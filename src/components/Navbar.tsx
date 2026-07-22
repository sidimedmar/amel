/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Sun, Moon, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { Logo } from './Logo';
import { Language } from '../types';
import { useEditable } from '../context/EditableContext';

interface NavbarProps {
  currentLang: Language;
  setLang: (lang: Language) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  setLang,
  isDarkMode,
  setIsDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { 
    t, 
    handleSecretLogoClick, 
    user, 
    currentManager, 
    setIsLoginModalOpen, 
    setLoginModalType,
    setIsAdminPanelOpen, 
    logout 
  } = useEditable();

  const isLoggedIn = user !== null || currentManager !== null;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: t.navHome, href: '#home' },
    { name: t.navValues, href: '#values' },
    { name: t.navCampaigns, href: '#campaigns' },
    { name: currentLang === 'fr' ? "Carte" : "الخريطة", href: '#map' },
    { name: t.navGallery, href: '#gallery' },
    { name: t.navTimeline, href: '#timeline' },
    { name: t.navFAQ, href: '#faq' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
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
    <nav
      id="main-navbar"
      className={`w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-slate-900/95 shadow-md backdrop-blur-md py-2.5 border-b border-slate-200/80 dark:border-slate-800'
          : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md py-3.5 border-b border-slate-200/50 dark:border-slate-800/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={(e) => {
              handleSecretLogoClick();
            }}
            className="flex items-center gap-2 cursor-pointer"
            id="nav-logo-link"
          >
            <Logo className="w-12 h-12" showText={true} />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 rtl:space-x-reverse">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Utility Buttons (Language, Dark Mode, CTA) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(currentLang === 'fr' ? 'ar' : 'fr')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              title="Switch Language"
              id="lang-switcher-desktop"
            >
              <Globe className="w-4 h-4 text-blue-600 dark:text-amber-400" />
              <span>{currentLang === 'fr' ? 'العربية' : 'Français'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
              aria-label="Toggle Theme"
              id="theme-toggler-desktop"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Manager/Admin Authorization Quick Access */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-slate-900 transition-all duration-200"
                  id="nav-dashboard-btn"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{currentLang === 'fr' ? "Tableau de Bord" : "لوحة التحكم"}</span>
                </button>
                <button
                  onClick={() => logout()}
                  className="p-2 rounded-full border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-all"
                  title={currentLang === 'fr' ? "Déconnexion" : "تسجيل الخروج"}
                  id="nav-logout-btn"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setLoginModalType('manager');
                  setIsLoginModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-amber-500 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-200"
                id="nav-login-btn"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-amber-500" />
                <span>{currentLang === 'fr' ? "Se connecter" : "تسجيل الدخول"}</span>
              </button>
            )}

            {/* Quick Contact CTA */}
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="bg-blue-700 hover:bg-blue-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-900 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
              id="cta-join-desktop"
            >
              {t.navContact}
            </a>
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex md:hidden items-center gap-2">
            {/* Quick Language Toggle on Mobile */}
            <button
              onClick={() => setLang(currentLang === 'fr' ? 'ar' : 'fr')}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              id="lang-switcher-mobile"
            >
              <Globe className="w-5 h-5 text-blue-600 dark:text-amber-400" />
            </button>

            {/* Theme Toggle Mobile */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              id="theme-toggler-mobile"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            {/* Burger toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Menu"
              id="mobile-menu-toggle"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden animate-fade-in bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="block px-4 py-3 rounded-xl text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                {item.name}
              </a>
            ))}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsAdminPanelOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 w-full bg-emerald-600/10 dark:bg-emerald-500/15 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-slate-900 text-emerald-750 dark:text-emerald-400 border border-emerald-500/20 px-6 py-3 rounded-xl font-bold transition-all text-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{currentLang === 'fr' ? "Tableau de Bord" : "لوحة التحكم"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-center gap-2 w-full bg-rose-600/10 dark:bg-rose-500/15 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white px-6 py-3 rounded-xl font-bold transition-all border border-rose-500/20 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{currentLang === 'fr' ? "Se déconnecter" : "تسجيل الخروج"}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setLoginModalType('manager');
                    setIsLoginModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-blue-700 dark:text-amber-400 px-6 py-3 rounded-xl font-bold transition-all border border-slate-200 dark:border-slate-700 text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{currentLang === 'fr' ? "Se connecter" : "تسجيل الدخول"}</span>
                </button>
              )}

              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, '#contact')}
                className="block text-center w-full bg-blue-700 hover:bg-blue-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-900 px-6 py-3 rounded-xl font-bold shadow-md transition-all text-sm"
              >
                {t.navContact}
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
