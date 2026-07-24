import React, { useState } from 'react';
import { AppSettings } from '../types';
import {
  Volume2,
  Monitor,
  RefreshCw,
  Upload,
  Check,
  Play,
  HardDrive,
  Smartphone,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onTestSound: () => void;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onTestSound,
  onResetDemoData,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const isDark = Boolean(settings.darkMode);

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
    <div className="space-y-6 max-w-4xl animate-slide-in-up">
      {/* Tab Header Banner */}
      <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
        isDark ? 'bg-[#1e1c20] border-[#382c38]' : 'bg-white border-[#382c38]/15'
      }`}>
        <div>
          <h3 className={`text-lg font-black flex items-center gap-2 ${isDark ? 'text-[#faf1ec]' : 'text-[#121214]'}`}>
            <span>⚙️ Settings & Sound</span>
          </h3>
          <p className={`text-xs mt-1 font-medium ${isDark ? 'text-[#a095a0]' : 'text-[#8f7c60]'}`}>
            Manage appearance theme, startup sounds, Windows boot, and live mobile sync.
          </p>
        </div>
      </div>

      {/* Grid of Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Card 1: Appearance & Dark Mode */}
        <div className={`p-5 rounded-3xl border space-y-4 shadow-xs transition-all duration-200 ${
          isDark ? 'bg-[#1e1c20] border-[#382c38]' : 'bg-white border-[#382c38]/15'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isDark ? 'bg-[#efcc59]/20 text-[#efcc59] border-[#efcc59]/40' : 'bg-[#121214] text-[#faf1ec] border-[#121214]'
              }`}>
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <h4 className={`font-bold text-sm ${isDark ? 'text-[#faf1ec]' : 'text-[#121214]'}`}>Appearance Theme</h4>
                <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-[#efcc59]' : 'text-[#8f7c60]'}`}>
                  {isDark ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ darkMode: !isDark })}
              className={`w-12 h-6.5 rounded-full transition-colors relative border p-0.5 ${
                isDark ? 'bg-[#efcc59] border-[#efcc59]' : 'bg-[#382c38]/20 border-[#382c38]/30'
              }`}
              title="Toggle Dark / Light Mode"
            >
              <span
                className={`w-5 h-5 rounded-full bg-[#121214] flex items-center justify-center transition-transform shadow-sm ${
                  isDark ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              >
                {isDark ? <Moon className="w-3 h-3 text-[#efcc59]" /> : <Sun className="w-3 h-3 text-[#faf1ec]" />}
              </span>
            </button>
          </div>

          <p className={`leading-relaxed font-medium ${isDark ? 'text-[#a095a0]' : 'text-[#8f7c60]'}`}>
            Switch between modern sleek Dark Mode (`#121214`) and classic Warm Cream (`#faf1ec`).
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onUpdateSettings({ darkMode: false })}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                !isDark
                  ? 'bg-[#121214] text-[#faf1ec] border-[#121214]'
                  : 'bg-[#121214]/40 text-[#a095a0] border-[#382c38] hover:text-[#faf1ec]'
              }`}
            >
              ☀️ Light Theme
            </button>
            <button
              onClick={() => onUpdateSettings({ darkMode: true })}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                isDark
                  ? 'bg-[#efcc59] text-[#121214] border-[#efcc59]'
                  : 'bg-[#f8f5ef] text-[#8f7c60] border-[#382c38]/20 hover:text-[#121214]'
              }`}
            >
              🌙 Dark Theme
            </button>
          </div>
        </div>

        {/* Card 2: Startup Sound Cue */}
        <div className={`p-5 rounded-3xl border space-y-4 shadow-xs transition-all duration-200 ${
          isDark ? 'bg-[#1e1c20] border-[#382c38]' : 'bg-white border-[#382c38]/15'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isDark ? 'bg-[#f1f5b1]/20 text-[#f1f5b1] border-[#f1f5b1]/30' : 'bg-[#f1f5b1] text-[#121214] border-[#382c38]/20'
              }`}>
                <Volume2 className="w-4 h-4" />
              </div>
              <h4 className={`font-bold text-sm ${isDark ? 'text-[#faf1ec]' : 'text-[#121214]'}`}>Startup Sound Cue</h4>
            </div>

            <button
              onClick={() => onUpdateSettings({ startupSoundEnabled: !settings.startupSoundEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative border ${
                settings.startupSoundEnabled ? 'bg-[#f1f5b1] border-[#382c38]/30' : 'bg-[#beb5a0] border-[#382c38]/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-[#121214] transition-transform shadow-xs ${
                  settings.startupSoundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <p className={`leading-relaxed font-medium ${isDark ? 'text-[#a095a0]' : 'text-[#8f7c60]'}`}>
            Plays an audio chime once when Windows starts up and Izumo enters system tray.
          </p>

          {settings.startupSoundEnabled && (
            <div className="pt-2 space-y-3 border-t border-[#382c38]/15">
              <div className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 shadow-xs ${
                isDark ? 'bg-[#121214] border-[#382c38]' : 'bg-[#faf1ec] border-[#382c38]/15'
              }`}>
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-[#efcc59] shrink-0" />
                  <span className={`font-bold truncate text-xs ${isDark ? 'text-[#faf1ec]' : 'text-[#121214]'}`}>
                    {settings.customSoundData
                      ? settings.customSoundName || 'Custom Sound'
                      : 'Izumo Startup Sound Cue (Tenka.mp3)'}
                  </span>
                </div>
                <button
                  onClick={onTestSound}
                  className="px-3 py-1.5 bg-[#f1f5b1] hover:bg-[#e6eba0] text-[#121214] border border-[#382c38]/20 font-bold rounded-xl flex items-center gap-1 transition shrink-0 shadow-xs"
                >
                  <Play className="w-3 h-3 fill-[#121214]" />
                  <span>Test</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className={`cursor-pointer px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition shadow-xs ${
                  isDark ? 'bg-[#121214] text-[#faf1ec] border-[#382c38] hover:bg-[#252225]' : 'bg-[#f8f5ef] text-[#121214] border-[#382c38]/30 hover:bg-[#faf1ec]'
                }`}>
                  <Upload className="w-3.5 h-3.5 text-[#efcc59]" />
                  <span>Upload Audio</span>
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
                    Reset default
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Windows Auto-Start */}
        <div className={`p-5 rounded-3xl border space-y-4 shadow-xs transition-all duration-200 ${
          isDark ? 'bg-[#1e1c20] border-[#382c38]' : 'bg-white border-[#382c38]/15'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isDark ? 'bg-[#382c38] text-[#faf1ec] border-[#382c38]' : 'bg-[#f8f5ef] text-[#121214] border-[#382c38]/20'
              }`}>
                <Monitor className="w-4 h-4" />
              </div>
              <h4 className={`font-bold text-sm ${isDark ? 'text-[#faf1ec]' : 'text-[#121214]'}`}>Launch on Windows Login</h4>
            </div>

            <button
              onClick={() => onUpdateSettings({ autoStartWindows: !settings.autoStartWindows })}
              className={`w-11 h-6 rounded-full transition-colors relative border ${
                settings.autoStartWindows ? 'bg-[#f1f5b1] border-[#382c38]/30' : 'bg-[#beb5a0] border-[#382c38]/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-[#121214] transition-transform shadow-xs ${
                  settings.autoStartWindows ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <p className={`leading-relaxed font-medium ${isDark ? 'text-[#a095a0]' : 'text-[#8f7c60]'}`}>
            Launches background tray process automatically when your Windows computer starts up.
          </p>

          <div className="bg-[#121214] p-2.5 rounded-xl border border-[#382c38] font-mono text-[10px] text-[#faf1ec] break-all">
            %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Izumo.lnk
          </div>
        </div>

        {/* Card 4: Mobile Sync Pairing */}
        <div className={`p-5 rounded-3xl border space-y-4 shadow-xs transition-all duration-200 ${
          isDark ? 'bg-[#1e1c20] border-[#382c38]' : 'bg-white border-[#382c38]/15'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#386641]/20 border border-[#386641]/40 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-[#386641]" />
              </div>
              <h4 className={`font-bold text-sm ${isDark ? 'text-[#faf1ec]' : 'text-[#121214]'}`}>Mobile Sync Pairing</h4>
            </div>

            <span className="text-[10px] bg-[#386641]/20 text-[#386641] border border-[#386641]/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
              Active ({settings.lastSyncTime})
            </span>
          </div>

          <p className={`leading-relaxed font-medium ${isDark ? 'text-[#a095a0]' : 'text-[#8f7c60]'}`}>
            Enter this code into your phone app to sync your agenda across devices in real time.
          </p>

          <div className="flex items-center gap-3">
            <div className="bg-[#121214] border border-[#382c38] px-4 py-2 rounded-2xl text-lg font-mono font-black text-[#f1f5b1] tracking-wider shadow-xs">
              {settings.syncCode}
            </div>

            <button
              onClick={handleCopyCode}
              className={`px-3.5 py-2 rounded-2xl border font-bold transition flex items-center gap-1.5 shadow-xs ${
                isDark
                  ? 'bg-[#121214] hover:bg-[#252225] text-[#faf1ec] border-[#382c38]'
                  : 'bg-[#f8f5ef] hover:bg-[#faf1ec] text-[#121214] border-[#382c38]/30'
              }`}
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#386641]" /> : <RefreshCw className="w-3.5 h-3.5 text-[#8f7c60]" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card 5: Danger / Reset Zone */}
      <div className={`p-4 rounded-3xl border flex items-center justify-between ${
        isDark ? 'bg-[#1e1c20] border-[#382c38]' : 'bg-white border-[#382c38]/15'
      }`}>
        <div className="flex items-center gap-2 font-bold text-[#8f7c60]">
          <HardDrive className="w-4 h-4" />
          <span>Local storage: /data/agenda.json</span>
        </div>
        <button
          onClick={onResetDemoData}
          className="text-[#851f22] hover:underline font-bold hover:scale-105 transition-transform"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
};
