/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Droplets, Users, ShieldCheck } from 'lucide-react';
import { useEditable } from '../context/EditableContext';
import { Logo } from './Logo';

export const Hero: React.FC = () => {
  const { t, images, currentLang, translations } = useEditable();

  const handleScrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden bg-slate-50 dark:bg-slate-950"
    >
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

      {/* Decorative colored glow orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-blue-300/20 dark:bg-blue-900/10 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-amber-200/20 dark:bg-amber-950/10 rounded-full blur-3xl z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content Block */}
          <div className="lg:col-span-7 flex flex-col items-start text-left rtl:text-right">
            
            {/* Elegant Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-amber-400 animate-pulse"></span>
              {t.heroBadge}
            </div>

            {/* Title with display font pair */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight font-display mb-6 tracking-tight">
              {currentLang === 'ar' ? (
                <>
                  كتلة <span className="text-blue-700 dark:text-amber-400">أمل حاسي البكاي</span>
                </>
              ) : (
                <>
                  L'Espoir de <span className="text-blue-700 dark:text-amber-400">Hassi El Bekay</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mb-8 leading-relaxed font-normal">
              {t.heroSubtitle}
            </p>

            {/* Primary & Secondary Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={() => handleScrollTo('#contact')}
                className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-900 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                id="hero-cta-btn"
              >
                <span>{t.heroCTA}</span>
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </button>
              
              <button
                onClick={() => handleScrollTo('#campaigns')}
                className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold px-8 py-4 rounded-xl shadow-sm transition-all duration-300"
                id="hero-secondary-btn"
              >
                {t.heroSecondaryCTA}
              </button>
            </div>

            {/* Quick Micro-Stats under buttons */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 w-full">
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-800 dark:text-amber-400">350K+</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {currentLang === 'fr' ? "Litres d'Eau" : "لتر من مياه السقاية"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-800 dark:text-amber-400">1,200+</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {currentLang === 'fr' ? "Sympathisants" : "منتسب ناشط"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-800 dark:text-amber-400">12</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {currentLang === 'fr' ? "Villages Couverts" : "قرية مستفيدة"}
                </span>
              </div>
            </div>

          </div>

          {/* Visual Presentation Block */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Main Visual Frame */}
            <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 group transform hover:scale-[1.01] transition-all duration-500">
              <img
                src={images.hero}
                alt="Mauritanie Hassi El Bekay"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-[1.1]"
                referrerPolicy="no-referrer"
              />
              
              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

              {/* Centered Crest Ring inside image overlay */}
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/95 p-2 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800">
                <Logo className="w-16 h-16" />
              </div>

              {/* Caption inside visual frame */}
              <div className="absolute bottom-6 left-6 right-6 text-white text-left rtl:text-right">
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2 text-amber-300">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  <span>{t.footerLeader}</span>
                </h3>
                <p className="text-xs text-slate-200 mt-1.5 font-normal leading-relaxed">
                  {currentLang === 'fr' 
                    ? "Initié par les intellectuels et leaders pour une représentativité équitable."
                    : "حراك شبابي تأسس بإشراف النخبة الواعية لخدمة التنمية المحلية."}
                </p>
              </div>
            </div>

            {/* Floating decoration widget: Movement Badge on Photo */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 animate-bounce-slow max-w-xs">
              <div className="bg-amber-100 dark:bg-amber-950/50 p-2.5 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-left rtl:text-right">
                <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-white leading-snug">
                  {currentLang === 'fr' 
                    ? (translations?.fr?.heroPhotoBadgeFr || t.heroPhotoBadgeFr || "Mouvement Social & Politique à Kiffa") 
                    : (translations?.ar?.heroPhotoBadgeAr || t.heroPhotoBadgeAr || "حراك اجتماعي وسياسي بكيفه")}
                </p>
              </div>
            </div>

            {/* Floating decoration widget: People Alliance */}
            <div className="absolute -top-4 -right-4 bg-white dark:bg-slate-900 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 flex items-center gap-2.5 hidden sm:flex">
              <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded-lg text-blue-600 dark:text-blue-300">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {currentLang === 'fr' ? "Alliance El Insaf" : "بالتنسيق مع حزب الإنصاف"}
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
