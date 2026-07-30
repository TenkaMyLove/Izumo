import React, { useState } from 'react';
import { AgendaItem, AgendaCategory } from '../types';
import { getItemStatus, formatFriendlyDate, getTodayDateString } from '../utils/dateUtils';
import {
  CheckSquare,
  Square,
  ExternalLink,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Calendar,
  Repeat,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface UpcomingTabProps {
  items: AgendaItem[];
  simulatedDate?: string;
  onToggleDone: (id: string, currentDone: boolean) => void;
  onToggleWatched: (id: string, currentWatched: boolean) => void;
  onEditItem: (item: AgendaItem) => void;
  onDeleteItem: (item: AgendaItem) => void;
  onOpenLink: (url: string, title: string) => void;
  onAddNew: () => void;
}

export const UpcomingTab: React.FC<UpcomingTabProps> = ({
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

  const validItems = (items || []).filter((i): i is AgendaItem => Boolean(i && typeof i === 'object'));

  // Upcoming tab: everything that is NOT "Due Today" (Overdue + Upcoming + Done)
  const filteredItems = validItems.filter((item) => {
    const status = getItemStatus(item, todayStr);
    const isNotToday = status !== 'Due Today';
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return isNotToday && matchesCategory && matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  const categories = ['All', 'Anime', 'Manhwa', 'Manga', 'Deadline', 'Other'];

  const getCategoryBadgeClass = (category: AgendaCategory) => {
    switch (category) {
      case 'Anime': return 'bg-[#121214] text-[#faf1ec] border-[#121214]';
      case 'Manhwa': return 'bg-[#efcc59]/20 text-[#121214] border-[#efcc59]/50';
      case 'Manga': return 'bg-[#e07b54]/20 text-[#8b3a1a] border-[#e07b54]/50';
      case 'Deadline': return 'bg-[#851f22]/10 text-[#851f22] border-[#851f22]/30';
      default: return 'bg-[#f8f5ef] text-[#121214] border-[#382c38]/30';
    }
  };

  const getRowHighlightClass = (item: AgendaItem) => {
    const status = getItemStatus(item, todayStr);
    switch (status) {
      case 'Done': return 'bg-[#faf1ec]/60 border-[#382c38]/15 opacity-60 text-[#121214]';
      case 'Overdue': return 'bg-[#f1f5b1] border-l-4 border-l-[#851f22] border-[#382c38]/25 text-[#121214] shadow-sm hover:bg-[#e6eba0]';
      default: return 'bg-[#f1f5b1] border-[#382c38]/25 text-[#121214] shadow-sm hover:bg-[#e6eba0]';
    }
  };

  const overdueCount = validItems.filter((i) => getItemStatus(i, todayStr) === 'Overdue').length;
  const upcomingCount = validItems.filter((i) => getItemStatus(i, todayStr) === 'Upcoming').length;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-[#f1f5b1] border border-[#382c38]/20 text-[#121214] rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-[#121214] rounded-xl flex items-center justify-center border border-[#121214]">
              <ArrowRight className="w-4 h-4 text-[#f1f5b1]" />
            </div>
            <h3 className="text-base font-black text-[#121214]">Upcoming</h3>
            <span className="text-[10px] font-extrabold bg-[#121214] text-[#faf1ec] px-2.5 py-0.5 rounded-full font-mono">
              {upcomingCount} ahead
            </span>
            {overdueCount > 0 && (
              <span className="text-[10px] font-extrabold bg-[#851f22] text-[#faf1ec] px-2.5 py-0.5 rounded-full font-mono animate-pulse">
                {overdueCount} overdue
              </span>
            )}
          </div>
          <p className="text-xs text-[#382c38]/80 font-medium">
            Everything that's coming up — sorted by due date. Today's items are on the Dashboard.
          </p>
        </div>
        <button
          onClick={onAddNew}
          className="px-4 py-2.5 rounded-2xl bg-[#121214] hover:bg-[#382c38] text-[#faf1ec] font-bold text-xs flex items-center gap-1.5 shadow-sm border border-[#121214] transition-all duration-150 hover:scale-105 shrink-0"
        >
          + Add Item
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#382c38]/15 shadow-xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-[#8f7c60] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search upcoming items..."
            className="w-full bg-[#faf1ec] border border-[#382c38]/15 rounded-xl pl-9 pr-3 py-2 text-xs text-[#121214] placeholder-[#8f7c60] focus:outline-none focus:ring-2 focus:ring-[#f1f5b1]/80 focus:border-[#382c38]/40 transition-all duration-200"
          />
        </div>
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
      </div>

      {/* Main List */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-14 bg-[#f1f5b1] text-[#121214] rounded-3xl border border-[#382c38]/20 p-6 shadow-md animate-fade-in-scale">
          <Calendar className="w-10 h-10 text-[#382c38] mx-auto mb-3" />
          <h3 className="text-sm font-black text-[#121214]">No upcoming items</h3>
          <p className="text-xs text-[#382c38]/80 mt-1 max-w-xs mx-auto font-medium">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try adjusting your search or category filter.'
              : 'All caught up! Add new items to start tracking.'}
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
                {/* Left Section */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleDone(item.id, item.isDone)}
                    className="mt-0.5 text-[#8f7c60] hover:text-[#121214] transition-transform duration-150 hover:scale-110 shrink-0"
                    title={item.isDone ? 'Mark Undone' : 'Mark Done'}
                  >
                    {item.isDone ? (
                      <CheckSquare className="w-5 h-5 text-[#386641] fill-[#386641]/20" />
                    ) : (
                      <Square className="w-5 h-5 text-[#8f7c60] hover:text-[#121214]" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className={`text-sm font-bold truncate ${item.isDone ? 'line-through text-[#8f7c60]' : 'text-[#121214]'}`}>
                        {item.title}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide ${getCategoryBadgeClass(item.category)}`}>
                        {item.category}
                      </span>
                      {item.recurrence && item.recurrence !== 'none' && (
                        <span className="bg-[#efcc59]/15 text-[#121214] border border-[#efcc59]/40 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                          <Repeat className="w-3 h-3 text-[#8f7c60]" />
                          {item.recurrence === 'weekly' ? 'Weekly' : 'Monthly'}
                        </span>
                      )}
                      {status === 'Overdue' && (
                        <span className="bg-[#851f22] text-[#faf1ec] text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                      {status === 'Upcoming' && (
                        <span className="bg-[#f8f5ef] text-[#8f7c60] text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#382c38]/15">
                          <Clock className="w-3 h-3" /> Upcoming
                        </span>
                      )}
                      {isAnimeOrManhwa && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          item.isWatched
                            ? 'bg-[#386641]/15 text-[#386641] border-[#386641]/30'
                            : 'bg-[#f8f5ef] text-[#8f7c60] border-[#382c38]/15'
                        }`}>
                          {item.isWatched ? <Eye className="w-3 h-3 text-[#386641]" /> : <EyeOff className="w-3 h-3" />}
                          <span>
                            {item.category === 'Manhwa' || item.category === 'Manga'
                              ? item.isWatched ? 'Read' : 'Unread'
                              : item.isWatched ? 'Watched' : 'Unwatched'}
                          </span>
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-[#382c38]/80 line-clamp-1 font-medium">{item.notes}</p>
                    )}
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#382c38]/10">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-bold text-[#121214] block">{friendlyDate}</span>
                    <span className="text-[10px] text-[#382c38]/70 font-mono font-semibold">{item.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isAnimeOrManhwa && (
                      <button
                        onClick={() => onToggleWatched(item.id, !!item.isWatched)}
                        className={`p-1.5 rounded-lg border transition-all duration-150 hover:scale-110 ${
                          item.isWatched
                            ? 'bg-[#386641]/15 text-[#386641] border-[#386641]/30'
                            : 'bg-[#f8f5ef] text-[#121214] border-[#382c38]/25 hover:bg-[#faf1ec]'
                        }`}
                        title={item.isWatched ? 'Mark Unread' : 'Mark Read'}
                      >
                        {item.isWatched ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    {item.link && (
                      <button
                        onClick={() => onOpenLink(item.link!, item.title)}
                        className="p-1.5 bg-[#efcc59]/15 hover:bg-[#efcc59]/35 text-[#121214] border border-[#efcc59]/40 rounded-lg transition-all duration-150 hover:scale-110"
                        title="Open link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onEditItem(item)}
                      className="p-1.5 bg-[#f8f5ef] hover:bg-[#faf1ec] text-[#121214] rounded-lg border border-[#382c38]/25 transition-all duration-150 hover:scale-110"
                      title="Edit Item"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item)}
                      className="p-1.5 bg-[#851f22]/8 hover:bg-[#851f22] text-[#851f22] hover:text-[#faf1ec] rounded-lg border border-[#851f22]/25 transition-all duration-150 hover:scale-110"
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
