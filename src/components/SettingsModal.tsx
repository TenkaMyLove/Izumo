import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Volume2, Monitor, RefreshCw, Upload, Check, Play, HardDrive, Smartphone, Sparkles, X, Moon, Sun } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onTestSound: () => void;
  onResetDemoData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTestSound,
  onResetDemoData,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121214]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-[#382c38]/20 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-[#121214] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#382c38]/20 flex items-center justify-between bg-[#faf1ec]">
          <div>
            <h3 className="text-base font-bold text-[#121214] flex items-center gap-2">
              <span>Izumo Settings</span>
            </h3>
            <p className="text-xs text-[#8f7c60] mt-0.5 font-medium">
              Startup sound, Windows boot options, and Mobile sync pairing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8f7c60] hover:text-[#121214] hover:bg-[#f8f5ef] rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-[#121214]">
          {/* Section 0: Dark Mode Theme */}
          <div className="space-y-3 bg-[#faf1ec] p-4 rounded-2xl border border-[#382c38]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.darkMode ? <Moon className="w-4 h-4 text-[#efcc59]" /> : <Sun className="w-4 h-4 text-[#121214]" />}
                <h4 className="font-bold text-[#121214] text-sm">Dark Mode Theme</h4>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({ darkMode: !settings.darkMode })
                }
                className={`w-11 h-6 rounded-full transition-colors relative border border-[#382c38]/30 ${
                  settings.darkMode ? 'bg-[#efcc59]' : 'bg-[#beb5a0]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-[#121214] transition-transform shadow-xs ${
                    settings.darkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[#8f7c60] leading-relaxed font-semibold">
              Switch app background and panels to dark mode aesthetic.
            </p>
          </div>

          {/* Section 1: Startup Sound */}
          <div className="space-y-3 bg-[#faf1ec] p-4 rounded-2xl border border-[#382c38]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#121214]" />
                <h4 className="font-bold text-[#121214] text-sm">Startup Sound Cue</h4>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({ startupSoundEnabled: !settings.startupSoundEnabled })
                }
                className={`w-11 h-6 rounded-full transition-colors relative border border-[#382c38]/30 ${
                  settings.startupSoundEnabled ? 'bg-[#f1f5b1]' : 'bg-[#beb5a0]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-[#121214] transition-transform shadow-xs ${
                    settings.startupSoundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[#8f7c60] leading-relaxed font-semibold">
              Plays a light audio chime once when Windows starts up and the app enters system tray.
            </p>

            {settings.startupSoundEnabled && (
              <div className="pt-2 space-y-3 border-t border-[#382c38]/15">
                <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-[#382c38]/20 shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="w-4 h-4 text-[#efcc59] shrink-0" />
                    <span className="font-bold text-[#121214] truncate">
                      {settings.customSoundData
                        ? settings.customSoundName || 'Custom Uploaded Sound'
                        : 'Izumo Startup Sound Cue (Tenka.mp3)'}
                    </span>
                  </div>

                  <button
                    onClick={onTestSound}
                    className="px-3 py-1.5 bg-[#f1f5b1] hover:bg-[#f1f5b1]/80 text-[#121214] border border-[#382c38]/20 font-bold rounded-xl flex items-center gap-1 transition shrink-0 shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-[#121214]" />
                    <span>Test Sound</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-[#f8f5ef] hover:bg-[#faf1ec] text-[#121214] px-3 py-1.5 rounded-2xl border border-[#382c38]/30 font-bold flex items-center gap-1.5 transition shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-[#121214]" />
                    <span>Upload Custom Sound (.wav/.mp3)</span>
                    <input
                      type="file"
                      accept="audio/wav,audio/mp3,audio/mpeg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {settings.customSoundData && (
                    <button
                      onClick={() =>
                        onUpdateSettings({
                          customSoundName: 'Izumo Startup Sound Cue (Tenka.mp3)',
                          customSoundData: undefined,
                        })
                      }
                      className="text-[#8f7c60] hover:text-[#121214] underline font-bold"
                    >
                      Reset to default
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Windows Auto-Start */}
          <div className="space-y-3 bg-[#faf1ec] p-4 rounded-2xl border border-[#382c38]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#121214]" />
                <h4 className="font-bold text-[#121214] text-sm">Launch on Windows Login</h4>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({ autoStartWindows: !settings.autoStartWindows })
                }
                className={`w-11 h-6 rounded-full transition-colors relative border border-[#382c38]/30 ${
                  settings.autoStartWindows ? 'bg-[#f1f5b1]' : 'bg-[#beb5a0]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-[#121214] transition-transform shadow-xs ${
                    settings.autoStartWindows ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[#8f7c60] leading-relaxed font-semibold">
              Launches background process automatically in system tray on Windows boot with zero console window.
            </p>

            <div className="bg-[#121214] p-2.5 rounded-2xl border border-[#382c38] font-mono text-[11px] text-[#faf1ec] break-all shadow-xs">
              %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\MyAgenda.lnk
            </div>
          </div>

          {/* Section 3: Mobile Sync & Pairing */}
          <div className="space-y-3 bg-[#faf1ec] p-4 rounded-2xl border border-[#382c38]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#386641]" />
                <h4 className="font-bold text-[#121214] text-sm">Mobile Sync Pairing</h4>
              </div>
              <span className="text-[10px] bg-[#386641]/20 text-[#386641] border border-[#386641]/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
                Synced ({settings.lastSyncTime})
              </span>
            </div>

            <p className="text-[#8f7c60] leading-relaxed font-semibold">
              Use this code on your mobile companion app to sync agenda items in real time.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={settings.syncCode || ''}
                onChange={(e) => onUpdateSettings({ syncCode: e.target.value.toUpperCase() })}
                placeholder="XX-1234"
                className="bg-[#121214] border border-[#382c38] px-4 py-2 rounded-2xl text-lg font-mono font-black text-[#f1f5b1] tracking-wider shadow-xs focus:outline-none focus:ring-2 focus:ring-[#efcc59] uppercase w-44"
              />

              <button
                onClick={handleCopyCode}
                className="px-3.5 py-2 bg-[#f8f5ef] hover:bg-[#faf1ec] text-[#121214] rounded-2xl border border-[#382c38]/30 font-bold transition flex items-center gap-1.5 shadow-xs text-xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#386641]" /> : <RefreshCw className="w-3.5 h-3.5 text-[#8f7c60]" />}
                <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={() => {
                  const newCode = `AG-${Math.floor(1000 + Math.random() * 9000)}`;
                  onUpdateSettings({ syncCode: newCode });
                }}
                className="px-3.5 py-2 rounded-2xl border font-bold text-xs bg-[#efcc59]/20 text-[#121214] border-[#efcc59]/50 hover:bg-[#efcc59]/30 transition"
              >
                New Code
              </button>
            </div>
          </div>

          {/* Section 4: Data Reset */}
          <div className="pt-2 flex items-center justify-between border-t border-[#382c38]/15">
            <div className="flex items-center gap-2 text-[#8f7c60] font-bold">
              <HardDrive className="w-4 h-4" />
              <span>Stored in /data/agenda.json</span>
            </div>

            <button
              onClick={onResetDemoData}
              className="text-[#851f22] hover:underline font-bold"
            >
              Reset Seed Data
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#faf1ec] border-t border-[#382c38]/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-[#f1f5b1] hover:bg-[#f1f5b1]/80 text-[#121214] border border-[#382c38]/20 font-bold transition text-xs shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
