/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { EditableProvider, useEditable } from './context/EditableContext';
import { TickerBanner } from './components/TickerBanner';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Values } from './components/Values';
import { Campaigns } from './components/Campaigns';
import { InterventionMap } from './components/InterventionMap';
import { Gallery } from './components/Gallery';
import { Timeline } from './components/Timeline';
import { FAQ } from './components/FAQ';
import { ContactForm } from './components/ContactForm';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { SecurityShield } from './components/SecurityShield';

function AppContent() {
  const { currentLang, setLang, t } = useEditable();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Sync RTL/LTR state & Dynamic SEO Document Title dynamically with active language selection
  useEffect(() => {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;

    // Dynamic Title for SEO
    if (currentLang === 'ar') {
      document.title = `${t.heroTitle || 'حراك أمل حاسي البكاي'} | المبادرة الشعبية للتنمية بكيفه ونواكشوط والنعمة`;
    } else {
      document.title = `${t.heroTitle || 'Mouvement Amel Hassi El Bekay'} | Initiative Citoyenne à Kiffa, Nouakchott et Nema`;
    }
  }, [currentLang, t.heroTitle]);

  // Sync dark mode class with state
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 antialiased selection:bg-amber-500/35 pb-12">
      
      {/* Sticky Combined Header: Banner + Navigation bar */}
      <header className="sticky top-0 z-50 w-full shadow-sm bg-white dark:bg-slate-900">
        <TickerBanner />
        <Navbar
          currentLang={currentLang}
          setLang={setLang}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      </header>

      {/* Main Sections */}
      <main className="flex flex-col">
        <Hero />
        <Values />
        <Campaigns />
        <InterventionMap />
        <Gallery />
        <Timeline />
        <FAQ />
        <ContactForm />
      </main>

      {/* Footer Section */}
      <Footer />

      {/* Complete CMS Admin CRUD Controls overlay */}
      <AdminDashboard />

      {/* Embedded Client Security & Anti-Intrusion Shield */}
      <SecurityShield />

    </div>
  );
}


export default function App() {
  return (
    <EditableProvider>
      <AppContent />
    </EditableProvider>
  );
}

