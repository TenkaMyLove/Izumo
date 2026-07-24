import React from 'react';
import { ViewMode, AppSettings } from '../types';
import { Monitor, Smartphone, LayoutGrid, Volume2, Calendar, RefreshCw, Layers, Activity } from 'lucide-react';

interface TopDeviceBarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  settings: AppSettings;
  onPlaySound: () => void;
  onSimulateRollover: () => void;
  onResetData: () => void;
  isSyncing: boolean;
  itemCount: number;
  overdueCount: number;
}

export const TopDeviceBar: React.FC<TopDeviceBarProps> = ({
  viewMode,
  setViewMode,
  settings,
  onPlaySound,
  onSimulateRollover,
  onResetData,
  isSyncing,
  itemCount,
  overdueCount,
}) => {
  return (
    <header className="bg-[#121214] text-[#faf1ec] border-b border-[#382c38]/60 px-4 py-3 sticky top-0 z-50 shadow-lg shadow-black/30">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f1f5b1]/40 to-transparent" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-lg border border-[#f1f5b1]/40 group">
            <img src="/app-icon.jpg" alt="App Icon" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            {overdueCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#851f22] rounded-full flex items-center justify-center text-[#faf1ec] text-[9px] font-extrabold border-2 border-[#121214] animate-pulse">
                {overdueCount > 9 ? '9+' : overdueCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base tracking-tight text-[#faf1ec]">Izumo</h1>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-[#efcc59]/15 text-[#efcc59] border border-[#efcc59]/30 px-2.5 py-0.5 rounded-full">
                Bento Grid
              </span>
            </div>
            <p className="text-[11px] text-[#8f7c60] font-medium">
              Desktop Tray + Mobile Sync · <span className="text-[#faf1ec]/50 font-mono">{itemCount} items</span>
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#0d0d0f] p-1 rounded-2xl border border-[#382c38]/60 text-xs font-medium gap-0.5 shadow-inner">
          {(
            [
              { mode: 'dual', icon: <LayoutGrid className="w-3.5 h-3.5" />, label: 'Dual View', title: 'Desktop & Mobile side-by-side view' },
              { mode: 'desktop', icon: <Monitor className="w-3.5 h-3.5" />, label: 'Desktop', title: 'Desktop App with Windows Tray' },
              { mode: 'mobile', icon: <Smartphone className="w-3.5 h-3.5" />, label: 'Mobile', title: 'Mobile Companion App' },
              { mode: 'tray-only', icon: <Layers className="w-3.5 h-3.5" />, label: 'Tray', title: 'Tray Icon Pop-up view' },
            ] as { mode: ViewMode; icon: React.ReactNode; label: string; title: string }[]
          ).map(({ mode, icon, label, title }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={title}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                viewMode === mode
                  ? 'bg-[#f1f5b1] text-[#121214] shadow-md font-bold scale-[1.02]'
                  : 'text-[#8f7c60] hover:text-[#faf1ec] hover:bg-[#382c38]/40'
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* PRD Quick Actions */}
        <div className="flex items-center gap-2 text-xs">
          {/* Test Startup Sound */}
          <button
            onClick={onPlaySound}
            className="flex items-center gap-1.5 bg-[#382c38]/50 hover:bg-[#382c38] text-[#faf1ec] px-3 py-1.5 rounded-xl border border-[#382c38]/60 transition-all duration-200 hover:scale-105 hover:shadow-md"
            title="Test Startup Sound (PRD 4.9)"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#f1f5b1]" />
            <span className="hidden sm:inline font-medium">Sound</span>
          </button>

          {/* Test Day Rollover */}
          <button
            onClick={onSimulateRollover}
            className="flex items-center gap-1.5 bg-[#efcc59]/10 hover:bg-[#efcc59]/20 text-[#efcc59] border border-[#efcc59]/30 px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md hover:shadow-[#efcc59]/10 font-semibold"
            title="Simulate Day Rollover to test clearing yesterday's done items (PRD 4.5)"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rollover</span>
          </button>

          {/* Sync Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-medium transition-all duration-300 ${
            isSyncing
              ? 'bg-[#efcc59]/10 border-[#efcc59]/30 text-[#efcc59]'
              : 'bg-[#121214] border-[#382c38]/60 text-[#faf1ec]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSyncing ? 'bg-[#efcc59] animate-ping' : 'bg-[#386641]'}`} />
            <div className="flex items-center gap-1 text-[11px]">
              <Activity className={`w-3 h-3 ${isSyncing ? 'animate-pulse text-[#efcc59]' : 'text-[#8f7c60]'}`} />
              <span className="font-mono font-bold">{settings.syncCode}</span>
            </div>
          </div>

          {/* Overdue Quick Alert */}
          {overdueCount > 0 && (
            <span className="bg-[#851f22] text-[#faf1ec] border border-[#851f22]/50 px-3 py-1.5 rounded-xl font-bold text-xs animate-pulse shadow-sm shadow-[#851f22]/30">
              ⚠ {overdueCount} Overdue
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
