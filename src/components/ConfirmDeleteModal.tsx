import React from 'react';
import { AgendaItem } from '../types';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  item: AgendaItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121214]/75 backdrop-blur-sm animate-fade-in-scale">
      <div className="bg-white border border-[#382c38]/20 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden text-[#121214] animate-slide-in-up">
        {/* Top accent strip */}
        <div className="h-1 bg-gradient-to-r from-[#851f22]/60 via-[#851f22] to-[#851f22]/60" />
        
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#851f22]/10 border border-[#851f22]/25 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[#851f22]" />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8f7c60] hover:text-[#121214] hover:bg-[#f8f5ef] rounded-xl transition-all duration-150 hover:scale-110"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h3 className="text-base font-black text-[#121214]">Delete Item?</h3>
            <p className="text-xs text-[#8f7c60] mt-1.5 leading-relaxed font-medium">
              Are you sure you want to delete{' '}
              <span className="text-[#121214] font-bold">"{item.title}"</span>?
              This removes it permanently from both desktop and mobile sync.
            </p>
          </div>

          {/* Item preview chip */}
          <div className="p-3 bg-[#f8f5ef] border border-[#382c38]/15 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#851f22]" />
            <span className="text-xs font-bold text-[#121214] truncate">{item.title}</span>
            <span className="text-[10px] text-[#8f7c60] font-mono shrink-0">{item.category}</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#382c38]/10">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#f8f5ef] hover:bg-[#faf1ec] text-[#121214] border border-[#382c38]/15 text-xs font-bold transition-all duration-150 hover:scale-105"
            >
              Keep It
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#851f22] hover:bg-[#851f22]/85 text-[#faf1ec] text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all duration-150 hover:scale-105"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
