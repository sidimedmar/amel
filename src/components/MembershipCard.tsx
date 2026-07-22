/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Download, Check, ShieldCheck, Phone, User, MapPin, Loader2 } from 'lucide-react';
import { Adherent } from '../types';
import { useEditable } from '../context/EditableContext';
import { Logo } from './Logo';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface MembershipCardProps {
  adherent: Adherent;
  showDownloadButton?: boolean;
}

// Simple deterministic barcode line generator for a high-fidelity visual barcode
const Barcode: React.FC<{ value: string }> = ({ value }) => {
  // Generate pseudo-random line widths based on character codes
  const lines = [];
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed += value.charCodeAt(i);
  }
  
  for (let i = 0; i < 35; i++) {
    const isDark = (seed * (i + 3) + 7) % 11 > 3;
    const width = ((seed * (i + 1)) % 3) + 1; // 1px, 2px, or 3px
    lines.push({ isDark, width });
  }

  return (
    <div className="flex items-stretch h-8 px-2 py-1 rounded" style={{ direction: 'ltr', backgroundColor: '#ffffff' }}>
      {lines.map((line, idx) => (
        <div
          key={idx}
          className="h-full"
          style={{
            width: `${line.width}px`,
            backgroundColor: line.isDark ? '#000000' : 'transparent',
            marginRight: '1px'
          }}
        />
      ))}
    </div>
  );
};

export const MembershipCard: React.FC<MembershipCardProps> = ({ adherent, showDownloadButton = true }) => {
  const { currentLang, presidentSignature, translations } = useEditable();
  const [isExporting, setIsExporting] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  // Dynamic lists of custom rules (up to 8 rules)
  const rules = [];
  for (let i = 1; i <= 8; i++) {
    const titleFr = translations?.fr?.[`cardRule${i}TitleFr` as any] || "";
    const descFr = translations?.fr?.[`cardRule${i}DescFr` as any] || "";
    const titleAr = translations?.ar?.[`cardRule${i}TitleAr` as any] || "";
    const descAr = translations?.ar?.[`cardRule${i}DescAr` as any] || "";
    if (titleFr || descFr || titleAr || descAr) {
      rules.push({ id: i, titleFr, descFr, titleAr, descAr });
    }
  }

  // Dynamic custom info lines on Front (up to 6)
  const frontCustomLines = [];
  for (let i = 1; i <= 6; i++) {
    const textFr = translations?.fr?.[`cardFrontCustom${i}Fr` as any] || "";
    const textAr = translations?.ar?.[`cardFrontCustom${i}Ar` as any] || "";
    if (textFr || textAr) {
      frontCustomLines.push({ id: i, fr: textFr, ar: textAr });
    }
  }

  // Dynamic custom info lines on Back (up to 6)
  const backCustomLines = [];
  for (let i = 1; i <= 6; i++) {
    const textFr = translations?.fr?.[`cardBackCustom${i}Fr` as any] || "";
    const textAr = translations?.ar?.[`cardBackCustom${i}Ar` as any] || "";
    if (textFr || textAr) {
      backCustomLines.push({ id: i, fr: textFr, ar: textAr });
    }
  }

  const handleDownloadPDF = async () => {
    if (!frontRef.current || !backRef.current) return;
    setIsExporting(true);

    // Temporary helper to strip oklch and oklab colors from all active stylesheets and computed styles
    // because html2canvas crashes when encountering modern CSS color spaces.
    const sanitizeStylesheetsAndComputedStyles = () => {
      const originalGetComputedStyle = window.getComputedStyle;
      const originalGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;
      const backups: { element: HTMLStyleElement; originalText: string }[] = [];
      
      const cleanValue = (val: any): any => {
        if (typeof val !== 'string') return val;
        if (!/oklch|oklab/i.test(val)) return val;
        
        // Replace oklch(...)
        // Format: oklch(L C H) or oklch(L C H / A)
        let cleaned = val.replace(/oklch\(\s*([^)]+)\s*\)/gi, (match, content) => {
          const parts = content.trim().split(/[\s,+/]+/);
          if (parts.length >= 3) {
            const lStr = parts[0];
            const cStr = parts[1];
            const hStr = parts[2];
            const aStr = parts[3] || '1';

            let l = parseFloat(lStr);
            if (lStr.includes('%')) l = l / 100;
            let c = parseFloat(cStr);
            if (cStr.includes('%')) c = c / 100;
            let h = parseFloat(hStr);
            if (hStr.includes('%')) h = (h / 100) * 360;

            const s = Math.min(100, Math.max(0, Math.round(c * 250)));
            const lightness = Math.min(100, Math.max(0, Math.round(l * 100)));
            const hue = Math.round(((h % 360) + 360) % 360);
            
            const alpha = parseFloat(aStr);
            if (alpha === 1) {
              return `hsl(${hue}, ${s}%, ${lightness}%)`;
            } else {
              return `hsla(${hue}, ${s}%, ${lightness}%, ${alpha})`;
            }
          }
          return 'rgb(30, 41, 59)';
        });

        // Replace oklab(...)
        // Format: oklab(L a b) or oklab(L a b / A)
        cleaned = cleaned.replace(/oklab\(\s*([^)]+)\s*\)/gi, (match, content) => {
          const parts = content.trim().split(/[\s,+/]+/);
          if (parts.length >= 3) {
            const lStr = parts[0];
            const aValStr = parts[1];
            const bValStr = parts[2];
            const aStr = parts[3] || '1';

            let l = parseFloat(lStr);
            if (lStr.includes('%')) l = l / 100;
            const aVal = parseFloat(aValStr);
            const bVal = parseFloat(bValStr);

            const c = Math.sqrt(aVal * aVal + bVal * bVal);
            const hRad = Math.atan2(bVal, aVal);
            let h = (hRad * 180) / Math.PI;
            h = ((h % 360) + 360) % 360;

            const s = Math.min(100, Math.max(0, Math.round(c * 250)));
            const lightness = Math.min(100, Math.max(0, Math.round(l * 100)));
            const hue = Math.round(h);
            
            const alpha = parseFloat(aStr);
            if (alpha === 1) {
              return `hsl(${hue}, ${s}%, ${lightness}%)`;
            } else {
              return `hsla(${hue}, ${s}%, ${lightness}%, ${alpha})`;
            }
          }
          return 'rgb(30, 41, 59)';
        });

        return cleaned;
      };

      // 1. Intercept CSSStyleDeclaration.prototype.getPropertyValue
      CSSStyleDeclaration.prototype.getPropertyValue = function (this: CSSStyleDeclaration, property: string) {
        const originalVal = originalGetPropertyValue.call(this, property);
        return cleanValue(originalVal);
      };

      // 2. Intercept window.getComputedStyle
      window.getComputedStyle = function (elt, pseudoElt) {
        const style = originalGetComputedStyle(elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            const val = target[prop as any];
            if (typeof val === 'function') {
              if (prop === 'getPropertyValue') {
                return function (propertyName: string) {
                  const originalVal = target.getPropertyValue(propertyName);
                  return cleanValue(originalVal);
                };
              }
              return (val as any).bind(target);
            }
            return cleanValue(val);
          }
        });
      };

      // 3. Sanitize <style> tags in-place without removing them from DOM
      const styleElements = Array.from(document.querySelectorAll('style'));
      for (const styleEl of styleElements) {
        try {
          const text = styleEl.textContent || '';
          if (/oklch|oklab/i.test(text)) {
            backups.push({ element: styleEl, originalText: text });
            styleEl.textContent = cleanValue(text);
          }
        } catch (err) {
          console.warn('Could not sanitize style tag:', err);
        }
      }

      return () => {
        // Restore window.getComputedStyle
        window.getComputedStyle = originalGetComputedStyle;

        // Restore CSSStyleDeclaration.prototype.getPropertyValue
        CSSStyleDeclaration.prototype.getPropertyValue = originalGetPropertyValue;
        
        // Restore style tag contents
        for (const backup of backups) {
          try {
            backup.element.textContent = backup.originalText;
          } catch (e) {
            console.error('Failed to restore stylesheet content:', e);
          }
        }
      };
    };

    let restoreStylesheets: (() => void) | null = null;
    try {
      restoreStylesheets = sanitizeStylesheetsAndComputedStyles();
    } catch (e) {
      console.warn('Could not sanitize stylesheets before html2canvas:', e);
    }

    // Force explicit letterSpacing: normal on all elements inside front & back targets before html2canvas
    const enforceArabicLetterSpacing = (container: HTMLElement) => {
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.letterSpacing = 'normal';
        htmlEl.style.wordSpacing = 'normal';
        htmlEl.style.fontVariantLigatures = 'normal';
      });
    };

    if (frontRef.current) enforceArabicLetterSpacing(frontRef.current);
    if (backRef.current) enforceArabicLetterSpacing(backRef.current);

    try {
      // Standard ID card CR80 aspect ratio size: 85.6mm x 53.98mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 54]
      });

      // Front Page
      const frontCanvas = await html2canvas(frontRef.current, {
        scale: 3, // High DPI for sharp print text
        useCORS: true,
        backgroundColor: null,
        logging: false
      });
      const frontImg = frontCanvas.toDataURL('image/png');
      pdf.addImage(frontImg, 'PNG', 0, 0, 85.6, 54);

      // Back Page
      pdf.addPage([85.6, 54], 'landscape');
      const backCanvas = await html2canvas(backRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });
      const backImg = backCanvas.toDataURL('image/png');
      pdf.addImage(backImg, 'PNG', 0, 0, 85.6, 54);

      pdf.save(`Carte_Adherent_${adherent.id}_${adherent.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error rendering card PDF:', err);
    } finally {
      if (restoreStylesheets) {
        try {
          restoreStylesheets();
        } catch (e) {
          console.error('Could not restore stylesheets:', e);
        }
      }
      setIsExporting(false);
    }
  };

  const isAr = adherent.lang === 'ar';

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Hidden container for print rendering at perfect aspect ratio & high contrast */}
      <div className="absolute overflow-hidden opacity-0 pointer-events-none -z-50" style={{ width: '400px', height: '252px' }}>
        {/* FRONT RENDER TARGET */}
        <div
          ref={frontRef}
          id={`front-card-${adherent.id}`}
          className="w-[400px] h-[252px] rounded-none p-3.5 flex flex-col justify-between relative overflow-hidden"
          style={{ 
            fontFamily: "'Cairo', 'Tajawal', system-ui, -apple-system, sans-serif", 
            letterSpacing: '0px',
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #172554 100%)',
            color: '#ffffff',
            border: '1px solid rgba(245, 158, 11, 0.4)'
          }}
        >
          {/* Subtle watermarks */}
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-xl" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-2xl" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}></div>

          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 relative z-10" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 p-0.5 rounded-lg flex items-center justify-center bg-white/10 border border-white/10 shrink-0">
                <Logo className="w-8 h-8" showText={false} />
              </div>
              <div className="text-right" dir="rtl">
                <p dir="rtl" lang="ar" className="text-[11px] font-black m-0" style={{ color: '#fbbf24', letterSpacing: 'normal' }}>
                  {translations?.ar?.cardRectoHeaderAr || "أمل حاسي البكاي"}
                </p>
                <p dir="rtl" lang="ar" className="text-[7.5px] m-0" style={{ color: '#cbd5e1', letterSpacing: 'normal' }}>
                  {translations?.ar?.cardRectoSubtitleAr || "حراك اجتماعي وسياسي بكيفه"}
                </p>
              </div>
            </div>
            <div className="text-left flex flex-col items-end">
              <span dir="rtl" lang="ar" className="text-[7.5px] px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: 'rgba(245, 158, 11, 0.25)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.4)', letterSpacing: 'normal' }}>
                {translations?.ar?.cardRectoBadgeAr || "بطاقة انتساب رسمية"}
              </span>
              <p className="text-[6px] mt-0.5 font-bold" style={{ color: '#94a3b8' }}>RECTO (عربي)</p>
            </div>
          </div>

          {/* Body content with Photo and Details in Arabic */}
          <div className="flex gap-3 items-center my-1 relative z-10" dir="rtl">
            {/* Adherent Photo */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full border-2 overflow-hidden flex items-center justify-center shadow-lg" style={{ borderColor: '#f59e0b', backgroundColor: '#1e293b' }}>
                {adherent.photo ? (
                  <img src={adherent.photo} alt={adherent.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-8 h-8" style={{ color: '#94a3b8' }} />
                )}
              </div>
              <div className="absolute -bottom-1 -left-1 rounded-full p-0.5 shadow" style={{ backgroundColor: '#10b981', color: '#ffffff', border: '1px solid #0f172a' }}>
                <Check className="w-2 h-2 stroke-[3]" />
              </div>
            </div>

            {/* Info details in Arabic with Highlighted Prominent Name Box */}
            <div className="flex-1 min-w-0 text-right">
              <div 
                className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-amber-500/40 shadow-sm mb-1 text-right"
                style={{ letterSpacing: 'normal' }}
              >
                <span className="block text-[6.5px] font-bold uppercase" style={{ color: '#fbbf24', letterSpacing: 'normal' }} dir="rtl" lang="ar">
                  الاسم الكامل / Nom complet
                </span>
                <h4 
                  className="text-[13.5px] font-black leading-tight m-0" 
                  style={{ 
                    color: '#fef08a', 
                    letterSpacing: '0px', 
                    fontFamily: "'Cairo', 'Tajawal', sans-serif",
                    wordBreak: 'break-word'
                  }} 
                  dir="rtl" 
                  lang="ar"
                >
                  {adherent.nameAr || adherent.name}
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-0.5 text-[8px]" style={{ letterSpacing: 'normal' }}>
                <div>
                  <span className="block text-[6.5px]" style={{ color: '#94a3b8', letterSpacing: 'normal' }} dir="rtl" lang="ar">المدينة / البلدية</span>
                  <span className="font-bold text-[8.5px]" style={{ color: '#ffffff', letterSpacing: 'normal' }} dir="rtl" lang="ar">{adherent.cityAr || adherent.city}</span>
                </div>
                <div>
                  <span className="block text-[6.5px]" style={{ color: '#94a3b8', letterSpacing: 'normal' }} dir="rtl" lang="ar">رقم الانتساب</span>
                  <span className="font-mono font-bold text-[8.5px]" style={{ color: '#fcd34d' }}>{adherent.id}</span>
                </div>
                <div>
                  <span className="block text-[6.5px]" style={{ color: '#94a3b8', letterSpacing: 'normal' }} dir="rtl" lang="ar">الواتساب / الهاتف</span>
                  <span className="font-mono text-[8.5px]" style={{ color: '#ffffff' }}>{adherent.phone}</span>
                </div>
                <div>
                  <span className="block text-[6.5px]" style={{ color: '#94a3b8', letterSpacing: 'normal' }} dir="rtl" lang="ar">تاريخ الانتساب</span>
                  <span className="font-mono text-[8.5px]" style={{ color: '#ffffff' }}>{adherent.createdAt || "2026"}</span>
                </div>

                {/* Dynamic Custom Front Lines */}
                {frontCustomLines.map((line) => (
                  <div key={line.id} className="col-span-2 text-amber-300 font-semibold text-[7px] leading-tight mt-0.5" style={{ letterSpacing: 'normal' }}>
                    {line.ar || line.fr}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Barcode */}
          <div className="pt-1 flex items-center justify-between relative z-10" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <span className="text-[7px] font-medium" style={{ color: '#cbd5e1', letterSpacing: 'normal' }} dir="rtl" lang="ar">
              {translations?.ar?.cardRectoFooterAr || "المبادرة الاجتماعية والسياسية بكيفه"}
            </span>
            <div className="flex flex-col items-end">
              <Barcode value={adherent.id} />
              <span className="text-[5px] font-mono mt-0.5" style={{ color: '#cbd5e1' }}>{adherent.id}</span>
            </div>
          </div>
        </div>

        {/* BACK RENDER TARGET (FRANÇAIS - NO CHARTE - WITH DR MAHFOUDH SIGNATURE) */}
        <div
          ref={backRef}
          id={`back-card-${adherent.id}`}
          className="w-[400px] h-[252px] rounded-none p-3.5 flex flex-col justify-between relative overflow-hidden text-left"
          style={{ 
            fontFamily: "system-ui, -apple-system, sans-serif", 
            letterSpacing: '0px',
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #172554 100%)',
            color: '#ffffff',
            border: '1px solid rgba(245, 158, 11, 0.4)'
          }}
        >
          {/* Subtle watermarks */}
          <div className="absolute top-0 left-0 w-24 h-24 rounded-full blur-xl" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}></div>
          
          {/* Back Header in French */}
          <div className="flex justify-between items-center pb-1.5" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <div>
              <p className="text-[9.5px] font-black uppercase" style={{ color: '#fbbf24' }}>
                {translations?.fr?.cardVersoHeaderFr || "MOUVEMENT AMEL - HASSI EL BEKAY"}
              </p>
              <p className="text-[7px]" style={{ color: '#cbd5e1' }}>
                {translations?.fr?.cardVersoSubtitleFr || "Carte d'Adhésion Officielle - Kiffa"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-right justify-end">
              <Logo className="w-5 h-5 shrink-0 bg-white/10 p-0.5 rounded border border-white/10" showText={false} />
              <span className="text-[7px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: 'rgba(59, 130, 246, 0.25)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                VERSO (FR)
              </span>
            </div>
          </div>

          {/* Body in French with Same Adherent Info */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 my-1 text-[8.5px]">
            <div className="col-span-2 bg-slate-800/90 p-1.5 rounded-lg border border-amber-500/30 flex items-center justify-between shadow-sm">
              <div>
                <span className="block text-[6.5px] uppercase font-bold text-amber-400">Nom & Prénom</span>
                <span className="font-black text-amber-200 text-[12px] leading-tight block">{adherent.nameFr || adherent.name}</span>
              </div>
              <span className="text-[8px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                {adherent.id}
              </span>
            </div>

            <div>
              <span className="block text-[6.5px] uppercase font-bold text-slate-400">Ville / Commune</span>
              <span className="font-bold text-slate-100">{adherent.cityFr || adherent.city}</span>
            </div>

            <div>
              <span className="block text-[6.5px] uppercase font-bold text-slate-400">N° Adhérent</span>
              <span className="font-mono font-bold text-amber-300">{adherent.id}</span>
            </div>

            <div>
              <span className="block text-[6.5px] uppercase font-bold text-slate-400">WhatsApp / Tél</span>
              <span className="font-mono text-slate-100">{adherent.phone}</span>
            </div>

            <div>
              <span className="block text-[6.5px] uppercase font-bold text-slate-400">Date d'Adhésion</span>
              <span className="font-mono text-slate-100">{adherent.createdAt || "2026"}</span>
            </div>

            {/* Custom Extra Back Lines in French */}
            {backCustomLines.map((line) => (
              <div key={line.id} className="col-span-2 text-[7px] text-emerald-300">
                • {line.fr || line.ar}
              </div>
            ))}
          </div>

          {/* Footer Signature President Dr Mahfoudh */}
          <div className="pt-2 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <div className="text-[6.5px] flex items-center gap-1" style={{ color: '#cbd5e1' }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
              <span>Membre Certifié & Approuvé</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Stamp */}
              <div className="w-8 h-8 rounded-full flex flex-col items-center justify-center text-[5px] font-black rotate-12 scale-90" style={{ border: '1px solid rgba(239, 68, 68, 0.6)', color: '#ef4444' }}>
                <span>{translations?.fr?.cardVersoStamp?.split(' ')?.[0] || "AMEL"}</span>
                <span>{translations?.fr?.cardVersoStamp?.split(' ')?.[1] || "APPROUVÉ"}</span>
              </div>
              
              {/* President Signature */}
              <div className="text-right flex flex-col items-end">
                <p className="text-[5.5px] font-bold text-slate-300 m-0 uppercase">
                  {translations?.fr?.cardVersoSignatureFr || "Le Président: Dr. Mahfoudh"}
                </p>
                {presidentSignature ? (
                  <img src={presidentSignature} className="h-5 object-contain mt-0.5 bg-white/10 p-0.5 rounded" alt="Signature" referrerPolicy="no-referrer" />
                ) : (
                  <p className="text-[8.5px] font-serif italic font-extrabold text-amber-300 m-0">
                    Dr Mahfoudh Ould Soueidane
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Interactive Card Preview Panel */}
      <div className="w-full flex flex-col md:flex-row gap-6 justify-center items-center">
        {/* Card Recto (Front) Screen Display - ARABIC */}
        <div 
          className="w-full max-w-[340px] h-[215px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-4 flex flex-col justify-between relative border border-amber-500/40 shadow-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300" 
          dir="rtl"
          style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

          {/* Card Header (Arabic) */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 relative z-10">
            <div className="flex items-center gap-2">
              <Logo className="w-8 h-8 bg-white/10 p-1.5 rounded-lg border border-white/10" showText={false} />
              <div className="text-right">
                <p dir="rtl" lang="ar" className="text-[11px] font-black text-amber-400 uppercase m-0 leading-none">
                  {translations?.ar?.cardRectoHeaderAr || "أمل حاسي البكاي"}
                </p>
                <p dir="rtl" lang="ar" className="text-[8px] text-slate-300 m-0 mt-0.5 leading-none">
                  {translations?.ar?.cardRectoSubtitleAr || "حراك اجتماعي وسياسي بكيفه"}
                </p>
              </div>
            </div>
            <div className="text-left flex flex-col items-end justify-center">
              <span className="text-[8px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black">
                {translations?.ar?.cardRectoBadgeAr || "بطاقة انتساب رسمية"}
              </span>
              <span className="text-[7px] text-slate-400 font-bold mt-0.5">RECTO (عربي)</span>
            </div>
          </div>

          {/* Card Body (Arabic) */}
          <div className="flex gap-3 items-center my-1 relative z-10">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full border-2 border-amber-500 overflow-hidden bg-slate-800 flex items-center justify-center shadow-lg">
                {adherent.photo ? (
                  <img src={adherent.photo} alt={adherent.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-7 h-7 text-slate-400" />
                )}
              </div>
              <div className="absolute -bottom-1 -left-1 bg-emerald-500 text-white rounded-full p-0.5 border border-slate-900 shadow">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>

            <div className="flex-1 min-w-0 text-right">
              {/* Highlighted Prominent Name Box */}
              <div className="bg-slate-900/90 px-2 py-1 rounded-lg border border-amber-500/40 shadow-sm mb-1 text-right">
                <span className="block text-[7px] font-bold text-amber-400" dir="rtl" lang="ar">
                  الاسم الكامل / Nom complet
                </span>
                <h4 className="text-[13px] sm:text-sm font-black text-amber-200 leading-tight m-0" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }} dir="rtl" lang="ar">
                  {adherent.nameAr || adherent.name}
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8.5px] text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[6.5px] font-bold" dir="rtl" lang="ar">
                    المدينة / البلدية
                  </span>
                  <span className="font-bold text-slate-100" dir="rtl" lang="ar">{adherent.cityAr || adherent.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[6.5px] font-bold" dir="rtl" lang="ar">
                    رقم الانتساب
                  </span>
                  <span className="text-amber-400 font-mono font-bold">{adherent.id}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[6.5px] font-bold" dir="rtl" lang="ar">
                    الواتساب / الهاتف
                  </span>
                  <span className="font-mono text-slate-100 block truncate">{adherent.phone}</span>
                </div>

                {/* Dynamic Custom Front Lines */}
                {frontCustomLines.map((line) => (
                  <div key={line.id} className="col-span-2 text-amber-300 font-semibold text-[7.5px] leading-tight">
                    {line.ar || line.fr}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card Footer (Arabic) */}
          <div className="border-t border-white/10 pt-1.5 flex items-center justify-between relative z-10 text-[7.5px] text-slate-300">
            <span className="truncate max-w-[150px]" dir="rtl" lang="ar">
              {translations?.ar?.cardRectoFooterAr || "المبادرة الاجتماعية والسياسية بكيفه"}
            </span>
            <div className="flex flex-col items-end">
              <Barcode value={adherent.id} />
              <span className="text-[6px] font-mono mt-0.5 text-slate-400">{adherent.id}</span>
            </div>
          </div>
        </div>

        {/* Card Verso (Back) Screen Display - FRENCH (NO CHARTE, FRENCH ADHERENT INFO & DR MAHFOUDH SIGNATURE) */}
        <div className="w-full max-w-[340px] h-[215px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-4 flex flex-col justify-between relative border border-amber-500/40 shadow-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300" dir="ltr">
          <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>

          {/* Card Header (French) */}
          <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
            <div>
              <p className="text-[9.5px] font-black text-amber-400 uppercase">
                {translations?.fr?.cardVersoHeaderFr || "MOUVEMENT AMEL - HASSI EL BEKAY"}
              </p>
              <p className="text-[7.5px] text-slate-300">
                {translations?.fr?.cardVersoSubtitleFr || "Carte d'Adhésion Officielle - Kiffa"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <Logo className="w-5 h-5 shrink-0 bg-white/10 p-0.5 rounded border border-white/10" showText={false} />
              <span className="text-[7.5px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase font-black">
                VERSO (FR)
              </span>
            </div>
          </div>

          {/* Body in French with Same Adherent Info */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 my-1 text-[8px] text-left">
            <div className="col-span-2 bg-slate-800/90 p-1.5 rounded-lg border border-amber-500/30 flex items-center justify-between shadow-sm">
              <div>
                <span className="block text-[6.5px] uppercase font-bold text-amber-400">Nom & Prénom</span>
                <span className="font-extrabold text-amber-200 text-[11px] leading-tight block">{adherent.nameFr || adherent.name}</span>
              </div>
              <span className="text-[7.5px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {adherent.id}
              </span>
            </div>

            <div>
              <span className="block text-[6px] uppercase font-bold text-slate-400">Ville / Commune</span>
              <span className="font-bold text-slate-200 text-[8px]">{adherent.cityFr || adherent.city}</span>
            </div>

            <div>
              <span className="block text-[6px] uppercase font-bold text-slate-400">N° Adhérent</span>
              <span className="font-mono font-bold text-amber-300 text-[8px]">{adherent.id}</span>
            </div>

            <div>
              <span className="block text-[6px] uppercase font-bold text-slate-400">WhatsApp / Tél</span>
              <span className="font-mono text-slate-200 text-[8px]">{adherent.phone}</span>
            </div>

            <div>
              <span className="block text-[6px] uppercase font-bold text-slate-400">Date d'Adhésion</span>
              <span className="font-mono text-slate-200 text-[8px]">{adherent.createdAt || "2026"}</span>
            </div>

            {/* Custom Extra Back Lines in French */}
            {backCustomLines.map((line) => (
              <div key={line.id} className="col-span-2 text-[7px] text-emerald-300">
                • {line.fr || line.ar}
              </div>
            ))}
          </div>

          {/* Footer Signature President Dr Mahfoudh */}
          <div className="pt-2 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="text-[6.5px] flex items-center gap-1" style={{ color: '#94a3b8' }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
              <span>Membre Certifié & Approuvé</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Stamp */}
              <div className="w-8 h-8 rounded-full flex flex-col items-center justify-center text-[5px] font-black rotate-12 scale-90" style={{ border: '1px solid rgba(239, 68, 68, 0.5)', color: '#ef4444' }}>
                <span>{translations?.fr?.cardVersoStamp?.split(' ')?.[0] || "AMEL"}</span>
                <span>{translations?.fr?.cardVersoStamp?.split(' ')?.[1] || "APPROUVÉ"}</span>
              </div>
              
              {/* President Signature */}
              <div className="text-right flex flex-col items-end">
                <p className="text-[5.5px] font-bold text-slate-300 m-0 uppercase">
                  {translations?.fr?.cardVersoSignatureFr || "Le Président: Dr. Mahfoudh"}
                </p>
                {presidentSignature ? (
                  <img src={presidentSignature} className="h-5 object-contain mt-0.5 bg-white/10 p-0.5 rounded" alt="Signature" referrerPolicy="no-referrer" />
                ) : (
                  <p className="text-[8.5px] font-serif italic font-extrabold text-amber-300 m-0 tracking-tight">
                    Dr Mahfoudh Ould Soueidane
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Interactive Card Preview Panel */}
      <div className="w-full flex flex-col md:flex-row gap-6 justify-center items-center">
        {/* Card Recto (Front) Screen Display - ARABIC */}
        <div className="w-full max-w-[340px] h-[215px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-4 flex flex-col justify-between relative border border-slate-700/50 shadow-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300" dir="rtl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

          {/* Card Header (Arabic) */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 relative z-10">
            <div className="flex items-center gap-2">
              <Logo className="w-8 h-8 bg-white/10 p-1.5 rounded-lg border border-white/10" showText={false} />
              <div className="text-right">
                <p dir="rtl" lang="ar" className="text-[11px] font-black text-amber-400 uppercase m-0 leading-none">
                  {translations?.ar?.cardRectoHeaderAr || "أمل حاسي البكاي"}
                </p>
                <p dir="rtl" lang="ar" className="text-[8px] text-slate-300 m-0 mt-0.5 leading-none">
                  {translations?.ar?.cardRectoSubtitleAr || "حراك اجتماعي وسياسي بكيفه"}
                </p>
              </div>
            </div>
            <div className="text-left flex flex-col items-end justify-center">
              <span className="text-[8px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black">
                {translations?.ar?.cardRectoBadgeAr || "بطاقة انتساب رسمية"}
              </span>
              <span className="text-[7px] text-slate-400 font-bold mt-0.5">RECTO (عربي)</span>
            </div>
          </div>

          {/* Card Body (Arabic) */}
          <div className="flex gap-3 items-center my-1 relative z-10">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full border-2 border-amber-500 overflow-hidden bg-slate-800 flex items-center justify-center">
                {adherent.photo ? (
                  <img src={adherent.photo} alt={adherent.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-7 h-7 text-slate-400" />
                )}
              </div>
              <div className="absolute -bottom-1 -left-1 bg-emerald-500 text-white rounded-full p-0.5 border border-slate-900 shadow">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>

            <div className="flex-1 min-w-0 text-right">
              <h4 className="text-xs font-black text-white leading-snug truncate" dir="rtl" lang="ar">
                {adherent.nameAr || adherent.name}
              </h4>
              
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-[8.5px] text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[6.5px] font-bold" dir="rtl" lang="ar">
                    المدينة / البلدية
                  </span>
                  <span className="font-bold text-slate-100" dir="rtl" lang="ar">{adherent.cityAr || adherent.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[6.5px] font-bold" dir="rtl" lang="ar">
                    رقم الانتساب
                  </span>
                  <span className="text-amber-400 font-mono font-bold">{adherent.id}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[6.5px] font-bold" dir="rtl" lang="ar">
                    الواتساب / الهاتف
                  </span>
                  <span className="font-mono text-slate-100 block truncate">{adherent.phone}</span>
                </div>

                {/* Dynamic Custom Front Lines */}
                {frontCustomLines.map((line) => (
                  <div key={line.id} className="col-span-2 text-amber-300 font-semibold text-[7.5px] leading-tight">
                    {line.ar || line.fr}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card Footer (Arabic) */}
          <div className="border-t border-white/10 pt-1.5 flex items-center justify-between relative z-10 text-[7.5px] text-slate-400">
            <span className="truncate max-w-[150px]" dir="rtl" lang="ar">
              {translations?.ar?.cardRectoFooterAr || "المبادرة الاجتماعية والسياسية بكيفه"}
            </span>
            <div className="flex flex-col items-end">
              <Barcode value={adherent.id} />
              <span className="text-[6px] font-mono mt-0.5 text-slate-400">{adherent.id}</span>
            </div>
          </div>
        </div>

        {/* Card Verso (Back) Screen Display - FRENCH (NO CHARTE, FRENCH ADHERENT INFO & DR MAHFOUDH SIGNATURE) */}
        <div className="w-full max-w-[340px] h-[215px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-4 flex flex-col justify-between relative border border-slate-700/50 shadow-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300" dir="ltr">
          <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>

          {/* Card Header (French) */}
          <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
            <div>
              <p className="text-[9.5px] font-black text-amber-400 uppercase tracking-tight">
                {translations?.fr?.cardVersoHeaderFr || "MOUVEMENT AMEL - HASSI EL BEKAY"}
              </p>
              <p className="text-[7.5px] text-slate-300">
                {translations?.fr?.cardVersoSubtitleFr || "Carte d'Adhésion Officielle - Kiffa"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <Logo className="w-5 h-5 shrink-0 bg-white/10 p-0.5 rounded border border-white/10" showText={false} />
              <span className="text-[7.5px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase font-black tracking-wider">
                VERSO (FR)
              </span>
            </div>
          </div>

          {/* Body in French with Same Adherent Info */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 my-1 text-[8px] text-left">
            <div className="col-span-2 bg-slate-800/80 p-1.5 rounded border border-white/10 flex items-center justify-between">
              <div>
                <span className="block text-[6px] uppercase font-bold text-slate-400">Nom & Prénom</span>
                <span className="font-extrabold text-white text-[9.5px]">{adherent.nameFr || adherent.name}</span>
              </div>
              <span className="text-[7.5px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {adherent.id}
              </span>
            </div>

            <div>
              <span className="block text-[6px] uppercase font-bold text-slate-400">Ville / Commune</span>
              <span className="font-bold text-slate-200 text-[8px]">{adherent.cityFr || adherent.city}</span>
            </div>

            <div>
              <span className="block text-[6px] uppercase font-bold text-slate-400">N° Adhérent</span>
              <span className="font-mono font-bold text-amber-300 text-[8px]">{adherent.id}</span>
            </div>

            <div>
              <span className="block text-[6px] uppercase font-bold text-slate-400">WhatsApp / Tél</span>
              <span className="font-mono text-slate-200 text-[8px]">{adherent.phone}</span>
            </div>

            <div>
              <span className="block text-[6px] uppercase font-bold text-slate-400">Date d'Adhésion</span>
              <span className="font-mono text-slate-200 text-[8px]">{adherent.createdAt || "2026"}</span>
            </div>

            {/* Custom Extra Back Lines in French */}
            {backCustomLines.map((line) => (
              <div key={line.id} className="col-span-2 text-[7px] text-emerald-300">
                • {line.fr || line.ar}
              </div>
            ))}
          </div>

          {/* Footer Signature President Dr Mahfoudh */}
          <div className="border-t border-white/10 pt-1.5 flex items-center justify-between">
            <div className="text-[6.5px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Membre Certifié & Approuvé</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-red-500/40 flex flex-col items-center justify-center text-[4.5px] text-red-500/70 font-black rotate-12 scale-90 shrink-0">
                <span>{translations?.fr?.cardVersoStamp?.split(' ')?.[0] || "AMEL"}</span>
                <span>{translations?.fr?.cardVersoStamp?.split(' ')?.[1] || "APPROUVÉ"}</span>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="text-[5.5px] text-slate-300 font-bold uppercase leading-none m-0">
                  {translations?.fr?.cardVersoSignatureFr || "Le Président: Dr. Mahfoudh"}
                </p>
                {presidentSignature ? (
                  <img src={presidentSignature} className="h-4 object-contain mt-0.5 bg-white/15 p-0.5 rounded" alt="Signature" referrerPolicy="no-referrer" />
                ) : (
                  <p className="text-[8.5px] font-serif italic font-extrabold text-amber-300 leading-none m-0 mt-0.5">
                    Dr Mahfoudh Ould Soueidane
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA Download */}
      {showDownloadButton && (
        <button
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 dark:from-amber-500 dark:to-amber-600 dark:hover:from-amber-600 dark:hover:to-amber-700 text-white dark:text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all w-full max-w-sm justify-center"
          id={`download-pdf-btn-${adherent.id}`}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{currentLang === 'fr' ? 'Génération du PDF...' : 'جاري إنشاء ملف الـ PDF...'}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>{currentLang === 'fr' ? 'Télécharger ma Carte (PDF)' : 'تحميل بطاقتي الشخصية (PDF)'}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
