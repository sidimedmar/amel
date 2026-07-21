/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { EditableProvider, useEditable } from './context/EditableContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Values } from './components/Values';
import { Campaigns } from './components/Campaigns';
import { Gallery } from './components/Gallery';
import { Timeline } from './components/Timeline';
import { FAQ } from './components/FAQ';
import { ContactForm } from './components/ContactForm';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';

function AppContent() {
  const { currentLang, setLang } = useEditable();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Sync RTL/LTR state dynamically with active language selection
  useEffect(() => {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [currentLang]);

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
      
      {/* Sticky Top-level Navigation */}
      <Navbar
        currentLang={currentLang}
        setLang={setLang}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Sections */}
      <main className="flex flex-col">
        <Hero />
        <Values />
        <Campaigns />
        <Gallery />
        <Timeline />
        <FAQ />
        <ContactForm />
      </main>

      {/* Footer Section */}
      <Footer />

      {/* Complete CMS Admin CRUD Controls overlay */}
      <AdminDashboard />

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

