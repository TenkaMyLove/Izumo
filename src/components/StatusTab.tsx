import React from 'react';
import { AgendaItem } from '../types';
import { getItemStatus, formatFriendlyDate, getTodayDateString } from '../utils/dateUtils';
import { AlertCircle, Clock, Calendar, CheckCircle2, ExternalLink, Edit3, CheckSquare, Square, Repeat } from 'lucide-react';

interface StatusTabProps {
  items: AgendaItem[];
  simulatedDate?: string;
  onToggleDone: (id: string, currentDone: boolean) => void;
  onEditItem: (item: AgendaItem) => void;
  onOpenLink: (url: string, title: string) => void;
}

export const StatusTab: React.FC<StatusTabProps> = ({
  items,
  simulatedDate,
  onToggleDone,
  onEditItem,
  onOpenLink,
}) => {
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

  const totalActive = overdueItems.length + dueTodayItems.length + upcomingItems.length;
  const completionPct = items.length > 0 ? Math.round((doneItems.length / items.length) * 100) : 0;

  const statCards = [
    {
      label: 'Overdue',
      count: overdueItems.length,
      icon: <AlertCircle className="w-6 h-6" />,
      bg: 'bg-[#851f22]/30',
      border: overdueItems.length > 0 ? 'border-[#ff5555]' : 'border-[#851f22]/40',
      text: 'text-[#ff6b6b]',
      pulse: overdueItems.length > 0,
    },
    {
      label: 'Due Today',
      count: dueTodayItems.length,
      icon: <Clock className="w-6 h-6" />,
      bg: 'bg-[#efcc59]/20',
      border: dueTodayItems.length > 0 ? 'border-[#efcc59]' : 'border-[#efcc59]/30',
      text: 'text-[#efcc59]',
      pulse: false,
    },
    {
      label: 'Upcoming',
      count: upcomingItems.length,
      icon: <Calendar className="w-6 h-6" />,
      bg: 'bg-[#386641]/20',
      border: 'border-[#386641]/50',
      text: 'text-[#4ade80]',
      pulse: false,
    },
    {
      label: 'Completed',
      count: doneItems.length,
      icon: <CheckCircle2 className="w-6 h-6" />,
      bg: 'bg-white/10',
      border: 'border-white/20',
      text: 'text-[#beb5a0]',
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
              <span className={`${card.text} opacity-60 ${card.pulse ? 'animate-pulse' : ''}`}>
                {card.icon}
              </span>
            </div>
            <div>
              <span className={`text-3xl font-black ${card.text} block leading-none`}>
                {card.count}
              </span>
              <span className="text-[10px] text-[#8f7c60] font-medium mt-0.5 block">
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
        colorClass="text-[#ff6b6b]"
        borderAccent="border-l-[#ff5555]"
        bgAccent="bg-[#851f22]/20"
        icon={<AlertCircle className="w-4 h-4 text-[#ff6b6b]" />}
        items={overdueItems}
        todayStr={todayStr}
        onToggleDone={onToggleDone}
        onEditItem={onEditItem}
        onOpenLink={onOpenLink}
        emptyMsg="No overdue items — you're on track!"
      />

      <StatusSection
        title="Due Today"
        count={dueTodayItems.length}
        colorClass="text-[#efcc59]"
        borderAccent="border-l-[#efcc59]"
        bgAccent="bg-[#efcc59]/20"
        icon={<Clock className="w-4 h-4 text-[#efcc59]" />}
        items={dueTodayItems}
        todayStr={todayStr}
        onToggleDone={onToggleDone}
        onEditItem={onEditItem}
        onOpenLink={onOpenLink}
        emptyMsg="Nothing due today."
      />

      <StatusSection
        title="Upcoming"
        count={upcomingItems.length}
        colorClass="text-[#386641]"
        borderAccent="border-l-[#386641]"
        bgAccent="bg-[#386641]/5"
        icon={<Calendar className="w-4 h-4 text-[#386641]" />}
        items={upcomingItems}
        todayStr={todayStr}
        onToggleDone={onToggleDone}
        onEditItem={onEditItem}
        onOpenLink={onOpenLink}
        emptyMsg="No upcoming items scheduled."
      />

      <StatusSection
        title="Done Today"
        count={doneItems.length}
        colorClass="text-[#8f7c60]"
        borderAccent="border-l-[#382c38]/40"
        bgAccent="bg-[#f8f5ef]/50"
        icon={<CheckCircle2 className="w-4 h-4 text-[#8f7c60]" />}
        items={doneItems}
        todayStr={todayStr}
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
        <span className="text-[10px] text-[#faf1ec] font-mono font-bold bg-[#121214] px-2 py-0.5 rounded-full border border-white/20">
          {count}
        </span>
        {subNote && (
          <span className="text-[10px] text-[#8f7c60] italic hidden sm:inline">· {subNote}</span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-[#8f7c60] italic py-1 pl-1 font-medium">{emptyMsg || 'No items.'}</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => {
            const friendlyDate = formatFriendlyDate(item.dueDate, todayStr);
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl flex items-center justify-between gap-3 text-xs transition-all duration-150 shadow-xs group ${
                  item.isDone
                    ? 'bg-[#faf1ec]/60 border-[#382c38]/15 opacity-60 text-[#121214]'
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
