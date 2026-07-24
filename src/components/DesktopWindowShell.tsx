import React from 'react';
import { ActiveTab, AgendaItem, AppSettings } from '../types';
import { 
  Calendar, 
  Minus, 
  Square as SquareIcon, 
  X, 
  Film, 
  BarChart3, 
  Settings, 
  Wifi, 
  Volume2, 
  Search, 
  ShieldCheck,
  ChevronUp,
  Layout
} from 'lucide-react';

interface DesktopWindowShellProps {
  items: AgendaItem[];
  settings: AppSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isWindowVisible: boolean;
  onHideWindow: () => void;
  onOpenTrayMenu: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  overdueCount: number;
  dueTodayCount: number;
  isNativeDesktop?: boolean;
}

export const DesktopWindowShell: React.FC<DesktopWindowShellProps> = ({
  items,
  settings,
  activeTab,
  setActiveTab,
  isWindowVisible,
  onHideWindow,
  onOpenTrayMenu,
  children,
  overdueCount,
  dueTodayCount,
  isNativeDesktop = false,
}) => {
  const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const navItems = [
    {
      id: 'all' as ActiveTab,
      icon: <Calendar className="w-4 h-4" />,
      label: 'All Items',
      badge: items.length,
      badgeClass: 'bg-[#f1f5b1]/20 text-[#faf1ec]',
    },
    {
      id: 'anime-manhwa' as ActiveTab,
      icon: <Film className="w-4 h-4" />,
      label: 'Anime & Manhwa',
      badge: items.filter((i) => i.category === 'Anime' || i.category === 'Manhwa').length,
      badgeClass: 'bg-[#efcc59]/20 text-[#efcc59]',
    },
    {
      id: 'status' as ActiveTab,
      icon: <BarChart3 className="w-4 h-4" />,
      label: 'Status Board',
      badge: overdueCount > 0 ? overdueCount : null,
      badgeClass: 'bg-[#851f22] text-[#faf1ec] animate-pulse',
    },
  ];

  return (
    <div className={`w-full bg-[#faf1ec] text-[#121214] flex flex-col relative select-none ${
      isNativeDesktop ? 'h-screen border-none rounded-none' : 'rounded-3xl overflow-hidden shadow-2xl shadow-black/30 border border-[#382c38]/60 min-h-[700px]'
    }`}>
      {/* Windows App Window Header / Titlebar (only shown in dual preview mode) */}
      {!isNativeDesktop && (
        <div className="bg-[#121214] border-b border-[#382c38]/60 px-5 py-3 flex items-center justify-between select-none">
          {/* Subtle top gradient */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#382c38] to-transparent" />

          {/* Left: Window Title & App Icon */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg overflow-hidden border border-[#f1f5b1]/40 shadow-sm shrink-0">
              <img src="/app-icon.jpg" alt="App Icon" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-bold text-[#faf1ec] tracking-tight">
              Izumo — Desktop
            </span>
            <span className="text-[10px] bg-[#efcc59]/15 text-[#efcc59] px-2 py-0.5 rounded-full font-mono font-bold border border-[#efcc59]/30">
              Tray Active
            </span>
            {dueTodayCount > 0 && (
              <span className="text-[10px] bg-[#f1f5b1]/15 text-[#f1f5b1] px-2 py-0.5 rounded-full font-bold border border-[#f1f5b1]/20">
                {dueTodayCount} due today
              </span>
            )}
          </div>

          {/* Right: Window Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={onHideWindow}
              className="w-7 h-7 rounded-lg hover:bg-[#382c38] text-[#8f7c60] hover:text-[#faf1ec] flex items-center justify-center transition-all duration-150 hover:scale-110"
              title="Minimize to System Tray"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              className="w-7 h-7 rounded-lg hover:bg-[#382c38] text-[#8f7c60] hover:text-[#faf1ec] flex items-center justify-center transition-all duration-150 opacity-40 cursor-not-allowed"
              title="Maximize"
            >
              <SquareIcon className="w-3 h-3" />
            </button>
            <button
              onClick={onHideWindow}
              className="w-7 h-7 rounded-lg hover:bg-[#851f22] text-[#8f7c60] hover:text-[#faf1ec] flex items-center justify-center transition-all duration-150 hover:scale-110"
              title="Close window (Hides to System Tray per PRD 4.1)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Window Frame Area */}
      {isWindowVisible ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#faf1ec]">
          {/* Windows App Navigation Sidebar */}
          <aside className="w-full md:w-56 bg-[#121214] border-r border-[#382c38]/60 p-3 space-y-1 shrink-0 flex flex-col">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#f1f5b1]/70 px-3 py-2 mt-1">
              Navigation
            </div>

            {navItems.map((nav) => {
              const isActive = activeTab === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-between transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? 'bg-[#f1f5b1] text-[#121214] shadow-md font-bold'
                      : 'text-[#f1f5b1] hover:text-[#ffffff] hover:bg-[#382c38]/50'
                  }`}
                >
                  {/* Active left indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#121214] rounded-r-full" />
                  )}
                  <div className="flex items-center gap-2.5 pl-1">
                    <span className={`transition-colors duration-200 ${isActive ? 'text-[#121214]' : 'text-[#f1f5b1] group-hover:text-[#ffffff]'}`}>
                      {nav.icon}
                    </span>
                    <span>{nav.label}</span>
                  </div>
                  {nav.badge !== null && nav.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#121214] text-[#faf1ec]'
                        : nav.badgeClass
                    }`}>
                      {nav.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="border-t border-[#382c38]/50 my-2" />

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2.5 transition-all duration-200 group relative overflow-hidden ${
                activeTab === 'settings'
                  ? 'bg-[#f1f5b1] text-[#121214] shadow-md font-bold'
                  : 'text-[#f1f5b1] hover:text-[#ffffff] hover:bg-[#382c38]/50'
              }`}
            >
              {activeTab === 'settings' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#121214] rounded-r-full" />
              )}
              <span className="pl-1">
                <Settings className={`w-4 h-4 transition-transform duration-300 ${activeTab === 'settings' ? 'rotate-45 text-[#121214]' : 'text-[#f1f5b1] group-hover:rotate-12'}`} />
              </span>
              <span>Settings & Sound</span>
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Tray Status Info Card */}
            <div className="mt-4 p-3 rounded-xl bg-[#382c38]/20 border border-[#382c38]/40 text-[11px] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#f1f5b1] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#f1f5b1]" />
                <span>Tray Protected</span>
              </div>
              <p className="text-[#8f7c60] text-[10px] leading-relaxed">
                Closing hides to tray. Right-click icon to manage anytime.
              </p>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#386641] animate-pulse" />
                <span className="text-[#8f7c60] text-[10px] font-mono font-bold">{settings.syncCode}</span>
              </div>
            </div>
          </aside>

          {/* Windows Main Content Panel */}
          <main className="flex-1 p-5 overflow-y-auto bg-[#faf1ec] animate-slide-in-up">
            {children}
          </main>
        </div>
      ) : (
        /* Hidden Window Placeholder */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#faf1ec] space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-[#121214] border border-[#382c38]/60 flex items-center justify-center text-[#f1f5b1] shadow-xl animate-pulse">
            <Calendar className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#121214]">Izumo is Running in System Tray</h3>
            <p className="text-xs text-[#8f7c60] mt-1.5 max-w-sm mx-auto leading-relaxed font-medium">
              Izumo is active in the background. Click the tray icon or use the button below to restore the window.
            </p>
          </div>
          <button
            onClick={onHideWindow}
            className="px-6 py-2.5 bg-[#f1f5b1] hover:bg-[#e6eba0] text-[#121214] font-bold text-xs rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 border border-[#382c38]/20"
          >
            Re-open Window
          </button>
        </div>
      )}

      {/* Windows 11 Taskbar & System Tray Mockup (only in dual preview mode) */}
      {!isNativeDesktop && (
        <footer className="bg-[#121214] border-t border-[#382c38]/60 px-4 py-2 flex items-center justify-between text-xs select-none z-10 text-[#faf1ec]">
        {/* Taskbar Left: Start & App Icons */}
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 hover:bg-[#382c38] rounded-lg transition-all duration-150 hover:scale-110" title="Start">
            <Layout className="w-4 h-4 text-[#f1f5b1]" />
          </button>
          <button className="p-1.5 hover:bg-[#382c38] rounded-lg transition-all duration-150 text-[#8f7c60]" title="Search">
            <Search className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#382c38] mx-1" />

          {/* My Agenda Active Taskbar Icon */}
          <button
            onClick={onHideWindow}
            className={`px-2 py-1 rounded-lg flex items-center gap-1.5 transition-all duration-150 ${
              isWindowVisible
                ? 'bg-[#382c38] border border-[#f1f5b1]/30 text-[#faf1ec] font-bold shadow-inner'
                : 'text-[#8f7c60] hover:bg-[#382c38]/50'
            }`}
            title="My Agenda Desktop Window"
          >
            <div className="w-4 h-4 rounded bg-[#f1f5b1] flex items-center justify-center text-[#121214]">
              <Calendar className="w-2.5 h-2.5" />
            </div>
            <span className="hidden sm:inline text-[11px]">Izumo</span>
            {isWindowVisible && (
              <span className="hidden sm:inline w-1 h-1 bg-[#f1f5b1] rounded-full" />
            )}
          </button>
        </div>

        {/* Taskbar Right: System Tray */}
        <div className="flex items-center gap-2.5">
          <ChevronUp className="w-3.5 h-3.5 text-[#8f7c60]" />

          {/* System Tray Icon Area */}
          <div
            onClick={onHideWindow}
            onContextMenu={onOpenTrayMenu}
            className="relative p-1.5 rounded-lg bg-[#382c38]/80 hover:bg-[#382c38] border border-[#f1f5b1]/25 cursor-pointer transition-all duration-150 flex items-center gap-1 text-[#f1f5b1] hover:scale-105"
            title="Izumo Tray Icon — Left click: Open Dashboard | Right click: Menu"
          >
            <Calendar className="w-4 h-4 text-[#f1f5b1]" />
            {overdueCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#851f22] text-[#faf1ec] font-extrabold text-[9px] rounded-full flex items-center justify-center border-2 border-[#121214] animate-bounce">
                {overdueCount > 9 ? '9+' : overdueCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[#8f7c60]">
            <Wifi className="w-3.5 h-3.5" />
            <Volume2 className="w-3.5 h-3.5" />
          </div>

          {/* System Time */}
          <div className="text-[11px] font-mono text-[#faf1ec] text-right leading-tight">
            <div className="font-bold">{currentTimeStr}</div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
};
