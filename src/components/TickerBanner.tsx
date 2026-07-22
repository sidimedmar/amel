/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BellRing, Pause, Play, X, ChevronRight, Sparkles } from 'lucide-react';
import { useEditable } from '../context/EditableContext';

export const TickerBanner: React.FC = () => {
  const { currentLang, announcements } = useEditable();
  const [isPaused, setIsPaused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const activeMessages = announcements && announcements.length > 0
    ? announcements.map(a => currentLang === 'fr' ? a.text.fr : a.text.ar)
    : [
        currentLang === 'fr' 
          ? "🚨 URGENCE EAU POTABLE: Distribution gratuite par citernes aujourd'hui à Kiffa."
          : "🚨 عاجل - طوارئ المياه: توزيع مجاني للمياه الصالحة للشرب عبر الصهاريج اليوم بكيفه."
      ];

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 text-xs sm:text-sm font-bold shadow-md relative z-50 border-b border-amber-400/40 select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Label Badge */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-950 text-amber-400 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-extrabold shadow-sm">
          <BellRing className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>{currentLang === 'fr' ? "ANNONCES KIFFA" : "إعلانات كيفه"}</span>
        </div>

        {/* Scrolling Marquee Container */}
        <div 
          className="flex-1 overflow-hidden relative cursor-pointer group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className={`flex items-center whitespace-nowrap transition-transform duration-300 ${
              isPaused ? 'opacity-90' : 'animate-marquee'
            }`}
            style={{
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          >
            {activeMessages.concat(activeMessages).map((msg, idx) => (
              <div key={idx} className="flex items-center mx-6 gap-2">
                <Sparkles className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span className="font-semibold text-slate-950 drop-shadow-sm">{msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls (Pause/Play + Dismiss) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded-md hover:bg-slate-950/10 text-slate-950 transition-colors"
            title={isPaused ? "Reprendre le défilement" : "Mettre en pause"}
            aria-label="Pause marquee"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md hover:bg-slate-950/10 text-slate-950 transition-colors"
            title="Masquer la bannière"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
