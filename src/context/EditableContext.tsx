/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationDict, ValueCard, CampaignItem, GalleryItem, TimelineEvent, FAQItem } from '../types';
import { TRANSLATIONS, IMAGES, VALUE_CARDS, CAMPAIGNS_DATA, GALLERY_ITEMS, TIMELINE_EVENTS, FAQ_DATA } from '../data';
import { auth, onAuthStateChanged, User, signOut } from '../lib/firebase-client.ts';

// Define MRU Budget Item interface for Mauritania budget tracking
export interface BudgetRecord {
  id: string;
  campaignId: string;
  title: { fr: string; ar: string };
  allocatedMru: number;
  spentMru: number;
}

interface EditableContextType {
  currentLang: Language;
  setLang: (lang: Language) => void;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  t: TranslationDict;
  user: User | null;
  logout: () => Promise<void>;
  
  // Custom states
  translations: Record<'fr' | 'ar', TranslationDict>;
  images: typeof IMAGES;
  valueCards: ValueCard[];
  campaignsData: CampaignItem[];
  galleryItems: GalleryItem[];
  timelineEvents: TimelineEvent[];
  faqData: FAQItem[];
  budgetRecords: BudgetRecord[];

  // CRUD functions for translations & main sections
  updateTranslation: (lang: Language, key: keyof TranslationDict, value: string) => Promise<void>;
  updateImage: (key: keyof typeof IMAGES, base64: string) => Promise<void>;
  resetAll: () => Promise<void>;

  // CRUD for Value Cards
  addValueCard: (item: Omit<ValueCard, 'id'>) => Promise<void>;
  updateValueCard: (id: string, item: ValueCard) => Promise<void>;
  deleteValueCard: (id: string) => Promise<void>;

  // CRUD for Campaigns
  addCampaign: (item: Omit<CampaignItem, 'id'>) => Promise<void>;
  updateCampaign: (id: string, item: CampaignItem) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;

  // CRUD for Gallery
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => Promise<void>;
  updateGalleryItem: (id: string, item: GalleryItem) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;

  // CRUD for Timeline
  addTimelineEvent: (item: Omit<TimelineEvent, 'id'>) => Promise<void>;
  updateTimelineEvent: (id: string, item: TimelineEvent) => Promise<void>;
  deleteTimelineEvent: (id: string) => Promise<void>;

  // CRUD for FAQ
  addFAQItem: (item: Omit<FAQItem, 'id'>) => Promise<void>;
  updateFAQItem: (id: string, item: FAQItem) => Promise<void>;
  deleteFAQItem: (id: string) => Promise<void>;

  // CRUD for Budget
  addBudgetRecord: (item: Omit<BudgetRecord, 'id'>) => Promise<void>;
  updateBudgetRecord: (id: string, item: BudgetRecord) => Promise<void>;
  deleteBudgetRecord: (id: string) => Promise<void>;
}

const EditableContext = createContext<EditableContextType | undefined>(undefined);

export const EditableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('hassi_lang') as Language) || 'ar';
  });
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Base database states (initially with default fallback data)
  const [translations, setTranslations] = useState<Record<'fr' | 'ar', TranslationDict>>(TRANSLATIONS);
  const [images, setImages] = useState<typeof IMAGES>(IMAGES);
  const [valueCards, setValueCards] = useState<ValueCard[]>(VALUE_CARDS);
  const [campaignsData, setCampaignsData] = useState<CampaignItem[]>(CAMPAIGNS_DATA);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(GALLERY_ITEMS);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(TIMELINE_EVENTS);
  const [faqData, setFaqData] = useState<FAQItem[]>(FAQ_DATA);
  
  const DEFAULT_BUDGET_RECORDS: BudgetRecord[] = [
    {
      id: "bud_1",
      campaignId: "camp_water_relief",
      title: { fr: "Carburant, logistique et location de citernes (Kiffa)", ar: "الوقود واللوجستيات وتأجير صهاريج المياه (بلدية كيفه)" },
      allocatedMru: 450000,
      spentMru: 450000
    },
    {
      id: "bud_2",
      campaignId: "camp_water_relief",
      title: { fr: "Achat d'eau pure aux stations de pompage", ar: "شراء المياه النقية من محطات الضخ المركزية" },
      allocatedMru: 120000,
      spentMru: 120000
    },
    {
      id: "bud_3",
      campaignId: "camp_political_rally",
      title: { fr: "Tentes traditionnelles mauritaniennes & sonorisation", ar: "تأجير الخيام الموريتانية التقليدية وتجهيز الصوتيات" },
      allocatedMru: 85000,
      spentMru: 82000
    },
    {
      id: "bud_4",
      campaignId: "camp_youth_mentorship",
      title: { fr: "Supports scolaires, cahiers, stylos pour les élèves", ar: "الأدوات المدرسية والكتب والدفاتر للتلاميذ" },
      allocatedMru: 50000,
      spentMru: 48000
    }
  ];
  const [budgetRecords, setBudgetRecords] = useState<BudgetRecord[]>(DEFAULT_BUDGET_RECORDS);

  // Sync lang preference locally
  useEffect(() => {
    localStorage.setItem('hassi_lang', currentLang);
  }, [currentLang]);

  // Auth Listener
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setIsAdminMode(false);
      }
    });
  }, []);

  // Fetch all site data from Express + Cloud SQL on mount
  useEffect(() => {
    const loadSiteData = async () => {
      try {
        const res = await fetch('/api/site-data');
        if (res.ok) {
          const data = await res.json();
          if (data.translations) setTranslations(data.translations);
          if (data.images) setImages(data.images);
          if (data.valueCards) setValueCards(data.valueCards);
          if (data.campaignsData) setCampaignsData(data.campaignsData);
          if (data.galleryItems) setGalleryItems(data.galleryItems);
          if (data.timelineEvents) setTimelineEvents(data.timelineEvents);
          if (data.faqData) setFaqData(data.faqData);
          if (data.budgetRecords) setBudgetRecords(data.budgetRecords);
        }
      } catch (err) {
        console.error('Error loading site data from database:', err);
      }
    };
    loadSiteData();
  }, []);

  // Helper to get Firebase authorization header
  const getAuthHeaders = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return {};
    const token = await currentUser.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const logout = async () => {
    await signOut(auth);
    setIsAdminMode(false);
  };

  // Sync state functions
  const updateTranslation = async (lang: Language, key: keyof TranslationDict, value: string) => {
    const updated = {
      ...translations,
      [lang]: {
        ...translations[lang],
        [key]: value
      }
    };
    setTranslations(updated);

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/translations', {
        method: 'POST',
        headers,
        body: JSON.stringify({ lang, key, value })
      });
    } catch (err) {
      console.error('Error saving translation to DB:', err);
    }
  };

  const updateImage = async (key: keyof typeof IMAGES, base64: string) => {
    const updated = {
      ...images,
      [key]: base64
    };
    setImages(updated);

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/images', {
        method: 'POST',
        headers,
        body: JSON.stringify({ key, src: base64 })
      });
    } catch (err) {
      console.error('Error saving image to DB:', err);
    }
  };

  const resetAll = async () => {
    if (window.confirm(currentLang === 'fr' ? 'Réinitialiser toutes les modifications aux valeurs d\'origine ?' : 'هل تريد استعادة جميع البيانات الأصلية وحذف تعديلاتك؟')) {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/reset', {
          method: 'POST',
          headers
        });
        if (res.ok) {
          window.location.reload();
        }
      } catch (err) {
        console.error('Error resetting DB content:', err);
      }
    }
  };

  // CRUD Value Cards
  const addValueCard = async (item: Omit<ValueCard, 'id'>) => {
    const id = `value_${Date.now()}`;
    const newItem = { ...item, id };
    setValueCards([...valueCards, newItem]);

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/value-cards', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id,
          titleFr: item.title.fr,
          titleAr: item.title.ar,
          descFr: item.desc.fr,
          descAr: item.desc.ar,
          icon: item.icon
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const updateValueCard = async (id: string, item: ValueCard) => {
    setValueCards(valueCards.map(c => c.id === id ? item : c));

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/value-cards', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id,
          titleFr: item.title.fr,
          titleAr: item.title.ar,
          descFr: item.desc.fr,
          descAr: item.desc.ar,
          icon: item.icon
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteValueCard = async (id: string) => {
    setValueCards(valueCards.filter(c => c.id !== id));

    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/value-cards/${id}`, {
        method: 'DELETE',
        headers
      });
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Campaigns
  const addCampaign = async (item: Omit<CampaignItem, 'id'>) => {
    const id = `camp_${Date.now()}`;
    const newItem = { ...item, id };
    setCampaignsData([newItem, ...campaignsData]);

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/campaigns', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id,
          titleFr: item.title.fr,
          titleAr: item.title.ar,
          descFr: item.description.fr,
          descAr: item.description.ar,
          targetMru: 500000,
          collectedMru: 350000,
          category: item.category,
          image: item.image
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const updateCampaign = async (id: string, item: CampaignItem) => {
    setCampaignsData(campaignsData.map(c => c.id === id ? item : c));

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/campaigns', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id,
          titleFr: item.title.fr,
          titleAr: item.title.ar,
          descFr: item.description.fr,
          descAr: item.description.ar,
          targetMru: 500000,
          collectedMru: 350000,
          category: item.category,
          image: item.image
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCampaign = async (id: string) => {
    setCampaignsData(campaignsData.filter(c => c.id !== id));

    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
        headers
      });
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Gallery
  const addGalleryItem = async (item: Omit<GalleryItem, 'id'>) => {
    const id = `gallery_${Date.now()}`;
    const newItem = { ...item, id };
    setGalleryItems([newItem, ...galleryItems]);

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/gallery-items', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id,
          src: item.src,
          category: item.category,
          titleFr: item.title.fr,
          titleAr: item.title.ar,
          descFr: item.description?.fr || '',
          descAr: item.description?.ar || '',
          rotation: item.rotation || 0
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const updateGalleryItem = async (id: string, item: GalleryItem) => {
    setGalleryItems(galleryItems.map(c => c.id === id ? item : c));

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/gallery-items', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id,
          src: item.src,
          category: item.category,
          titleFr: item.title.fr,
          titleAr: item.title.ar,
          descFr: item.description?.fr || '',
          descAr: item.description?.ar || '',
          rotation: item.rotation || 0
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteGalleryItem = async (id: string) => {
    setGalleryItems(galleryItems.filter(c => c.id !== id));

    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/gallery-items/${id}`, {
        method: 'DELETE',
        headers
      });
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Timeline
  const addTimelineEvent = async (item: Omit<TimelineEvent, 'id'>) => {
    const id = `time_${Date.now()}`;
    const newItem = { ...item, id };
    setTimelineEvents([...timelineEvents, newItem]);

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/timeline-events', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id,
          year: item.date.fr,
          titleFr: item.title.fr,
          titleAr: item.title.ar,
          descFr: item.description.fr,
          descAr: item.description.ar
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const updateTimelineEvent = async (id: string, item: TimelineEvent) => {
    setTimelineEvents(timelineEvents.map(c => c.id === id ? item : c));

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/timeline-events', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id,
          year: item.date.fr,
          titleFr: item.title.fr,
          titleAr: item.title.ar,
          descFr: item.description.fr,
          descAr: item.description.ar
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTimelineEvent = async (id: string) => {
    setTimelineEvents(timelineEvents.filter(c => c.id !== id));

    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/timeline-events/${id}`, {
        method: 'DELETE',
        headers
      });
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD FAQ
  const addFAQItem = async (item: Omit<FAQItem, 'id'>) => {
    const id = `faq_${Date.now()}`;
    const newItem = { ...item, id };
    setFaqData([...faqData, newItem]);

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/faq-items', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id,
          questionFr: item.question.fr,
          questionAr: item.question.ar,
          answerFr: item.answer.fr,
          answerAr: item.answer.ar
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const updateFAQItem = async (id: string, item: FAQItem) => {
    setFaqData(faqData.map(c => c.id === id ? item : c));

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/faq-items', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id,
          questionFr: item.question.fr,
          questionAr: item.question.ar,
          answerFr: item.answer.fr,
          answerAr: item.answer.ar
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFAQItem = async (id: string) => {
    setFaqData(faqData.filter(c => c.id !== id));

    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/faq-items/${id}`, {
        method: 'DELETE',
        headers
      });
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Budget
  const addBudgetRecord = async (item: Omit<BudgetRecord, 'id'>) => {
    const id = `bud_${Date.now()}`;
    const newItem = { ...item, id };
    setBudgetRecords([...budgetRecords, newItem]);

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/budget-records', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id,
          campaignId: item.campaignId,
          titleFr: item.title.fr,
          titleAr: item.title.ar,
          allocatedMru: item.allocatedMru,
          spentMru: item.spentMru
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const updateBudgetRecord = async (id: string, item: BudgetRecord) => {
    setBudgetRecords(budgetRecords.map(c => c.id === id ? item : c));

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/budget-records', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id,
          campaignId: item.campaignId,
          titleFr: item.title.fr,
          titleAr: item.title.ar,
          allocatedMru: item.allocatedMru,
          spentMru: item.spentMru
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBudgetRecord = async (id: string) => {
    setBudgetRecords(budgetRecords.filter(c => c.id !== id));

    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/budget-records/${id}`, {
        method: 'DELETE',
        headers
      });
    } catch (err) {
      console.error(err);
    }
  };

  const t = translations[currentLang];

  return (
    <EditableContext.Provider value={{
      currentLang,
      setLang,
      isAdminMode,
      setIsAdminMode,
      translations,
      t,
      images,
      valueCards,
      campaignsData,
      galleryItems,
      timelineEvents,
      faqData,
      budgetRecords,
      user,
      logout,

      updateTranslation,
      updateImage,
      resetAll,

      addValueCard,
      updateValueCard,
      deleteValueCard,

      addCampaign,
      updateCampaign,
      deleteCampaign,

      addGalleryItem,
      updateGalleryItem,
      deleteGalleryItem,

      addTimelineEvent,
      updateTimelineEvent,
      deleteTimelineEvent,

      addFAQItem,
      updateFAQItem,
      deleteFAQItem,

      addBudgetRecord,
      updateBudgetRecord,
      deleteBudgetRecord
    }}>
      {children}
    </EditableContext.Provider>
  );
};

export const useEditable = () => {
  const context = useContext(EditableContext);
  if (!context) {
    throw new Error('useEditable must be used within an EditableProvider');
  }
  return context;
};
