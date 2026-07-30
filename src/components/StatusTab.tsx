import React from 'react';
import { AgendaItem } from '../types';
import { getItemStatus, formatFriendlyDate, getTodayDateString } from '../utils/dateUtils';
import { AlertCircle, Clock, Calendar, CheckCircle2, ExternalLink, Edit3, CheckSquare, Square, Repeat } from 'lucide-react';

interface StatusTabProps {
  items: AgendaItem[];
  simulatedDate?: string;
  darkMode?: boolean;
  onToggleDone: (id: string, currentDone: boolean) => void;
  onEditItem: (item: AgendaItem) => void;
  onOpenLink: (url: string, title: string) => void;
}

export const StatusTab: React.FC<StatusTabProps> = ({
  items,
  simulatedDate,
  darkMode,
  onToggleDone,
  onEditItem,
  onOpenLink,
}) => {
  const isDark = Boolean(darkMode);
  const todayStr = getTodayDateString(simulatedDate);

  const overdueItems: AgendaItem[] = [];
  const dueTodayItems: AgendaItem[] = [];
  const upcomingItems: AgendaItem[] = [];
  const doneItems: AgendaItem[] = [];

  items.forEach((item) => {
    const status = getItemStatus(item, todayStr);
    if (status === 'Overdue') overdueItems.push(item);
    else if (status === 'Due Today') dueTodayItems.push(item);
    else if (status === 'Upcoming') upcomingItems.push(item);
    else if (status === 'Done') doneItems.push(item);
  });

  const sortByDate = (a: AgendaItem, b: AgendaItem) => a.dueDate.localeCompare(b.dueDate);
  overdueItems.sort(sortByDate);
  dueTodayItems.sort(sortByDate);
  upcomingItems.sort(sortByDate);
  doneItems.sort(sortByDate);

  const statCards = [
    {
      label: 'Overdue',
      count: overdueItems.length,
      icon: <AlertCircle className="w-6 h-6" />,
      bg: isDark ? 'bg-[#851f22]/30' : 'bg-[#851f22]/10',
      border: overdueItems.length > 0 
        ? isDark ? 'border-[#ff5555]' : 'border-[#851f22]/40' 
        : isDark ? 'border-[#851f22]/40' : 'border-[#851f22]/20',
      text: isDark ? 'text-[#ff6b6b]' : 'text-[#851f22]',
      subText: isDark ? 'text-[#ff6b6b]/70' : 'text-[#851f22]/70',
      pulse: overdueItems.length > 0,
    },
    {
      label: 'Due Today',
      count: dueTodayItems.length,
      icon: <Clock className="w-6 h-6" />,
      bg: isDark ? 'bg-[#efcc59]/20' : 'bg-[#efcc59]/20',
      border: dueTodayItems.length > 0 
        ? isDark ? 'border-[#efcc59]' : 'border-[#d4ab28]' 
        : isDark ? 'border-[#efcc59]/30' : 'border-[#d4ab28]/30',
      text: isDark ? 'text-[#efcc59]' : 'text-[#8a6d0b]',
      subText: isDark ? 'text-[#efcc59]/70' : 'text-[#8a6d0b]/70',
      pulse: false,
    },
    {
      label: 'Upcoming',
      count: upcomingItems.length,
      icon: <Calendar className="w-6 h-6" />,
      bg: isDark ? 'bg-[#386641]/20' : 'bg-[#386641]/12',
      border: isDark ? 'border-[#386641]/50' : 'border-[#386641]/30',
      text: isDark ? 'text-[#4ade80]' : 'text-[#2d5a35]',
      subText: isDark ? 'text-[#4ade80]/70' : 'text-[#2d5a35]/70',
      pulse: false,
    },
    {
      label: 'Completed',
      count: doneItems.length,
      icon: <CheckCircle2 className="w-6 h-6" />,
      bg: isDark ? 'bg-[#1c1a1e]' : 'bg-white',
      border: isDark ? 'border-[#382c38]' : 'border-[#382c38]/15 shadow-xs',
      text: isDark ? 'text-[#faf1ec]' : 'text-[#121214]',
      subText: isDark ? 'text-[#a095a0]' : 'text-[#8f7c60]',
      pulse: false,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} border ${card.border} p-4 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${card.text}`}>
                {card.label}
              </span>
              <span className={`${card.text} opacity-80 ${card.pulse ? 'animate-pulse' : ''}`}>
                {card.icon}
              </span>
            </div>
            <div>
              <span className={`text-3xl font-black ${card.text} block leading-none`}>
                {card.count}
              </span>
              <span className={`text-[10px] font-medium mt-1 block ${card.subText}`}>
                {card.count === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Status Sections */}
      <StatusSection
        title="Overdue"
        count={overdueItems.length}
        colorClass={isDark ? 'text-[#ff6b6b]' : 'text-[#851f22]'}
        borderAccent="border-l-[#851f22]"
        bgAccent={isDark ? 'bg-[#851f22]/30' : 'bg-[#851f22]/15'}
        icon={<AlertCircle className={`w-4 h-4 ${isDark ? 'text-[#ff6b6b]' : 'text-[#851f22]'}`} />}
        items={overdueItems}
        todayStr={todayStr}
        isDark={isDark}
        isOverdueSection={true}
        onToggleDone={onToggleDone}
        onEditItem={onEditItem}
        onOpenLink={onOpenLink}
        emptyMsg="No overdue items — you're on track!"
      />

      <StatusSection
        title="Due Today"
        count={dueTodayItems.length}
        colorClass={isDark ? 'text-[#efcc59]' : 'text-[#8a6d0b]'}
        borderAccent="border-l-[#efcc59]"
        bgAccent={isDark ? 'bg-[#efcc59]/20' : 'bg-[#efcc59]/20'}
        icon={<Clock className={`w-4 h-4 ${isDark ? 'text-[#efcc59]' : 'text-[#8a6d0b]'}`} />}
        items={dueTodayItems}
        todayStr={todayStr}
        isDark={isDark}
        onToggleDone={onToggleDone}
        onEditItem={onEditItem}
        onOpenLink={onOpenLink}
        emptyMsg="Nothing due today."
      />

      <StatusSection
        title="Upcoming"
        count={upcomingItems.length}
        colorClass={isDark ? 'text-[#4ade80]' : 'text-[#2d5a35]'}
        borderAccent="border-l-[#386641]"
        bgAccent={isDark ? 'bg-[#386641]/20' : 'bg-[#386641]/12'}
        icon={<Calendar className={`w-4 h-4 ${isDark ? 'text-[#4ade80]' : 'text-[#2d5a35]'}`} />}
        items={upcomingItems}
        todayStr={todayStr}
        isDark={isDark}
        onToggleDone={onToggleDone}
        onEditItem={onEditItem}
        onOpenLink={onOpenLink}
        emptyMsg="No upcoming items scheduled."
      />

      <StatusSection
        title="Done Today"
        count={doneItems.length}
        colorClass={isDark ? 'text-[#a095a0]' : 'text-[#6b5e52]'}
        borderAccent="border-l-[#382c38]/40"
        bgAccent={isDark ? 'bg-[#1c1a1e]' : 'bg-[#f8f5ef]'}
        icon={<CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-[#a095a0]' : 'text-[#6b5e52]'}`} />}
        items={doneItems}
        todayStr={todayStr}
        isDark={isDark}
        onToggleDone={onToggleDone}
        onEditItem={onEditItem}
        onOpenLink={onOpenLink}
        emptyMsg="No completed items yet today."
        subNote="Clears automatically at next day rollover"
      />
    </div>
  );
};

interface StatusSectionProps {
  title: string;
  count: number;
  colorClass: string;
  borderAccent: string;
  bgAccent: string;
  icon: React.ReactNode;
  items: AgendaItem[];
  todayStr: string;
  isDark: boolean;
  isOverdueSection?: boolean;
  onToggleDone: (id: string, currentDone: boolean) => void;
  onEditItem: (item: AgendaItem) => void;
  onOpenLink: (url: string, title: string) => void;
  emptyMsg?: string;
  subNote?: string;
}

const StatusSection: React.FC<StatusSectionProps> = ({
  title,
  count,
  colorClass,
  borderAccent,
  bgAccent,
  icon,
  items,
  todayStr,
  isDark,
  isOverdueSection,
  onToggleDone,
  onEditItem,
  onOpenLink,
  emptyMsg,
  subNote,
}) => {
  return (
    <div className={`border-l-2 ${borderAccent} pl-4 space-y-2`}>
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-lg ${bgAccent} border ${borderAccent.replace('border-l-', 'border-')} flex items-center justify-center`}>
          {icon}
        </div>
        <h4 className={`text-xs font-bold uppercase tracking-widest ${colorClass}`}>
          {title}
        </h4>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
          isDark ? 'bg-[#121214] text-[#faf1ec] border border-[#382c38]' : 'bg-[#121214] text-[#faf1ec]'
        }`}>
          {count}
        </span>
        {subNote && (
          <span className={`text-[10px] italic hidden sm:inline ${isDark ? 'text-[#a095a0]' : 'text-[#8f7c60]'}`}>· {subNote}</span>
        )}
      </div>

      {items.length === 0 ? (
        <p className={`text-xs italic py-1 pl-1 font-medium ${isDark ? 'text-[#a095a0]' : 'text-[#8f7c60]'}`}>
          {emptyMsg || 'No items.'}
        </p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => {
            const friendlyDate = formatFriendlyDate(item.dueDate, todayStr);
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl flex items-center justify-between gap-3 text-xs transition-all duration-150 shadow-xs group ${
                  item.isDone
                    ? isDark ? 'bg-[#1c1a1e] border-[#382c38]/40 text-[#a095a0] opacity-75' : 'bg-[#f8f5ef] border-[#382c38]/20 text-[#6b5e52] opacity-75'
                    : isOverdueSection
                    ? 'bg-[#f1f5b1] border-l-4 border-l-[#851f22] border-[#382c38]/25 text-[#121214] hover:bg-[#e6eba0]'
                    : 'bg-[#f1f5b1] border-[#382c38]/25 text-[#121214] hover:bg-[#e6eba0]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleDone(item.id, item.isDone)}
                    className="text-[#121214] hover:text-[#382c38] transition-transform duration-150 hover:scale-110 shrink-0"
                  >
                    {item.isDone ? (
                      <CheckSquare className="w-4 h-4 text-[#386641] fill-[#386641]/15" />
                    ) : (
                      <Square className="w-4 h-4 text-[#121214] hover:text-[#382c38]" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold truncate block ${item.isDone ? 'line-through text-[#8f7c60]' : 'text-[#121214]'}`}>
                        {item.title}
                      </span>
                      {item.recurrence && item.recurrence !== 'none' && (
                        <span className="text-[9px] bg-[#121214] text-[#faf1ec] border border-[#121214] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shrink-0" title="Recurring">
                          <Repeat className="w-2.5 h-2.5 text-[#f1f5b1]" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#382c38]/80 font-semibold">
                      {item.category} · {friendlyDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  {item.link && (
                    <button
                      onClick={() => onOpenLink(item.link!, item.title)}
                      className="p-1.5 bg-[#121214] text-[#faf1ec] rounded-lg border border-[#121214] hover:bg-[#382c38] transition-all duration-150 hover:scale-110"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => onEditItem(item)}
                    className="p-1.5 bg-white/80 text-[#121214] rounded-lg border border-[#382c38]/25 hover:bg-white transition-all duration-150 hover:scale-110"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
