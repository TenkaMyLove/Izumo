import React, { useState } from 'react';
import { AgendaItem } from '../types';
import { Eye, EyeOff, ExternalLink, Edit3, Film, BookOpen, Check, Play, Repeat, Sparkles } from 'lucide-react';
import { formatFriendlyDate, getItemStatus, getTodayDateString } from '../utils/dateUtils';

interface AnimeManhwaTabProps {
  items: AgendaItem[];
  simulatedDate?: string;
  isDark?: boolean;
  onToggleWatched: (id: string, currentWatched: boolean) => void;
  onEditItem: (item: AgendaItem) => void;
  onOpenLink: (url: string, title: string) => void;
}

export const AnimeManhwaTab: React.FC<AnimeManhwaTabProps> = ({
  items,
  simulatedDate,
  isDark = false,
  onToggleWatched,
  onEditItem,
  onOpenLink,
}) => {
  const todayStr = getTodayDateString(simulatedDate);
  const [filterView, setFilterView] = useState<'all' | 'unwatched' | 'watched'>('all');

  const animeManhwaItems = items.filter(
    (item) => item.category === 'Anime' || item.category === 'Manhwa' || item.category === 'Manga'
  );

  const unwatchedItems = animeManhwaItems.filter((item) => !item.isWatched);
  const watchedItems = animeManhwaItems.filter((item) => !!item.isWatched);
  const watchedPct = animeManhwaItems.length > 0
    ? Math.round((watchedItems.length / animeManhwaItems.length) * 100)
    : 0;

  const filterOptions: { value: 'all' | 'unwatched' | 'watched'; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: animeManhwaItems.length },
    { value: 'unwatched', label: 'Unwatched', count: unwatchedItems.length },
    { value: 'watched', label: 'Watched', count: watchedItems.length },
  ];

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className={`p-5 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs ${
        isDark ? 'bg-[#1c1a1e] border-[#382c38]' : 'bg-white border-[#382c38]/15'
      }`}>
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <Film className={`w-5 h-5 ${isDark ? 'text-[#faf1ec]' : 'text-[#121214]'}`} />
              <BookOpen className="w-5 h-5 text-[#efcc59]" />
            </div>
            <h3 className={`text-base font-bold ${isDark ? 'text-[#faf1ec]' : 'text-[#121214]'}`}>Anime, Manhwa & Manga</h3>
            <span className="text-[10px] font-bold bg-[#efcc59]/15 text-[#efcc59] border border-[#efcc59]/40 px-2 py-0.5 rounded-full font-mono">
              {watchedPct}% watched
            </span>
          </div>
          <p className={`text-xs mt-1.5 font-medium leading-relaxed ${isDark ? 'text-[#a095a0]' : 'text-[#8f7c60]'}`}>
            <Sparkles className="w-3 h-3 text-[#efcc59] inline mr-1" />
            One-time insertion: marking watched auto-increments to the next episode/chapter!
          </p>
          {/* Progress bar */}
          {animeManhwaItems.length > 0 && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#f8f5ef] rounded-full overflow-hidden border border-[#382c38]/10">
                <div
                  className="h-full bg-[#386641] rounded-full transition-all duration-700"
                  style={{ width: `${watchedPct}%` }}
                />
              </div>
              <span className="text-[10px] text-[#8f7c60] font-mono font-bold">{watchedItems.length}/{animeManhwaItems.length}</span>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${
          isDark ? 'bg-[#121214] border-[#382c38]' : 'bg-[#faf1ec] border-[#382c38]/15'
        }`}>
          {filterOptions.map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setFilterView(value)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 flex items-center gap-1.5 ${
                filterView === value
                  ? isDark
                    ? 'bg-[#efcc59] text-[#121214] shadow-sm'
                    : 'bg-[#121214] text-[#faf1ec] shadow-sm'
                  : isDark
                  ? 'text-[#a095a0] hover:text-[#faf1ec]'
                  : 'text-[#8f7c60] hover:text-[#121214]'
              }`}
            >
              {label}
              <span className={`text-[10px] font-mono ${filterView === value ? (isDark ? 'text-[#121214]' : 'text-[#f1f5b1]') : 'text-[#beb5a0]'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {animeManhwaItems.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-3xl border border-[#382c38]/15 p-6 shadow-xs animate-fade-in-scale">
          <Film className="w-12 h-12 text-[#beb5a0] mx-auto mb-3" />
          <h4 className="text-sm font-bold text-[#121214]">No Anime or Manhwa entries</h4>
          <p className="text-xs text-[#8f7c60] mt-1 max-w-xs mx-auto font-medium">
            Add an item under Category "Anime", "Manhwa", or "Manga" to start tracking here!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Not Watched Section */}
          {(filterView === 'all' || filterView === 'unwatched') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#efcc59]/20 border border-[#efcc59]/40 flex items-center justify-center">
                  <Play className="w-3 h-3 fill-[#efcc59] text-[#efcc59]" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#121214]">
                  Up Next / Not Watched
                </h4>
                <span className="text-[10px] text-[#8f7c60] font-mono bg-[#f8f5ef] px-2 py-0.5 rounded-full border border-[#382c38]/15">
                  {unwatchedItems.length}
                </span>
              </div>

              {unwatchedItems.length === 0 ? (
                <p className="text-xs text-[#8f7c60] italic bg-white p-4 rounded-2xl border border-[#382c38]/15 font-medium">
                  ✨ All caught up! No unwatched anime or unread manhwa.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {unwatchedItems.map((item, idx) => (
                    <AnimeCard
                      key={item.id}
                      item={item}
                      todayStr={todayStr}
                      isDark={isDark}
                      onToggleWatched={onToggleWatched}
                      onEditItem={onEditItem}
                      onOpenLink={onOpenLink}
                      animIdx={idx}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Watched Section */}
          {(filterView === 'all' || filterView === 'watched') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#386641]/15 border border-[#386641]/30 flex items-center justify-center">
                  <Check className="w-3 h-3 text-[#386641]" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#386641]">
                  Watched / Read
                </h4>
                <span className="text-[10px] text-[#8f7c60] font-mono bg-[#f8f5ef] px-2 py-0.5 rounded-full border border-[#382c38]/15">
                  {watchedItems.length}
                </span>
              </div>

              {watchedItems.length === 0 ? (
                <p className="text-xs text-[#8f7c60] italic bg-white p-4 rounded-2xl border border-[#382c38]/15 font-medium">
                  No items marked as watched yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {watchedItems.map((item, idx) => (
                    <AnimeCard
                      key={item.id}
                      item={item}
                      todayStr={todayStr}
                      isDark={isDark}
                      onToggleWatched={onToggleWatched}
                      onEditItem={onEditItem}
                      onOpenLink={onOpenLink}
                      animIdx={idx}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface AnimeCardProps {
  item: AgendaItem;
  todayStr: string;
  isDark?: boolean;
  onToggleWatched: (id: string, currentWatched: boolean) => void;
  onEditItem: (item: AgendaItem) => void;
  onOpenLink: (url: string, title: string) => void;
  animIdx?: number;
}

const AnimeCard: React.FC<AnimeCardProps> = ({
  item,
  todayStr,
  isDark = false,
  onToggleWatched,
  onEditItem,
  onOpenLink,
  animIdx = 0,
}) => {
  const friendlyDate = formatFriendlyDate(item.dueDate, todayStr);
  const isAnime = item.category === 'Anime';
  const isManhwaOrManga = item.category === 'Manhwa' || item.category === 'Manga';
  const status = getItemStatus(item, todayStr);

  return (
    <div
      className={`border rounded-2xl p-4 space-y-3 transition-all duration-200 flex flex-col justify-between group hover:shadow-md animate-slide-in-up ${
        isDark ? 'bg-[#1c1a1e] text-[#faf1ec]' : 'bg-white text-[#121214]'
      } ${
        item.isWatched
          ? isDark ? 'border-[#382c38]/40 opacity-60' : 'border-[#382c38]/10 opacity-70'
          : status === 'Overdue'
          ? 'border-[#851f22]/60 hover:border-[#851f22]'
          : status === 'Due Today'
          ? 'border-[#efcc59]/60 hover:border-[#efcc59]'
          : isDark ? 'border-[#382c38] hover:border-[#382c38]/80' : 'border-[#382c38]/15 hover:border-[#382c38]/35'
      }`}
      style={{ animationDelay: `${animIdx * 30}ms` }}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide ${
                isAnime
                  ? 'bg-[#121214] text-[#faf1ec] border-[#121214]'
                  : item.category === 'Manga'
                  ? 'bg-[#e07b54]/20 text-[#8b3a1a] border-[#e07b54]/50'
                  : 'bg-[#efcc59]/20 text-[#121214] border-[#efcc59]/50'
              }`}
            >
              {item.category}
            </span>

            {item.recurrence && item.recurrence !== 'none' && (
              <span className="text-[10px] bg-[#f1f5b1] text-[#121214] border border-[#382c38]/15 px-1.5 py-0.5 rounded-md flex items-center gap-1 font-mono font-bold">
                <Repeat className="w-3 h-3 text-[#8f7c60]" />
                {item.recurrence === 'weekly' ? '+1 Wk' : '+1 Mo'}
              </span>
            )}

            {status === 'Due Today' && !item.isWatched && (
              <span className="text-[10px] bg-[#efcc59] text-[#121214] px-2 py-0.5 rounded-md font-bold">Today!</span>
            )}
            {status === 'Overdue' && !item.isWatched && (
              <span className="text-[10px] bg-[#851f22] text-[#faf1ec] px-2 py-0.5 rounded-md font-bold">Overdue</span>
            )}
          </div>

          <span className="text-[10px] font-mono text-[#8f7c60] font-bold shrink-0">
            {friendlyDate}
          </span>
        </div>

        <h4 className={`text-sm font-bold leading-snug ${item.isWatched ? 'line-through text-[#8f7c60]' : isDark ? 'text-[#faf1ec]' : 'text-[#121214]'}`}>
          {item.title}
        </h4>

        {item.notes && (
          <p className={`text-xs line-clamp-2 leading-relaxed font-medium ${isDark ? 'text-[#a095a0]' : 'text-[#8f7c60]'}`}>{item.notes}</p>
        )}
      </div>

      <div className="pt-3 border-t border-[#382c38]/10 flex items-center justify-between gap-2">
        <button
          onClick={() => onToggleWatched(item.id, !!item.isWatched)}
          className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-150 hover:scale-[1.02] ${
            item.isWatched
              ? 'bg-[#386641]/15 text-[#386641] border border-[#386641]/30 hover:bg-[#386641]/25'
              : 'bg-[#efcc59]/15 text-[#121214] border border-[#efcc59]/40 hover:bg-[#efcc59]/30'
          }`}
        >
          {item.isWatched ? <Eye className="w-3.5 h-3.5 text-[#386641]" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>
            {isManhwaOrManga ? item.isWatched ? 'Read' : 'Mark Read'
              : item.isWatched ? 'Watched' : 'Mark Watched'}
          </span>
        </button>

        <div className="flex items-center gap-1">
          {item.link && (
            <button
              onClick={() => onOpenLink(item.link!, item.title)}
              className="p-1.5 bg-[#121214] hover:bg-[#382c38] text-[#faf1ec] rounded-lg border border-[#121214] transition-all duration-150 hover:scale-110"
              title="Open stream/reader link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onEditItem(item)}
            className="p-1.5 bg-[#f8f5ef] hover:bg-[#faf1ec] text-[#121214] rounded-lg border border-[#382c38]/25 transition-all duration-150 hover:scale-110"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
