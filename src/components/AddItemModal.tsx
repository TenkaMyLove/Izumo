import React, { useState, useEffect } from 'react';
import { AgendaCategory, AgendaItem } from '../types';
import { RecurrenceType } from '../utils/recurringUtils';
import { X, Calendar, Link as LinkIcon, FileText, Tag, AlertCircle, Repeat, Sparkles, Check } from 'lucide-react';
import { getTodayDateString } from '../utils/dateUtils';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<AgendaItem>) => void;
  editingItem?: AgendaItem | null;
  simulatedDate?: string;
}

type CategoryOption = { label: AgendaCategory; emoji: string; desc: string };

const CATEGORIES: CategoryOption[] = [
  { label: 'Anime', emoji: '🎬', desc: 'Episodes & livestreams' },
  { label: 'Manhwa', emoji: '📖', desc: 'Chapters & webtoons' },
  { label: 'Deadline', emoji: '⏰', desc: 'Assignments & exams' },
  { label: 'Other', emoji: '📌', desc: 'Personal tasks & bills' },
];

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  simulatedDate,
}) => {
  const todayStr = getTodayDateString(simulatedDate);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AgendaCategory>('Anime');
  const [dueDate, setDueDate] = useState(todayStr);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('weekly');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [urlWarning, setUrlWarning] = useState('');

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || '');
      setCategory(editingItem.category || 'Anime');
      setDueDate(editingItem.dueDate || todayStr);
      setRecurrence(editingItem.recurrence || 'none');
      setNotes(editingItem.notes || '');
      setLink(editingItem.link || '');
    } else {
      setTitle('');
      setCategory('Anime');
      setDueDate(todayStr);
      setRecurrence('weekly');
      setNotes('');
      setLink('');
    }
    setErrorMsg('');
    setUrlWarning('');
  }, [editingItem, isOpen, todayStr]);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: AgendaCategory) => {
    setCategory(cat);
    if (!editingItem) {
      if (cat === 'Anime' || cat === 'Manhwa') {
        setRecurrence('weekly');
      } else {
        setRecurrence('none');
      }
    }
  };

  const handleLinkChange = (val: string) => {
    setLink(val);
    if (val.trim() && !val.startsWith('http://') && !val.startsWith('https://')) {
      setUrlWarning('URLs should start with http:// or https://');
    } else {
      setUrlWarning('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a title for this agenda item.');
      return;
    }
    if (!dueDate) {
      setErrorMsg('Please select a valid due date.');
      return;
    }

    let formattedLink = link.trim();
    if (formattedLink && !formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
      formattedLink = `https://${formattedLink}`;
    }

    onSave({
      id: editingItem?.id,
      title: title.trim(),
      category,
      dueDate,
      recurrence,
      notes: notes.trim(),
      link: formattedLink,
    });

    onClose();
  };

  const isAnimeOrManhwa = category === 'Anime' || category === 'Manhwa';

  const recurrenceOptions: { value: RecurrenceType; label: string; desc: string }[] = [
    { value: 'none', label: 'One-time', desc: 'No auto-repeat' },
    { value: 'weekly', label: 'Weekly', desc: '+1 Ep/Ch each week' },
    { value: 'monthly', label: 'Monthly', desc: '+1 Ep/Ch each month' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#121214]/75 backdrop-blur-sm animate-fade-in-scale">
      <div className="bg-white border border-[#382c38]/20 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg shadow-2xl overflow-hidden text-[#121214] flex flex-col animate-slide-in-up">
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-[#382c38]/25 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-4 border-b border-[#382c38]/15 flex items-center justify-between bg-[#faf1ec]">
          <div>
            <h2 className="text-base font-black text-[#121214] flex items-center gap-2">
              <div className="w-7 h-7 bg-[#f1f5b1] rounded-xl flex items-center justify-center border border-[#382c38]/15">
                <Calendar className="w-4 h-4 text-[#121214]" />
              </div>
              <span>{editingItem ? 'Edit Item' : 'New Agenda Item'}</span>
            </h2>
            <p className="text-xs text-[#8f7c60] mt-0.5 font-medium pl-9">
              {editingItem ? 'Update task details and recurrence' : 'Track an anime, manhwa chapter, or deadline'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8f7c60] hover:text-[#121214] hover:bg-[#f8f5ef] rounded-xl transition-all duration-150 hover:scale-110"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm overflow-y-auto max-h-[75vh]">
          {/* Error */}
          {errorMsg && (
            <div className="p-3 bg-[#851f22]/10 border border-[#851f22]/30 rounded-xl text-[#851f22] text-xs font-bold flex items-center gap-2 animate-slide-in-up">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title Field */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-[#8f7c60] mb-1.5 tracking-widest">
              Title <span className="text-[#851f22]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. Chained Soldier Ep 1, Solo Leveling Ch 180..."
              className="w-full bg-[#faf1ec] border border-[#382c38]/20 rounded-2xl px-4 py-3 text-[#121214] placeholder-[#beb5a0] focus:outline-none focus:ring-2 focus:ring-[#f1f5b1] focus:border-[#382c38]/40 font-medium transition-all duration-200 text-sm"
              autoFocus
            />
          </div>

          {/* Category Visual Picker */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-[#8f7c60] mb-2 tracking-widest flex items-center gap-1">
              <Tag className="w-3 h-3" /> Category <span className="text-[#851f22]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => handleCategoryChange(cat.label)}
                  className={`p-3 rounded-xl border text-left transition-all duration-150 hover:scale-[1.02] relative ${
                    category === cat.label
                      ? 'bg-[#f1f5b1] border-[#382c38]/30 shadow-sm'
                      : 'bg-[#faf1ec] border-[#382c38]/15 hover:border-[#382c38]/30'
                  }`}
                >
                  {category === cat.label && (
                    <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#121214] rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-[#f1f5b1]" />
                    </div>
                  )}
                  <div className="text-base mb-1">{cat.emoji}</div>
                  <div className="text-xs font-bold text-[#121214]">{cat.label}</div>
                  <div className="text-[10px] text-[#8f7c60] font-medium">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-[#8f7c60] mb-1.5 tracking-widest flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Due Date <span className="text-[#851f22]">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 bg-[#faf1ec] border border-[#382c38]/20 rounded-xl px-3 py-2.5 text-[#121214] font-medium focus:outline-none focus:ring-2 focus:ring-[#f1f5b1] focus:border-[#382c38]/40 transition-all duration-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setDueDate(todayStr)}
                  className="bg-[#f1f5b1] hover:bg-[#e6eba0] text-[#121214] px-3 py-2.5 rounded-xl border border-[#382c38]/20 text-xs font-bold whitespace-nowrap transition-all duration-150 hover:scale-105"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Recurrence Selector */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-[#8f7c60] mb-1.5 tracking-widest flex items-center gap-1">
                <Repeat className="w-3 h-3" /> Auto-Repeat
              </label>
              <div className="flex gap-1 bg-[#faf1ec] p-1 rounded-xl border border-[#382c38]/15">
                {recurrenceOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRecurrence(opt.value)}
                    title={opt.desc}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all duration-150 ${
                      recurrence === opt.value
                        ? 'bg-[#121214] text-[#faf1ec] shadow-sm'
                        : 'text-[#8f7c60] hover:text-[#121214]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recurrence Info Banner */}
          {recurrence !== 'none' && isAnimeOrManhwa && (
            <div className="p-3.5 bg-[#f1f5b1] border border-[#382c38]/15 rounded-2xl text-[11px] text-[#121214] space-y-1 animate-slide-in-up">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Time Insertion Active · {recurrence === 'weekly' ? 'Weekly' : 'Monthly'}</span>
              </div>
              <p className="text-[#382c38]/80 leading-relaxed font-medium">
                Enter once! When marked done/watched, the next episode (<span className="font-mono font-bold">+1</span>) auto-generates for next {recurrence === 'weekly' ? 'week' : 'month'}.
              </p>
            </div>
          )}

          {/* Optional Link */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-[#8f7c60] mb-1.5 tracking-widest flex items-center gap-1">
              <LinkIcon className="w-3 h-3" /> Direct Link <span className="text-[#beb5a0] normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => handleLinkChange(e.target.value)}
              placeholder="https://crunchyroll.com, https://asuracomic.net..."
              className="w-full bg-[#faf1ec] border border-[#382c38]/15 rounded-xl px-4 py-2.5 text-[#121214] placeholder-[#beb5a0] font-medium focus:outline-none focus:ring-2 focus:ring-[#f1f5b1] focus:border-[#382c38]/40 transition-all duration-200 text-xs"
            />
            {urlWarning && (
              <p className="text-[11px] text-[#efcc59] mt-1 font-bold">⚠ {urlWarning}</p>
            )}
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-[#8f7c60] mb-1.5 tracking-widest flex items-center gap-1">
              <FileText className="w-3 h-3" /> Notes <span className="text-[#beb5a0] normal-case">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Details, episode notes, chapter expectations..."
              rows={2}
              className="w-full bg-[#faf1ec] border border-[#382c38]/15 rounded-xl px-4 py-2.5 text-[#121214] placeholder-[#beb5a0] font-medium focus:outline-none focus:ring-2 focus:ring-[#f1f5b1] focus:border-[#382c38]/40 transition-all duration-200 resize-none text-xs"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#382c38]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#f8f5ef] hover:bg-[#faf1ec] text-[#121214] border border-[#382c38]/15 font-bold transition-all duration-150 text-xs hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#f1f5b1] hover:bg-[#e6eba0] text-[#121214] border border-[#382c38]/20 font-bold transition-all duration-150 text-xs shadow-sm hover:shadow-md hover:scale-105"
            >
              {editingItem ? '✓ Save Changes' : '+ Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
