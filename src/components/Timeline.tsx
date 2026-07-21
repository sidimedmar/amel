/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lightbulb, Scroll, Droplet, Handshake, Calendar, Circle } from 'lucide-react';
import { useEditable } from '../context/EditableContext';

export const Timeline: React.FC = () => {
  const { currentLang, t, timelineEvents } = useEditable();

  const getTimelineIcon = (iconName: string) => {
    const iconClass = "w-5 h-5 text-white";
    switch (iconName) {
      case 'lightbulb':
        return <Lightbulb className={iconClass} />;
      case 'scroll':
        return <Scroll className={iconClass} />;
      case 'droplet':
        return <Droplet className={iconClass} />;
      case 'handshake':
        return <Handshake className={iconClass} />;
      default:
        return <Circle className={iconClass} />;
    }
  };

  return (
    <section
      id="timeline"
      className="py-24 bg-slate-50 dark:bg-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display mb-4 tracking-tight">
            {t.timelineTitle}
          </h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t.timelineSubtitle}
          </p>
        </div>

        {/* Timeline Core Architecture */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Center Branch Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-800 transform md:-translate-x-1/2 rounded-full"></div>

          {/* Events Stack */}
          <div className="space-y-12">
            {timelineEvents.map((evt, idx) => {
              const isEven = idx % 2 === 0;
              const evtDate = currentLang === 'fr' ? evt.date.fr : evt.date.ar;
              const evtTitle = currentLang === 'fr' ? evt.title.fr : evt.title.ar;
              const evtDesc = currentLang === 'fr' ? evt.description.fr : evt.description.ar;

              return (
                <div
                  key={evt.id}
                  className={`relative flex flex-col md:flex-row items-start ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                  id={`timeline-row-${evt.id}`}
                >
                  {/* Outer spacing placeholder on desktop to keep items aligned */}
                  <div className="hidden md:block w-1/2 px-8"></div>

                  {/* Circular Node marker on line */}
                  <div className="absolute left-4 md:left-1/2 top-1.5 w-10 h-10 rounded-full bg-gradient-to-br from-blue-700 to-indigo-800 dark:from-amber-500 dark:to-yellow-600 flex items-center justify-center shadow-lg border-4 border-slate-50 dark:border-slate-950 transform -translate-x-5 z-10">
                    {getTimelineIcon(evt.iconName)}
                  </div>

                  {/* Card Block */}
                  <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-8">
                    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group relative">
                      
                      {/* Triangle Pointer Accent (Desktop-only) */}
                      <div className={`hidden md:block absolute top-4 w-3 h-3 bg-white dark:bg-slate-900 border-t border-l border-slate-200/70 dark:border-slate-800 transform rotate-45 ${
                        isEven ? '-right-1.5 border-t border-r !border-l-0 rotate-[135deg]' : '-left-1.5'
                      }`}></div>

                      {/* Date Indicator Badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-xs font-bold mb-4">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{evtDate}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-slate-950 dark:text-white font-display mb-3 group-hover:text-blue-700 dark:group-hover:text-amber-400 transition-colors">
                        {evtTitle}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {evtDesc}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>


      </div>
    </section>
  );
};
