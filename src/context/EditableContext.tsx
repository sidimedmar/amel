/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationDict, ValueCard, CampaignItem, GalleryItem, TimelineEvent, FAQItem, InterventionPoint, Adherent, Manager } from '../types';
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

export interface AnnouncementItem {
  id: string;
  text: { fr: string; ar: string };
  isUrgent?: boolean;
}

interface EditableContextType {
  currentLang: Language;
  setLang: (lang: Language) => void;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (val: boolean) => void;
  loginModalType: 'admin' | 'manager' | null;
  setLoginModalType: (val: 'admin' | 'manager' | null) => void;
  isAdminPanelOpen: boolean;
  setIsAdminPanelOpen: (val: boolean) => void;
  handleSecretLogoClick: () => void;
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
  announcements: AnnouncementItem[];
  interventionPoints: InterventionPoint[];

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

  // CRUD for Ticker Announcements
  addAnnouncement: (item: Omit<AnnouncementItem, 'id'>) => Promise<void>;
  updateAnnouncement: (id: string, item: AnnouncementItem) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;

  // CRUD for Intervention Points (Kiffa, Nouakchott, Nema, etc.)
  addInterventionPoint: (item: Omit<InterventionPoint, 'id'>) => Promise<void>;
  updateInterventionPoint: (id: string, item: InterventionPoint) => Promise<void>;
  deleteInterventionPoint: (id: string) => Promise<void>;

  // CRUD for Adherents
  adherents: Adherent[];
  addAdherent: (item: Omit<Adherent, 'id' | 'status' | 'createdAt'>) => Promise<string>;
  updateAdherentStatus: (id: string, status: 'pending' | 'approved' | 'rejected') => Promise<void>;
  deleteAdherent: (id: string) => Promise<void>;
  updateAdherentPhoto: (id: string, base64: string) => Promise<void>;

  // Manager and RBAC Authentication
  managers: Manager[];
  currentManager: Manager | null;
  addManager: (item: Omit<Manager, 'id'>) => Promise<void>;
  updateManager: (id: string, item: Manager) => Promise<void>;
  deleteManager: (id: string) => Promise<void>;
  loginManager: (username: string, password: string) => boolean;
  logoutManager: () => void;

  // Custom Signature
  presidentSignature: string | null;
  setPresidentSignature: (base64: string | null) => Promise<void>;
}

const EditableContext = createContext<EditableContextType | undefined>(undefined);

export const EditableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('hassi_lang') as Language) || 'ar';
  });
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginModalType, setLoginModalType] = useState<'admin' | 'manager' | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const logoClickRef = React.useRef<{ count: number; lastTime: number }>({ count: 0, lastTime: 0 });

  const handleSecretLogoClick = () => {
    const now = Date.now();
    if (now - logoClickRef.current.lastTime > 2500) {
      logoClickRef.current.count = 1;
    } else {
      logoClickRef.current.count += 1;
    }
    logoClickRef.current.lastTime = now;

    if (logoClickRef.current.count >= 5) {
      logoClickRef.current.count = 0;
      if (auth.currentUser || isAdminMode) {
        setIsAdminMode(true);
        setIsAdminPanelOpen(true);
      } else {
        setLoginModalType('admin');
        setIsLoginModalOpen(true);
      }
    }
  };

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

  const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
    {
      id: "ann_1",
      text: {
        fr: "🚨 URGENCE EAU POTABLE: Distribution gratuite par citernes aujourd'hui dans les quartiers de Hassi El Bekay et Soukeina (Kiffa).",
        ar: "🚨 عاجل - طوارئ المياه: توزيع مجاني للمياه الصالحة للشرب عبر الصهاريج اليوم في حسي البكاي وحي سكينه ببلدية كيفه."
      },
      isUrgent: true
    },
    {
      id: "ann_2",
      text: {
        fr: "📢 ASSEMBLÉE CITOYENNE: Réunion générale ce vendredi à 16h00 au siège du mouvement Amel Hassi El Bkay.",
        ar: "📢 اجتماع جماهيري: جمعية عامة يوم الجمعة المقبل الساعة 16:00 بمقر حركة أمل حسي البكاي."
      },
      isUrgent: false
    },
    {
      id: "ann_3",
      text: {
        fr: "💧 NOUVEAU FORAGE: Finalisation des travaux du 3ème forage au niveau de la commune de Kiffa.",
        ar: "💧 إنجاز جديد: اكتمال أعمال الحفر في البئر الارتوازية الثالثة لدعم الساكنة بكيفه."
      },
      isUrgent: false
    },
    {
      id: "ann_4",
      text: {
        fr: "🤝 CARAVANE DE SANTÉ: Consultation médicale gratuite et distribution de médicaments les 25 et 26 juillet.",
        ar: "🤝 قافلة طبية: استشارات طبية مجانية وتوزيع الأدوية يومي 25 و26 يوليوز."
      },
      isUrgent: false
    }
  ];

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    const saved = localStorage.getItem('hassi_announcements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_ANNOUNCEMENTS;
      }
    }
    return DEFAULT_ANNOUNCEMENTS;
  });

  useEffect(() => {
    localStorage.setItem('hassi_announcements', JSON.stringify(announcements));
  }, [announcements]);

  const DEFAULT_INTERVENTION_POINTS: InterventionPoint[] = [
    {
      id: 'point_hq_bekay',
      category: 'hq',
      title: {
        fr: "Siège Central & Forages Hassi El Bekay (Kiffa)",
        ar: "المقر الرئيسي وآبار حسي البكاي المركزية (كيفه)"
      },
      locationName: {
        fr: "Hassi El Bekay, Commune de Kiffa",
        ar: "حسي البكاي، بلدية كيفه"
      },
      lat: 16.6215,
      lng: -11.4120,
      description: {
        fr: "Point névralgique du mouvement à Kiffa. Abrite le quartier général, 3 forages modernes équipés en solaire et la station de remplissage des citernes gratuites.",
        ar: "المركز الرئيسي للحركة بكيفه، ويضم المقر العام و3 آبار ارتوازية حديثة تعمل بالطاقة الشمسية مع محطة تعبئة الصهاريج المجانية."
      },
      impactStats: {
        fr: "3 Forages Solaire • 800m³ d'eau potable/jour",
        ar: "3 آبار شمسية • 800 متر مكعب مياه يومياً"
      },
      status: 'active',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'point_kiffa_centre',
      category: 'water',
      title: {
        fr: "Centre de Distribution Kiffa Ville",
        ar: "مركز توزيع وتواصل كيفه المدينة"
      },
      locationName: {
        fr: "Centre-Ville Kiffa (près du Marché)",
        ar: "وسط مدينة كيفه (قرب السوق)"
      },
      lat: 16.6167,
      lng: -11.4000,
      description: {
        fr: "Permanence citoyenne de réception des requêtes en eau potable et coordination des caravanes d'urgence pour les quartiers assoiffés de Kiffa.",
        ar: "مكتب التنسيق والاستقبال الشعبي لتلقي طلبات المياه وتوجيه صهاريج الإغاثة للأحياء الأكثر احتياجاً بكيفه."
      },
      impactStats: {
        fr: "Plus de 12 000 Citoyens assistés",
        ar: "أكثر من 12,000 مواطن مستفيد"
      },
      status: 'active',
      image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'point_nouakchott_hq',
      category: 'hq',
      title: {
        fr: "Bureau de Coordination & Cadres (Nouakchott)",
        ar: "مكتب التنسيق الدائم والروابط الشعبية (نواكشوط)"
      },
      locationName: {
        fr: "Tevragh-Zeina / Ksar, Nouakchott",
        ar: "تفرغ زينه / القصر، نواكشوط"
      },
      lat: 18.0866,
      lng: -15.9785,
      description: {
        fr: "Antenne de rassemblement des cadres, étudiants et ressortissants de Hassi El Bekay résidant à Nouakchott pour le pilotage stratégique et la mobilisation des ressources.",
        ar: "مكتب التنسيق والتواصل الاجتماعي لأطر وأبناء حسي البكاي بنواكشوط لحشد الموارد وتوجيه الدعم للتنمية المحلية بكيفه والشرق."
      },
      impactStats: {
        fr: "Plus de 350 Cadres & Membres actifs",
        ar: "تعبئة أكثر من 350 إطاراً وعضواً نشطاً"
      },
      status: 'active',
      image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'point_nema_hub',
      category: 'social',
      title: {
        fr: "Pôle d'Ancrage & Solidarité Est (Nema)",
        ar: "مركز التواجد والتضامن الاجتماعي بالشرق (النعمة)"
      },
      locationName: {
        fr: "Centre-Ville Nema, Hodh Ech Chargui",
        ar: "وسط مدينة النعمة، الحوض الشرقي"
      },
      lat: 16.6133,
      lng: -7.2533,
      description: {
        fr: "Point de liaison et d'entraide citoyenne reliant les actions du mouvement Amel Hassi El Bekay entre l'Assaba et les wilayas du Hodh.",
        ar: "نقطة الارتباط والتضامن الشعبي لربط مبادرات الحركة بين ولاية العصابة والحوضين."
      },
      impactStats: {
        fr: "Relais régional d'entraide communautaire",
        ar: "شبكة تضامن إقليمية واسعة"
      },
      status: 'active',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'point_soukeina',
      category: 'social',
      title: {
        fr: "Station Citerne Soukeina & Douyez (Kiffa)",
        ar: "محطة الصهاريج بحي سكينه والدويز (كيفه)"
      },
      locationName: {
        fr: "Quartier Soukeina, Kiffa",
        ar: "حي سكينه، كيفه"
      },
      lat: 16.6080,
      lng: -11.3910,
      description: {
        fr: "Point d'eau communautaire permanent approvisionné quotidiennement par les camions-citernes de l'initiative Hassi El Bkay.",
        ar: "نقطة مياه مجتمعية دائمة يتم تزويها يومياً بصهاريج المياه الصالحة للشرب التابعة للحركة."
      },
      impactStats: {
        fr: "450 Familles desservies / jour",
        ar: "450 أسرة تستفيد يومياً"
      },
      status: 'active',
      image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'point_sagatar',
      category: 'youth',
      title: {
        fr: "Espace Jeunesse & Soutien Sagatar (Kiffa)",
        ar: "مركز الشباب والدعم بسقاطار (كيفه)"
      },
      locationName: {
        fr: "Secteur Sagatar Nord, Kiffa",
        ar: "قطاع سقاطار الشمالي، كيفه"
      },
      lat: 16.6310,
      lng: -11.4050,
      description: {
        fr: "Distribution annuelle de fournitures scolaires, parrainage d'élèves démunis et organisation de tournois sportifs de la jeunesse.",
        ar: "توزيع الأدوات المدرسية السنوية وكفالة التلاميذ المتعثرين وتنظيم البطولات الرياضية الشبابية."
      },
      impactStats: {
        fr: "150 Élèves parrainés & Kits scolaires",
        ar: "كفالة 150 تلميذاً وتوزيع الحقائب المدرسية"
      },
      status: 'active',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'point_khedim',
      category: 'health',
      title: {
        fr: "Poste Médical Mobile El Khedim (Kiffa)",
        ar: "المركز الطبي السَيّار بالخديم (كيفه)"
      },
      locationName: {
        fr: "Zone El Khedim, Kiffa",
        ar: "منطقة الخديم، كيفه"
      },
      lat: 16.6020,
      lng: -11.4180,
      description: {
        fr: "Consultations médicales bénévoles avec médecins partenaires et distribution gratuite de médicaments essentiels.",
        ar: "استشارات طبية تطوعية مع أطباء شركاء وتوزيع مجاني للأدوية الأساسية للساكنة."
      },
      impactStats: {
        fr: "2 Caravanes de santé mensuelles",
        ar: "قافلتان طبيتان كل شهر"
      },
      status: 'in_progress',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const [interventionPoints, setInterventionPoints] = useState<InterventionPoint[]>(() => {
    const saved = localStorage.getItem('hassi_intervention_points');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_INTERVENTION_POINTS;
      }
    }
    return DEFAULT_INTERVENTION_POINTS;
  });

  const DEFAULT_ADHERENTS: Adherent[] = [
    {
      id: "AMEL-2026-3847",
      name: "Ahmed Ould Mohamed El Moctar",
      phone: "+222 4655 4433",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      city: "Kiffa",
      status: "approved",
      createdAt: "18/07/2026",
      lang: "ar"
    },
    {
      id: "AMEL-2026-9281",
      name: "Mariem Mint Alassane",
      phone: "+222 3611 2299",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
      city: "Nouakchott",
      status: "approved",
      createdAt: "19/07/2026",
      lang: "fr"
    },
    {
      id: "AMEL-2026-1049",
      name: "Sidi Ould Cheikh",
      phone: "+222 2244 5566",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
      city: "Nema",
      status: "pending",
      createdAt: "22/07/2026",
      lang: "fr"
    }
  ];

  const [adherents, setAdherents] = useState<Adherent[]>(() => {
    const saved = localStorage.getItem('hassi_adherents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_ADHERENTS;
      }
    }
    return DEFAULT_ADHERENTS;
  });

  const [managers, setManagers] = useState<Manager[]>(() => {
    const saved = localStorage.getItem('hassi_managers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [currentManager, setCurrentManager] = useState<Manager | null>(() => {
    const saved = localStorage.getItem('hassi_current_manager');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [presidentSignature, setPresidentSignatureState] = useState<string | null>(() => {
    return localStorage.getItem('hassi_president_signature') || null;
  });

  useEffect(() => {
    localStorage.setItem('hassi_managers', JSON.stringify(managers));
  }, [managers]);

  useEffect(() => {
    if (currentManager) {
      localStorage.setItem('hassi_current_manager', JSON.stringify(currentManager));
    } else {
      localStorage.removeItem('hassi_current_manager');
    }
  }, [currentManager]);

  useEffect(() => {
    localStorage.setItem('hassi_adherents', JSON.stringify(adherents));
  }, [adherents]);

  useEffect(() => {
    localStorage.setItem('hassi_intervention_points', JSON.stringify(interventionPoints));
  }, [interventionPoints]);

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
          if (data.managers && Array.isArray(data.managers)) setManagers(data.managers);
          if (data.adherents && Array.isArray(data.adherents)) setAdherents(data.adherents);
          if (data.announcements && Array.isArray(data.announcements)) setAnnouncements(data.announcements);
          if (data.interventionPoints && Array.isArray(data.interventionPoints)) setInterventionPoints(data.interventionPoints);
          if (data.presidentSignature !== undefined) setPresidentSignatureState(data.presidentSignature);
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
    setCurrentManager(null);
    setIsAdminPanelOpen(false);
    localStorage.removeItem('hassi_current_manager');
  };

  const addManager = async (item: Omit<Manager, 'id'>) => {
    const id = `mgr_${Date.now()}`;
    const newMgr: Manager = {
      ...item,
      id,
      name: item.name || item.username,
      role: item.role || 'Gestionnaire',
      phone: item.phone || '',
      createdAt: item.createdAt || new Date().toLocaleDateString('fr-FR')
    };
    setManagers(prev => [...prev, newMgr]);
    try {
      await fetch('/api/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMgr)
      });
    } catch (err) {
      console.error('Error saving manager to database:', err);
    }
  };

  const updateManager = async (id: string, item: Manager) => {
    setManagers(prev => prev.map(m => m.id === id ? item : m));
    if (currentManager && currentManager.id === id) {
      setCurrentManager(item);
    }
    try {
      await fetch('/api/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    } catch (err) {
      console.error('Error updating manager in database:', err);
    }
  };

  const deleteManager = async (id: string) => {
    setManagers(prev => prev.filter(m => m.id !== id));
    if (currentManager && currentManager.id === id) {
      setCurrentManager(null);
    }
    try {
      await fetch(`/api/managers/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error deleting manager from database:', err);
    }
  };

  const loginManager = (username: string, password: string): boolean => {
    const m = managers.find(x => x.username.toLowerCase() === username.toLowerCase() && x.password === password);
    if (m) {
      setCurrentManager(m);
      setIsAdminMode(false);
      return true;
    }
    return false;
  };

  const logoutManager = () => {
    setCurrentManager(null);
    localStorage.removeItem('hassi_current_manager');
  };

  const setPresidentSignature = async (base64: string | null) => {
    setPresidentSignatureState(base64);
    if (base64) {
      localStorage.setItem('hassi_president_signature', base64);
    } else {
      localStorage.removeItem('hassi_president_signature');
    }
    try {
      await fetch('/api/site-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'presidentSignature', value: base64 })
      });
    } catch (err) {
      console.error('Error saving signature to database:', err);
    }
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

  const addAnnouncement = async (item: Omit<AnnouncementItem, 'id'>) => {
    const newAnn: AnnouncementItem = {
      ...item,
      id: `ann_${Date.now()}`
    };
    setAnnouncements(prev => [...prev, newAnn]);
  };

  const updateAnnouncement = async (id: string, item: AnnouncementItem) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? item : a));
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  // CRUD Intervention Points
  const addInterventionPoint = async (item: Omit<InterventionPoint, 'id'>) => {
    const newPoint: InterventionPoint = {
      ...item,
      id: `point_${Date.now()}`
    };
    setInterventionPoints(prev => [...prev, newPoint]);
  };

  const updateInterventionPoint = async (id: string, item: InterventionPoint) => {
    setInterventionPoints(prev => prev.map(p => p.id === id ? item : p));
  };

  const deleteInterventionPoint = async (id: string) => {
    setInterventionPoints(prev => prev.filter(p => p.id !== id));
  };

  const addAdherent = async (item: Omit<Adherent, 'id' | 'status' | 'createdAt'>) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const id = `AMEL-2026-${randomNum}`;
    const newAdherent: Adherent = {
      ...item,
      id,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('fr-FR'),
    };
    setAdherents(prev => [newAdherent, ...prev]);
    try {
      await fetch('/api/adherents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdherent)
      });
    } catch (err) {
      console.error('Error saving adherent to database:', err);
    }
    return id;
  };

  const updateAdherentStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    setAdherents(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    try {
      await fetch(`/api/adherents/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error('Error updating adherent status in database:', err);
    }
  };

  const deleteAdherent = async (id: string) => {
    setAdherents(prev => prev.filter(a => a.id !== id));
    try {
      await fetch(`/api/adherents/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error deleting adherent from database:', err);
    }
  };

  const updateAdherentPhoto = async (id: string, base64: string) => {
    setAdherents(prev => prev.map(a => a.id === id ? { ...a, photo: base64 } : a));
    const found = adherents.find(a => a.id === id);
    if (found) {
      try {
        await fetch('/api/adherents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...found, photo: base64 })
        });
      } catch (err) {
        console.error('Error updating adherent photo in database:', err);
      }
    }
  };

  const t = translations[currentLang];

  return (
    <EditableContext.Provider value={{
      currentLang,
      setLang,
      isAdminMode,
      setIsAdminMode,
      isLoginModalOpen,
      setIsLoginModalOpen,
      loginModalType,
      setLoginModalType,
      isAdminPanelOpen,
      setIsAdminPanelOpen,
      handleSecretLogoClick,
      translations,
      t,
      images,
      valueCards,
      campaignsData,
      galleryItems,
      timelineEvents,
      faqData,
      budgetRecords,
      announcements,
      interventionPoints,
      adherents,
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
      deleteBudgetRecord,

      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,

      addInterventionPoint,
      updateInterventionPoint,
      deleteInterventionPoint,

      addAdherent,
      updateAdherentStatus,
      deleteAdherent,
      updateAdherentPhoto,

      managers,
      currentManager,
      addManager,
      updateManager,
      deleteManager,
      loginManager,
      logoutManager,
      presidentSignature,
      setPresidentSignature
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
