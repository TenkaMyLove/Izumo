import React from 'react';
import { ActiveTab, AgendaItem, AppSettings } from '../types';
import { 
  Calendar, 
  Film, 
  BarChart3, 
  Settings, 
  Wifi, 
  Battery, 
  Plus, 
  Smartphone,
  ExternalLink,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Repeat,
  Signal,
  RefreshCw,
  Check,
  Sparkles,
  Moon,
  Volume2,
  Play,
  Upload
} from 'lucide-react';
import { getItemStatus, formatFriendlyDate, getTodayDateString } from '../utils/dateUtils';

interface MobilePhoneShellProps {
  items: AgendaItem[];
  settings: AppSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onToggleDone: (id: string, currentDone: boolean) => void;
  onToggleWatched: (id: string, currentWatched: boolean) => void;
  onEditItem: (item: AgendaItem) => void;
  onDeleteItem: (item: AgendaItem) => void;
  onOpenLink: (url: string, title: string) => void;
  onAddNew: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onTestSound?: () => void;
  onResetDemoData?: () => void;
  onSimulateRollover?: () => void;
  overdueCount: number;
  simulatedDate?: string;
  isSyncing: boolean;
}

export const MobilePhoneShell: React.FC<MobilePhoneShellProps> = ({
  items,
  settings,
  activeTab,
  setActiveTab,
  onToggleDone,
  onToggleWatched,
  onEditItem,
  onDeleteItem,
  onOpenLink,
  onAddNew,
  onUpdateSettings,
  onTestSound,
  onResetDemoData,
  onSimulateRollover,
  overdueCount,
  simulatedDate,
  isSyncing,
}) => {
  const todayStr = getTodayDateString(simulatedDate);
  const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full max-w-md md:max-w-[380px] mx-auto bg-[#faf1ec] text-[#121214] sm:rounded-[44px] p-3 sm:shadow-2xl shadow-black/40 sm:border-[3px] border-[#121214] sm:ring-4 ring-[#382c38]/20 flex flex-col relative min-h-screen sm:min-h-[740px]">
      {/* Dynamic Island (hidden on real mobile screens) */}
      <div className="hidden sm:flex w-28 h-[18px] bg-[#121214] rounded-full mx-auto mb-2 items-center justify-center gap-2 z-20 border border-[#382c38]/30">
        <span className="w-2.5 h-2.5 rounded-full bg-[#382c38]" />
        <span className={`w-2 h-2 rounded-full transition-colors duration-500 ${isSyncing ? 'bg-[#efcc59] animate-pulse' : 'bg-[#382c38]/60'}`} />
      </div>

      {/* Mobile Top Status Bar */}
      <div className="px-5 py-1 flex items-center justify-between text-[11px] font-bold text-[#8f7c60]">
        <span className="font-mono">{currentTimeStr}</span>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3 h-3 text-[#8f7c60]" />
          <Wifi className="w-3.5 h-3.5 text-[#8f7c60]" />
          <Battery className="w-4 h-4 text-[#8f7c60]" />
        </div>
      </div>

      {/* App Mobile Header */}
      <div className="bg-[#121214] text-[#faf1ec] px-4 py-3 rounded-2xl border border-[#382c38]/60 my-1.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden border border-[#f1f5b1]/40 shadow-sm shrink-0">
            <img src="/app-icon.png" alt="App Icon" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-black text-xs text-[#faf1ec] leading-tight">Izumo</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isSyncing ? 'bg-[#efcc59] animate-ping' : 'bg-[#386641]'}`} />
              <span className="text-[9px] text-[#efcc59] font-mono font-bold">{settings.syncCode}</span>
            </div>
          </div>
        </div>

        {overdueCount > 0 && (
          <span className="text-[10px] bg-[#851f22] text-[#faf1ec] font-bold px-2 py-0.5 rounded-full animate-pulse mr-1">
            {overdueCount}!
          </span>
        )}

        <button
          onClick={onAddNew}
          className="w-8 h-8 rounded-xl bg-[#f1f5b1] hover:bg-[#e6eba0] text-[#121214] flex items-center justify-center transition-all duration-150 hover:scale-110 shadow-sm"
          title="Add New Item"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Main Body Area */}
      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-3 h-0 min-h-0">
        {activeTab === 'all' && (
          <MobileMainList
            items={items}
            todayStr={todayStr}
            onToggleDone={onToggleDone}
            onToggleWatched={onToggleWatched}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            onOpenLink={onOpenLink}
          />
        )}

        {activeTab === 'anime-manhwa' && (
          <MobileAnimeList
            items={items}
            todayStr={todayStr}
            onToggleWatched={onToggleWatched}
            onEditItem={onEditItem}
            onOpenLink={onOpenLink}
          />
        )}

        {activeTab === 'status' && (
          <MobileStatusBreakdown
            items={items}
            todayStr={todayStr}
            onToggleDone={onToggleDone}
            onEditItem={onEditItem}
            onOpenLink={onOpenLink}
          />
        )}

        {activeTab === 'settings' && (
          <MobileSettings
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onTestSound={onTestSound}
            onResetDemoData={onResetDemoData}
            onSimulateRollover={onSimulateRollover}
          />
        )}
      </div>

      {/* Bottom Navigation Tab Bar */}
      <nav className="mt-auto pt-1.5 bg-[#121214] border border-[#382c38]/60 rounded-2xl p-1.5 grid grid-cols-4 gap-0.5 text-[10px] font-bold text-[#8f7c60] shadow-lg sticky bottom-0 z-20">
        {[
          { id: 'all' as ActiveTab, icon: <Calendar className="w-4 h-4" />, label: 'Agenda', badge: null },
          { id: 'anime-manhwa' as ActiveTab, icon: <Film className="w-4 h-4" />, label: 'Anime', badge: null },
          { id: 'status' as ActiveTab, icon: <BarChart3 className="w-4 h-4" />, label: 'Status', badge: overdueCount > 0 ? overdueCount : null },
          { id: 'settings' as ActiveTab, icon: <Settings className="w-4 h-4" />, label: 'Sync', badge: null },
        ].map(({ id, icon, label, badge }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all duration-150 relative ${
              activeTab === id ? 'bg-[#f1f5b1] text-[#121214] shadow-sm scale-105' : 'hover:text-[#faf1ec]'
            }`}
          >
            {icon}
            <span>{label}</span>
            {badge !== null && (
              <span className="absolute -top-1 -right-1 bg-[#851f22] text-[#faf1ec] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs">
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

/* Mobile Main List */
const MobileMainList: React.FC<{
  items: AgendaItem[];
  todayStr: string;
  onToggleDone: (id: string, currentDone: boolean) => void;
  onToggleWatched: (id: string, currentWatched: boolean) => void;
  onEditItem: (item: AgendaItem) => void;
  onDeleteItem: (item: AgendaItem) => void;
  onOpenLink: (url: string, title: string) => void;
}> = ({ items, todayStr, onToggleDone, onToggleWatched, onEditItem, onDeleteItem, onOpenLink }) => {
  const activeItems = items.filter((i) => i && !i.isDone);
  const sorted = [...activeItems].sort((a, b) => {
    const statusA = getItemStatus(a, todayStr);
    const statusB = getItemStatus(b, todayStr);

    const prio = { Overdue: 0, 'Due Today': 1, Upcoming: 2, Done: 3 };
    if (prio[statusA] !== prio[statusB]) {
      return prio[statusA] - prio[statusB];
    }
    if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  return (
    <div className="space-y-2 px-1">
      {sorted.map((item) => {
        const status = getItemStatus(item, todayStr);
        const friendlyDate = formatFriendlyDate(item.dueDate, todayStr);
        const isAnimeOrManhwa = item.category === 'Anime' || item.category === 'Manhwa';

        return (
          <div
            key={item.id}
            className={`p-3 rounded-2xl border transition-all duration-200 ${
              item.isDone
                ? 'bg-[#f8f5ef] border-[#382c38]/12 opacity-60'
                : status === 'Overdue'
                ? 'bg-[#f1f5b1] border-l-2 border-l-[#851f22] border-[#382c38]/25 text-[#121214]'
                : status === 'Due Today'
                ? 'bg-[#f1f5b1] border-l-2 border-l-[#efcc59] border-[#382c38]/25 text-[#121214]'
                : 'bg-white border-[#382c38]/15'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0 flex-1">
                <button
                  onClick={() => onToggleDone(item.id, item.isDone)}
                  className="mt-0.5 shrink-0 transition-transform duration-150 hover:scale-110"
                >
                  {item.isDone ? (
                    <CheckSquare className="w-4 h-4 text-[#386641] fill-[#386641]/15" />
                  ) : (
                    <Square className="w-4 h-4 text-[#8f7c60]" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className={`text-xs font-bold leading-snug ${item.isDone ? 'line-through text-[#8f7c60]' : 'text-[#121214]'}`}>
                      {item.title}
                    </h4>
                    {item.recurrence && item.recurrence !== 'none' && (
                      <span className="text-[9px] bg-[#efcc59]/20 text-[#121214] border border-[#efcc59]/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shrink-0">
                        <Repeat className="w-2 h-2" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-[#8f7c60] font-semibold">{item.category}</span>
                    {status === 'Overdue' && !item.isDone && (
                      <span className="text-[9px] bg-[#851f22] text-[#faf1ec] px-1.5 py-0.5 rounded font-bold">OVERDUE</span>
                    )}
                    {status === 'Due Today' && !item.isDone && (
                      <span className="text-[9px] bg-[#efcc59] text-[#121214] px-1.5 py-0.5 rounded font-bold">TODAY</span>
                    )}
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono text-[#8f7c60] whitespace-nowrap font-bold shrink-0">
                {friendlyDate}
              </span>
            </div>

            {item.notes && (
              <p className="text-[10px] text-[#8f7c60] line-clamp-1 pl-6 mt-1 font-medium">{item.notes}</p>
            )}

            <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#382c38]/10">
              {isAnimeOrManhwa ? (
                <button
                  onClick={() => onToggleWatched(item.id, !!item.isWatched)}
                  className={`px-2 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all duration-150 ${
                    item.isWatched
                      ? 'bg-[#386641]/15 text-[#386641] border border-[#386641]/30'
                      : 'bg-[#efcc59]/15 text-[#121214] border border-[#efcc59]/40'
                  }`}
                >
                  {item.isWatched ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{item.isWatched ? 'Watched' : 'Unwatched'}</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-1 ml-auto">
                {item.link && (
                  <button
                    onClick={() => onOpenLink(item.link!, item.title)}
                    className="p-1.5 bg-[#efcc59]/15 text-[#121214] border border-[#efcc59]/40 rounded-lg transition-all duration-150 hover:scale-110"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => onEditItem(item)}
                  className="p-1.5 bg-[#f8f5ef] text-[#121214] border border-[#382c38]/25 rounded-lg transition-all duration-150 hover:scale-110"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDeleteItem(item)}
                  className="p-1.5 bg-[#851f22]/8 text-[#851f22] border border-[#851f22]/25 rounded-lg transition-all duration-150 hover:scale-110 hover:bg-[#851f22] hover:text-[#faf1ec]"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* Mobile Anime List */
const MobileAnimeList: React.FC<{
  items: AgendaItem[];
  todayStr: string;
  onToggleWatched: (id: string, currentWatched: boolean) => void;
  onEditItem: (item: AgendaItem) => void;
  onOpenLink: (url: string, title: string) => void;
}> = ({ items, todayStr, onToggleWatched, onEditItem, onOpenLink }) => {
  const animeManhwa = items.filter((i) => i?.category === 'Anime' || i?.category === 'Manhwa');
  const watched = animeManhwa.filter((i) => i.isWatched).length;
  const pct = animeManhwa.length > 0 ? Math.round((watched / animeManhwa.length) * 100) : 0;

  return (
    <div className="space-y-3 px-1">
      {/* Mini progress */}
      {animeManhwa.length > 0 && (
        <div className="p-2.5 bg-white border border-[#382c38]/15 rounded-xl">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#121214] mb-1.5">
            <span>Anime & Manhwa</span>
            <span className="font-mono text-[#8f7c60]">{watched}/{animeManhwa.length} watched</span>
          </div>
          <div className="h-1 bg-[#f8f5ef] rounded-full overflow-hidden">
            <div className="h-full bg-[#386641] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {animeManhwa.map((item) => (
        <div key={item.id} className="p-3 bg-white border border-[#382c38]/15 rounded-2xl space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-[#121214]">{item.title}</h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-[#8f7c60] font-semibold">{item.category}</span>
                <span className="text-[10px] text-[#8f7c60]">• {formatFriendlyDate(item.dueDate, todayStr)}</span>
              </div>
            </div>
            <button
              onClick={() => onToggleWatched(item.id, !!item.isWatched)}
              className={`px-2 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 shrink-0 ${
                item.isWatched
                  ? 'bg-[#386641]/15 text-[#386641] border border-[#386641]/30'
                  : 'bg-[#efcc59]/15 text-[#121214] border border-[#efcc59]/40'
              }`}
            >
              {item.isWatched ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>{item.isWatched ? 'Watched' : 'Unwatched'}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

/* Mobile Status Breakdown */
const MobileStatusBreakdown: React.FC<{
  items: AgendaItem[];
  todayStr: string;
  onToggleDone: (id: string, currentDone: boolean) => void;
  onEditItem: (item: AgendaItem) => void;
  onOpenLink: (url: string, title: string) => void;
}> = ({ items, todayStr, onToggleDone, onEditItem, onOpenLink }) => {
  const validItems = items.filter(Boolean);
  const overdue = validItems.filter((i) => !i.isDone && getItemStatus(i, todayStr) === 'Overdue');
  const dueToday = validItems.filter((i) => !i.isDone && getItemStatus(i, todayStr) === 'Due Today');
  const upcoming = validItems.filter((i) => !i.isDone && getItemStatus(i, todayStr) === 'Upcoming');

  const groups = [
    { title: '🚨 Overdue', list: overdue, badge: 'bg-[#851f22] text-white' },
    { title: '⭐ Due Today', list: dueToday, badge: 'bg-[#efcc59] text-[#121214]' },
    { title: '📅 Upcoming', list: upcoming, badge: 'bg-[#faf1ec] text-[#121214] border border-[#382c38]/20' },
  ];

  return (
    <div className="space-y-3 px-1">
      {groups.map(({ title, list, badge }) => (
        <div key={title} className="p-3 bg-white border border-[#382c38]/15 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#121214]">{title}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}>
              {list.length}
            </span>
          </div>

          {list.map((item) => (
            <div key={item.id} className="p-2.5 bg-[#faf1ec]/60 rounded-xl flex items-center justify-between text-xs border border-[#382c38]/10">
              <span className="font-bold text-[#121214] truncate pr-2">{item.title}</span>
              <button
                onClick={() => onToggleDone(item.id, item.isDone)}
                className="text-[10px] font-bold px-2 py-1 bg-[#121214] text-[#faf1ec] rounded-lg shrink-0"
              >
                Mark Done
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

/* Mobile Settings & Sync */
const MobileSettings: React.FC<{
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onTestSound?: () => void;
  onResetDemoData?: () => void;
  onSimulateRollover?: () => void;
}> = ({ settings, onUpdateSettings, onTestSound, onResetDemoData, onSimulateRollover }) => {
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [inputCode, setInputCode] = React.useState(settings.syncCode || '');

  React.useEffect(() => {
    setInputCode(settings.syncCode || '');
  }, [settings.syncCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setInputCode(val);
    if (val.trim()) {
      onUpdateSettings({ syncCode: val.trim() });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(settings.syncCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        onUpdateSettings({
          customSoundName: file.name,
          customSoundData: base64Data,
          startupSoundEnabled: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="px-1 space-y-3 pb-4">
      {/* Sync Code Pairing Box */}
      <div className="p-4 bg-white border border-[#382c38]/15 rounded-2xl space-y-3 text-xs shadow-xs">
        <div className="flex items-center justify-between">
          <div className="font-bold text-[#121214] flex items-center gap-2">
            <div className="w-7 h-7 bg-[#f1f5b1] rounded-xl flex items-center justify-center border border-[#382c38]/15">
              <Smartphone className="w-4 h-4 text-[#121214]" />
            </div>
            <span>Mobile Sync Pair</span>
          </div>
          <span className="text-[10px] bg-[#386641]/15 text-[#386641] font-mono font-bold px-2 py-0.5 rounded-full border border-[#386641]/30">
            Active
          </span>
        </div>

        <p className="text-[11px] text-[#8f7c60] font-medium">
          Enter or edit your secret pair code to sync with Desktop:
        </p>

        <div className="space-y-2">
          <input
            type="text"
            value={inputCode}
            onChange={handleInputChange}
            placeholder="AG-9842"
            className="w-full p-2.5 bg-[#121214] text-[#f1f5b1] font-mono font-black text-center rounded-xl text-lg border border-[#382c38]/40 tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[#efcc59]"
          />

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCopyCode}
              className="flex-1 py-2 bg-[#f8f5ef] hover:bg-[#faf1ec] text-[#121214] border border-[#382c38]/20 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#386641]" /> : <RefreshCw className="w-3.5 h-3.5 text-[#8f7c60]" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => {
                const newCode = `IZ-${Math.floor(1000 + Math.random() * 9000)}`;
                onUpdateSettings({ syncCode: newCode });
              }}
              className="flex-1 py-2 bg-[#efcc59]/20 hover:bg-[#efcc59]/30 text-[#121214] border border-[#efcc59]/50 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#121214]" />
              <span>New Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Appearance Theme */}
      <div className="p-4 bg-white border border-[#382c38]/15 rounded-2xl space-y-2.5 text-xs shadow-xs">
        <div className="flex items-center justify-between">
          <div className="font-bold text-[#121214] flex items-center gap-2">
            <Moon className="w-4 h-4 text-[#8f7c60]" />
            <span>Theme Mode</span>
          </div>
          <button
            onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
            className={`w-10 h-5 rounded-full relative transition-colors ${
              settings.darkMode ? 'bg-[#121214]' : 'bg-[#beb5a0]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#f1f5b1] transition-transform ${
                settings.darkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-[10px] text-[#8f7c60]">
          {settings.darkMode ? 'Dark Mode Active (#121214)' : 'Light Mode Active (#faf1ec)'}
        </p>
      </div>

      {/* Startup Sound Cue */}
      <div className="p-4 bg-white border border-[#382c38]/15 rounded-2xl space-y-2.5 text-xs shadow-xs">
        <div className="flex items-center justify-between">
          <div className="font-bold text-[#121214] flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#8f7c60]" />
            <span>Startup Sound Cue</span>
          </div>
          <button
            onClick={() => onUpdateSettings({ startupSoundEnabled: !settings.startupSoundEnabled })}
            className={`w-10 h-5 rounded-full relative transition-colors ${
              settings.startupSoundEnabled ? 'bg-[#121214]' : 'bg-[#beb5a0]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#f1f5b1] transition-transform ${
                settings.startupSoundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {onTestSound && (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onTestSound}
              className="px-3 py-1.5 bg-[#121214] text-[#faf1ec] rounded-xl font-bold text-[10px] flex items-center gap-1"
            >
              <Play className="w-3 h-3 text-[#f1f5b1]" />
              <span>Test Audio</span>
            </button>

            <label className="px-3 py-1.5 bg-[#f8f5ef] text-[#121214] border border-[#382c38]/20 rounded-xl font-bold text-[10px] flex items-center gap-1 cursor-pointer">
              <Upload className="w-3 h-3 text-[#8f7c60]" />
              <span>Upload Custom</span>
              <input
                type="file"
                accept="audio/wav,audio/mp3,audio/mpeg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Simulation & Reset Data */}
      <div className="p-3 bg-white border border-[#382c38]/15 rounded-2xl text-[10px] space-y-2 shadow-xs">
        <div className="font-bold text-[#121214] text-xs">Actions & Rollover</div>
        <div className="flex items-center justify-between gap-2 pt-1">
          {onSimulateRollover && (
            <button
              onClick={onSimulateRollover}
              className="px-2.5 py-1.5 bg-[#efcc59]/20 text-[#121214] border border-[#efcc59]/40 rounded-xl font-bold text-[10px]"
            >
              Simulate Rollover
            </button>
          )}

          {onResetDemoData && (
            <button
              onClick={onResetDemoData}
              className="px-2.5 py-1.5 bg-[#851f22]/10 text-[#851f22] border border-[#851f22]/30 rounded-xl font-bold text-[10px]"
            >
              Reset Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
