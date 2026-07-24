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
  Signal
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
  overdueCount,
  simulatedDate,
  isSyncing,
}) => {
  const todayStr = getTodayDateString(simulatedDate);
  const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full max-w-[380px] mx-auto bg-[#faf1ec] text-[#121214] rounded-[48px] p-3 shadow-2xl shadow-black/40 border-[3px] border-[#121214] ring-4 ring-[#382c38]/20 flex flex-col relative min-h-[740px] select-none">
      {/* Dynamic Island */}
      <div className="w-28 h-[18px] bg-[#121214] rounded-full mx-auto mb-2 flex items-center justify-center gap-2 z-20 border border-[#382c38]/30">
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
            <img src="/app-icon.jpg" alt="App Icon" className="w-full h-full object-cover" />
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
      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-3 max-h-[500px]">
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
            onToggleDone={() => {}}
          />
        )}
      </div>

      {/* Bottom Navigation Tab Bar */}
      <nav className="mt-2 bg-[#121214] border border-[#382c38]/60 rounded-2xl p-1.5 grid grid-cols-4 gap-0.5 text-[10px] font-bold text-[#8f7c60] shadow-lg">
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
            <span className="text-[9px] font-bold">{label}</span>
            {badge !== null && badge !== undefined && badge > 0 && (
              <span className="absolute -top-0.5 right-1.5 w-3 h-3 rounded-full bg-[#851f22] text-[#faf1ec] text-[8px] font-extrabold flex items-center justify-center animate-pulse">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Home Gesture Bar */}
      <div className="w-28 h-1 bg-[#382c38]/40 rounded-full mx-auto mt-2 opacity-60" />
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
  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <Calendar className="w-8 h-8 text-[#beb5a0] mx-auto mb-2" />
        <p className="text-xs text-[#8f7c60] font-medium">No agenda items yet.</p>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => {
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
                ? 'bg-[#851f22]/8 border-l-2 border-l-[#851f22] border-[#851f22]/25'
                : status === 'Due Today'
                ? 'bg-[#efcc59]/10 border-l-2 border-l-[#efcc59] border-[#efcc59]/35'
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
  const animeManhwa = items.filter((i) => i.category === 'Anime' || i.category === 'Manhwa');
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
        <div key={item.id} className="bg-white border border-[#382c38]/15 p-3 rounded-2xl space-y-2 text-xs">
          <div className="flex items-start justify-between gap-1">
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                  item.category === 'Anime' ? 'bg-[#121214] text-[#faf1ec] border-[#121214]' : 'bg-[#efcc59]/20 text-[#121214] border-[#efcc59]/50'
                }`}>
                  {item.category}
                </span>
                {item.recurrence && item.recurrence !== 'none' && (
                  <span className="text-[9px] bg-[#efcc59]/15 text-[#121214] border border-[#efcc59]/40 px-1.5 py-0.5 rounded font-bold">
                    <Repeat className="w-2.5 h-2.5 inline" />
                  </span>
                )}
              </div>
              <span className={`font-bold text-[#121214] block mt-1 ${item.isWatched ? 'line-through text-[#8f7c60]' : ''}`}>
                {item.title}
              </span>
            </div>
            <span className="text-[10px] text-[#8f7c60] font-bold shrink-0 font-mono">
              {item.category}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => onToggleWatched(item.id, !!item.isWatched)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all duration-150 ${
                item.isWatched
                  ? 'bg-[#386641]/15 text-[#386641] border border-[#386641]/30'
                  : 'bg-[#efcc59]/15 text-[#121214] border border-[#efcc59]/40'
              }`}
            >
              {item.isWatched ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>{item.isWatched ? 'Watched' : 'Mark Watched'}</span>
            </button>
            <div className="flex items-center gap-1">
              {item.link && (
                <button
                  onClick={() => onOpenLink(item.link!, item.title)}
                  className="p-1.5 bg-[#121214] text-[#faf1ec] rounded-lg border border-[#121214] transition-all duration-150 hover:scale-110"
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
            </div>
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
}> = ({ items, todayStr }) => {
  const overdue = items.filter((i) => getItemStatus(i, todayStr) === 'Overdue');
  const dueToday = items.filter((i) => getItemStatus(i, todayStr) === 'Due Today');
  const upcoming = items.filter((i) => getItemStatus(i, todayStr) === 'Upcoming');
  const done = items.filter((i) => getItemStatus(i, todayStr) === 'Done');

  const sections = [
    { label: 'Overdue', items: overdue, bg: 'bg-[#851f22]/8', border: 'border-l-2 border-l-[#851f22] border-[#851f22]/25', text: 'text-[#851f22]' },
    { label: 'Due Today', items: dueToday, bg: 'bg-[#efcc59]/10', border: 'border-l-2 border-l-[#efcc59] border-[#efcc59]/30', text: 'text-[#121214]' },
    { label: 'Upcoming', items: upcoming, bg: 'bg-white', border: 'border-[#382c38]/15', text: 'text-[#386641]' },
    { label: 'Done', items: done, bg: 'bg-[#f8f5ef]', border: 'border-[#382c38]/10', text: 'text-[#8f7c60]' },
  ];

  return (
    <div className="space-y-2.5 px-1 text-xs">
      {sections.map(({ label, items: groupItems, bg, border, text }) => (
        <div key={label} className={`p-3 ${bg} border ${border} rounded-2xl`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`font-bold ${text}`}>{label}</span>
            <span className={`text-[10px] font-mono font-bold ${text} opacity-70`}>{groupItems.length}</span>
          </div>
          {groupItems.length === 0 ? (
            <p className="text-[10px] text-[#8f7c60] italic font-medium">No items.</p>
          ) : (
            <div className="space-y-1">
              {groupItems.map((i) => (
                <span key={i.id} className="block text-[#121214] text-[11px] truncate font-semibold">
                  · {i.title}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* Mobile Settings */
const MobileSettings: React.FC<{
  settings: AppSettings;
  onToggleDone: () => void;
}> = ({ settings }) => {
  return (
    <div className="px-1 space-y-3">
      <div className="p-4 bg-white border border-[#382c38]/15 rounded-2xl space-y-3 text-xs">
        <div className="font-bold text-[#121214] flex items-center gap-2">
          <div className="w-7 h-7 bg-[#f1f5b1] rounded-xl flex items-center justify-center border border-[#382c38]/15">
            <Smartphone className="w-4 h-4 text-[#121214]" />
          </div>
          <span>Mobile Sync Pair</span>
        </div>
        <p className="text-[11px] text-[#8f7c60] font-medium">Connected to Desktop via Pair Code:</p>
        <div className="p-3 bg-[#121214] text-[#f1f5b1] font-mono font-black text-center rounded-xl text-lg border border-[#382c38]/40 tracking-widest">
          {settings.syncCode}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#386641] animate-pulse" />
          <p className="text-[10px] text-[#8f7c60] font-medium">
            Data syncs live whenever either app updates items.
          </p>
        </div>
      </div>

      <div className="p-3 bg-[#faf1ec] border border-[#382c38]/15 rounded-2xl text-[10px] text-[#8f7c60] font-medium space-y-1">
        <div className="font-bold text-[#121214] text-xs">Quick Stats</div>
        <div>Sync code: <span className="font-mono font-bold text-[#121214]">{settings.syncCode}</span></div>
      </div>
    </div>
  );
};
