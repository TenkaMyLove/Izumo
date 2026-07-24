import React from 'react';
import { ExternalLink, X, Globe, ShieldCheck } from 'lucide-react';

interface BrowserLinkModalProps {
  url: string | null;
  itemTitle: string;
  onClose: () => void;
}

export const BrowserLinkModal: React.FC<BrowserLinkModalProps> = ({
  url,
  itemTitle,
  onClose,
}) => {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121214]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-[#382c38]/20 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-[#121214] flex flex-col">
        {/* Browser Top Bar Mock */}
        <div className="bg-[#faf1ec] px-4 py-3 border-b border-[#382c38]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#851f22]" />
              <span className="w-3 h-3 rounded-full bg-[#efcc59]" />
              <span className="w-3 h-3 rounded-full bg-[#386641]" />
            </div>
            <span className="text-xs text-[#8f7c60] font-bold ml-2">Default Web Browser</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8f7c60] hover:text-[#121214] hover:bg-[#f8f5ef] rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Address Bar */}
        <div className="bg-[#f8f5ef] px-4 py-2 border-b border-[#382c38]/20 flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-[#386641] shrink-0" />
          <div className="flex-1 bg-[#121214] px-3 py-1.5 rounded-xl border border-[#382c38] text-[#f1f5b1] font-mono truncate font-semibold">
            {url}
          </div>
        </div>

        {/* Content Preview / Launch Prompt */}
        <div className="p-6 space-y-4 text-center bg-white">
          <div className="w-14 h-14 rounded-2xl bg-[#f1f5b1] border border-[#382c38]/20 flex items-center justify-center mx-auto text-[#121214]">
            <Globe className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold text-[#121214]">Launching Link in Default Browser</h3>
            <p className="text-xs text-[#8f7c60] mt-1 max-w-md mx-auto leading-relaxed font-semibold">
              Opening <strong className="text-[#121214] font-bold">"{itemTitle}"</strong>. Links open in your primary default web browser so you stay logged into your streaming site, reader, or college portal.
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#f1f5b1] hover:bg-[#f1f5b1]/80 text-[#121214] border border-[#382c38]/20 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in New Browser Tab</span>
            </a>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#f8f5ef] hover:bg-[#faf1ec] text-[#121214] border border-[#382c38]/20 text-xs font-bold transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
