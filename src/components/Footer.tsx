/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUp, Facebook, Phone, Mail, MapPin, Globe } from 'lucide-react';
import { useEditable } from '../context/EditableContext';
import { Logo } from './Logo';
import { VisitorCounter } from './VisitorCounter';

export const Footer: React.FC = () => {
  const { currentLang, t, handleSecretLogoClick } = useEditable();

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
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
    <footer className="bg-slate-900 text-slate-300 dark:bg-slate-950 border-t border-slate-800">
      
      {/* Upper Footer: Logo, Bio, Contact & Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* Column 1: Brand details */}
          <div className="md:col-span-5 flex flex-col items-start text-left rtl:text-right">
            <Logo 
              className="w-16 h-16 bg-white/5 p-2 rounded-xl mb-6 border border-white/10 cursor-pointer" 
              showText={true} 
              onClick={handleSecretLogoClick}
            />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6 font-normal">
              {t.footerText}
            </p>
            {/* Social Link block */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/photo/?fbid=122106015873346518&set=a.122102219883346518"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 transition-all duration-300 shadow-sm"
                title="Soutenez-nous sur Facebook"
                id="footer-facebook-link"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://ais-dev-cz6jdp4pues7fnzfatwatk-10032870300.europe-west2.run.app"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition-all duration-300 shadow-sm"
                title="Mouvement Officiel"
                id="footer-website-link"
              >
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-3 text-left rtl:text-right">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-l-2 rtl:border-l-0 rtl:border-r-2 border-amber-500 pl-3 rtl:pr-3 mb-6">
              {t.footerShortcutsHeading || (currentLang === 'fr' ? "Raccourcis" : "روابط سريعة")}
            </h4>
            <ul className="space-y-3.5 text-sm font-medium">
              {[
                { name: t.navHome, href: "#home" },
                { name: t.navValues, href: "#values" },
                { name: t.navCampaigns, href: "#campaigns" },
                { name: t.navGallery, href: "#gallery" },
                { name: t.navTimeline, href: "#timeline" },
                { name: t.navFAQ, href: "#faq" }
              ].map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="hover:text-amber-400 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Leadership coordinates */}
          <div className="md:col-span-4 text-left rtl:text-right">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-l-2 rtl:border-l-0 rtl:border-r-2 border-amber-500 pl-3 rtl:pr-3 mb-6">
              {t.footerContactHeading || (currentLang === 'fr' ? "Coordonnées de l'Initiative" : "معلومات الاتصال")}
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-xs uppercase tracking-wider">
                    {t.footerPhoneLabel || "WhatsApp & Appel"}
                  </p>
                  <p className="text-slate-400 mt-0.5">
                    {t.footerPhoneVal || "+222 4673 3465"}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-xs uppercase tracking-wider">
                    {t.footerEmailLabel || "Adresse Email"}
                  </p>
                  <p className="text-slate-400 mt-0.5">
                    {t.footerEmailVal || "contact@hassi-elbkay.org"}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-xs uppercase tracking-wider">
                    {t.footerAddressLabel || "Quartier Général"}
                  </p>
                  <p className="text-slate-400 mt-0.5">
                    {t.footerAddressVal || "Hassi El Bekay, Commune de Kiffa, Mauritanie"}
                  </p>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Visitor Counter Section displaying movement popularity in Kiffa */}
      <VisitorCounter />

      {/* SEO metadata tags representation (Under footer, readable by search crawlers) */}
      <div className="bg-slate-950 py-4 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] text-slate-500 select-none">
          <span className="font-semibold uppercase mr-1">Mots-clés SEO / الوعي الكياني:</span>
          <span>{t.footerSEOInfo}</span>
        </div>
      </div>

      {/* Lower Footer: copyright and scroll top */}
      <div className="bg-slate-950 py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 text-center sm:text-left rtl:sm:text-right font-medium">
            <span>© {new Date().getFullYear()} - </span>
            <span className="text-slate-400 font-bold">{t.footerLeader}</span>
            <span>. {t.footerRights}</span>
          </div>

          <button
            onClick={handleScrollToTop}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-bold border border-slate-750"
            aria-label="Retour en haut"
          >
            <span>{currentLang === 'fr' ? "Retour en haut" : "العودة للأعلى"}</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>

    </footer>
  );
};
