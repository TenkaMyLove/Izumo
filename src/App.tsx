import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ActiveTab, AgendaItem, AppSettings, ViewMode } from './types';
import { TopDeviceBar } from './components/TopDeviceBar';
import { DesktopWindowShell } from './components/DesktopWindowShell';
import { MobilePhoneShell } from './components/MobilePhoneShell';
import { TrayContextMenu } from './components/TrayContextMenu';
import { DashboardMainTab } from './components/DashboardMainTab';
import { AnimeManhwaTab } from './components/AnimeManhwaTab';
import { UpcomingTab } from './components/UpcomingTab';
import { StatusTab } from './components/StatusTab';
import { AddItemModal } from './components/AddItemModal';
import { SettingsModal } from './components/SettingsModal';
import { SettingsView } from './components/SettingsView';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { BrowserLinkModal } from './components/BrowserLinkModal';
import { playStartupSound } from './utils/soundUtils';
import { getItemStatus, getTodayDateString } from './utils/dateUtils';
import { getInitialSeedData } from './utils/seedData';
import { incrementEpisodeTitle, calculateNextDueDate } from './utils/recurringUtils';

const getInitialSyncCode = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('izumo_sync_code');
    if (saved && saved.trim()) return saved.trim().toUpperCase();
  }
  const newCode = `IZ-${Math.floor(1000 + Math.random() * 9000)}`;
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('izumo_sync_code', newCode);
  }
  return newCode;
};

export default function App() {
  // Initial state: load cached backup first to prevent flash of stale data
  const [items, setItems] = useState<AgendaItem[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cached = localStorage.getItem('izumo_auto_backup_items');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((i: any) => Boolean(i && typeof i === 'object' && i.id && i.category));
          }
        }
      } catch (e) {}
    }
    return [];
  });
  const [settings, setSettings] = useState<AppSettings>(() => {
    const seedSettings = getInitialSeedData().settings;
    const initialCode = getInitialSyncCode();
    const savedDark = typeof localStorage !== 'undefined' ? localStorage.getItem('izumo_dark_mode') : null;
    const savedSound = typeof localStorage !== 'undefined' ? localStorage.getItem('izumo_sound_enabled') : null;
    return {
      ...seedSettings,
      syncCode: initialCode,
      darkMode: savedDark !== null ? savedDark === 'true' : seedSettings.darkMode,
      startupSoundEnabled: savedSound !== null ? savedSound === 'true' : seedSettings.startupSoundEnabled,
    };
  });
  // Auto-detect viewMode: Default to 'mobile' on mobile devices, 'desktop' for actual desktop window app
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'mobile';
    }
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'dual') {
        setViewMode('mobile');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [isWindowVisible, setIsWindowVisible] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<AgendaItem | null>(null);
  const [browserUrl, setBrowserUrl] = useState<{ url: string; title: string } | null>(null);

  // Tray context menu state
  const [trayMenu, setTrayMenu] = useState<{ isOpen: boolean; pos: { x: number; y: number } }>({
    isOpen: false,
    pos: { x: 0, y: 0 },
  });

  const getApiHeaders = useCallback((codeOverride?: string) => {
    const code =
      codeOverride ||
      settings.syncCode ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('izumo_sync_code') : null) ||
      'XX-1234';
    return {
      'Content-Type': 'application/json',
      'x-sync-code': code,
    };
  }, [settings.syncCode]);

  /** Timestamp-aware merge: the item with the newer updatedAt wins.
   *  Items only in local are pushed; items only on server are kept; conflicts go to the newer version. */
  const mergeItems = useCallback((serverItems: AgendaItem[], localItems: AgendaItem[]): {
    merged: AgendaItem[];
    toPost: AgendaItem[];
    toPut: AgendaItem[];
  } => {
    const serverMap = new Map(serverItems.map((i) => [i.id, i]));
    const localMap = new Map(localItems.filter((i) => Boolean(i?.id)).map((i) => [i.id, i]));
    const merged: AgendaItem[] = [];
    const toPost: AgendaItem[] = [];
    const toPut: AgendaItem[] = [];

    const allIds = new Set([...serverMap.keys(), ...localMap.keys()]);
    for (const id of allIds) {
      const serverItem = serverMap.get(id);
      const localItem = localMap.get(id);
      if (serverItem && !localItem) {
        merged.push(serverItem);
      } else if (!serverItem && localItem) {
        merged.push(localItem);
        toPost.push(localItem);
      } else if (serverItem && localItem) {
        const serverTs = new Date(serverItem.updatedAt || 0).getTime();
        const localTs = new Date(localItem.updatedAt || 0).getTime();
        if (localTs > serverTs) {
          merged.push(localItem);
          toPut.push(localItem);
        } else {
          merged.push(serverItem);
        }
      }
    }
    // Preserve server ordering roughly (newest first)
    merged.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
    return { merged, toPost, toPut };
  }, []);

  // Fetch data from server
  const fetchData = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/data', {
        headers: getApiHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const rawItems = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
        const serverItems = rawItems.filter(
          (i: any): i is AgendaItem => Boolean(i && typeof i === 'object' && i.id && i.category)
        );

        const currentCode =
          (typeof localStorage !== 'undefined' ? localStorage.getItem('izumo_sync_code') : null) ||
          settings.syncCode ||
          'XX-1234';

        // Load local backup for merge
        let localBackupItems: AgendaItem[] = [];
        try {
          const cached = localStorage.getItem('izumo_auto_backup_items');
          if (cached) localBackupItems = JSON.parse(cached).filter((i: any) => Boolean(i?.id && i?.category));
        } catch (_) {}

        const isColdStart = data.coldStart || serverItems.length === 0;

        let finalItems: AgendaItem[];

        if (localBackupItems.length > 0) {
          // Always merge using timestamps so the newer edit wins regardless of source
          const { merged, toPost, toPut } = mergeItems(serverItems, localBackupItems);
          finalItems = merged;

          if (isColdStart && localBackupItems.length > 0) {
            // Cold start: push entire local backup atomically via push-state (single request)
            fetch('/api/push-state', {
              method: 'POST',
              headers: getApiHeaders(currentCode),
              body: JSON.stringify({ items: localBackupItems }),
            }).catch(() => {});
          } else {
            // Warm: push only items that are newer locally (non-blocking)
            for (const item of toPost) {
              fetch('/api/items', {
                method: 'POST',
                headers: getApiHeaders(currentCode),
                body: JSON.stringify(item),
              }).catch(() => {});
            }
            for (const item of toPut) {
              fetch(`/api/items/${item.id}`, {
                method: 'PUT',
                headers: getApiHeaders(currentCode),
                body: JSON.stringify(item),
              }).catch(() => {});
            }
          }
        } else {
          finalItems = serverItems;
        }

        setItems(finalItems);

        const savedDarkMode = typeof localStorage !== 'undefined' ? localStorage.getItem('izumo_dark_mode') : null;
        const savedSound = typeof localStorage !== 'undefined' ? localStorage.getItem('izumo_sound_enabled') : null;

        setSettings((prev) => ({
          ...(data.settings || getInitialSeedData().settings),
          darkMode: savedDarkMode !== null ? savedDarkMode === 'true' : (data.settings?.darkMode ?? prev.darkMode),
          startupSoundEnabled: savedSound !== null ? savedSound === 'true' : (data.settings?.startupSoundEnabled ?? prev.startupSoundEnabled),
          syncCode: currentCode,
        }));

        // Save merged state as local backup
        try {
          localStorage.setItem('izumo_auto_backup_items', JSON.stringify(finalItems));
          localStorage.setItem(
            'izumo_auto_backup_settings',
            JSON.stringify({ ...(data.settings || {}), syncCode: currentCode })
          );
          localStorage.setItem('izumo_sync_code', currentCode);
        } catch (_) {}

        // Electron: backup to disk
        if (typeof window !== 'undefined' && (window as any).electronAPI?.saveLocalBackup) {
          (window as any).electronAPI.saveLocalBackup({
            items: finalItems,
            settings: { ...(data.settings || {}), syncCode: currentCode },
          });
        }
      }
    } catch (e) {
      console.warn('Backend API fetch error, restoring from local backup:', e);
      try {
        const cachedItems = localStorage.getItem('izumo_auto_backup_items');
        const cachedSettings = localStorage.getItem('izumo_auto_backup_settings');
        if (cachedItems) setItems(JSON.parse(cachedItems));
        if (cachedSettings) setSettings(JSON.parse(cachedSettings));
      } catch (_) {}
    } finally {
      setIsSyncing(false);
    }
  }, [getApiHeaders, mergeItems, settings.syncCode]);

  // Initial load & Polling for live sync between Desktop & Mobile
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2500); // Poll every 2.5s to keep Mobile & Desktop in sync
    return () => clearInterval(interval);
  }, [fetchData]);

  // Play startup sound on initial boot or first user gesture on PWA/Web
  const hasPlayedStartupSound = useRef(false);
  useEffect(() => {
    const handleGesturePlay = () => {
      if (settings.startupSoundEnabled && !hasPlayedStartupSound.current) {
        hasPlayedStartupSound.current = true;
        playStartupSound(settings.customSoundData);
      }
      window.removeEventListener('click', handleGesturePlay);
      window.removeEventListener('touchstart', handleGesturePlay);
      window.removeEventListener('keydown', handleGesturePlay);
    };

    if (settings.startupSoundEnabled && !hasPlayedStartupSound.current) {
      playStartupSound(settings.customSoundData).then(() => {
        hasPlayedStartupSound.current = true;
      }).catch(() => {});

      window.addEventListener('click', handleGesturePlay);
      window.addEventListener('touchstart', handleGesturePlay);
      window.addEventListener('keydown', handleGesturePlay);
    }

    return () => {
      window.removeEventListener('click', handleGesturePlay);
      window.removeEventListener('touchstart', handleGesturePlay);
      window.removeEventListener('keydown', handleGesturePlay);
    };
  }, [settings.startupSoundEnabled, settings.customSoundData]);

  // Helper: Auto-schedule next occurrence when an item with recurrence is completed/watched
  const scheduleNextOccurrence = async (item: AgendaItem) => {
    if (!item.recurrence || item.recurrence === 'none') return;

    const nextDueDate = calculateNextDueDate(item.dueDate, item.recurrence);
    const nextTitle = incrementEpisodeTitle(item.title);

    // Check if next episode already exists in current items
    const alreadyExists = items.some(
      (i) => i && i.dueDate === nextDueDate && i.title?.toLowerCase() === nextTitle.toLowerCase()
    );

    if (!alreadyExists) {
      const nextItemData: Partial<AgendaItem> = {
        title: nextTitle,
        category: item.category,
        dueDate: nextDueDate,
        recurrence: item.recurrence,
        notes: item.notes,
        link: item.link,
        isDone: false,
        isWatched: false,
      };
      await handleSaveItem(nextItemData);
    }
  };

  // Handler: Add or Edit Item
  const handleSaveItem = async (itemData: Partial<AgendaItem>) => {
    setIsSyncing(true);
    if (itemData.id) {
      // Edit existing
      try {
        const res = await fetch(`/api/items/${itemData.id}`, {
          method: 'PUT',
          headers: getApiHeaders(),
          body: JSON.stringify(itemData),
        });
        if (res.ok) {
          const result = await res.json();
          const savedItem: AgendaItem | null =
            result.item || (result.id && result.category ? result : null);
          if (savedItem) {
            setItems((prev) =>
              prev.map((i) => (i.id === itemData.id ? { ...i, ...savedItem } : i))
            );
          }
        }
      } catch {
        setItems((prev) =>
          prev.map((i) => (i.id === itemData.id ? { ...i, ...itemData, updatedAt: new Date().toISOString() } : i))
        );
      }
    } else {
      // Create new
      try {
        const res = await fetch('/api/items', {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify({
            ...itemData,
            isDone: false,
            isWatched: false,
          }),
        });
        if (res.ok) {
          const result = await res.json();
          const newItem: AgendaItem | null =
            result.item || (result.id && result.category ? result : null);
          if (newItem) {
            setItems((prev) => [newItem, ...prev.filter((i) => Boolean(i && i.id))]);
          }
        }
      } catch {
        const newItem: AgendaItem = {
          id: `item-${Date.now()}`,
          title: itemData.title || '',
          category: itemData.category || 'Anime',
          dueDate: itemData.dueDate || getTodayDateString(settings.simulatedCurrentDate),
          recurrence: itemData.recurrence || 'none',
          notes: itemData.notes,
          link: itemData.link,
          isDone: false,
          isWatched: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setItems((prev) => [newItem, ...prev.filter((i) => Boolean(i && i.id))]);
      }
    }
    setIsSyncing(false);
  };

  // Handler: Toggle Done State
  const handleToggleDone = async (id: string, currentDone: boolean) => {
    const nextDone = !currentDone;
    const doneAt = nextDone ? new Date().toISOString() : null;

    const targetItem = items.find((i) => i.id === id);

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isDone: nextDone, doneAt } : item))
    );

    try {
      await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({ isDone: nextDone, doneAt }),
      });
    } catch (e) {
      console.warn('API error toggling done state:', e);
    }

    // Trigger auto-creation of next episode/chapter if recurring and marked as done
    if (nextDone && targetItem) {
      await scheduleNextOccurrence(targetItem);
    }
  };

  // Handler: Toggle Watched State (Anime/Manhwa)
  const handleToggleWatched = async (id: string, currentWatched: boolean) => {
    const nextWatched = !currentWatched;
    const targetItem = items.find((i) => i.id === id);

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isWatched: nextWatched } : item))
    );

    try {
      await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({ isWatched: nextWatched }),
      });
    } catch (e) {
      console.warn('API error toggling watched state:', e);
    }

    // Trigger auto-creation of next episode/chapter if recurring and marked as watched
    if (nextWatched && targetItem) {
      await scheduleNextOccurrence(targetItem);
    }
  };

  // Handler: Delete Item
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    const id = deletingItem.id;
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      });
    } catch (e) {
      console.warn('API error deleting item:', e);
    }
    setDeletingItem(null);
  };

  // Handler: Day Rollover Simulation (PRD 4.5)
  const handleSimulateRollover = async () => {
    setIsSyncing(true);
    const currentDate = getTodayDateString(settings.simulatedCurrentDate);
    // Advance date by 1 day
    const [y, m, d] = currentDate.split('-').map(Number);
    const nextDayObj = new Date(y, m - 1, d + 1);
    const nextDayStr = `${nextDayObj.getFullYear()}-${String(nextDayObj.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(nextDayObj.getDate()).padStart(2, '0')}`;

    try {
      const res = await fetch('/api/rollover', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ simulatedDate: nextDayStr }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setSettings(data.settings);
        alert(
          `📅 Day Rollover Triggered!\nSimulated date advanced to: ${nextDayStr}.\n${data.clearedCount} completed items from previous days were automatically cleared from active agenda!`
        );
      }
    } catch {
      // Local fallback
      setSettings((prev) => ({ ...prev, simulatedCurrentDate: nextDayStr }));
      setItems((prev) =>
        prev.filter((i) => {
          if (!i.isDone) return true;
          const doneDate = i.doneAt ? i.doneAt.split('T')[0] : '';
          return doneDate >= nextDayStr;
        })
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // Handler: Update Settings
  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    if (typeof newSettings.darkMode !== 'undefined') {
      try {
        localStorage.setItem('izumo_dark_mode', String(newSettings.darkMode));
      } catch (e) {}
    }
    if (typeof newSettings.startupSoundEnabled !== 'undefined') {
      try {
        localStorage.setItem('izumo_sound_enabled', String(newSettings.startupSoundEnabled));
      } catch (e) {}
    }
    if (newSettings.syncCode) {
      try {
        localStorage.setItem('izumo_sync_code', newSettings.syncCode.trim().toUpperCase());
      } catch (e) {}
    }

    const oldCode = settings.syncCode;
    const updatedCode = newSettings.syncCode
      ? newSettings.syncCode.trim().toUpperCase()
      : settings.syncCode;

    const updated = { ...settings, ...newSettings, syncCode: updatedCode };
    setSettings(updated);

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: getApiHeaders(updatedCode),
        body: JSON.stringify({ ...newSettings, syncCode: updatedCode }),
      });

      // If user changed/generated a new code and has existing items, transfer current items to the new room
      if (newSettings.syncCode && updatedCode !== oldCode && items.length > 0) {
        for (const item of items) {
          await fetch('/api/items', {
            method: 'POST',
            headers: getApiHeaders(updatedCode),
            body: JSON.stringify(item),
          });
        }
      }

      fetchData();
    } catch (e) {
      console.warn('API error updating settings:', e);
    }
  };

  // Handler: Reset Demo Data
  const handleResetData = async () => {
    if (confirm('Reset agenda data to initial PRD seed state?')) {
      setIsSyncing(true);
      try {
        const res = await fetch('/api/reset', {
          method: 'POST',
          headers: getApiHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data.items);
          setSettings(data.settings);
        }
      } catch {
        const seedData = getInitialSeedData();
        setItems(seedData.items);
        setSettings(seedData.settings);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Counts for badge notifications (with defensive null checks)
  const todayStr = getTodayDateString(settings.simulatedCurrentDate);
  const validItems = (items || []).filter((i): i is AgendaItem => Boolean(i && typeof i === 'object'));
  const overdueCount = validItems.filter((i) => getItemStatus(i, todayStr) === 'Overdue').length;
  const dueTodayCount = validItems.filter((i) => getItemStatus(i, todayStr) === 'Due Today').length;

  // Open Tray Context Menu
  const handleOpenTrayMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setTrayMenu({
      isOpen: true,
      pos: { x: e.clientX, y: e.clientY },
    });
  };

  return (
    <div className="min-h-screen bg-[#0f0d0f] text-[#faf1ec] flex flex-col font-sans antialiased selection:bg-[#f1f5b1] selection:text-[#121214]">
      {/* Top Controls Bar (hidden when running as pure desktop window or mobile) */}
      {viewMode === 'dual' && (
        <TopDeviceBar
          viewMode={viewMode}
          setViewMode={setViewMode}
          settings={settings}
          onPlaySound={() => playStartupSound(settings.customSoundData)}
          onSimulateRollover={handleSimulateRollover}
          onResetData={handleResetData}
          isSyncing={isSyncing}
          itemCount={items.length}
          overdueCount={overdueCount}
        />
      )}

      {/* Main Workspace Stage */}
      <main className={`flex-1 w-full ${viewMode === 'desktop' ? 'p-0 max-w-none' : 'p-4 md:p-8 max-w-7xl mx-auto'}`}>
        {/* View Mode 1: Dual View (Desktop & Mobile Side-by-Side) */}
        {viewMode === 'dual' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Desktop App (Left Col - 8 cols) */}
            <div className="lg:col-span-8">
              <DesktopWindowShell
                items={items}
                settings={settings}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isWindowVisible={isWindowVisible}
                onHideWindow={() => setIsWindowVisible((prev) => !prev)}
                onOpenTrayMenu={handleOpenTrayMenu}
                overdueCount={overdueCount}
                dueTodayCount={dueTodayCount}
              >
                {activeTab === 'all' && (
                  <DashboardMainTab
                    items={items}
                    simulatedDate={settings.simulatedCurrentDate}
                    darkMode={settings.darkMode}
                    onToggleDone={handleToggleDone}
                    onToggleWatched={handleToggleWatched}
                    onEditItem={(item) => {
                      setEditingItem(item);
                      setIsAddModalOpen(true);
                    }}
                    onDeleteItem={(item) => setDeletingItem(item)}
                    onOpenLink={(url, title) => setBrowserUrl({ url, title })}
                    onAddNew={() => {
                      setEditingItem(null);
                      setIsAddModalOpen(true);
                    }}
                  />
                )}

                {activeTab === 'anime-manhwa' && (
                  <AnimeManhwaTab
                    items={items}
                    simulatedDate={settings.simulatedCurrentDate}
                    darkMode={settings.darkMode}
                    onToggleWatched={handleToggleWatched}
                    onEditItem={(item) => {
                      setEditingItem(item);
                      setIsAddModalOpen(true);
                    }}
                    onOpenLink={(url, title) => setBrowserUrl({ url, title })}
                  />
                )}

                {activeTab === 'upcoming' && (
                  <UpcomingTab
                    items={items}
                    simulatedDate={settings.simulatedCurrentDate}
                    darkMode={settings.darkMode}
                    onToggleDone={handleToggleDone}
                    onToggleWatched={handleToggleWatched}
                    onEditItem={(item) => {
                      setEditingItem(item);
                      setIsAddModalOpen(true);
                    }}
                    onDeleteItem={(item) => setDeletingItem(item)}
                    onOpenLink={(url, title) => setBrowserUrl({ url, title })}
                    onAddNew={() => {
                      setEditingItem(null);
                      setIsAddModalOpen(true);
                    }}
                  />
                )}

                {activeTab === 'status' && (
                  <StatusTab
                    items={items}
                    simulatedDate={settings.simulatedCurrentDate}
                    darkMode={settings.darkMode}
                    onToggleDone={handleToggleDone}
                    onEditItem={(item) => {
                      setEditingItem(item);
                      setIsAddModalOpen(true);
                    }}
                    onOpenLink={(url, title) => setBrowserUrl({ url, title })}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsView
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    onTestSound={() => playStartupSound(settings.customSoundData)}
                    onResetDemoData={handleResetData}
                  />
                )}
              </DesktopWindowShell>
            </div>

            {/* Mobile Companion App (Right Col - 4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="text-center mb-3">
                <span className="text-xs font-bold text-[#8f7c60] uppercase tracking-widest">
                  📱 Mobile Companion
                </span>
                <p className="text-[11px] text-[#8f7c60]/70 font-mono mt-0.5">Live sync · {settings.syncCode}</p>
              </div>
              <MobilePhoneShell
                items={items}
                settings={settings}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onToggleDone={handleToggleDone}
                onToggleWatched={handleToggleWatched}
                onEditItem={(item) => {
                  setEditingItem(item);
                  setIsAddModalOpen(true);
                }}
                onDeleteItem={(item) => setDeletingItem(item)}
                onOpenLink={(url, title) => setBrowserUrl({ url, title })}
                onAddNew={() => {
                  setEditingItem(null);
                  setIsAddModalOpen(true);
                }}
                onUpdateSettings={handleUpdateSettings}
                onTestSound={() => playStartupSound(settings.customSoundData)}
                onResetDemoData={handleResetData}
                onSimulateRollover={handleSimulateRollover}
                overdueCount={overdueCount}
                simulatedDate={settings.simulatedCurrentDate}
                isSyncing={isSyncing}
              />
            </div>
          </div>
        )}

        {/* View Mode 2: Desktop Only */}
        {viewMode === 'desktop' && (
          <div className="w-full h-screen">
            <DesktopWindowShell
              items={items}
              settings={settings}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isWindowVisible={isWindowVisible}
              onHideWindow={() => setIsWindowVisible((prev) => !prev)}
              onOpenTrayMenu={handleOpenTrayMenu}
              overdueCount={overdueCount}
              dueTodayCount={dueTodayCount}
              isNativeDesktop={true}
            >
              {activeTab === 'all' && (
                <DashboardMainTab
                  items={items}
                  simulatedDate={settings.simulatedCurrentDate}
                  darkMode={settings.darkMode}
                  onToggleDone={handleToggleDone}
                  onToggleWatched={handleToggleWatched}
                  onEditItem={(item) => {
                    setEditingItem(item);
                    setIsAddModalOpen(true);
                  }}
                  onDeleteItem={(item) => setDeletingItem(item)}
                  onOpenLink={(url, title) => setBrowserUrl({ url, title })}
                  onAddNew={() => {
                    setEditingItem(null);
                    setIsAddModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'anime-manhwa' && (
                <AnimeManhwaTab
                  items={items}
                  simulatedDate={settings.simulatedCurrentDate}
                  darkMode={settings.darkMode}
                  onToggleWatched={handleToggleWatched}
                  onEditItem={(item) => {
                    setEditingItem(item);
                    setIsAddModalOpen(true);
                  }}
                  onOpenLink={(url, title) => setBrowserUrl({ url, title })}
                />
              )}

              {activeTab === 'upcoming' && (
                <UpcomingTab
                  items={items}
                  simulatedDate={settings.simulatedCurrentDate}
                  darkMode={settings.darkMode}
                  onToggleDone={handleToggleDone}
                  onToggleWatched={handleToggleWatched}
                  onEditItem={(item) => {
                    setEditingItem(item);
                    setIsAddModalOpen(true);
                  }}
                  onDeleteItem={(item) => setDeletingItem(item)}
                  onOpenLink={(url, title) => setBrowserUrl({ url, title })}
                  onAddNew={() => {
                    setEditingItem(null);
                    setIsAddModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'status' && (
                <StatusTab
                  items={items}
                  simulatedDate={settings.simulatedCurrentDate}
                  darkMode={settings.darkMode}
                  onToggleDone={handleToggleDone}
                  onEditItem={(item) => {
                    setEditingItem(item);
                    setIsAddModalOpen(true);
                  }}
                  onOpenLink={(url, title) => setBrowserUrl({ url, title })}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onTestSound={() => playStartupSound(settings.customSoundData)}
                  onResetDemoData={handleResetData}
                />
              )}
            </DesktopWindowShell>
          </div>
        )}

        {/* View Mode 3: Mobile Phone Only */}
        {viewMode === 'mobile' && (
          <div className="flex flex-col items-center -m-4 sm:m-0">
            <MobilePhoneShell
              items={items}
              settings={settings}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onToggleDone={handleToggleDone}
              onToggleWatched={handleToggleWatched}
              onEditItem={(item) => {
                setEditingItem(item);
                setIsAddModalOpen(true);
              }}
              onDeleteItem={(item) => setDeletingItem(item)}
              onOpenLink={(url, title) => setBrowserUrl({ url, title })}
              onAddNew={() => {
                setEditingItem(null);
                setIsAddModalOpen(true);
              }}
              onUpdateSettings={handleUpdateSettings}
              onTestSound={() => playStartupSound(settings.customSoundData)}
              onResetDemoData={handleResetData}
              onSimulateRollover={handleSimulateRollover}
              overdueCount={overdueCount}
              simulatedDate={settings.simulatedCurrentDate}
              isSyncing={isSyncing}
            />
          </div>
        )}

        {/* View Mode 4: Tray Pop-up Preview */}
        {viewMode === 'tray-only' && (
          <div className="max-w-sm mx-auto py-12 space-y-4">
            <div className="p-6 bg-[#121214] border border-[#382c38]/60 rounded-3xl shadow-2xl space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-[#382c38]/40 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#f1f5b1] rounded-xl flex items-center justify-center">
                    <span className="text-xs">🖥</span>
                  </div>
                  <span className="font-black text-[#faf1ec] text-sm">Tray Simulator</span>
                </div>
                <span className="text-[10px] bg-[#efcc59]/15 text-[#efcc59] px-2 py-0.5 rounded-full border border-[#efcc59]/30 font-mono font-bold">
                  PRD 4.1
                </span>
              </div>
              <p className="text-xs text-[#8f7c60] font-medium leading-relaxed">
                In tray mode, My Agenda stays active in the Windows notification area. Left-click to open the dashboard, right-click for the context menu.
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setIsWindowVisible(true)}
                  onContextMenu={handleOpenTrayMenu}
                  className="w-full py-3 rounded-2xl bg-[#f1f5b1] hover:bg-[#e6eba0] text-[#121214] font-bold text-xs transition-all duration-150 hover:scale-[1.02] hover:shadow-md shadow-sm"
                >
                  🖱 Left-Click — Open Dashboard
                </button>
                <button
                  onClick={(e) => handleOpenTrayMenu(e as unknown as React.MouseEvent)}
                  className="w-full py-3 rounded-2xl bg-[#382c38]/50 hover:bg-[#382c38] border border-[#382c38] text-[#faf1ec] font-bold text-xs transition-all duration-150 hover:scale-[1.02]"
                >
                  🖱 Right-Click — Tray Context Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        editingItem={editingItem}
        simulatedDate={settings.simulatedCurrentDate}
      />

      <ConfirmDeleteModal
        isOpen={!!deletingItem}
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onTestSound={() => playStartupSound(settings.customSoundData)}
        onResetDemoData={handleResetData}
      />

      <BrowserLinkModal
        url={browserUrl?.url || null}
        itemTitle={browserUrl?.title || ''}
        onClose={() => setBrowserUrl(null)}
      />

      <TrayContextMenu
        isOpen={trayMenu.isOpen}
        position={trayMenu.pos}
        onClose={() => setTrayMenu({ isOpen: false, pos: { x: 0, y: 0 } })}
        onOpenDashboard={() => setIsWindowVisible(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onTestSound={() => playStartupSound(settings.customSoundData)}
        onQuitApp={() => setIsWindowVisible(false)}
        isWindowVisible={isWindowVisible}
        overdueCount={overdueCount}
      />
    </div>
  );
}
