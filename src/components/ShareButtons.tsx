/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Share2, Facebook, MessageCircle, Twitter, Link as LinkIcon, Check } from 'lucide-react';
import { Language } from '../types';

interface ShareButtonsProps {
  title: string;
  description?: string;
  url?: string;
  currentLang: Language;
  className?: string;
  compact?: boolean;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  title,
  description = '',
  url,
  currentLang,
  className = '',
  compact = false
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://hassi-elbkay.org');
  const shareText = `${title}${description ? ' - ' + description : ''}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const encodedText = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  const shareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const encodedUrl = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
  };

  const shareTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={shareWhatsApp}
          className="p-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all"
          title={currentLang === 'fr' ? "Partager sur WhatsApp" : "مشاركة عبر واتساب"}
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <button
          onClick={shareFacebook}
          className="p-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all"
          title={currentLang === 'fr' ? "Partager sur Facebook" : "مشاركة عبر فيسبوك"}
        >
          <Facebook className="w-4 h-4" />
        </button>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-full bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 dark:text-slate-300 transition-all"
          title={currentLang === 'fr' ? "Copier le lien" : "نسخ الرابط"}
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`} onClick={(e) => e.stopPropagation()}>
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Share2 className="w-3.5 h-3.5 text-amber-500" />
        {currentLang === 'fr' ? "Partager cet appel / événement" : "مشاركة هذا المنشور"}
      </span>

      <div className="flex flex-wrap items-center gap-2">
        {/* WhatsApp */}
        <button
          onClick={shareWhatsApp}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>

        {/* Facebook */}
        <button
          onClick={shareFacebook}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95"
        >
          <Facebook className="w-3.5 h-3.5" />
          <span>Facebook</span>
        </button>

        {/* Twitter */}
        <button
          onClick={shareTwitter}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95"
        >
          <Twitter className="w-3.5 h-3.5" />
          <span>X / Twitter</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-sm"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">
                {currentLang === 'fr' ? "Copié !" : "تم النسخ!"}
              </span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{currentLang === 'fr' ? "Copier le lien" : "نسخ الرابط"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
