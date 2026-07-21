/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useEditable } from '../context/EditableContext';

export const FAQ: React.FC = () => {
  const { currentLang, t, faqData } = useEditable();
  const [openId, setOpenId] = useState<string | null>("faq_1"); // Default open first item

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section
      id="faq"
      className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display mb-4 tracking-tight flex items-center justify-center gap-2">
            <HelpCircle className="w-8 h-8 text-blue-600 dark:text-amber-400" />
            <span>{t.faqTitle}</span>
          </h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t.faqSubtitle}
          </p>
        </div>

        {/* Accordion Stack */}
        <div className="space-y-4">
          {faqData.map((item) => {
            const isOpen = openId === item.id;
            const itemQuestion = currentLang === 'fr' ? item.question.fr : item.question.ar;
            const itemAnswer = currentLang === 'fr' ? item.answer.fr : item.answer.ar;

            return (
              <div
                key={item.id}
                id={`faq-accordion-item-${item.id}`}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'border-blue-200 dark:border-amber-500/30 bg-blue-50/20 dark:bg-slate-900/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50'
                }`}
              >
                {/* Trigger Button */}
                <button
                  onClick={() => toggleFaq(item.id)}
                  className="w-full flex items-center justify-between p-6 text-left rtl:text-right font-semibold text-slate-900 dark:text-white hover:text-blue-700 dark:hover:text-amber-400 transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold font-display pr-4 rtl:pl-4">
                    {itemQuestion}
                  </span>
                  <div className={`p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-blue-100 text-blue-700 dark:bg-amber-950 dark:text-amber-400' : ''
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Collapsible Content Area */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[500px] border-t border-slate-100 dark:border-slate-800' : 'max-h-0'
                  } overflow-hidden`}
                >
                  <div className="p-6 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                    {itemAnswer}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

