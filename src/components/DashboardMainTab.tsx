import React, { useState } from 'react';
import { AgendaCategory, AgendaItem } from '../types';
import { getItemStatus, formatFriendlyDate, getTodayDateString } from '../utils/dateUtils';
import { 
  CheckSquare, 
  Square, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Plus, 
  Search, 
  Calendar,
  Sparkles,
  AlertCircle,
  Clock,
  Repeat,
  TrendingUp
} from 'lucide-react';

interface DashboardMainTabProps {
  items: AgendaItem[];
  simulatedDate?: string;
  onToggleDone: (id: string, currentDone: boolean) => void;
  onToggleWatched: (id: string, currentWatched: boolean) => void;
  onEditItem: (item: AgendaItem) => void;
  onDeleteItem: (item: AgendaItem) => void;
  onOpenLink: (url: string, title: string) => void;
  onAddNew: () => void;
}

export const DashboardMainTab: React.FC<DashboardMainTabProps> = ({
  items,
  simulatedDate,
  onToggleDone,
  onToggleWatched,
  onEditItem,
  onDeleteItem,
  onOpenLink,
  onAddNew,
}) => {
  const todayStr = getTodayDateString(simulatedDate);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sanitize items array against null/undefined elements
  const validItems = (items || []).filter((i): i is AgendaItem => Boolean(i && typeof i === 'object'));

  // Key metrics for top Bento Grid Overview
  const activeItems = validItems.filter((i) => !i.isDone);
  const completedItems = validItems.filter((i) => i.isDone);
  const overdueItems = validItems.filter((i) => getItemStatus(i, todayStr) === 'Overdue');
  const dueTodayItems = validItems.filter((i) => getItemStatus(i, todayStr) === 'Due Today');
  const progressPct = validItems.length > 0 ? Math.round((completedItems.length / validItems.length) * 100) : 0;
  
  // Find "Up Next" item
  const upNextItem = [...activeItems].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  // Filter items — Dashboard only shows today's items
  const filteredItems = validItems.filter((item) => {
    const status = getItemStatus(item, todayStr);
    const isToday = status === 'Due Today';
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return isToday && matchesCategory && matchesSearch;
  });

  // Sort items: Sorted by due date ascending, done items sinking to bottom
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.isDone !== b.isDone) {
      return a.isDone ? 1 : -1;
    }
    return a.dueDate.localeCompare(b.dueDate);
  });

  const getCategoryBadgeClass = (category: AgendaCategory) => {
    switch (category) {
      case 'Anime':
        return 'bg-[#121214] text-[#faf1ec] border-[#121214]';
      case 'Manhwa':
        return 'bg-[#efcc59]/20 text-[#121214] border-[#efcc59]/50';
      case 'Manga':
        return 'bg-[#e07b54]/20 text-[#8b3a1a] border-[#e07b54]/50';
      case 'Deadline':
        return 'bg-[#851f22]/10 text-[#851f22] border-[#851f22]/30';
      default:
        return 'bg-[#f8f5ef] text-[#121214] border-[#382c38]/30';
    }
  };

  const getRowHighlightClass = (item: AgendaItem) => {
    const status = getItemStatus(item, todayStr);
    switch (status) {
      case 'Done':
        return 'bg-[#faf1ec]/60 border-[#382c38]/15 opacity-60 text-[#121214]';
      case 'Overdue':
        return 'bg-[#851f22]/20 border-l-4 border-l-[#ff5555] border-[#851f22]/40 text-[#faf1ec]';
      case 'Due Today':
      default:
        return 'bg-[#f1f5b1] border-[#382c38]/25 text-[#121214] shadow-sm hover:bg-[#e6eba0]';
    }
  };

  const categories = ['All', 'Anime', 'Manhwa', 'Manga', 'Deadline', 'Other'];

  return (
    <div className="space-y-5">
      {/* BENTO GRID OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Unified Bento Card: Today's Agenda (Merged Priority Up Next & Today's Overview) */}
        <div className="md:col-span-6 bg-[#f1f5b1] text-[#121214] rounded-3xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden group border border-[#382c38]/15">
          <div className="z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#121214]/70" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#121214]/70">
                  Today's Agenda
                </span>
              </div>
              <span className="bg-[#121214] px-3 py-1 rounded-full text-[#faf1ec] font-bold text-[11px]">
                📅 {todayStr}
              </span>
            </div>

            {upNextItem ? (
              <div className="space-y-1.5 bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-[#382c38]/10 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#121214] text-[#faf1ec] uppercase tracking-wide">
                      {upNextItem.category}
                    </span>
                    <h4 className="text-base font-black text-[#121214] line-clamp-1">{upNextItem.title}</h4>
                  </div>
                  {upNextItem.recurrence && upNextItem.recurrence !== 'none' && (
                    <span className="text-[10px] bg-[#efcc59]/30 text-[#121214] px-2 py-0.5 rounded-md border border-[#efcc59]/50 flex items-center gap-1 font-mono font-bold shrink-0">
                      <Repeat className="w-3 h-3" /> {upNextItem.recurrence}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8f7c60] line-clamp-1 font-medium">
                  {upNextItem.notes || `${formatFriendlyDate(upNextItem.dueDate, todayStr)} · Priority Item`}
                </p>
              </div>
            ) : (
              <div className="bg-white/70 p-4 rounded-2xl border border-[#382c38]/10 text-center">
                <p className="text-sm text-[#386641] font-bold">🎉 All caught up! No active items due.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/50 p-2.5 rounded-xl border border-[#382c38]/10 text-center">
                <span className="text-[10px] uppercase font-bold text-[#8f7c60] block">Active</span>
                <span className="text-xl font-black text-[#121214]">{activeItems.length}</span>
              </div>
              <div className="bg-white/50 p-2.5 rounded-xl border border-[#382c38]/10 text-center">
                <span className="text-[10px] uppercase font-bold text-[#121214] block">Due Today</span>
                <span className="text-xl font-black text-[#121214]">{dueTodayItems.length}</span>
              </div>
            </div>
          </div>

          <div className="z-10 mt-3 flex items-center justify-between text-xs pt-2 border-t border-[#121214]/10">
            <span className="text-[#121214]/70 text-[11px] font-semibold">
              {completedItems.length} completed · {progressPct}% done
            </span>
            {upNextItem?.link && (
              <button
                onClick={() => onOpenLink(upNextItem.link!, upNextItem.title)}
                className="text-[#121214] hover:text-[#382c38] text-xs font-bold flex items-center gap-1 transition-colors duration-150"
              >
                Open Link <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
          {/* Decorative orb */}
          <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-[#efcc59]/30 rounded-full blur-2xl pointer-events-none transition-transform duration-700 group-hover:scale-150" />
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#382c38]/15 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-[#8f7c60] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agenda items..."
            className="w-full bg-[#faf1ec] border border-[#382c38]/15 rounded-xl pl-9 pr-3 py-2 text-xs text-[#121214] placeholder-[#8f7c60] focus:outline-none focus:ring-2 focus:ring-[#f1f5b1]/80 focus:border-[#382c38]/40 transition-all duration-200"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all duration-150 ${
                selectedCategory === cat
                  ? 'bg-[#121214] text-[#faf1ec] shadow-sm'
                  : 'bg-[#f8f5ef] text-[#8f7c60] hover:bg-[#faf1ec] hover:text-[#121214] border border-[#382c38]/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Add Item Button */}
        <button
          onClick={onAddNew}
          className="sm:w-auto px-4 py-2 rounded-xl bg-[#f1f5b1] hover:bg-[#e6eba0] text-[#121214] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs border border-[#382c38]/20 transition-all duration-150 hover:scale-105 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Main List View */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-14 bg-[#f1f5b1] text-[#121214] rounded-3xl border border-[#382c38]/20 p-6 shadow-md animate-fade-in-scale">
          <Calendar className="w-10 h-10 text-[#382c38] mx-auto mb-3" />
          <h3 className="text-sm font-black text-[#121214]">No agenda items found</h3>
          <p className="text-xs text-[#382c38]/80 mt-1 max-w-xs mx-auto font-medium">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try adjusting your search or category filter.'
              : 'Nothing due today — check the Upcoming tab for what\'s next!'}
          </p>
          {!searchQuery && selectedCategory === 'All' && (
            <button
              onClick={onAddNew}
              className="mt-4 px-6 py-2.5 bg-[#121214] hover:bg-[#382c38] text-[#f1f5b1] font-bold text-xs rounded-2xl transition-all duration-150 hover:scale-105 border border-[#121214] shadow-sm"
            >
              + Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedItems.map((item, idx) => {
            const status = getItemStatus(item, todayStr);
            const friendlyDate = formatFriendlyDate(item.dueDate, todayStr);
            const isAnimeOrManhwa = item.category === 'Anime' || item.category === 'Manhwa' || item.category === 'Manga';

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-slide-in-up ${getRowHighlightClass(item)}`}
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                {/* Left Section: Done Checkbox + Details */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleDone(item.id, item.isDone)}
                    className="mt-0.5 text-[#121214] hover:text-[#382c38] transition-transform duration-150 hover:scale-110 shrink-0"
                    title={item.isDone ? 'Mark Undone' : 'Mark Done'}
                  >
                    {item.isDone ? (
                      <CheckSquare className="w-5 h-5 text-[#386641] fill-[#386641]/20" />
                    ) : (
                      <Square className="w-5 h-5 text-[#121214] hover:text-[#382c38]" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Title */}
                      <h4
                        className={`text-sm font-bold truncate ${
                          item.isDone ? 'line-through text-[#8f7c60]' : 'text-[#121214]'
                        }`}
                      >
                        {item.title}
                      </h4>

                      {/* Category Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide ${getCategoryBadgeClass(item.category)}`}
                      >
                        {item.category}
                      </span>

                      {/* Recurrence Badge */}
                      {item.recurrence && item.recurrence !== 'none' && (
                        <span className="bg-[#efcc59]/15 text-[#121214] border border-[#efcc59]/40 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                          <Repeat className="w-3 h-3 text-[#8f7c60]" />
                          {item.recurrence === 'weekly' ? 'Weekly' : 'Monthly'}
                        </span>
                      )}

                      {/* Status Badges */}
                      {status === 'Overdue' && (
                        <span className="bg-[#851f22] text-[#faf1ec] text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                      {status === 'Due Today' && (
                        <span className="bg-[#efcc59] text-[#121214] text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Due Today
                        </span>
                      )}

                      {/* Watched / Read Badge */}
                      {isAnimeOrManhwa && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            item.isWatched
                              ? 'bg-[#386641]/15 text-[#386641] border-[#386641]/30'
                              : 'bg-[#f8f5ef] text-[#8f7c60] border-[#382c38]/15'
                          }`}
                        >
                          {item.isWatched ? <Eye className="w-3 h-3 text-[#386641]" /> : <EyeOff className="w-3 h-3" />}
                          <span>
                            {item.category === 'Manhwa' || item.category === 'Manga'
                              ? item.isWatched ? 'Read' : 'Unread'
                              : item.isWatched ? 'Watched' : 'Unwatched'}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <p className="text-xs text-[#382c38]/80 line-clamp-1 font-medium">{item.notes}</p>
                    )}
                  </div>
                </div>

                {/* Right Section: Due Date & Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#382c38]/10">
                  {/* Due Date */}
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-bold text-[#121214] block">{friendlyDate}</span>
                    <span className="text-[10px] text-[#382c38]/70 font-mono font-semibold">{item.dueDate}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Watched Toggle */}
                    {isAnimeOrManhwa && (
                      <button
                        onClick={() => onToggleWatched(item.id, !!item.isWatched)}
                        className={`p-1.5 rounded-lg border transition-all duration-150 hover:scale-110 ${
                          item.isWatched
                            ? 'bg-[#386641]/20 text-[#386641] border-[#386641]/40'
                            : 'bg-white/80 text-[#121214] border-[#382c38]/25 hover:bg-white'
                        }`}
                        title={item.isWatched ? 'Mark Unwatched' : 'Mark Watched'}
                      >
                        {item.isWatched ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {/* External Link */}
                    {item.link && (
                      <button
                        onClick={() => onOpenLink(item.link!, item.title)}
                        className="p-1.5 bg-[#121214] hover:bg-[#382c38] text-[#faf1ec] border border-[#121214] rounded-lg transition-all duration-150 hover:scale-110"
                        title="Open link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => onEditItem(item)}
                      className="p-1.5 bg-white/80 hover:bg-white text-[#121214] rounded-lg border border-[#382c38]/25 transition-all duration-150 hover:scale-110"
                      title="Edit Item"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteItem(item)}
                      className="p-1.5 bg-[#851f22]/15 hover:bg-[#851f22] text-[#851f22] hover:text-[#faf1ec] rounded-lg border border-[#851f22]/30 transition-all duration-150 hover:scale-110"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
