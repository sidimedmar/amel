/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Users2, Sprout, Award } from 'lucide-react';
import { useEditable } from '../context/EditableContext';

export const Values: React.FC = () => {
  const { t, valueCards, currentLang } = useEditable();

  const getIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'book':
        return <BookOpen className={className} />;
      case 'users':
        return <Users2 className={className} />;
      case 'sprout':
        return <Sprout className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  return (
    <section
      id="values"
      className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display mb-4 tracking-tight">
            {t.valuesTitle}
          </h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t.valuesSubtitle}
          </p>
        </div>

        {/* Values 3-column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valueCards.map((card, idx) => {
            const titleText = currentLang === 'fr' ? card.title.fr : card.title.ar;
            const descText = currentLang === 'fr' ? card.desc.fr : card.desc.ar;

            return (
              <div
                key={card.id}
                id={`value-card-${idx}`}
                className="relative bg-slate-50 dark:bg-slate-950 p-8 rounded-2xl border border-slate-150/70 dark:border-slate-800 hover:border-blue-300 dark:hover:border-amber-500/40 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Number Watermark */}
                <div className="absolute top-4 right-4 text-slate-200/50 dark:text-slate-800/40 text-6xl font-black select-none font-display">
                  {`0${idx + 1}`}
                </div>

                <div>
                  {/* Icon Frame */}
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md mb-6 transform group-hover:scale-105 transition-transform duration-300`}>
                    {getIcon(card.icon, "w-6 h-6")}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display mb-3 flex items-center gap-2">
                    {titleText}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                    {descText}
                  </p>
                </div>

                {/* Accent footer line */}
                <div className="w-0 group-hover:w-full h-1 bg-gradient-to-r from-blue-600 to-amber-500 transition-all duration-500 rounded-full mt-6"></div>
              </div>
            );
          })}
        </div>


        {/* Secondary Banner Quote */}
        <div className="mt-16 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden shadow-lg border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <span className="text-amber-400 text-xs sm:text-sm uppercase font-black tracking-widest block mb-4">
              {currentLang === 'fr' ? "NOTRE LEADER D'OPINION" : "رؤيتنا السياسية والتنموية"}
            </span>
            <blockquote className="text-xl sm:text-2xl font-medium font-display leading-relaxed italic">
              {currentLang === 'fr' 
                ? "« Notre action est purement altruiste : mobiliser la force vive des cadres pour offrir l'eau, la santé, et la dignité politique à chaque village de Hassi El Bekay. »"
                : "« نؤمن بأن الخدمة الاجتماعية الصادقة وتأطير الكفاءات هما السبيل الوحيد لفك العزلة وتوفير العيش الكريم وتمثيل قرى حاسي البكاي خير تمثيل. »"}
            </blockquote>
            <cite className="block text-slate-300 font-bold text-sm sm:text-base mt-6 not-italic">
              — {t.footerLeader}
            </cite>
          </div>
        </div>

      </div>
    </section>
  );
};
