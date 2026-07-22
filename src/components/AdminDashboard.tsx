/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useEditable, BudgetRecord } from '../context/EditableContext';
import { TranslationDict, InterventionPoint } from '../types';
import { ImageCropperModal } from './ImageCropperModal';
import { MembershipCard } from './MembershipCard';
import { 
  Settings, Lock, Unlock, RefreshCw, X, Save, Plus, Trash2, 
  RotateCw, Edit2, Check, Coins, FileText, Image as ImageIcon, Sliders, ChevronDown,
  Mail, Key, ShieldCheck, UserCheck, Crop, BellRing, MapPin, Search, Eye, CreditCard
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  googleProvider,
  auth 
} from '../lib/firebase-client.ts';

export const AdminDashboard: React.FC = () => {
  const {
    currentLang,
    isAdminMode,
    setIsAdminMode,
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginModalType,
    setLoginModalType,
    isAdminPanelOpen,
    setIsAdminPanelOpen,
    translations,
    images,
    budgetRecords,
    announcements,
    interventionPoints,
    addInterventionPoint,
    updateInterventionPoint,
    deleteInterventionPoint,
    updateTranslation,
    updateImage,
    resetAll,
    addBudgetRecord,
    updateBudgetRecord,
    deleteBudgetRecord,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    user,
    logout,
    adherents,
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
  } = useEditable();

  const [activeTab, setActiveTab] = useState<string>('nav_hero');

  // Manager Administration Local States
  const [newManagerUsername, setNewManagerUsername] = useState('');
  const [newManagerPassword, setNewManagerPassword] = useState('');
  const [newManagerPermissions, setNewManagerPermissions] = useState<string[]>([]);
  const [editingManagerId, setEditingManagerId] = useState<string | null>(null);

  // Dynamic Tab list based on permissions
  const isMasterAdmin = isAdminMode && !currentManager;
  const filteredTabs = React.useMemo(() => {
    const allTabs = [
      { id: 'nav_hero', label: "Navbar & Hero", icon: Sliders },
      { id: 'banner', label: currentLang === 'fr' ? "Bannière Défilante" : "إعلانات الشريط", icon: BellRing },
      { id: 'sections', label: "Titres Sections", icon: FileText },
      { id: 'map_points', label: currentLang === 'fr' ? "Carte & Regions" : "الخريطة والمناطق", icon: MapPin },
      { id: 'footer_seo', label: "Footer & SEO", icon: ChevronDown },
      { id: 'images', label: "Photos Statiques", icon: ImageIcon },
      { id: 'budget_mru', label: "Budget (MRU)", icon: Coins },
      { id: 'card_customization', label: currentLang === 'fr' ? "Personnaliser la Carte" : "تخصيص نصوص البطاقة", icon: CreditCard },
      { id: 'adherents', label: currentLang === 'fr' ? "Cartes Adhérents" : "بطاقات الأعضاء", icon: UserCheck }
    ];

    const result = allTabs.filter(tab => {
      if (isMasterAdmin) return true;
      if (currentManager) {
        return currentManager.permissions.includes(tab.id);
      }
      return false;
    });

    if (isMasterAdmin) {
      result.push({ id: 'managers', label: currentLang === 'fr' ? "Gestionnaires" : "إدارة الصلاحيات", icon: ShieldCheck });
    }

    return result;
  }, [isMasterAdmin, currentManager, currentLang]);

  // Ensure active tab is valid based on permissions
  React.useEffect(() => {
    if (filteredTabs.length > 0) {
      const isValid = filteredTabs.some(t => t.id === activeTab);
      if (!isValid) {
        setActiveTab(filteredTabs[0].id);
      }
    }
  }, [filteredTabs, activeTab]);
  const [imageUploadProgress, setImageUploadProgress] = useState<string | null>(null);
  const [adherentFilter, setAdherentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [adherentSearch, setAdherentSearch] = useState('');
  const [selectedPreviewAdherent, setSelectedPreviewAdherent] = useState<any | null>(null);

  // Announcement Form State
  const [annFr, setAnnFr] = useState('');
  const [annAr, setAnnAr] = useState('');
  const [annUrgent, setAnnUrgent] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);

  // Intervention Point Form State
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [ptCategory, setPtCategory] = useState<'water' | 'health' | 'youth' | 'hq' | 'social'>('water');
  const [ptTitleFr, setPtTitleFr] = useState('');
  const [ptTitleAr, setPtTitleAr] = useState('');
  const [ptLocationFr, setPtLocationFr] = useState('');
  const [ptLocationAr, setPtLocationAr] = useState('');
  const [ptLat, setPtLat] = useState('16.6167');
  const [ptLng, setPtLng] = useState('-11.4000');
  const [ptDescFr, setPtDescFr] = useState('');
  const [ptDescAr, setPtDescAr] = useState('');
  const [ptImpactFr, setPtImpactFr] = useState('');
  const [ptImpactAr, setPtImpactAr] = useState('');
  const [ptImage, setPtImage] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80');

  const handleSaveInterventionPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptTitleFr.trim() && !ptTitleAr.trim()) return;

    const latNum = parseFloat(ptLat) || 16.6167;
    const lngNum = parseFloat(ptLng) || -11.4000;

    if (editingPointId) {
      updateInterventionPoint(editingPointId, {
        id: editingPointId,
        category: ptCategory,
        title: { fr: ptTitleFr.trim() || 'Point', ar: ptTitleAr.trim() || 'نقطة' },
        locationName: { fr: ptLocationFr.trim() || 'Kiffa', ar: ptLocationAr.trim() || 'كيفه' },
        lat: latNum,
        lng: lngNum,
        description: { fr: ptDescFr.trim(), ar: ptDescAr.trim() },
        impactStats: { fr: ptImpactFr.trim(), ar: ptImpactAr.trim() },
        status: 'active',
        image: ptImage || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80'
      });
      setEditingPointId(null);
    } else {
      addInterventionPoint({
        category: ptCategory,
        title: { fr: ptTitleFr.trim() || 'Nouveau point', ar: ptTitleAr.trim() || 'نقطة جديدة' },
        locationName: { fr: ptLocationFr.trim() || 'Kiffa', ar: ptLocationAr.trim() || 'كيفه' },
        lat: latNum,
        lng: lngNum,
        description: { fr: ptDescFr.trim(), ar: ptDescAr.trim() },
        impactStats: { fr: ptImpactFr.trim(), ar: ptImpactAr.trim() },
        status: 'active',
        image: ptImage || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80'
      });
    }

    setPtTitleFr('');
    setPtTitleAr('');
    setPtLocationFr('');
    setPtLocationAr('');
    setPtDescFr('');
    setPtDescAr('');
    setPtImpactFr('');
    setPtImpactAr('');
  };

  const startEditPoint = (pt: InterventionPoint) => {
    setEditingPointId(pt.id);
    setPtCategory(pt.category);
    setPtTitleFr(pt.title.fr);
    setPtTitleAr(pt.title.ar);
    setPtLocationFr(pt.locationName.fr);
    setPtLocationAr(pt.locationName.ar);
    setPtLat(String(pt.lat));
    setPtLng(String(pt.lng));
    setPtDescFr(pt.description.fr);
    setPtDescAr(pt.description.ar);
    setPtImpactFr(pt.impactStats.fr);
    setPtImpactAr(pt.impactStats.ar);
    setPtImage(pt.image);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annFr.trim() && !annAr.trim()) return;

    if (editingAnnId) {
      updateAnnouncement(editingAnnId, {
        id: editingAnnId,
        text: {
          fr: annFr.trim() || 'Annonce',
          ar: annAr.trim() || 'إعلان'
        },
        isUrgent: annUrgent
      });
      setEditingAnnId(null);
    } else {
      addAnnouncement({
        text: {
          fr: annFr.trim() || 'Annonce',
          ar: annAr.trim() || 'إعلان'
        },
        isUrgent: annUrgent
      });
    }

    setAnnFr('');
    setAnnAr('');
    setAnnUrgent(false);
  };

  const startEditAnn = (ann: any) => {
    setEditingAnnId(ann.id);
    setAnnFr(ann.text.fr);
    setAnnAr(ann.text.ar);
    setAnnUrgent(!!ann.isUrgent);
  };

  // Cropper Modal state for Admin Assets
  const [cropperRawSrc, setCropperRawSrc] = useState<string | null>(null);
  const [cropperImageKey, setCropperImageKey] = useState<keyof typeof images | null>(null);

  // Manual auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setEmail('');
    setPassword('');
    setAuthError(null);
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setAuthError(
        currentLang === 'fr' 
          ? 'Veuillez saisir votre identifiant et votre mot de passe.' 
          : 'يرجى إدخال اسم المستخدم وكلمة المرور.'
      );
      return;
    }

    setIsSubmittingAuth(true);
    setAuthError(null);

    // If it's a manager, ONLY check local managers list. Never check Firebase.
    if (loginModalType === 'manager') {
      const isManager = loginManager(cleanEmail, password);
      if (isManager) {
        setIsAdminPanelOpen(true);
        setIsLoginModalOpen(false);
        setEmail('');
        setPassword('');
        setIsSubmittingAuth(false);
        return;
      } else {
        setAuthError(
          currentLang === 'fr'
            ? "Identifiant ou mot de passe incorrect."
            : "اسم المستخدم أو كلمة المرور غير صحيحة."
        );
        setIsSubmittingAuth(false);
        return;
      }
    }

    // Admin mode (loginModalType === 'admin')
    // Check manager list first to see if a manager is mistakenly trying to log in through the admin panel
    const isManagerInAdminPanel = loginManager(cleanEmail, password);
    if (isManagerInAdminPanel) {
      setIsAdminPanelOpen(true);
      setIsLoginModalOpen(false);
      setEmail('');
      setPassword('');
      setIsSubmittingAuth(false);
      return;
    }

    // For Firebase Admin Login, check that the identifier is an email format
    if (!cleanEmail.includes('@')) {
      setAuthError(
        currentLang === 'fr'
          ? "Identifiant ou mot de passe incorrect."
          : "اسم المستخدم أو كلمة المرور غير صحيحة."
      );
      setIsSubmittingAuth(false);
      return;
    }

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, cleanEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      }
      setIsAdminMode(true);
      setIsAdminPanelOpen(true);
      setIsLoginModalOpen(false);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error("Authentication error:", err);
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setAuthError(
          currentLang === 'fr'
            ? "La connexion par Email/Mot de passe est désactivée dans la console Firebase. Utilisez la connexion Google ou l'accès direct ci-dessous."
            : "تسجيل الدخول بالبريد الإلكتروني غير مفعّل في منصة Firebase. يرجى استخدام Google أو الدخول المباشر أسفله."
        );
      } else if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-email' || code === 'auth/wrong-password') {
        setAuthError(
          currentLang === 'fr'
            ? "Identifiant ou mot de passe incorrect."
            : "اسم المستخدم أو كلمة المرور غير صحيحة."
        );
      } else if (code === 'auth/email-already-in-use') {
        setAuthError(
          currentLang === 'fr'
            ? "Cet email est déjà enregistré. Veuillez vous connecter avec 'Se connecter'."
            : "هذا البريد الإلكتروني مستخدم بالفعل. استخدم خيار 'تسجيل الدخول'."
        );
      } else if (code === 'auth/weak-password') {
        setAuthError(
          currentLang === 'fr'
            ? "Le mot de passe doit comporter au moins 6 caractères."
            : "يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل."
        );
      } else {
        setAuthError(
          currentLang === 'fr' ? "Identifiant ou mot de passe incorrect." : "اسم المستخدم أو كلمة المرور غير صحيحة."
        );
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmittingAuth(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setIsAdminMode(true);
        setIsAdminPanelOpen(true);
        setIsLoginModalOpen(false);
      }
    } catch (err: any) {
      console.error("Google auth error:", err);
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setAuthError(
          currentLang === 'fr'
            ? "Échec de la connexion Google. Vous pouvez utiliser l'Accès Direct ci-dessous."
            : "فشل تسجيل الدخول بواسطة Google. يمكنك استخدام الدخول المباشر أسفله."
        );
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleDirectAuth = () => {
    setIsAdminMode(true);
    setIsAdminPanelOpen(true);
    setIsLoginModalOpen(false);
    setAuthError(null);
  };

  const handleLogoutAll = () => {
    logout();
    logoutManager();
    setIsAdminMode(false);
    setIsAdminPanelOpen(false);
    setEmail('');
    setPassword('');
  };

  // Budget states
  const [newBudgetCampaignId, setNewBudgetCampaignId] = useState('camp_water_relief');
  const [newBudgetTitleFr, setNewBudgetTitleFr] = useState('');
  const [newBudgetTitleAr, setNewBudgetTitleAr] = useState('');
  const [newBudgetAllocated, setNewBudgetAllocated] = useState('');
  const [newBudgetSpent, setNewBudgetSpent] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  // Resize helper for uploaded assets keeping ultra HD clarity
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1440;
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

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.92));
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
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCropperRawSrc(event.target.result as string);
        setCropperImageKey(key);
      }
    };
    reader.readAsDataURL(file);
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
    { tab: 'nav_hero', key: 'heroPhotoBadgeFr', labelFr: "Badge sur la Première Photo (Hero FR)", labelAr: "شارة الصورة الأولى (فرنسي)" },
    { tab: 'nav_hero', key: 'heroPhotoBadgeAr', labelFr: "Badge sur la Première Photo (Hero AR)", labelAr: "شارة الصورة الأولى (عربي)" },
    { tab: 'nav_hero', key: 'heroTitle', labelFr: "Titre Principal de l'Initiative (Hero)", labelAr: "العنوان الرئيسي (أمل حاسي البكاي)" },
    { tab: 'nav_hero', key: 'heroSubtitle', labelFr: "Sous-titre d'accroche (Hero)", labelAr: "الوصف الفرعي لـ Hero", isTextArea: true },
    { tab: 'nav_hero', key: 'heroCTA', labelFr: "Bouton CTA Principal", labelAr: "زر الدعوة الرئيسي" },
    { tab: 'nav_hero', key: 'heroSecondaryCTA', labelFr: "Bouton CTA Secondaire", labelAr: "زر الدعوة الثانوي" },

    // Tab: Section Titles & Texts
    { tab: 'sections', key: 'popSectionTitleFr', labelFr: "Rubrique Popularité: Titre Principal (FR)", labelAr: "قسم مؤشر الشعبية: العنوان الرئيسي (فرنسي)" },
    { tab: 'sections', key: 'popSectionTitleAr', labelFr: "Rubrique Popularité: Titre Principal (AR)", labelAr: "قسم مؤشر الشعبية: العنوان الرئيسي (عربي)" },
    { tab: 'sections', key: 'popLocationFr', labelFr: "Rubrique Popularité: Localisation / Ville (FR)", labelAr: "قسم مؤشر الشعبية: المدينة والمنطقة (فرنسي)" },
    { tab: 'sections', key: 'popLocationAr', labelFr: "Rubrique Popularité: Localisation / Ville (AR)", labelAr: "قسم مؤشر الشعبية: المدينة والمنطقة (عربي)" },
    
    { tab: 'sections', key: 'popCard1Val', labelFr: "Carte Popularité 1: Chiffre / Valeur (ex: 3 640)", labelAr: "بطاقة الشعبية 1: الرقم (مثال: 3640)" },
    { tab: 'sections', key: 'popCard1LabelFr', labelFr: "Carte Popularité 1: Libellé Texte (FR)", labelAr: "بطاقة الشعبية 1: النص (فرنسي)" },
    { tab: 'sections', key: 'popCard1LabelAr', labelFr: "Carte Popularité 1: Libellé Texte (AR)", labelAr: "بطاقة الشعبية 1: النص (عربي)" },

    { tab: 'sections', key: 'popCard2Val', labelFr: "Carte Popularité 2: Chiffre / Valeur (ex: +412)", labelAr: "بطاقة الشعبية 2: الرقم (مثال: +412)" },
    { tab: 'sections', key: 'popCard2LabelFr', labelFr: "Carte Popularité 2: Libellé Texte (FR)", labelAr: "بطاقة الشعبية 2: النص (فرنسي)" },
    { tab: 'sections', key: 'popCard2LabelAr', labelFr: "Carte Popularité 2: Libellé Texte (AR)", labelAr: "بطاقة الشعبية 2: النص (عربي)" },

    { tab: 'sections', key: 'popCard3Val', labelFr: "Carte Popularité 3: Chiffre / Valeur (ex: 14 892)", labelAr: "بطاقة الشعبية 3: الرقم (مثال: 14892)" },
    { tab: 'sections', key: 'popCard3LabelFr', labelFr: "Carte Popularité 3: Libellé Texte (FR)", labelAr: "بطاقة الشعبية 3: النص (فرنسي)" },
    { tab: 'sections', key: 'popCard3LabelAr', labelFr: "Carte Popularité 3: Libellé Texte (AR)", labelAr: "بطاقة الشعبية 3: النص (عربي)" },

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
    { tab: 'sections', key: 'mapBadge', labelFr: "Badge Carte des Interventions", labelAr: "وسام قسم خريطة التدخلات" },
    { tab: 'sections', key: 'mapTitle', labelFr: "Titre Carte (Zones d'Influence & Actions)", labelAr: "عنوان قسم الخريطة (مناطق النفوذ بكيفه ونواكشوط والنعمة)" },
    { tab: 'sections', key: 'mapSubtitle', labelFr: "Sous-titre Section Carte", labelAr: "الوصف الفرعي لقسم الخريطة", isTextArea: true },

    // Tab: Footer & SEO Settings
    { tab: 'footer_seo', key: 'footerLeader', labelFr: "Directeur / Leader Officiel", labelAr: "قائد الحراك الرسمي" },
    { tab: 'footer_seo', key: 'footerText', labelFr: "Texte de présentation (Footer)", labelAr: "نبذة التعريف في أسفل الموقع", isTextArea: true },
    { tab: 'footer_seo', key: 'footerRights', labelFr: "Mentions de droits d'auteur", labelAr: "حقوق النشر والملكية الفكرية" }
  ];

  return (
    <>
      {/* Secret Manual Login Modal (Triggered by 5-clicks on Logo for Admin, or Se connecter for Manager) */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up text-left rtl:text-right">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-500 rounded-xl border border-amber-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    {loginModalType === 'manager'
                      ? (currentLang === 'fr' ? "Connexion Espace Gestionnaire" : "تسجيل دخول المشرفين")
                      : (currentLang === 'fr' ? "Accès Écran Administration" : "تسجيل دخول الإدارة")}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {loginModalType === 'manager'
                      ? (currentLang === 'fr' 
                          ? "Saisissez votre identifiant de gestionnaire et mot de passe" 
                          : "يرجى إدخال اسم المستخدم وكلمة المرور الخاصة بالمشرف")
                      : (currentLang === 'fr' 
                          ? "Veuillez saisir votre email et mot de passe" 
                          : "يرجى إدخال البريد الإلكتروني وكلمة المرور الخاصة بالإدارة")}
                  </p>
                </div>
              </div>
              <button
                onClick={closeLoginModal}
                className="text-slate-400 hover:text-white p-2 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleManualAuth} className="p-6 space-y-4">
              
              {authError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs font-semibold leading-relaxed">
                  {authError}
                </div>
              )}

              {/* Email / Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {loginModalType === 'manager'
                    ? (currentLang === 'fr' ? "Nom d'utilisateur / Identifiant" : "اسم المستخدم / المعرّف")
                    : (currentLang === 'fr' ? "Identifiant / Adresse E-mail" : "اسم المستخدم / البريد الإلكتروني")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={loginModalType === 'manager'
                      ? (currentLang === 'fr' ? "Ex: budget_manager" : "مثال: budget_manager")
                      : (currentLang === 'fr' ? "Identifiant ou email" : "اسم المستخدم أو البريد الإلكتروني")}
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {currentLang === 'fr' ? "Mot de passe" : "كلمة المرور"}
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Mode Toggle Button (Login vs Register) - ONLY for Admin */}
              {loginModalType === 'admin' && (
                <div className="pt-2 flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(!isRegisterMode);
                      setAuthError(null);
                    }}
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                  >
                    {isRegisterMode
                      ? (currentLang === 'fr' ? "Déjà un compte ? Se connecter" : "لديك حساب بالفعل؟ تسجيل الدخول")
                      : (currentLang === 'fr' ? "Créer un nouveau compte Admin" : "إنشاء حساب جديد للإدارة")
                    }
                  </button>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors"
                >
                  {currentLang === 'fr' ? "Annuler" : "إلغاء"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isSubmittingAuth ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                  <span>
                    {isRegisterMode 
                      ? (currentLang === 'fr' ? "S'inscrire" : "إنشاء الحساب") 
                      : (currentLang === 'fr' ? "Se connecter" : "تسجيل الدخول")}
                  </span>
                </button>
              </div>

              {/* Alternative Auth Methods - ONLY for Admin */}
              {loginModalType === 'admin' && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isSubmittingAuth}
                    className="w-full py-2.5 px-4 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>{currentLang === 'fr' ? "Se connecter avec Google" : "تسجيل الدخول بـ Google"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectAuth}
                    className="w-full py-2 px-4 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold rounded-xl text-xs transition-all text-center"
                  >
                    {currentLang === 'fr' ? "Accès Direct Administrateur" : "الدخول المباشر للإدارة"}
                  </button>
                </div>
              )}

            </form>

          </div>
        </div>
      )}

      {/* Floating Control Button (Visible ONLY when logged in as admin or manager) */}
      {(isAdminMode || currentManager !== null) && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          <button
            onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
            className="flex items-center gap-2 px-5 py-3.5 bg-amber-500 text-slate-950 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold text-xs uppercase tracking-wider"
            title="Ouvrir le panneau d'édition"
          >
            <Settings className="w-5 h-5 animate-spin-slow" />
            <span>{currentLang === 'fr' ? "Éditer le site" : "تعديل الموقع"}</span>
          </button>
          <button
            onClick={handleLogoutAll}
            className="p-3.5 bg-slate-900 text-rose-400 hover:bg-rose-600 hover:text-white rounded-full shadow-2xl transition-all"
            title="Quitter le mode édition"
          >
            <Lock className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Admin Panel CMS Overlay */}
      {isAdminPanelOpen && (isAdminMode || currentManager !== null) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[92vh] sm:h-[85vh] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative animate-scale-up">
            
            {/* Header */}
            <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 animate-spin-slow shrink-0" />
                <div>
                  <h2 className="text-sm sm:text-lg font-bold font-display tracking-tight text-white flex items-center gap-2">
                    <span>Panneau Administration</span>
                    <span className="text-[10px] sm:text-xs bg-amber-500 text-slate-950 px-2 sm:px-2.5 py-0.5 rounded-full font-black">CMS CRUD</span>
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 hidden sm:block">
                    Modifiez à la volée tous les textes, Coordonnées de l'Initiative, photos et budget (MRU)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={handleLogoutAll}
                  className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-500 border border-amber-500/20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all"
                  title="Déconnexion"
                >
                  <span>{currentLang === 'fr' ? 'Déconnexion' : 'خروج'}</span>
                </button>
                <button
                  onClick={resetAll}
                  className="hidden sm:flex items-center gap-1 bg-rose-600/20 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  title="Réinitialiser"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={() => setIsAdminPanelOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-1.5 sm:p-2 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Workspace Layout */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Tab Selector Sidebar (Horizontal scroll on mobile, vertical sidebar on desktop) */}
              <div className="w-full md:w-52 bg-slate-50 dark:bg-slate-950 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-850 p-2 sm:p-3 md:p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0 no-scrollbar">
                <p className="hidden md:block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-2">Rubriques</p>
                {filteredTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 w-auto md:w-full whitespace-nowrap px-3 py-2 md:py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        activeTab === tab.id
                          ? 'bg-blue-700 dark:bg-amber-500 text-white dark:text-slate-950 shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 md:border-none'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Editing Area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-white dark:bg-slate-900 text-left">
                
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

                {/* 2. Banner Marquee Tab */}
                {activeTab === 'banner' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-500">
                          {currentLang === 'fr' ? "Bannière d'Annonces Défilantes (FR / AR)" : "إدارة إعلانات الشريط المتحرك (فرنسي / عربي)"}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {currentLang === 'fr' 
                            ? "Ajoutez ou modifiez les messages défilants au sommet du site (Urgence Eau, Réunions, Caravanes)" 
                            : "إضافة وتعديل الأشرطة الإخبارية والإعلانات العاجلة للساكنة في أسرع وقت"}
                        </p>
                      </div>
                    </div>

                    {/* Announcement Form */}
                    <form onSubmit={handleSaveAnnouncement} className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-4">
                      <h4 className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">
                        {editingAnnId 
                          ? (currentLang === 'fr' ? "Modifier l'annonce" : "تعديل الإعلان") 
                          : (currentLang === 'fr' ? "Ajouter une nouvelle annonce défilante" : "إضافة إعلان جديد للشريط")}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Texte en Français (FR)
                          </label>
                          <input
                            type="text"
                            value={annFr}
                            onChange={(e) => setAnnFr(e.target.value)}
                            placeholder="🚨 URGENCE EAU: Distribution aujourd'hui à..."
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 text-right">
                            النص بالعربية (AR)
                          </label>
                          <input
                            type="text"
                            value={annAr}
                            onChange={(e) => setAnnAr(e.target.value)}
                            placeholder="🚨 عاجل - طوارئ المياه: توزيع مجاني اليوم..."
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-right"
                            dir="rtl"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={annUrgent}
                            onChange={(e) => setAnnUrgent(e.target.checked)}
                            className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                          />
                          <span>{currentLang === 'fr' ? "Marquer comme Urgent / Alerte 🚨" : "تحديد كخبر عاجل 🚨"}</span>
                        </label>

                        <div className="flex items-center gap-2">
                          {editingAnnId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAnnId(null);
                                setAnnFr('');
                                setAnnAr('');
                                setAnnUrgent(false);
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              Annuler
                            </button>
                          )}
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{editingAnnId ? "Enregistrer les modifications" : "Ajouter l'Annonce"}</span>
                          </button>
                        </div>
                      </div>
                    </form>

                    {/* Announcements List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-slate-400">
                        {currentLang === 'fr' ? "Annonces actives dans le défilement" : "الإعلانات النشطة حالياً"}
                      </h4>
                      {announcements.map((ann) => (
                        <div
                          key={ann.id}
                          className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              {ann.isUrgent && (
                                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                  Urgent
                                </span>
                              )}
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {ann.text.fr}
                              </p>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-right" dir="rtl">
                              {ann.text.ar}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => startEditAnn(ann)}
                              className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-xl transition-colors"
                              title="Éditer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAnnouncement(ann.id)}
                              className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-xl transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Sections Tab */}
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

                {/* 3.5. Map Points Tab (Kiffa, Nouakchott, Nema) */}
                {activeTab === 'map_points' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-blue-700 dark:text-amber-500">
                          {currentLang === 'fr' ? "Zones d'Influence & Actions à Kiffa, Nouakchott et Nema" : "نقاط التدخل والتأثير بكيفه ونواكشوط والنعمة"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {currentLang === 'fr' 
                            ? "Ajoutez ou modifiez les lieux d'intervention, bureaux de coordination et forages (Coordonnées GPS, Titres FR/AR, Bilan)." 
                            : "إضافة وتعديل نقاط التدخل ومكاتب التنسيق والآبار (الإحداثيات، العناوين، والإحصائيات)."}
                        </p>
                      </div>
                    </div>

                    {/* Point Add/Edit Form */}
                    <form onSubmit={handleSaveInterventionPoint} className="bg-slate-50 dark:bg-slate-950/60 p-5 border rounded-2xl space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {editingPointId 
                          ? (currentLang === 'fr' ? "Modifier le point d'intervention" : "تعديل نقطة التدخل")
                          : (currentLang === 'fr' ? "Ajouter un nouveau point sur la carte" : "إضافة نقطة جديدة على الخريطة")}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Catégorie</label>
                          <select
                            value={ptCategory}
                            onChange={(e: any) => setPtCategory(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="hq">HQ / Siège & Bureau (المقرات والمكاتب)</option>
                            <option value="water">Distribution Eau (توزيع المياه)</option>
                            <option value="youth">Jeunesse & Éducation (الشباب والتعليم)</option>
                            <option value="health">Santé Mobile (الرعاية الصحية)</option>
                            <option value="social">Entraide & Solidarité (التضامن)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Latitude (ex: 16.6167 / 18.0866)</label>
                          <input
                            type="text"
                            value={ptLat}
                            onChange={(e) => setPtLat(e.target.value)}
                            placeholder="16.6167"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Longitude (ex: -11.4000 / -15.9785)</label>
                          <input
                            type="text"
                            value={ptLng}
                            onChange={(e) => setPtLng(e.target.value)}
                            placeholder="-11.4000"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Titre (Français)</label>
                          <input
                            type="text"
                            value={ptTitleFr}
                            onChange={(e) => setPtTitleFr(e.target.value)}
                            placeholder="ex: Bureau de Coordination (Nouakchott)"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase text-right">العنوان (بالعربية)</label>
                          <input
                            type="text"
                            value={ptTitleAr}
                            onChange={(e) => setPtTitleAr(e.target.value)}
                            placeholder="مثال: مكتب التنسيق بنواكشوط"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs text-right focus:ring-1 focus:ring-amber-500"
                            dir="rtl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Lieu / Ville (Français)</label>
                          <input
                            type="text"
                            value={ptLocationFr}
                            onChange={(e) => setPtLocationFr(e.target.value)}
                            placeholder="ex: Tevragh-Zeina, Nouakchott"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase text-right">الموقع / المدينة (بالعربية)</label>
                          <input
                            type="text"
                            value={ptLocationAr}
                            onChange={(e) => setPtLocationAr(e.target.value)}
                            placeholder="مثال: تفرغ زينه، نواكشوط"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs text-right focus:ring-1 focus:ring-amber-500"
                            dir="rtl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Description (Français)</label>
                          <textarea
                            value={ptDescFr}
                            onChange={(e) => setPtDescFr(e.target.value)}
                            placeholder="Description des activités..."
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                            rows={2}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase text-right">الوصف (بالعربية)</label>
                          <textarea
                            value={ptDescAr}
                            onChange={(e) => setPtDescAr(e.target.value)}
                            placeholder="وصف للأنشطة والخدمات..."
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs text-right focus:ring-1 focus:ring-amber-500"
                            dir="rtl"
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Impact (Français)</label>
                          <input
                            type="text"
                            value={ptImpactFr}
                            onChange={(e) => setPtImpactFr(e.target.value)}
                            placeholder="ex: Plus de 350 Cadres actifs"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase text-right">الإحصائية والنتيجة (بالعربية)</label>
                          <input
                            type="text"
                            value={ptImpactAr}
                            onChange={(e) => setPtImpactAr(e.target.value)}
                            placeholder="مثال: تعبئة 350 إطاراً ونشطاً"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs text-right focus:ring-1 focus:ring-amber-500"
                            dir="rtl"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        {editingPointId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPointId(null);
                              setPtTitleFr('');
                              setPtTitleAr('');
                            }}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                          >
                            Annuler
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-5 py-2 bg-amber-500 text-slate-950 hover:bg-amber-600 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          <span>{editingPointId ? "Enregistrer modifications" : "Ajouter le point"}</span>
                        </button>
                      </div>
                    </form>

                    {/* Points List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-slate-400">
                        {currentLang === 'fr' ? "Points d'intervention configurés" : "النقاط المحددة حالياً على الخريطة"} ({interventionPoints?.length || 0})
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {(interventionPoints || []).map((pt) => (
                          <div
                            key={pt.id}
                            className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4"
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                  {pt.category}
                                </span>
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {pt.title.fr} / {pt.title.ar}
                                </h5>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>{pt.locationName.fr} — Lat: {pt.lat}, Lng: {pt.lng}</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => startEditPoint(pt)}
                                className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-xl transition-colors"
                                title="Éditer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteInterventionPoint(pt.id)}
                                className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-xl transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
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
                    <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-x-auto bg-white dark:bg-slate-900 shadow-sm">
                      <table className="w-full text-xs min-w-[550px]">
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

                {/* 5.5. Membership Card Text & Custom Fields Customization Tab */}
                {activeTab === 'card_customization' && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-blue-700 dark:text-amber-500 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-amber-500" />
                          <span>{currentLang === 'fr' ? "Personnalisation Complète des Cartes d'Adhérent (Recto & Verso)" : "التخصيص الكامل لنصوص وإضافات بطاقات العضوية"}</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {currentLang === 'fr' 
                            ? "Modifiez tous les textes (en Français et Arabe), les règles de la Charte et ajoutez des lignes personnalisées. Les champs vides ne s'affichent pas."
                            : "تعديل جميع النصوص بالفرنسية والعربية، ومبادئ الميثاق، وإضافة أسطر مخصصة جديدة. الحقول الفارغة لا تظهر على البطاقة."}
                        </p>
                      </div>
                    </div>

                    {/* Live Preview Bar */}
                    <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-amber-400" />
                          <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                            {currentLang === 'fr' ? "Aperçu en Temps Réel de la Carte (Ajustement Instantané)" : "معاينة حية ومباشرة للبطاقة أثناء التعديل"}
                          </h4>
                        </div>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                          Exemple Adhérent
                        </span>
                      </div>
                      
                      <div className="pt-2 flex justify-center">
                        <MembershipCard 
                          adherent={{
                            id: 'AMEL-2026-9999',
                            name: 'Sidi Ould Mohamed',
                            phone: '+222 46 12 34 56',
                            city: 'Kiffa',
                            lang: currentLang === 'ar' ? 'ar' : 'fr',
                            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                            qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AMEL-2026-9999',
                            status: 'approved',
                            createdAt: '2026-07-22'
                          }} 
                          showDownloadButton={false} 
                        />
                      </div>
                    </div>

                    {/* SECTION 1: RECTO (FACE AVANT) */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-amber-400 flex items-center gap-2 border-b pb-2">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span>1. Textes de la Face Avant (Recto) / الوجه الأمامي</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            En-tête Recto Français (Header FR)
                          </label>
                          <input
                            type="text"
                            value={translations.fr['cardRectoHeaderFr'] || ''}
                            onChange={(e) => updateTranslation('fr', 'cardRectoHeaderFr', e.target.value)}
                            placeholder="Ex: AMEL HASSI EL BEKAY"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-right">
                            En-tête Recto Arabe (Header AR) / العنوان الرئيسي
                          </label>
                          <input
                            type="text"
                            value={translations.ar['cardRectoHeaderAr'] || ''}
                            onChange={(e) => updateTranslation('ar', 'cardRectoHeaderAr', e.target.value)}
                            placeholder="مثال: أمل حاسي البكاي"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                            dir="rtl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Badge Recto Français (Badge FR)
                          </label>
                          <input
                            type="text"
                            value={translations.fr['cardRectoBadgeFr'] || ''}
                            onChange={(e) => updateTranslation('fr', 'cardRectoBadgeFr', e.target.value)}
                            placeholder="Ex: RECTO ou CARTE ADHÉRENT"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-right">
                            Badge Recto Arabe (Badge AR) / شارة البطاقة
                          </label>
                          <input
                            type="text"
                            value={translations.ar['cardRectoBadgeAr'] || ''}
                            onChange={(e) => updateTranslation('ar', 'cardRectoBadgeAr', e.target.value)}
                            placeholder="مثال: بطاقة انتساب"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                            dir="rtl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Sous-titre Mouvement (Subtitle FR)
                          </label>
                          <input
                            type="text"
                            value={translations.fr['cardRectoSubtitleFr'] || ''}
                            onChange={(e) => updateTranslation('fr', 'cardRectoSubtitleFr', e.target.value)}
                            placeholder="Ex: Mouvement AMEL"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Pied de Carte Recto FR (Footer FR)
                          </label>
                          <input
                            type="text"
                            value={translations.fr['cardRectoFooterFr'] || ''}
                            onChange={(e) => updateTranslation('fr', 'cardRectoFooterFr', e.target.value)}
                            placeholder="Ex: Mouvement Social & Politique à Kiffa"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-right">
                            Pied de Carte Recto Arabe (Footer AR) / نص أسفل البطاقة
                          </label>
                          <input
                            type="text"
                            value={translations.ar['cardRectoFooterAr'] || ''}
                            onChange={(e) => updateTranslation('ar', 'cardRectoFooterAr', e.target.value)}
                            placeholder="مثال: المبادرة الاجتماعية والسياسية بكيفه"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: VERSO (FACE ARRIÈRE & TAMPON / SIGNATURE) */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-amber-400 flex items-center gap-2 border-b pb-2">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span>2. Textes du Verso (Face Arrière & Tampon/Signature) / الوجه الخلفي</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Titre Charte Verso FR
                          </label>
                          <input
                            type="text"
                            value={translations.fr['cardVersoHeaderFr'] || ''}
                            onChange={(e) => updateTranslation('fr', 'cardVersoHeaderFr', e.target.value)}
                            placeholder="Ex: Charte de l'Adhérent"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-right">
                            Titre Charte Verso AR / عنوان الميثاق
                          </label>
                          <input
                            type="text"
                            value={translations.ar['cardVersoHeaderAr'] || ''}
                            onChange={(e) => updateTranslation('ar', 'cardVersoHeaderAr', e.target.value)}
                            placeholder="مثال: مبادئ ميثاق الانتساب للحراك"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                            dir="rtl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Texte du Tampon Rouche/Rouge (Stamp Text)
                          </label>
                          <input
                            type="text"
                            value={translations.fr['cardVersoStamp'] || ''}
                            onChange={(e) => updateTranslation('fr', 'cardVersoStamp', e.target.value)}
                            placeholder="Ex: AMEL APPROUVÉ"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Libellé Signature FR
                          </label>
                          <input
                            type="text"
                            value={translations.fr['cardVersoSignatureFr'] || ''}
                            onChange={(e) => updateTranslation('fr', 'cardVersoSignatureFr', e.target.value)}
                            placeholder="Ex: Signature du Président"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-right">
                            Libellé Signature AR / صفة التوقيع
                          </label>
                          <input
                            type="text"
                            value={translations.ar['cardVersoSignatureAr'] || ''}
                            onChange={(e) => updateTranslation('ar', 'cardVersoSignatureAr', e.target.value)}
                            placeholder="مثال: توقيع الرئيس"
                            className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: RÈGLES DE LA CHARTE (CHARTE RULES 1 À 8) */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-amber-400 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-500" />
                          <span>3. Règles Dynamiques de la Charte (Verso) / بنود الميثاق</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {currentLang === 'fr' 
                            ? "Saisissez les règles de la charte. Seules les règles dont au moins un champ est rempli seront affichées sur le dos de la carte."
                            : "أدخل بنود الميثاق. البنود التي تحتوي على نصوص هي فقط التي تظهر على ظهر البطاقة."}
                        </p>
                      </div>

                      <div className="space-y-4 pt-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                          <div key={`rule-${i}`} className="bg-white dark:bg-slate-900 p-3.5 border rounded-xl space-y-3">
                            <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
                              Règle {i} / البند {i}
                            </span>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Titre FR ({i})</label>
                                <input
                                  type="text"
                                  value={translations.fr[`cardRule${i}TitleFr`] || ''}
                                  onChange={(e) => updateTranslation('fr', `cardRule${i}TitleFr`, e.target.value)}
                                  placeholder="Ex: Eau & Développement"
                                  className="w-full bg-slate-50 dark:bg-slate-950 border rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1 text-right">Titre AR ({i})</label>
                                <input
                                  type="text"
                                  value={translations.ar[`cardRule${i}TitleAr`] || ''}
                                  onChange={(e) => updateTranslation('ar', `cardRule${i}TitleAr`, e.target.value)}
                                  placeholder="مثال: المياه والتنمية"
                                  className="w-full bg-slate-50 dark:bg-slate-950 border rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                                  dir="rtl"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Description FR ({i})</label>
                                <input
                                  type="text"
                                  value={translations.fr[`cardRule${i}DescFr`] || ''}
                                  onChange={(e) => updateTranslation('fr', `cardRule${i}DescFr`, e.target.value)}
                                  placeholder="Ex: Engagement pour l'eau potable..."
                                  className="w-full bg-slate-50 dark:bg-slate-950 border rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1 text-right">Description AR ({i})</label>
                                <input
                                  type="text"
                                  value={translations.ar[`cardRule${i}DescAr`] || ''}
                                  onChange={(e) => updateTranslation('ar', `cardRule${i}DescAr`, e.target.value)}
                                  placeholder="مثال: التعهد بالسقاية وتوفير المياه..."
                                  className="w-full bg-slate-50 dark:bg-slate-950 border rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-right"
                                  dir="rtl"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SECTION 4: LIGNES SUPPLÉMENTAIRES PERSONNALISÉES (RECTO & VERSO) */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-amber-400 flex items-center gap-2">
                          <Plus className="w-4 h-4 text-amber-500" />
                          <span>4. Lignes Supplémentaires Personnalisées (Recto & Verso) / أسطر إضافية حسب الحاجة</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {currentLang === 'fr' 
                            ? "Ajoutez d'autres lignes de texte libres. Ces lignes n'apparaissent sur la carte QUE SI elles sont renseignées."
                            : "إضافة أسطر إضافية حسب الحاجة. هذه الأسطر لن تظهر على البطاقة إلا إذا كانت مملوءة."}
                        </p>
                      </div>

                      {/* Front Extra Lines (1..6) */}
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 border-b pb-1">
                          Lignes Supplémentaires Face Avant (Recto) / أسطر إضافية للوجه الأمامي
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={`front-line-${i}`} className="bg-white dark:bg-slate-900 p-3 border rounded-xl space-y-2">
                              <span className="text-[9px] font-bold uppercase text-slate-400">Ligne Recto {i}</span>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={translations.fr[`cardFrontLine${i}Fr`] || ''}
                                  onChange={(e) => updateTranslation('fr', `cardFrontLine${i}Fr`, e.target.value)}
                                  placeholder={`Texte FR ${i}`}
                                  className="w-full bg-slate-50 dark:bg-slate-950 border rounded px-2 py-1 text-xs"
                                />
                                <input
                                  type="text"
                                  value={translations.ar[`cardFrontLine${i}Ar`] || ''}
                                  onChange={(e) => updateTranslation('ar', `cardFrontLine${i}Ar`, e.target.value)}
                                  placeholder={`النص AR ${i}`}
                                  className="w-full bg-slate-50 dark:bg-slate-950 border rounded px-2 py-1 text-xs text-right"
                                  dir="rtl"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Back Extra Lines (1..6) */}
                      <div className="space-y-3 pt-2">
                        <h5 className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 border-b pb-1">
                          Lignes Supplémentaires Face Arrière (Verso) / أسطر إضافية للوجه الخلفي
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={`back-line-${i}`} className="bg-white dark:bg-slate-900 p-3 border rounded-xl space-y-2">
                              <span className="text-[9px] font-bold uppercase text-slate-400">Ligne Verso {i}</span>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={translations.fr[`cardBackLine${i}Fr`] || ''}
                                  onChange={(e) => updateTranslation('fr', `cardBackLine${i}Fr`, e.target.value)}
                                  placeholder={`Texte FR ${i}`}
                                  className="w-full bg-slate-50 dark:bg-slate-950 border rounded px-2 py-1 text-xs"
                                />
                                <input
                                  type="text"
                                  value={translations.ar[`cardBackLine${i}Ar`] || ''}
                                  onChange={(e) => updateTranslation('ar', `cardBackLine${i}Ar`, e.target.value)}
                                  placeholder={`النص AR ${i}`}
                                  className="w-full bg-slate-50 dark:bg-slate-950 border rounded px-2 py-1 text-xs text-right"
                                  dir="rtl"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* 6. Adherents Management Tab */}
                {activeTab === 'adherents' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-blue-700 dark:text-amber-500 flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-amber-500" />
                          <span>Gestion des Cartes Adhérents ("Nous Rejoindre")</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Consultez, validez ou rejetez les demandes d'adhésion. Les membres validés pourront télécharger leur carte d'adhérent recto-verso.
                        </p>
                      </div>
                      
                      {/* Adherents Stats */}
                      <div className="flex gap-2 text-xs">
                        <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl text-center">
                          <p className="text-[9px] font-bold text-slate-500 uppercase">Total Demandes</p>
                          <p className="text-sm font-black text-blue-600">{adherents.length}</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-center">
                          <p className="text-[9px] font-bold text-slate-500 uppercase">En Attente</p>
                          <p className="text-sm font-black text-amber-500">{adherents.filter(a => a.status === 'pending').length}</p>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-center">
                          <p className="text-[9px] font-bold text-slate-500 uppercase">Validées</p>
                          <p className="text-sm font-black text-emerald-600">{adherents.filter(a => a.status === 'approved').length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dr. Soueidane Custom Signature Upload Section */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-100 dark:border-slate-850">
                      <div>
                        <h4 className="text-xs font-bold uppercase text-blue-700 dark:text-amber-400">
                          Signature Électronique Officielle du Président
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Importez ou modifiez la signature électronique du Dr. Soueidane apposée sur les cartes d'adhérents.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {presidentSignature ? (
                          <div className="flex flex-col items-center shrink-0">
                            <span className="text-[9px] text-slate-400 uppercase font-black">Signature Actuelle</span>
                            <img src={presidentSignature} className="h-8 object-contain bg-white dark:bg-slate-900 p-1 border rounded" alt="Signature" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-450 italic">Signature par défaut ("Dr. Soueidane")</span>
                        )}
                        <div className="flex gap-2">
                          <label className="cursor-pointer bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1 shrink-0">
                            <span>Importer</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setPresidentSignature(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          {presidentSignature && (
                            <button
                              onClick={() => setPresidentSignature(null)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-750 text-white font-bold rounded-xl text-xs transition-colors"
                            >
                              Réinitialiser
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Filters and Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl">
                      <div className="flex gap-2">
                        {['all', 'pending', 'approved', 'rejected'].map((st) => (
                          <button
                            key={st}
                            onClick={() => setAdherentFilter(st as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              adherentFilter === st
                                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                                : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100'
                            }`}
                          >
                            {st === 'all' && "Tous"}
                            {st === 'pending' && "En Attente"}
                            {st === 'approved' && "Validés"}
                            {st === 'rejected' && "Refusés"}
                          </button>
                        ))}
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Rechercher nom / téléphone..."
                          value={adherentSearch}
                          onChange={(e) => setAdherentSearch(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* List Grid / Table */}
                    <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-x-auto bg-white dark:bg-slate-950 shadow-sm">
                      <table className="w-full text-xs min-w-[650px]">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-900 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <th className="px-4 py-3 text-left font-black">Photo</th>
                            <th className="px-4 py-3 text-left font-black">Membre</th>
                            <th className="px-4 py-3 text-left font-black">Localisation</th>
                            <th className="px-4 py-3 text-left font-black">WhatsApp</th>
                            <th className="px-4 py-3 text-left font-black">Date d'inscription</th>
                            <th className="px-4 py-3 text-center font-black">Statut</th>
                            <th className="px-4 py-3 text-center font-black">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                          {adherents
                            .filter(adh => {
                              const matchesFilter = adherentFilter === 'all' || adh.status === adherentFilter;
                              const matchesSearch = adh.name.toLowerCase().includes(adherentSearch.toLowerCase()) ||
                                                    adh.phone.includes(adherentSearch) ||
                                                    adh.id.toLowerCase().includes(adherentSearch.toLowerCase());
                              return matchesFilter && matchesSearch;
                            })
                            .length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                                Aucun adhérent ne correspond aux critères de recherche.
                              </td>
                            </tr>
                          ) : (
                            adherents
                              .filter(adh => {
                                const matchesFilter = adherentFilter === 'all' || adh.status === adherentFilter;
                                const matchesSearch = adh.name.toLowerCase().includes(adherentSearch.toLowerCase()) ||
                                                      adh.phone.includes(adherentSearch) ||
                                                      adh.id.toLowerCase().includes(adherentSearch.toLowerCase());
                                return matchesFilter && matchesSearch;
                              })
                              .map((adh) => (
                                <tr key={adh.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                                  <td className="px-4 py-3">
                                    <div className="relative group w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                      {adh.photo ? (
                                        <img src={adh.photo} alt={adh.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      ) : (
                                        <UserCheck className="w-5 h-5 text-slate-400" />
                                      )}
                                      <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                        <Edit2 className="w-3.5 h-3.5 text-white" />
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                updateAdherentPhoto(adh.id, reader.result as string);
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                      </label>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 font-medium">
                                    <div className="text-slate-800 dark:text-slate-200 font-bold flex flex-col">
                                      <span dir="rtl" className="text-amber-600 dark:text-amber-400 font-extrabold">{adh.nameAr || adh.name}</span>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{adh.nameFr || adh.name}</span>
                                    </div>
                                    <div className="text-slate-400 text-[10px] font-mono mt-0.5">ID: {adh.id} | Lang: {adh.lang.toUpperCase()}</div>
                                  </td>
                                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                    <div className="flex flex-col">
                                      <span dir="rtl" className="font-bold text-slate-800 dark:text-slate-200">{adh.cityAr || adh.city}</span>
                                      <span className="text-[10px] text-slate-400">{adh.cityFr || adh.city}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                                    {adh.phone}
                                  </td>
                                  <td className="px-4 py-3 text-slate-400">
                                    {adh.createdAt}
                                  </td>
                                  <td className="px-4 py-3 text-center whitespace-nowrap">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      adh.status === 'approved'
                                        ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20'
                                        : adh.status === 'rejected'
                                        ? 'bg-rose-500/15 text-rose-600 border border-rose-500/20'
                                        : 'bg-amber-500/15 text-amber-600 border border-amber-500/20'
                                    }`}>
                                      {adh.status === 'approved' && "Validé"}
                                      {adh.status === 'rejected' && "Refusé"}
                                      {adh.status === 'pending' && "En attente"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {adh.status !== 'approved' && (
                                        <button
                                          onClick={() => updateAdherentStatus(adh.id, 'approved')}
                                          className="p-1 text-emerald-500 hover:text-emerald-700 bg-emerald-500/5 hover:bg-emerald-500/20 rounded border border-emerald-500/10"
                                          title="Approuver le membre"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      {adh.status !== 'pending' && (
                                        <button
                                          onClick={() => updateAdherentStatus(adh.id, 'pending')}
                                          className="p-1 text-amber-500 hover:text-amber-700 bg-amber-500/5 hover:bg-amber-500/20 rounded border border-amber-500/10"
                                          title="Remettre en attente"
                                        >
                                          <RefreshCw className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      {adh.status !== 'rejected' && (
                                        <button
                                          onClick={() => updateAdherentStatus(adh.id, 'rejected')}
                                          className="p-1 text-rose-500 hover:text-rose-700 bg-rose-500/5 hover:bg-rose-500/20 rounded border border-rose-500/10"
                                          title="Refuser / Rejeter"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => setSelectedPreviewAdherent(adh)}
                                        className="p-1 text-blue-500 hover:text-blue-700 bg-blue-500/5 hover:bg-blue-500/20 rounded border border-blue-500/10"
                                        title="Voir la Carte Recto-Verso"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm('Supprimer définitivement cet adhérent ?')) deleteAdherent(adh.id);
                                        }}
                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                                        title="Supprimer la fiche"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Previews Modal inside Admin view for quick look */}
                    {selectedPreviewAdherent && (
                      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl p-6 text-center space-y-6 relative">
                          <button
                            onClick={() => setSelectedPreviewAdherent(null)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 rounded-xl transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          
                          <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">
                              Aperçu officiel de la Carte Membre
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Fiche adhérent de {selectedPreviewAdherent.name} (Code: {selectedPreviewAdherent.id})
                            </p>
                          </div>

                          <div className="py-2">
                            <MembershipCard adherent={selectedPreviewAdherent} showDownloadButton={true} />
                          </div>

                          <div className="text-xs text-slate-400 flex items-center gap-1 justify-center">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span>La signature électronique officielle de Dr. Soueidane est apposée par défaut.</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 7. Managers Management Tab */}
                {activeTab === 'managers' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-blue-700 dark:text-amber-500 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-amber-500" />
                          <span>Gestion des Gestionnaires (Rubriques & Permissions)</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Créez des comptes pour vos gestionnaires, attribuez-leur des accès spécifiques à certaines rubriques (par exemple, le budget MRU) avec authentification sécurisée.
                        </p>
                      </div>
                    </div>

                    {/* Manager Creation Form */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newManagerUsername.trim() || !newManagerPassword.trim()) return;
                        if (editingManagerId) {
                          updateManager(editingManagerId, {
                            id: editingManagerId,
                            username: newManagerUsername.trim(),
                            password: newManagerPassword,
                            permissions: newManagerPermissions
                          });
                          setEditingManagerId(null);
                        } else {
                          addManager({
                            username: newManagerUsername.trim(),
                            password: newManagerPassword,
                            permissions: newManagerPermissions
                          });
                        }
                        setNewManagerUsername('');
                        setNewManagerPassword('');
                        setNewManagerPermissions([]);
                      }}
                      className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850"
                    >
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-amber-500" />
                        <span>{editingManagerId ? "Modifier le compte gestionnaire" : "Créer un nouveau gestionnaire"}</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Identifiant / Nom d'utilisateur</label>
                          <input
                            type="text"
                            placeholder="Ex: budget_manager"
                            value={newManagerUsername}
                            onChange={(e) => setNewManagerUsername(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mot de passe de connexion</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={newManagerPassword}
                            onChange={(e) => setNewManagerPassword(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      {/* Permissions Choice */}
                      <div className="mb-5">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Autorisations de Rubriques</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'nav_hero', label: "Navbar & Hero" },
                            { id: 'banner', label: "Bannière Défilante" },
                            { id: 'sections', label: "Titres Sections" },
                            { id: 'map_points', label: "Carte & Regions" },
                            { id: 'footer_seo', label: "Footer & SEO" },
                            { id: 'images', label: "Photos Statiques" },
                            { id: 'budget_mru', label: "Budget (MRU)" },
                            { id: 'adherents', label: "Cartes Adhérents" }
                          ].map((p) => {
                            const isChecked = newManagerPermissions.includes(p.id);
                            return (
                              <label key={p.id} className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 border rounded-xl cursor-pointer hover:border-amber-500 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setNewManagerPermissions(prev => prev.filter(x => x !== p.id));
                                    } else {
                                      setNewManagerPermissions(prev => [...prev, p.id]);
                                    }
                                  }}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                                />
                                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{p.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        {editingManagerId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingManagerId(null);
                              setNewManagerUsername('');
                              setNewManagerPassword('');
                              setNewManagerPermissions([]);
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
                          <span>{editingManagerId ? "Sauvegarder les modifications" : "Créer le compte"}</span>
                        </button>
                      </div>
                    </form>

                    {/* Manager list table */}
                    <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-x-auto bg-white dark:bg-slate-900 shadow-sm">
                      <table className="w-full text-xs min-w-[500px]">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <th className="px-4 py-3 text-left font-black">Nom d'utilisateur</th>
                            <th className="px-4 py-3 text-left font-black">Mot de passe</th>
                            <th className="px-4 py-3 text-left font-black">Rubriques Autorisées</th>
                            <th className="px-4 py-3 text-center font-black">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {managers.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">
                                Aucun gestionnaire créé pour le moment.
                              </td>
                            </tr>
                          ) : (
                            managers.map((m) => (
                              <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                                  {m.username}
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-500">
                                  {m.password}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {m.permissions.length === 0 ? (
                                      <span className="text-[10px] text-rose-500 font-bold italic">Aucun accès</span>
                                    ) : (
                                      m.permissions.map((pId) => (
                                        <span key={pId} className="bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">
                                          {pId === 'nav_hero' && "Navbar & Hero"}
                                          {pId === 'banner' && "Bannière Défilante"}
                                          {pId === 'sections' && "Titres Sections"}
                                          {pId === 'map_points' && "Carte & Regions"}
                                          {pId === 'footer_seo' && "Footer & SEO"}
                                          {pId === 'images' && "Photos Statiques"}
                                          {pId === 'budget_mru' && "Budget (MRU)"}
                                          {pId === 'adherents' && "Cartes Adhérents"}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setEditingManagerId(m.id);
                                        setNewManagerUsername(m.username);
                                        setNewManagerPassword(m.password);
                                        setNewManagerPermissions(m.permissions);
                                      }}
                                      className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-amber-500"
                                      title="Modifier"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Supprimer le compte de ${m.username} ?`)) deleteManager(m.id);
                                      }}
                                      className="p-1 text-rose-500 hover:text-rose-700"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
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

      {/* Image Cropper Modal for Admin Assets */}
      <ImageCropperModal
        isOpen={!!cropperRawSrc}
        imageSrc={cropperRawSrc || ''}
        currentLang={currentLang}
        onClose={() => {
          setCropperRawSrc(null);
          setCropperImageKey(null);
        }}
        onCropComplete={(croppedData) => {
          if (cropperImageKey) {
            updateImage(cropperImageKey, croppedData);
          }
          setCropperRawSrc(null);
          setCropperImageKey(null);
        }}
      />
    </>
  );
};

