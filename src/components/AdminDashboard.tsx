/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useEditable, BudgetRecord } from '../context/EditableContext';
import { TranslationDict } from '../types';
import { 
  Settings, Lock, Unlock, RefreshCw, X, Save, Plus, Trash2, 
  RotateCw, Edit2, Check, Coins, FileText, Image as ImageIcon, Sliders, ChevronDown 
} from 'lucide-react';
import { signInWithPopup, googleProvider, auth } from '../lib/firebase-client.ts';

export const AdminDashboard: React.FC = () => {
  const {
    currentLang,
    isAdminMode,
    setIsAdminMode,
    translations,
    images,
    budgetRecords,
    updateTranslation,
    updateImage,
    resetAll,
    addBudgetRecord,
    updateBudgetRecord,
    deleteBudgetRecord,
    user,
    logout
  } = useEditable();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'nav_hero' | 'sections' | 'footer_seo' | 'images' | 'budget_mru'>('nav_hero');
  const [imageUploadProgress, setImageUploadProgress] = useState<string | null>(null);

  const handleToggleAdminMode = async () => {
    if (isAdminMode) {
      setIsAdminMode(false);
    } else {
      if (!user) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          if (result.user) {
            setIsAdminMode(true);
            setIsOpen(true);
          }
        } catch (error: any) {
          console.error("Authentication failed:", error);
          // If the user closed or cancelled the popup, do not show an aggressive error dialog.
          if (error && (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request')) {
            return;
          }
          alert(currentLang === 'fr' ? 'La connexion a échoué. Veuillez réessayer.' : 'فشلت عملية تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        }
      } else {
        setIsAdminMode(true);
        setIsOpen(true);
      }
    }
  };

  // Budget states
  const [newBudgetCampaignId, setNewBudgetCampaignId] = useState('camp_water_relief');
  const [newBudgetTitleFr, setNewBudgetTitleFr] = useState('');
  const [newBudgetTitleAr, setNewBudgetTitleAr] = useState('');
  const [newBudgetAllocated, setNewBudgetAllocated] = useState('');
  const [newBudgetSpent, setNewBudgetSpent] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  // Resize helper for uploaded assets
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => reject(new Error('Failed to parse image'));
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAssetUpload = async (key: keyof typeof images, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(currentLang === 'fr' ? 'Sélectionnez une image valide' : 'يرجى تحديد صورة صالحة');
      return;
    }
    try {
      setImageUploadProgress(key);
      const optimized = await compressImage(file);
      updateImage(key, optimized);
    } catch {
      alert('Error compressing image');
    } finally {
      setImageUploadProgress(null);
    }
  };

  const handleRotateStaticImage = async (key: keyof typeof images) => {
    const currentSrc = images[key];
    if (!currentSrc) return;
    try {
      setImageUploadProgress(key);
      const img = new Image();
      img.src = currentSrc;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.height;
        canvas.height = img.width;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((90 * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          updateImage(key, canvas.toDataURL('image/jpeg', 0.85));
          setImageUploadProgress(null);
        }
      };
    } catch {
      setImageUploadProgress(null);
    }
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allocatedNum = parseFloat(newBudgetAllocated) || 0;
    const spentNum = parseFloat(newBudgetSpent) || 0;
    const titleFr = newBudgetTitleFr.trim() || 'Dépense';
    const titleAr = newBudgetTitleAr.trim() || 'مصروفات';

    if (editingBudgetId) {
      const existing = budgetRecords.find(b => b.id === editingBudgetId);
      if (existing) {
        updateBudgetRecord(editingBudgetId, {
          id: editingBudgetId,
          campaignId: newBudgetCampaignId,
          title: { fr: titleFr, ar: titleAr },
          allocatedMru: allocatedNum,
          spentMru: spentNum
        });
      }
      setEditingBudgetId(null);
    } else {
      addBudgetRecord({
        campaignId: newBudgetCampaignId,
        title: { fr: titleFr, ar: titleAr },
        allocatedMru: allocatedNum,
        spentMru: spentNum
      });
    }

    // Reset budget form
    setNewBudgetTitleFr('');
    setNewBudgetTitleAr('');
    setNewBudgetAllocated('');
    setNewBudgetSpent('');
  };

  const startEditBudget = (item: BudgetRecord) => {
    setEditingBudgetId(item.id);
    setNewBudgetCampaignId(item.campaignId);
    setNewBudgetTitleFr(item.title.fr);
    setNewBudgetTitleAr(item.title.ar);
    setNewBudgetAllocated(String(item.allocatedMru));
    setNewBudgetSpent(String(item.spentMru));
  };

  // Quick stats calculations in MRU
  const totalAllocatedMru = budgetRecords.reduce((sum, item) => sum + item.allocatedMru, 0);
  const totalSpentMru = budgetRecords.reduce((sum, item) => sum + item.spentMru, 0);

  // Group of key fields with labels for high-quality bilingual CRUD form
  const translationFields: { 
    tab: 'nav_hero' | 'sections' | 'footer_seo'; 
    key: keyof TranslationDict; 
    labelFr: string; 
    labelAr: string; 
    isTextArea?: boolean;
  }[] = [
    // Tab: Navigation & Hero
    { tab: 'nav_hero', key: 'navHome', labelFr: "Lien Navigation: Accueil", labelAr: "رابط التنقل: الرئيسية" },
    { tab: 'nav_hero', key: 'navValues', labelFr: "Lien Navigation: Piliers", labelAr: "رابط التنقل: المرتكزات" },
    { tab: 'nav_hero', key: 'navCampaigns', labelFr: "Lien Navigation: Actions", labelAr: "رابط التنقل: الأنشطة" },
    { tab: 'nav_hero', key: 'navGallery', labelFr: "Lien Navigation: Galerie", labelAr: "رابط التنقل: المعرض" },
    { tab: 'nav_hero', key: 'navTimeline', labelFr: "Lien Navigation: Histoire", labelAr: "رابط التنقل: المسيرة" },
    { tab: 'nav_hero', key: 'navFAQ', labelFr: "Lien Navigation: FAQ", labelAr: "رابط التنقل: الأسئلة الشائعة" },
    { tab: 'nav_hero', key: 'navContact', labelFr: "Lien Navigation: Nous Rejoindre / Contact", labelAr: "رابط التنقل: انضم إلينا" },
    
    { tab: 'nav_hero', key: 'heroBadge', labelFr: "Bandeau Supérieur Hero", labelAr: "العنوان الترويجي الصغير" },
    { tab: 'nav_hero', key: 'heroTitle', labelFr: "Titre Principal de l'Initiative (Hero)", labelAr: "العنوان الرئيسي (أمل حاسي البكاي)" },
    { tab: 'nav_hero', key: 'heroSubtitle', labelFr: "Sous-titre d'accroche (Hero)", labelAr: "الوصف الفرعي لـ Hero", isTextArea: true },
    { tab: 'nav_hero', key: 'heroCTA', labelFr: "Bouton CTA Principal", labelAr: "زر الدعوة الرئيسي" },
    { tab: 'nav_hero', key: 'heroSecondaryCTA', labelFr: "Bouton CTA Secondaire", labelAr: "زر الدعوة الثانوي" },

    // Tab: Section Titles & Texts
    { tab: 'sections', key: 'valuesTitle', labelFr: "Titre Section Piliers", labelAr: "عنوان قسم المرتكزات" },
    { tab: 'sections', key: 'valuesSubtitle', labelFr: "Sous-titre Section Piliers", labelAr: "الوصف الفرعي لقسم المرتكزات" },
    { tab: 'sections', key: 'campaignsTitle', labelFr: "Titre Section Actions", labelAr: "عنوان قسم الحملات" },
    { tab: 'sections', key: 'campaignsSubtitle', labelFr: "Sous-titre Section Actions", labelAr: "الوصف الفرعي لقسم الحملات" },
    { tab: 'sections', key: 'galleryTitle', labelFr: "Titre Section Galerie", labelAr: "عنوان قسم المعرض" },
    { tab: 'sections', key: 'gallerySubtitle', labelFr: "Sous-titre Section Galerie", labelAr: "الوصف الفرعي لقسم المعرض", isTextArea: true },
    { tab: 'sections', key: 'timelineTitle', labelFr: "Titre Section Chronologie", labelAr: "عنوان قسم المسيرة" },
    { tab: 'sections', key: 'timelineSubtitle', labelFr: "Sous-titre Section Chronologie", labelAr: "الوصف الفرعي لقسم المسيرة" },
    { tab: 'sections', key: 'faqTitle', labelFr: "Titre Section FAQ", labelAr: "عنوان قسم الأسئلة الشائعة" },
    { tab: 'sections', key: 'faqSubtitle', labelFr: "Sous-titre Section FAQ", labelAr: "الوصف الفرعي لقسم الأسئلة الشائعة" },
    { tab: 'sections', key: 'contactTitle', labelFr: "Titre Formulaire Adhésion", labelAr: "عنوان استمارة الانتساب" },
    { tab: 'sections', key: 'contactSubtitle', labelFr: "Sous-titre Formulaire Adhésion", labelAr: "الوصف الفرعي لاستمارة الانتساب", isTextArea: true },

    // Tab: Footer & SEO Settings
    { tab: 'footer_seo', key: 'footerLeader', labelFr: "Directeur / Leader Officiel", labelAr: "قائد الحراك الرسمي" },
    { tab: 'footer_seo', key: 'footerText', labelFr: "Texte de présentation (Footer)", labelAr: "نبذة التعريف في أسفل الموقع", isTextArea: true },
    { tab: 'footer_seo', key: 'footerRights', labelFr: "Mentions de droits d'auteur", labelAr: "حقوق النشر والملكية" },
    { tab: 'footer_seo', key: 'footerSEOInfo', labelFr: "Mots-clés SEO (Indexation)", labelAr: "الكلمات الدلالية لمحركات البحث" },
    { tab: 'footer_seo', key: 'footerPhoneLabel', labelFr: "Label Téléphone/WhatsApp", labelAr: "عنوان الهاتف/الواتساب" },
    { tab: 'footer_seo', key: 'footerPhoneVal', labelFr: "Numéro de Téléphone/WhatsApp", labelAr: "رقم الهاتف/الواتساب" },
    { tab: 'footer_seo', key: 'footerEmailLabel', labelFr: "Label E-mail", labelAr: "عنوان البريد الإلكتروني" },
    { tab: 'footer_seo', key: 'footerEmailVal', labelFr: "Adresse E-mail", labelAr: "عنوان البريد الإلكتروني (القيمة)" },
    { tab: 'footer_seo', key: 'footerAddressLabel', labelFr: "Label Adresse", labelAr: "عنوان المقر" },
    { tab: 'footer_seo', key: 'footerAddressVal', labelFr: "Adresse Physique", labelAr: "عنوان المقر الرئيسي (القيمة)" },
    { tab: 'footer_seo', key: 'footerShortcutsHeading', labelFr: "Titre Raccourcis", labelAr: "عنوان الروابط السريعة" },
    { tab: 'footer_seo', key: 'footerContactHeading', labelFr: "Titre Contacts", labelAr: "عنوان معلومات الاتصال" },
  ];

  return (
    <>
      {/* Floating Toggle Activator */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <button
          onClick={handleToggleAdminMode}
          className={`flex items-center gap-2 px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            isAdminMode 
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-900 dark:bg-slate-800 text-amber-500 hover:bg-slate-850'
          }`}
          title="Mode Édition du Contenu"
        >
          {isAdminMode ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          <span className="text-xs font-bold tracking-wider uppercase">
            {currentLang === 'fr' 
              ? (isAdminMode ? "Éditeur Actif" : "Éditer le site") 
              : (isAdminMode ? "وضع التعديل مفعل" : "تعديل محتوى الموقع")
            }
          </span>
        </button>

        {isAdminMode && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center bg-amber-500 text-slate-950 w-12 h-12 rounded-full shadow-2xl transition-all hover:scale-110"
            title="Ouvrir le panneau de contrôle complet"
          >
            <Settings className="w-6 h-6 animate-spin-slow" />
          </button>
        )}
      </div>

      {/* Admin Panel Modal Overlay */}
      {isOpen && isAdminMode && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative animate-scale-up">
            
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <Settings className="w-6 h-6 text-amber-500 animate-spin-slow" />
                <div>
                  <h2 className="text-lg font-bold font-display tracking-tight text-white flex items-center gap-2">
                    <span>Panneau d'Administration de Hassi El Bekay</span>
                    <span className="text-xs bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full font-black">CMS CRUD</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modifiez à la volée tous les textes, photos, titres des onglets et le budget mauritanien (MRU)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={logout}
                  className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  title="Déconnexion"
                >
                  <span>{currentLang === 'fr' ? 'Déconnexion' : 'تسجيل الخروج'}</span>
                </button>
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1 bg-rose-600/20 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  title="Réinitialiser"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Réinitialiser tout</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-2 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Workspace Layout */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Tab Selector Sidebar */}
              <div className="w-48 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-850 p-4 flex flex-col gap-1 overflow-y-auto shrink-0">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2.5 px-2">Rubriques</p>
                {[
                  { id: 'nav_hero', label: "Navbar & Hero", icon: Sliders },
                  { id: 'sections', label: "Titres Sections", icon: FileText },
                  { id: 'footer_seo', label: "Footer & SEO", icon: ChevronDown },
                  { id: 'images', label: "Photos Statiques", icon: ImageIcon },
                  { id: 'budget_mru', label: "Budget (MRU)", icon: Coins }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2.5 w-full text-left px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-700 dark:bg-amber-500 text-white dark:text-slate-950 shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Editing Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900 text-left">
                
                {/* 1. Nav & Hero Tab */}
                {activeTab === 'nav_hero' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-wider text-blue-700 dark:text-amber-500 border-b pb-2">
                      Liens de l'En-tête et Titres des Onglets
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      {translationFields
                        .filter(f => f.tab === 'nav_hero')
                        .map((field) => (
                          <div key={field.key} className="bg-slate-50 dark:bg-slate-950/40 p-4 border rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase">{field.labelFr}</label>
                              {field.isTextArea ? (
                                <textarea
                                  value={translations.fr[field.key]}
                                  onChange={(e) => updateTranslation('fr', field.key, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                  rows={2}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={translations.fr[field.key]}
                                  onChange={(e) => updateTranslation('fr', field.key, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                />
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase text-right">{field.labelAr}</label>
                              {field.isTextArea ? (
                                <textarea
                                  value={translations.ar[field.key]}
                                  onChange={(e) => updateTranslation('ar', field.key, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                                  dir="rtl"
                                  rows={2}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={translations.ar[field.key]}
                                  onChange={(e) => updateTranslation('ar', field.key, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                                  dir="rtl"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 2. Sections Tab */}
                {activeTab === 'sections' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-wider text-blue-700 dark:text-amber-500 border-b pb-2">
                      Titres et Accroches des Sections du Site
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      {translationFields
                        .filter(f => f.tab === 'sections')
                        .map((field) => (
                          <div key={field.key} className="bg-slate-50 dark:bg-slate-950/40 p-4 border rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase">{field.labelFr}</label>
                              {field.isTextArea ? (
                                <textarea
                                  value={translations.fr[field.key]}
                                  onChange={(e) => updateTranslation('fr', field.key, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                  rows={2}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={translations.fr[field.key]}
                                  onChange={(e) => updateTranslation('fr', field.key, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                />
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase text-right">{field.labelAr}</label>
                              {field.isTextArea ? (
                                <textarea
                                  value={translations.ar[field.key]}
                                  onChange={(e) => updateTranslation('ar', field.key, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                                  dir="rtl"
                                  rows={2}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={translations.ar[field.key]}
                                  onChange={(e) => updateTranslation('ar', field.key, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                                  dir="rtl"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 3. Footer & SEO Tab */}
                {activeTab === 'footer_seo' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-wider text-blue-700 dark:text-amber-500 border-b pb-2">
                      Textes du Pied de Page (Footer) et Mots-clés de Référencement (SEO)
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      {translationFields
                        .filter(f => f.tab === 'footer_seo')
                        .map((field) => (
                          <div key={field.key} className="bg-slate-50 dark:bg-slate-950/40 p-4 border rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase">{field.labelFr}</label>
                              {field.isTextArea ? (
                                <textarea
                                  value={translations.fr[field.key]}
                                  onChange={(e) => updateTranslation('fr', field.key, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                  rows={3}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={translations.fr[field.key]}
                                  onChange={(e) => updateTranslation('fr', field.key, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                />
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase text-right">{field.labelAr}</label>
                              {field.isTextArea ? (
                                <textarea
                                  value={translations.ar[field.key]}
                                  onChange={(e) => updateTranslation('ar', field.key, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                                  dir="rtl"
                                  rows={3}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={translations.ar[field.key]}
                                  onChange={(e) => updateTranslation('ar', field.key, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-950 border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                                  dir="rtl"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 4. Images Tab */}
                {activeTab === 'images' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-wider text-blue-700 dark:text-amber-500 border-b pb-2">
                      Remplacer les Photos et Images Statiques par défaut
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { key: 'hero', title: "Image d'arrière-plan Hero" },
                        { key: 'water', title: "Image de la Campagne d'Eau" },
                        { key: 'political', title: "Image de la Campagne Politique" },
                        { key: 'community', title: "Image de la Caravane Culturelle" },
                        { key: 'youth', title: "Image Jeunesse" },
                        { key: 'well', title: "Image du Forage et Désert" }
                      ].map((imgAsset) => {
                        const imgKey = imgAsset.key as keyof typeof images;
                        const isUploading = imageUploadProgress === imgKey;
                        return (
                          <div key={imgKey} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{imgAsset.title}</span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleRotateStaticImage(imgKey)}
                                  className="bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-slate-950 p-1.5 rounded-lg text-xs font-bold transition-all"
                                  title="Faire pivoter la photo de 90°"
                                >
                                  <RotateCw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900 border">
                              {isUploading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-white">
                                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                  <span className="text-xs">Optimisation...</span>
                                </div>
                              ) : (
                                <img
                                  src={images[imgKey]}
                                  alt={imgAsset.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                            </div>
                            <div>
                              <label className="cursor-pointer block text-center w-full bg-blue-700 hover:bg-blue-800 text-white dark:bg-slate-900 dark:hover:bg-slate-800 py-2 rounded-xl text-xs font-bold transition-colors">
                                <span>Importer une autre photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleAssetUpload(imgKey, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Budget MRU Tab */}
                {activeTab === 'budget_mru' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-blue-700 dark:text-amber-500">
                          Suivi Budgétaire en Ouguiya Mauritanien (MRU)
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Consignez, éditez et supprimez les dépenses réelles et les dotations pour chaque action à Kiffa
                        </p>
                      </div>
                      
                      {/* MRU Stats */}
                      <div className="flex gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Alloué</p>
                          <p className="text-sm sm:text-base font-black text-emerald-600">{totalAllocatedMru.toLocaleString()} MRU</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Dépensé</p>
                          <p className="text-sm sm:text-base font-black text-amber-500">{totalSpentMru.toLocaleString()} MRU</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl">
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-600 dark:text-slate-400">Progression globale de l'utilisation du budget</span>
                        <span className="text-blue-600">
                          {totalAllocatedMru > 0 ? Math.round((totalSpentMru / totalAllocatedMru) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, totalAllocatedMru > 0 ? (totalSpentMru / totalAllocatedMru) * 100 : 0)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Budget Record Form */}
                    <form onSubmit={handleBudgetSubmit} className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-amber-500" />
                        <span>{editingBudgetId ? "Modifier la ligne budgétaire" : "Ajouter une nouvelle ligne budgétaire"}</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Action Concernée</label>
                          <select
                            value={newBudgetCampaignId}
                            onChange={(e) => setNewBudgetCampaignId(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          >
                            <option value="camp_water_relief">Campagne d'Eau Potable</option>
                            <option value="camp_political_rally">Coopération Politique</option>
                            <option value="camp_youth_mentorship">Caravane Culturelle & Scolaire</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Montant Alloué (MRU)</label>
                          <input
                            type="number"
                            placeholder="Ex: 150000"
                            value={newBudgetAllocated}
                            onChange={(e) => setNewBudgetAllocated(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Montant Dépensé (MRU)</label>
                          <input
                            type="number"
                            placeholder="Ex: 120000"
                            value={newBudgetSpent}
                            onChange={(e) => setNewBudgetSpent(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description (Français)</label>
                          <input
                            type="text"
                            placeholder="Ex: Achat d'équipements..."
                            value={newBudgetTitleFr}
                            onChange={(e) => setNewBudgetTitleFr(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-right">الوصف (العربية)</label>
                          <input
                            type="text"
                            placeholder="مثال: شراء المعدات واللوازم..."
                            value={newBudgetTitleAr}
                            onChange={(e) => setNewBudgetTitleAr(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                            dir="rtl"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        {editingBudgetId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBudgetId(null);
                              setNewBudgetTitleFr('');
                              setNewBudgetTitleAr('');
                              setNewBudgetAllocated('');
                              setNewBudgetSpent('');
                            }}
                            className="px-3.5 py-1.5 border rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200"
                          >
                            Annuler
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-blue-700 dark:bg-amber-500 text-white dark:text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{editingBudgetId ? "Sauvegarder les modifications" : "Enregistrer la ligne"}</span>
                        </button>
                      </div>
                    </form>

                    {/* Budget Records Table List */}
                    <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <th className="px-4 py-3 text-left font-black">Description (FR / AR)</th>
                            <th className="px-4 py-3 text-left font-black">Action</th>
                            <th className="px-4 py-3 text-right font-black">Alloué (MRU)</th>
                            <th className="px-4 py-3 text-right font-black">Dépensé (MRU)</th>
                            <th className="px-4 py-3 text-center font-black">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {budgetRecords.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                              <td className="px-4 py-3 font-medium">
                                <div className="text-slate-800 dark:text-slate-200">{item.title.fr}</div>
                                <div className="text-slate-400 text-[10px] mt-0.5" dir="rtl">{item.title.ar}</div>
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-500">
                                {item.campaignId === 'camp_water_relief' && "Campagne d'Eau"}
                                {item.campaignId === 'camp_political_rally' && "Alliances Politiques"}
                                {item.campaignId === 'camp_youth_mentorship' && "Soutien Scolaire"}
                              </td>
                              <td className="px-4 py-3 text-right font-black text-emerald-600 whitespace-nowrap">
                                {item.allocatedMru.toLocaleString()} MRU
                              </td>
                              <td className="px-4 py-3 text-right font-black text-amber-500 whitespace-nowrap">
                                {item.spentMru.toLocaleString()} MRU
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => startEditBudget(item)}
                                    className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-amber-500"
                                    title="Modifier"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm('Supprimer cette ligne ?')) deleteBudgetRecord(item.id);
                                    }}
                                    className="p-1 text-rose-500 hover:text-rose-700"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* Bottom Footer */}
            <div className="bg-slate-900 text-slate-400 border-t border-slate-800 px-6 py-4 flex items-center justify-between shrink-0 text-xs">
              <span>Mouvement d'Espoir Civique & Social Amel - Hassi El Bekay</span>
              <span>Devise active : <strong className="text-white">MRU (Ouguiya Mauritanien)</strong> 🇲🇷</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
