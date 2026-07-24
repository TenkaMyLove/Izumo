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

  // Key metrics for top Bento Grid Overview
  const activeItems = items.filter((i) => !i.isDone);
  const completedItems = items.filter((i) => i.isDone);
  const overdueItems = items.filter((i) => getItemStatus(i, todayStr) === 'Overdue');
  const dueTodayItems = items.filter((i) => getItemStatus(i, todayStr) === 'Due Today');
  const progressPct = items.length > 0 ? Math.round((completedItems.length / items.length) * 100) : 0;
  
  // Find "Up Next" item
  const upNextItem = [...activeItems].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
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
        return 'bg-[#f8f5ef] border-[#382c38]/15 opacity-60';
      case 'Overdue':
        return 'bg-[#851f22]/8 border-l-2 border-l-[#851f22] border-[#851f22]/30';
      case 'Due Today':
        return 'bg-[#efcc59]/10 border-l-2 border-l-[#efcc59] border-[#efcc59]/40';
      default:
        return 'bg-white border-[#382c38]/15 hover:border-[#382c38]/35 hover:shadow-sm';
    }
  };

  const categories = ['All', 'Anime', 'Manhwa', 'Deadline', 'Other'];

  return (
    <div className="space-y-5">
      {/* BENTO GRID OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Bento Card 1: Main Metric Hero */}
        <div className="md:col-span-3 bg-[#f1f5b1] text-[#121214] rounded-3xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden group border border-[#382c38]/15">
          <div className="z-10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[#121214]/60" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#121214]/60">Active Items</span>
            </div>
            <div className="text-6xl font-black mt-1 tracking-tight text-[#121214] leading-none">
              {activeItems.length}
            </div>
            <p className="text-xs text-[#121214]/70 mt-2 font-semibold">
              {completedItems.length} completed · {progressPct}% done
            </p>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-[#121214]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#121214]/40 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="z-10 mt-4 flex items-center gap-2 text-xs">
            <span className="bg-[#121214] px-3 py-1 rounded-full text-[#faf1ec] font-bold text-[11px]">
              📅 {todayStr}
            </span>
          </div>
          {/* Decorative orb */}
          <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-[#efcc59]/25 rounded-full blur-2xl pointer-events-none transition-transform duration-700 group-hover:scale-150" />
          <div className="absolute -top-4 -left-4 w-20 h-20 bg-[#f1f5b1]/60 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Bento Card 2: Overdue + Due Today */}
        <div className="md:col-span-3 grid grid-cols-2 gap-4">
          {/* Overdue */}
          <div className={`bg-[#851f22]/8 border rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 ${
            overdueItems.length > 0 ? 'border-[#851f22]/50 shadow-sm shadow-[#851f22]/10' : 'border-[#851f22]/25'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#851f22]">Overdue</span>
              <AlertCircle className={`w-4 h-4 text-[#851f22] ${overdueItems.length > 0 ? 'animate-pulse' : 'opacity-50'}`} />
            </div>
            <div className="mt-3">
              <div className={`text-4xl font-black ${overdueItems.length > 0 ? 'text-[#851f22]' : 'text-[#851f22]/40'}`}>
                {overdueItems.length}
              </div>
              <span className="text-[11px] text-[#851f22]/70 font-semibold mt-0.5 block">
                {overdueItems.length > 0 ? 'Needs attention' : 'All caught up!'}
              </span>
            </div>
          </div>

          {/* Due Today */}
          <div className={`bg-[#efcc59]/15 border rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 ${
            dueTodayItems.length > 0 ? 'border-[#efcc59]/60 shadow-sm shadow-[#efcc59]/10' : 'border-[#efcc59]/25'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#121214]">Due Today</span>
              <Clock className={`w-4 h-4 text-[#121214] ${dueTodayItems.length > 0 ? '' : 'opacity-40'}`} />
            </div>
            <div className="mt-3">
              <div className={`text-4xl font-black text-[#121214] ${dueTodayItems.length === 0 ? 'opacity-30' : ''}`}>
                {dueTodayItems.length}
              </div>
              <span className="text-[11px] text-[#8f7c60] font-semibold mt-0.5 block">
                {dueTodayItems.length > 0 ? 'Scheduled today' : 'Nothing due today'}
              </span>
            </div>
          </div>
        </div>

        {/* Bento Card 3: Up Next Priority */}
        <div className="md:col-span-4 bg-white text-[#121214] rounded-3xl p-5 border border-[#382c38]/15 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow duration-200">
          <div className="z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8f7c60] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#efcc59]" />
                Priority Up Next
              </span>
              {upNextItem && (
                <span className="text-[10px] bg-[#efcc59]/20 text-[#121214] px-2.5 py-0.5 rounded-full font-mono font-bold border border-[#efcc59]/40">
                  {upNextItem.dueDate}
                </span>
              )}
            </div>
            {upNextItem ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-[#121214] line-clamp-1">{upNextItem.title}</h4>
                  {upNextItem.recurrence && upNextItem.recurrence !== 'none' && (
                    <span className="text-[10px] bg-[#f1f5b1] text-[#121214] px-2 py-0.5 rounded-full border border-[#382c38]/20 flex items-center gap-1 font-mono font-bold shrink-0">
                      <Repeat className="w-3 h-3" /> {upNextItem.recurrence}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8f7c60] line-clamp-1 font-medium">
                  {upNextItem.notes || `${upNextItem.category} · ${formatFriendlyDate(upNextItem.dueDate, todayStr)}`}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#386641] font-bold mt-2">🎉 All items complete! Great work.</p>
            )}
          </div>
          <div className="z-10 mt-4 flex items-center justify-between text-xs border-t border-[#382c38]/10 pt-3">
            <span className="text-[#8f7c60] text-[11px] font-medium">Auto-sorted by due date</span>
            {upNextItem?.link && (
              <button
                onClick={() => onOpenLink(upNextItem.link!, upNextItem.title)}
                className="text-[#121214] hover:text-[#8f7c60] text-xs font-bold flex items-center gap-1 transition-colors duration-150"
              >
                Open Link <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-[#f1f5b1]/30 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Bento Card 4: Quick Add */}
        <div 
          onClick={onAddNew}
          className="md:col-span-2 bg-[#f8f5ef] border border-[#382c38]/15 hover:bg-[#faf1ec] hover:border-[#382c38]/30 rounded-3xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group hover:shadow-md"
        >
          <div className="w-12 h-12 bg-[#f1f5b1] rounded-2xl flex items-center justify-center text-[#121214] shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300 border border-[#382c38]/15">
            <Plus className="w-6 h-6 text-[#121214]" />
          </div>
          <span className="text-xs font-bold text-[#121214] mt-3">Add Agenda Item</span>
          <span className="text-[10px] text-[#8f7c60] font-medium mt-0.5">Anime, Manhwa, Deadline</span>
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
        <div className="text-center py-14 bg-white rounded-2xl border border-[#382c38]/15 shadow-xs animate-fade-in-scale">
          <Calendar className="w-10 h-10 text-[#beb5a0] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#121214]">No agenda items found</h3>
          <p className="text-xs text-[#8f7c60] mt-1 max-w-xs mx-auto font-medium">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try adjusting your search or category filter.'
              : 'Add your first anime release, manhwa chapter, or deadline!'}
          </p>
          {!searchQuery && selectedCategory === 'All' && (
            <button
              onClick={onAddNew}
              className="mt-4 px-5 py-2 bg-[#f1f5b1] hover:bg-[#e6eba0] text-[#121214] font-bold text-xs rounded-2xl transition-all duration-150 hover:scale-105 border border-[#382c38]/20 shadow-sm"
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
            const isAnimeOrManhwa = item.category === 'Anime' || item.category === 'Manhwa';

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

                      {/* Watched Badge */}
                      {isAnimeOrManhwa && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            item.isWatched
                              ? 'bg-[#386641]/15 text-[#386641] border-[#386641]/30'
                              : 'bg-[#f8f5ef] text-[#8f7c60] border-[#382c38]/15'
                          }`}
                        >
                          {item.isWatched ? <Eye className="w-3 h-3 text-[#386641]" /> : <EyeOff className="w-3 h-3" />}
                          <span>{item.isWatched ? 'Watched' : 'Unwatched'}</span>
                        </span>
                      )}
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <p className="text-xs text-[#8f7c60] line-clamp-1 font-normal">{item.notes}</p>
                    )}
                  </div>
                </div>

                {/* Right Section: Due Date & Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#382c38]/10">
                  {/* Due Date */}
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-bold text-[#121214] block">{friendlyDate}</span>
                    <span className="text-[10px] text-[#8f7c60] font-mono">{item.dueDate}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Watched Toggle */}
                    {isAnimeOrManhwa && (
                      <button
                        onClick={() => onToggleWatched(item.id, !!item.isWatched)}
                        className={`p-1.5 rounded-lg border transition-all duration-150 hover:scale-110 ${
                          item.isWatched
                            ? 'bg-[#386641]/15 text-[#386641] border-[#386641]/30'
                            : 'bg-[#f8f5ef] text-[#121214] border-[#382c38]/25 hover:bg-[#faf1ec]'
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
                        className="p-1.5 bg-[#efcc59]/15 hover:bg-[#efcc59]/35 text-[#121214] border border-[#efcc59]/40 rounded-lg transition-all duration-150 hover:scale-110"
                        title="Open link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => onEditItem(item)}
                      className="p-1.5 bg-[#f8f5ef] hover:bg-[#faf1ec] text-[#121214] rounded-lg border border-[#382c38]/25 transition-all duration-150 hover:scale-110"
                      title="Edit Item"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
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
