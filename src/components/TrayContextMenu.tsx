import React from 'react';
import { Calendar, Settings, Volume2, Power, Eye } from 'lucide-react';

interface TrayContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onOpenDashboard: () => void;
  onOpenSettings: () => void;
  onTestSound: () => void;
  onQuitApp: () => void;
  isWindowVisible: boolean;
  overdueCount: number;
}

export const TrayContextMenu: React.FC<TrayContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  onOpenDashboard,
  onOpenSettings,
  onTestSound,
  onQuitApp,
  isWindowVisible,
  overdueCount,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay to dismiss menu on click outside */}
      <div
        className="fixed inset-0 z-[100]"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Context Menu Card */}
      <div
        style={{
          left: Math.min(position.x, window.innerWidth - 220),
          top: Math.max(10, position.y - 190),
        }}
        className="fixed z-[101] w-56 bg-white/95 backdrop-blur-md text-[#121214] rounded-2xl shadow-2xl border border-[#382c38]/20 p-1.5 text-xs select-none animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Menu Header */}
        <div className="px-3 py-2 border-b border-[#382c38]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-[#121214] flex items-center justify-center text-[#faf1ec]">
              <Calendar className="w-3 h-3" />
            </div>
            <span className="font-bold text-[#121214]">Izumo</span>
          </div>
          <span className="text-[10px] text-[#386641] bg-[#386641]/10 px-1.5 py-0.5 rounded-full border border-[#386641]/30 font-mono font-bold">
            Tray Active
          </span>
        </div>

        {/* Menu Actions */}
        <div className="py-1 space-y-0.5">
          <button
            onClick={() => {
              onOpenDashboard();
              onClose();
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f1f5b1] hover:text-[#121214] flex items-center justify-between font-bold transition-colors text-[#121214] group"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#121214]" />
              <span>{isWindowVisible ? 'Focus Dashboard' : 'Open Dashboard'}</span>
            </div>
            {overdueCount > 0 && (
              <span className="bg-[#851f22] text-[#faf1ec] font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                {overdueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onTestSound();
              onClose();
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f8f5ef] flex items-center gap-2 font-bold transition-colors text-[#121214]"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#8f7c60]" />
            <span>Test Startup Chime</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f8f5ef] flex items-center gap-2 font-bold transition-colors text-[#121214]"
          >
            <Settings className="w-3.5 h-3.5 text-[#8f7c60]" />
            <span>Settings & Sound</span>
          </button>
        </div>

        <div className="border-t border-[#382c38]/15 my-1" />

        <button
          onClick={() => {
            onQuitApp();
            onClose();
          }}
          className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#851f22] hover:text-[#faf1ec] flex items-center justify-between font-bold transition-colors text-[#851f22]"
        >
          <div className="flex items-center gap-2">
            <Power className="w-3.5 h-3.5" />
            <span>Quit My Agenda</span>
          </div>
          <span className="text-[10px] opacity-70 font-bold">Exit Tray</span>
        </button>
      </div>
    </>
  );
};
