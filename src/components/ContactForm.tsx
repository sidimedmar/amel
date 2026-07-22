/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Award, Check, User, Phone, MapPin, Globe, 
  Upload, Search, FileDown, ShieldCheck, 
  MessageSquare, Send, ArrowRight, RefreshCw, Eye 
} from 'lucide-react';
import { useEditable } from '../context/EditableContext';
import { HASSI_VILLAGES } from '../data';
import { MembershipCard } from './MembershipCard';

interface RequestForm {
  nameAr: string;
  nameFr: string;
  phone: string;
  cityPreset: string;
  cityAr: string;
  cityFr: string;
  lang: 'fr' | 'ar';
}

export const ContactForm: React.FC = () => {
  const { currentLang, adherents, addAdherent, t } = useEditable();
  
  // Tab states: 'join' or 'status'
  const [activeTab, setActiveTab] = useState<'join' | 'status'>('join');

  // Form state
  const [form, setForm] = useState<RequestForm>({
    nameAr: '',
    nameFr: '',
    phone: '',
    cityPreset: 'Kiffa',
    cityAr: 'كيفه',
    cityFr: 'Kiffa',
    lang: currentLang === 'ar' ? 'ar' : 'fr'
  });
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [submittedId, setSubmittedId] = useState<string>('');
  const [whatsappSentNotify, setWhatsappSentNotify] = useState(false);
  const [phoneUsesWhatsapp, setPhoneUsesWhatsapp] = useState<boolean | null>(null);
  const [alternativePhone, setAlternativePhone] = useState<string>('');
  const [showSimulatedWhatsappNotification, setShowSimulatedWhatsappNotification] = useState(false);

  // Verification state
  const [searchPhone, setSearchPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCityPresetChange = (preset: string) => {
    if (preset === 'Kiffa') {
      setForm(prev => ({ ...prev, cityPreset: preset, cityAr: 'كيفه', cityFr: 'Kiffa' }));
    } else if (preset === 'Nouakchott') {
      setForm(prev => ({ ...prev, cityPreset: preset, cityAr: 'نواكشوط', cityFr: 'Nouakchott' }));
    } else if (preset === 'Nema') {
      setForm(prev => ({ ...prev, cityPreset: preset, cityAr: 'النعمة', cityFr: 'Nema' }));
    } else if (preset === 'Hassi El Bekay') {
      setForm(prev => ({ ...prev, cityPreset: preset, cityAr: 'حاسي البكاي', cityFr: 'Hassi El Bekay' }));
    } else {
      setForm(prev => ({ ...prev, cityPreset: 'custom' }));
    }
  };

  // File upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          photo: currentLang === 'fr' 
            ? "L'image est trop volumineuse (max 2Mo)" 
            : "حجم الصورة كبير جداً (الأقصى 2 ميغابايت)" 
        }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
        setErrors(prev => ({ ...prev, photo: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
        setErrors(prev => ({ ...prev, photo: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nameAr.trim() && !form.nameFr.trim()) {
      newErrors.name = currentLang === 'fr' 
        ? "Le nom complet est obligatoire (en français ou en arabe)" 
        : "الاسم الكامل مطلوب باللغة العربية أو الفرنسية";
    }
    if (!form.phone.trim()) {
      newErrors.phone = currentLang === 'fr' ? "Le numéro WhatsApp est obligatoire" : "رقم الواتساب مطلوب";
    } else if (!/^\+?[0-9\s-]{8,15}$/.test(form.phone.trim())) {
      newErrors.phone = currentLang === 'fr' ? "Numéro invalide (ex: +222 40000000)" : "رقم الهاتف غير صحيح (مثال: 22240000000+)";
    }
    if (!photoBase64) {
      newErrors.photo = currentLang === 'fr' ? "La photo d'identité est obligatoire pour la carte" : "الصورة الشخصية مطلوبة لإنشاء البطاقة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitStatus('submitting');
    
    const finalNameAr = form.nameAr.trim() || form.nameFr.trim();
    const finalNameFr = form.nameFr.trim() || form.nameAr.trim();
    const finalCityAr = form.cityAr.trim() || form.cityFr.trim() || 'كيفه';
    const finalCityFr = form.cityFr.trim() || form.cityAr.trim() || 'Kiffa';

    try {
      const assignedId = await addAdherent({
        name: finalNameAr,
        nameAr: finalNameAr,
        nameFr: finalNameFr,
        phone: form.phone.trim(),
        photo: photoBase64,
        city: finalCityAr,
        cityAr: finalCityAr,
        cityFr: finalCityFr,
        lang: form.lang
      });
      
      setSubmittedId(assignedId);
      setSubmitStatus('success');
      setWhatsappSentNotify(true);
      // Auto-trigger simulated WhatsApp message received notification
      setTimeout(() => {
        setShowSimulatedWhatsappNotification(true);
      }, 1200);
    } catch (err) {
      console.error(err);
    }
  };

  // Status search query
  const handleVerifySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;

    setIsSearching(true);
    setSearchPerformed(true);

    setTimeout(() => {
      // Find matches ignoring whitespaces and +
      const cleanedQuery = searchPhone.replace(/[\s+]/g, '');
      const found = adherents.find(adh => {
        const cleanedAdhPhone = adh.phone.replace(/[\s+]/g, '');
        return cleanedAdhPhone.includes(cleanedQuery) || cleanedQuery.includes(cleanedAdhPhone);
      });

      setSearchResult(found || null);
      setIsSearching(false);
    }, 1000);
  };

  // Generate WhatsApp text messages with both Arabic and French
  const getWhatsAppSubmitText = () => {
    const activeContactPhone = (phoneUsesWhatsapp === false && alternativePhone.trim()) ? alternativePhone.trim() : form.phone;
    const nameArVal = form.nameAr.trim() || form.nameFr.trim();
    const nameFrVal = form.nameFr.trim() || form.nameAr.trim();
    const cityArVal = form.cityAr.trim() || 'كيفه';
    const cityFrVal = form.cityFr.trim() || 'Kiffa';

    const textAr = `مرحباً أمانة حراك أمل، لقد أرسلت للتو طلبي للانتساب.\n` +
        `• الاسم بالعربية: ${nameArVal}\n` +
        `• Nom en Français: ${nameFrVal}\n` +
        `• هاتف التسجيل: ${form.phone}\n` +
        (phoneUsesWhatsapp === false ? `• هاتف الواتساب البديل: ${activeContactPhone}\n` : '') +
        `• المدينة/البلدية: ${cityArVal} / ${cityFrVal}\n` +
        `• رمز الملف: ${submittedId}\n` +
        `الرجاء من الأمانة العامة معالجة طلبي واعتماد بطاقتي وشكراً.`;

    const textFr = `Bonjour Secrétariat Amel, je viens de soumettre ma demande d'adhésion.\n` +
        `• Nom en Arabe: ${nameArVal}\n` +
        `• Nom en Français: ${nameFrVal}\n` +
        `• Tél d'inscription: ${form.phone}\n` +
        (phoneUsesWhatsapp === false ? `• Tél de contact WhatsApp alternatif: ${activeContactPhone}\n` : '') +
        `• Ville/Commune: ${cityFrVal}\n` +
        `• Code de dossier: ${submittedId}\n` +
        `Veuillez valider ma carte d'adhérent s'il vous plaît. Merci.`;

    const combined = `${textAr}\n\n---\n\n${textFr}`;
    return encodeURIComponent(combined);
  };

  const getWhatsAppFollowUpText = (adh: any) => {
    const textAr = `السلام عليكم أمانة حراك أمل، أود الاستفسار عن حالة ملف الانتساب الخاص بي.\n` +
        `• الاسم: ${adh.nameAr || adh.name}\n` +
        `• الهاتف: ${adh.phone}\n` +
        `• حالة الملف: قيد المراجعة\n` +
        `• رمز الملف: ${adh.id}\n` +
        `شكراً جزيلاً لكم.`;

    const textFr = `Bonjour Secrétariat Amel, je souhaite suivre ma demande d'adhésion.\n` +
        `• Nom: ${adh.nameFr || adh.name}\n` +
        `• Tél: ${adh.phone}\n` +
        `• Statut actuel: En attente\n` +
        `• Code de dossier: ${adh.id}\n` +
        `Merci de m'informer de l'avancement.`;

    const combined = `${textAr}\n\n---\n\n${textFr}`;
    return encodeURIComponent(combined);
  };

  const handleResetForm = () => {
    setForm({
      nameAr: '',
      nameFr: '',
      phone: '',
      cityPreset: 'Kiffa',
      cityAr: 'كيفه',
      cityFr: 'Kiffa',
      lang: currentLang === 'ar' ? 'ar' : 'fr'
    });
    setPhotoBase64('');
    setSubmitStatus('idle');
    setSubmittedId('');
    setWhatsappSentNotify(false);
    setPhoneUsesWhatsapp(null);
    setAlternativePhone('');
    setShowSimulatedWhatsappNotification(false);
    setErrors({});
  };

  const isAr = currentLang === 'ar';

  return (
    <section 
      id="contact" 
      className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 relative"
    >
      {/* Floating Simulated WhatsApp Push Notification */}
      {showSimulatedWhatsappNotification && (
        <div className="fixed top-6 right-6 z-[9999] w-full max-w-sm px-4 animate-bounce">
          <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border-l-4 border-emerald-500 p-4 relative overflow-hidden transition-all duration-500">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <span>WhatsApp • Secrétariat Amel</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {isAr ? 'الآن' : 'Maintenant'}
                  </span>
                </div>
                <p className="text-xs font-extrabold text-white mt-1">
                  {isAr ? '📩 تم استلام طلبك بنجاح' : '📩 Demande d\'adhésion reçue !'}
                </p>
                <div className="text-[11px] text-slate-200 mt-1.5 leading-relaxed space-y-1">
                  {isAr ? (
                    <p className="text-right" style={{ direction: 'rtl' }}>
                      مرحباً <strong className="text-amber-400">{form.name}</strong>، لقد تم استلام طلب انتسابك بنجاح وسُجل برمز الملف: <strong className="font-mono text-emerald-300">({submittedId})</strong>. طلبك قيد المعالجة لتنشيط بطاقتك الإلكترونية. شكراً لك!
                    </p>
                  ) : (
                    <p>
                      Bonjour <strong className="text-amber-400">{form.name}</strong>, votre demande d'adhésion a été enregistrée avec succès sous le code dossier : <strong className="font-mono text-emerald-300">({submittedId})</strong>. Elle est en cours de traitement pour activation. Merci!
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setShowSimulatedWhatsappNotification(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 leading-none shrink-0"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            {isAr ? 'الانضمام للحراك الاجتماعي والسياسي' : 'Espace Adhérent & Citoyen'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display mt-3 mb-4 tracking-tight flex items-center justify-center gap-3">
            <Award className="w-8 h-8 text-amber-500 animate-pulse" />
            <span>{isAr ? 'بوابة الانتساب وطلب البطاقات' : 'Nous Rejoindre & Cartes Membres'}</span>
          </h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            {isAr 
              ? 'بوابة رقمية مخصصة لتسجيل الانتساب لحراك أمل حاسي البكاي، تتيح لك رفع صورتك والحصول فوراً على بطاقة عضوية رسمية رقمية (Recto-Verso) قابلة للتنزيل كـ PDF عقب اعتمادها من الإدارة.'
              : 'Déposez votre candidature pour rejoindre notre mouvement citoyen, importez votre photo d\'identité, et téléchargez votre carte officielle recto-verso sous format PDF haute définition.'}
          </p>
        </div>

        {/* Tab Buttons Container */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-900 rounded-2xl border border-slate-300/40 dark:border-slate-800">
            <button
              onClick={() => { setActiveTab('join'); setSearchPerformed(false); }}
              className={`px-5 sm:px-8 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'join'
                  ? 'bg-blue-700 dark:bg-amber-500 text-white dark:text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{isAr ? 'تسجيل انتساب جديد' : 'Demander ma Carte'}</span>
            </button>
            <button
              onClick={() => { setActiveTab('status'); }}
              className={`px-5 sm:px-8 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'status'
                  ? 'bg-blue-700 dark:bg-amber-500 text-white dark:text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{isAr ? 'التحقق وتنزيل بطاقتي' : 'Suivre ma Demande'}</span>
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 shadow-xl overflow-hidden min-h-[500px]">
          
          {activeTab === 'join' ? (
            /* ==================== TAB 1: FORM TO SUBMIT REQUEST ==================== */
            submitStatus !== 'success' ? (
              <form onSubmit={handleJoinSubmit} className="p-8 sm:p-12 space-y-8">
                <div className="border-b border-slate-150 dark:border-slate-800 pb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isAr ? 'استمارة الانتساب لحراك أمل حاسي البكاي' : 'Formulaire d\'Adhésion Officiel'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isAr ? 'يرجى إدخال معلومات صحيحة لضمان إصدار البطاقة بشكل صحيح.' : 'Tous les champs marqués d\'une étoile sont obligatoires.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  
                  {/* Left Column: Fields */}
                  <div className="space-y-6">
                    
                    {/* Full Name Section (Arabic for Recto & French for Verso) */}
                    <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <User className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          {isAr ? 'الاسم الكامل (عربي وفرنسي)' : 'Nom Complet (Arabe & Français)'} *
                        </span>
                      </div>

                      {/* Name in Arabic (Recto) */}
                      <div className="flex flex-col text-right" dir="rtl">
                        <label className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center justify-between">
                          <span>الاسم الكامل باللغة العربية (يظهر في وجه البطاقة Recto) *</span>
                          <span className="text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-black">RECTO (عربي)</span>
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          lang="ar"
                          value={form.nameAr}
                          onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                          placeholder="مثال: أحمد ولد محمد المختار"
                          className={`w-full py-3 px-4 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none transition-all text-right ${
                            errors.name ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-amber-500'
                          }`}
                        />
                      </div>

                      {/* Name in French (Verso) */}
                      <div className="flex flex-col text-left" dir="ltr">
                        <label className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center justify-between">
                          <span>Nom complet en Français (Apparaît sur le Verso) *</span>
                          <span className="text-[9px] bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-black">VERSO (FR)</span>
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={form.nameFr}
                          onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
                          placeholder="Ex: Ahmed Ould Mohamed"
                          className={`w-full py-3 px-4 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none transition-all text-left ${
                            errors.name ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      {errors.name && <p className="text-xs text-red-500 font-semibold mt-1">{errors.name}</p>}
                    </div>

                    {/* WhatsApp Number */}
                    <div className="flex flex-col text-left rtl:text-right">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        {isAr ? 'رقم الهاتف (الواتساب الإلزامي للاتصال)' : 'Numéro de Téléphone WhatsApp'} *
                      </label>
                      <div className="relative font-mono">
                        <Phone className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                        <input
                          type="text"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder={isAr ? 'مثال: 22240000000+' : 'Ex: +222 40000000'}
                          className={`w-full py-3.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none transition-all ${isAr ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4'} ${
                            errors.phone ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {isAr ? 'تنبيه: سيتم إشعارك بحالة البطاقة عبر هذا الرقم وتلقي رابط التنزيل المباشر.' : 'Note: Ce numéro sert d\'identifiant pour vérifier le statut de votre carte.'}
                      </p>
                      {errors.phone && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.phone}</p>}
                    </div>

                    {/* Region / City in Arabic & French */}
                    <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          {isAr ? 'البلدية أو المدينة (عربي وفرنسي)' : 'Ville / Commune (Arabe & Français)'}
                        </span>
                      </div>

                      {/* Preset selector */}
                      <div className="flex flex-col text-left rtl:text-right">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          {isAr ? 'اختر المدينة من القائمة أو خصصها أدناه' : 'Sélectionnez dans la liste ou personnalisez'}
                        </label>
                        <select
                          value={form.cityPreset}
                          onChange={(e) => handleCityPresetChange(e.target.value)}
                          className="w-full py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Kiffa">{isAr ? 'كيفه (لعصابه - المقر الرئيسي) / Kiffa' : 'Kiffa (HQ) / كيفه'}</option>
                          <option value="Nouakchott">{isAr ? 'نواكشوط / Nouakchott' : 'Nouakchott / نواكشوط'}</option>
                          <option value="Nema">{isAr ? 'النعمة / Nema' : 'Nema / النعمة'}</option>
                          <option value="Hassi El Bekay">{isAr ? 'بلدية حاسي البكاي / Hassi El Bekay' : 'Commune Hassi El Bekay / حاسي البكاي'}</option>
                          <option value="custom">{isAr ? 'تخصيص مدينة أخرى...' : 'Autre ville personnalisée...'}</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* City Arabic */}
                        <div className="flex flex-col text-right" dir="rtl">
                          <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1">
                            المدينة بالعربية (الوجه Recto)
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            lang="ar"
                            value={form.cityAr}
                            onChange={(e) => setForm({ ...form, cityAr: e.target.value, cityPreset: 'custom' })}
                            placeholder="كيفه"
                            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 text-right"
                          />
                        </div>

                        {/* City French */}
                        <div className="flex flex-col text-left" dir="ltr">
                          <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1">
                            Ville en FR (Verso)
                          </label>
                          <input
                            type="text"
                            dir="ltr"
                            value={form.cityFr}
                            onChange={(e) => setForm({ ...form, cityFr: e.target.value, cityPreset: 'custom' })}
                            placeholder="Kiffa"
                            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 text-left"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Language Choice */}
                    <div className="flex flex-col text-left rtl:text-right">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        {isAr ? 'لغة البطاقة المفضلة' : 'Langue d\'affichage de la carte'}
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                          <input
                            type="radio"
                            name="lang"
                            checked={form.lang === 'fr'}
                            onChange={() => setForm({ ...form, lang: 'fr' })}
                            className="text-amber-500 focus:ring-amber-500 w-4 h-4"
                          />
                          <span>Français</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                          <input
                            type="radio"
                            name="lang"
                            checked={form.lang === 'ar'}
                            onChange={() => setForm({ ...form, lang: 'ar' })}
                            className="text-amber-500 focus:ring-amber-500 w-4 h-4"
                          />
                          <span>العربية</span>
                        </label>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Photo Upload Area */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block text-left rtl:text-right">
                      {isAr ? 'الصورة الشخصية الرسمية (مربعية الشكل مفضلة)' : 'Photo d\'Identité de l\'Adhérent'} *
                    </label>

                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                        photoBase64 
                          ? 'border-emerald-500/50 bg-emerald-50/5 dark:bg-emerald-950/10' 
                          : errors.photo 
                          ? 'border-red-400 bg-red-50/10' 
                          : 'border-slate-300 dark:border-slate-700 hover:border-amber-500 bg-slate-50 dark:bg-slate-950'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                      />

                      {photoBase64 ? (
                        <div className="relative group">
                          <img 
                            src={photoBase64} 
                            alt="Preview" 
                            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-semibold flex items-center gap-1 justify-center">
                            <Check className="w-4 h-4" />
                            <span>{isAr ? 'تم رفع صورتك بنجاح' : 'Photo chargée avec succès'}</span>
                          </p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-slate-400 mb-3" />
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {isAr ? 'اسحب صورتك هنا أو انقر للتصفح' : 'Glissez-déposez la photo ici'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            PNG, JPG, JPEG (Max 2Mo)
                          </p>
                        </>
                      )}
                    </div>
                    {errors.photo && <p className="text-xs text-red-500 text-center font-semibold">{errors.photo}</p>}
                  </div>

                </div>

                <div className="pt-6 border-t border-slate-150 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitStatus === 'submitting'}
                    className={`px-8 py-4 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition-transform duration-300 active:scale-95 ${
                      submitStatus === 'submitting'
                        ? 'bg-blue-600/60 dark:bg-amber-500/60 cursor-not-allowed'
                        : 'bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950'
                    }`}
                  >
                    {submitStatus === 'submitting' ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>{isAr ? 'جاري إرسال الطلب...' : 'Création en cours...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isAr ? 'إرسال طلب الانضمام والبطاقة' : 'Soumettre ma Demande'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* ==================== TAB 1: SUCCESS PAGE WITH WHATSAPP CONFIRMATION ==================== */
              <div className="p-8 sm:p-12 text-center space-y-8 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div className="space-y-3 max-w-lg mx-auto">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {isAr ? 'تم تسجيل طلبك بنجاح !' : 'Demande d\'adhésion enregistrée !'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {isAr 
                      ? `شكراً لثقتك وانضمامك. تم إنشاء ملف العضوية المؤقت الخاص بك برمز الملف: ${submittedId}. هو حالياً قيد المراجعة للتحقق والاعتماد النهائي من الإدارة.`
                      : `Votre candidature a bien été reçue. Un numéro de dossier temporaire vous a été attribué : ${submittedId}. Nos administrateurs vérifient la validité des informations avant d'approuver définitivement la carte.`}
                  </p>
                </div>

                {/* Simulated automatic Whatsapp notification on-screen */}
                {whatsappSentNotify && (
                  <div className="max-w-md mx-auto space-y-3">
                    {phoneUsesWhatsapp !== false ? (
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 text-left rtl:text-right relative overflow-hidden shadow-sm animate-fade-in">
                        <div className="absolute right-3 top-3 opacity-10">
                          <MessageSquare className="w-16 h-16 text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">
                          {isAr ? '🔔 تم إرسال إشعار تلقائي (WhatsApp)' : '🔔 Confirmation WhatsApp automatique'}
                        </span>
                        <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed font-semibold">
                          {isAr
                            ? `لقد تلقيت للتو رسالة تأكيد "تم استلام الطلب" تلقائياً على رقم الواتساب الخاص بك (${form.phone}): "أهلاً بك في حراك أمل! لقد تم استلام طلب انتسابك بنجاح وسُجل برمز الملف ${submittedId}. ملفك قيد المراجعة والاعتماد الآن."`
                            : `Vous venez de recevoir automatiquement un message WhatsApp de confirmation "Bien reçu" sur votre numéro (${form.phone}) : "Bienvenue chez Amel ! Votre demande d'adhésion a été reçue sous le n°${submittedId}."`}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900 rounded-2xl p-5 text-left rtl:text-right relative overflow-hidden shadow-sm animate-fade-in">
                        <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1">
                          {isAr ? '⚠️ تنبيه: تعذر إرسال الإشعار التلقائي' : '⚠️ Alerte : Accusé de réception non envoyé'}
                        </span>
                        <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed font-semibold">
                          {isAr
                            ? `تنبيه: بما أن الرقم المسجل (${form.phone}) ليس لديه حساب واتساب نشط، لم نتمكن من إرسال إشعار التأكيد التلقائي إليه. لتتمكن أمانة الحركة من تفعيل بطاقتك، يجب عليك إرسال ملفك من هاتف مفعل عليه الواتساب.`
                            : `Attention : Comme le numéro enregistré (${form.phone}) n'a pas de compte WhatsApp actif, nous n'avons pas pu envoyer l'accusé de réception automatique. Pour que le secrétariat valide votre dossier, l'adhérent doit obligatoirement envoyer son dossier depuis un numéro qui utilise WhatsApp.`}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step to verify if the registered number has WhatsApp */}
                <div className="max-w-xl mx-auto bg-slate-50 dark:bg-slate-950/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-left rtl:text-right space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isAr ? 'التحقق من رقم الواتساب' : 'Vérification de votre compte WhatsApp'}
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {isAr
                      ? `هل الرقم الذي قمت بالتسجيل به (${form.phone}) مفعل ومستخدم في تطبيق الواتساب؟`
                      : `Est-ce que le numéro de téléphone avec lequel vous vous êtes inscrit (${form.phone}) est actif sur WhatsApp ?`}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setPhoneUsesWhatsapp(true)}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                        phoneUsesWhatsapp === true
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{isAr ? 'نعم، أستخدم الواتساب على هذا الرقم' : 'Oui, ce numéro a WhatsApp'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoneUsesWhatsapp(false)}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                        phoneUsesWhatsapp === false
                          ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="font-extrabold text-sm leading-none">×</span>
                      <span>{isAr ? 'لا، هذا الرقم ليس لديه واتساب' : 'Non, pas de WhatsApp sur ce numéro'}</span>
                    </button>
                  </div>

                  {phoneUsesWhatsapp === true && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900 rounded-xl animate-fade-in space-y-3 text-left rtl:text-right">
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {isAr
                          ? 'لتسريع مراجعة وتفعيل بطاقتك فوراً، يمكنك إرسال ملفك مباشرة لأمانة الحراك عبر الواتساب بالنقر أدناه:'
                          : 'Pour accélérer la validation de votre carte, vous pouvez envoyer directement votre dossier pré-rempli au secrétariat du mouvement :'}
                      </p>
                      <a
                        href={`https://wa.me/22238363632?text=${getWhatsAppSubmitText()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow transition-all active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4 shrink-0" />
                        <span>{isAr ? 'إرسال الملف عبر الواتساب (222 38 36 36 32)' : 'Envoyer mon dossier au 222 38 36 36 32'}</span>
                      </a>
                    </div>
                  )}

                  {phoneUsesWhatsapp === false && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl animate-fade-in space-y-4 text-left rtl:text-right">
                      <div className="space-y-1.5">
                        <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                          {isAr ? '⚠️ تنبيه هام: الرقم ليس لديه واتساب' : '⚠️ Attention : Numéro sans WhatsApp'}
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {isAr
                            ? 'لتتمكن أمانة الحراك من معالجة وتفعيل ملفك، يجب عليك إرسال رسالة الملف من خلال رقم هاتف مفعل عليه الواتساب. يرجى إدخال رقم هاتف الواتساب البديل أدناه لتعديل الطلب وإرسال ملفك بنجاح:'
                            : 'Pour que le secrétariat puisse traiter votre dossier, vous devez obligatoirement envoyer le dossier depuis un numéro qui utilise WhatsApp. Veuillez saisir votre numéro WhatsApp actif ci-dessous pour mettre à jour votre message de dossier :'}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 max-w-sm">
                        <input
                          type="text"
                          value={alternativePhone}
                          onChange={(e) => setAlternativePhone(e.target.value)}
                          placeholder={isAr ? 'أدخل رقم الواتساب البديل' : 'Autre numéro WhatsApp'}
                          className="flex-1 py-2 px-3 border border-amber-300 dark:border-amber-900 rounded-lg text-xs bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div className="pt-2">
                        <a
                          href={`https://wa.me/22238363632?text=${getWhatsAppSubmitText()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow transition-all active:scale-95"
                        >
                          <MessageSquare className="w-4 h-4 shrink-0" />
                          <span>
                            {isAr 
                              ? `إرسال الملف بالرقم البديل للأمانة (222 38 36 36 32)` 
                              : `Envoyer au secrétariat (222 38 36 36 32)`}
                          </span>
                        </a>
                      </div>
                    </div>
                  )}

                  {phoneUsesWhatsapp === null && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center">
                      {isAr
                        ? 'يرجى تحديد الخيار أعلاه لنتمكن من توجيهك إلى طريقة تفعيل بطاقتك.'
                        : 'Veuillez sélectionner une option ci-dessus pour savoir comment activer votre carte.'}
                    </p>
                  )}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleResetForm}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <span>{isAr ? 'تسجيل منتسب آخر' : 'Nouvelle adhésion'}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            )
          ) : (
            /* ==================== TAB 2: VERIFY AND DOWNLOAD CARD ==================== */
            <div className="p-8 sm:p-12 space-y-8">
              <div className="border-b border-slate-150 dark:border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isAr ? 'التحقق من حالة طلب الانتساب وتنزيل البطاقة' : 'Vérification de Statut & Téléchargement'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isAr ? 'أدخل رقم هاتف الواتساب المستخدم في التسجيل لتنزيل بطاقتك أو تتبع حالتها.' : 'Saisissez le numéro WhatsApp utilisé lors de votre enregistrement pour charger votre carte.'}
                </p>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleVerifySearch} className="flex flex-col sm:flex-row gap-4 max-w-xl">
                <div className="relative flex-1">
                  <Phone className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                  <input
                    type="text"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    placeholder={isAr ? 'أدخل رقم الواتساب (مثال: 22240000000)' : 'Ex: +222 40000000'}
                    className={`w-full py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none transition-all ${isAr ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4'} border-slate-200 dark:border-slate-800 focus:border-amber-500`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-3 bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shrink-0 shadow-md"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isAr ? 'جاري البحث...' : 'Recherche...'}</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>{isAr ? 'تحقق الآن' : 'Rechercher'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Results rendering */}
              {searchPerformed && (
                <div className="pt-6 border-t border-slate-150 dark:border-slate-800 animate-fade-in">
                  {searchResult ? (
                    <div className="space-y-6">
                      
                      {/* Approved membership state */}
                      {searchResult.status === 'approved' ? (
                        <div className="space-y-6">
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                              </div>
                              <div className="text-left rtl:text-right">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {isAr ? 'تم تفعيل بطاقتك بنجاح !' : 'Carte validée et prête !'}
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {isAr 
                                    ? `أهلاً بك في حراك أمل حاسي البكاي. تم اعتماد ملفك برقم ${searchResult.id}. يمكنك الآن معاينة وتنزيل بطاقة الانتساب ذات الوجهين بالكامل كـ PDF.`
                                    : `Félicitations, votre carte d'adhérent sous le numéro ${searchResult.id} est maintenant signée et validée par la présidence.`}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Render actual printable/interactive card */}
                          <MembershipCard adherent={searchResult} showDownloadButton={true} />
                        </div>
                      ) : searchResult.status === 'pending' ? (
                        /* Pending state */
                        <div className="space-y-6 max-w-xl text-left rtl:text-right">
                          <div className="p-5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-300/40 dark:border-amber-500/20 rounded-2xl space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
                                <RefreshCw className="w-5 h-5 animate-spin" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {isAr ? 'طلبك قيد المراجعة والمعالجة' : 'Candidature en cours de traitement'}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {isAr 
                                    ? `أهلاً بك ${searchResult.name}. ملفك برقم (${searchResult.id}) مسجل لدينا وتتم مراجعته حالياً من قبل أمانة الحراك الاجتماعي والسياسي.`
                                    : `Bonjour ${searchResult.name}. Votre dossier numéro ${searchResult.id} a bien été enregistré le ${searchResult.createdAt} et est actuellement en cours de vérification.`}
                                </p>
                              </div>
                            </div>

                            {/* Show temporary card preview without barcode or stamp */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {isAr ? 'معاينة أولية للبطاقة قبل الاعتماد:' : 'Aperçu temporaire de votre carte avant validation :'}
                              </p>
                              <div className="opacity-75 grayscale-50 pointer-events-none scale-95 origin-top">
                                <MembershipCard adherent={searchResult} showDownloadButton={false} />
                              </div>
                            </div>

                            {/* WhatsApp follow-up */}
                            <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl space-y-3">
                              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                {isAr 
                                  ? 'هل ترغب في تسريع الاعتماد أو الاستفسار؟ يمكنك إرسال رسالة تذكير مباشرة للتحقق السريع عبر الواتساب:'
                                  : 'Vous pouvez envoyer une notification de rappel à l\'administrateur par WhatsApp pour activer votre carte :'}
                              </p>
                              <a
                                href={`https://wa.me/22238363632?text=${getWhatsAppFollowUpText(searchResult)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow"
                              >
                                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                                <span>{isAr ? 'متابعة الطلب عبر الواتساب' : 'Suivre par WhatsApp'}</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Rejected state */
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl text-left rtl:text-right flex gap-3">
                          <div className="p-2 bg-red-500/10 text-red-500 rounded-xl shrink-0">
                            <RefreshCw className="w-5 h-5 rotate-45" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {isAr ? 'عذراً، تم رفض طلبك' : 'Désolé, demande rejetée'}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {isAr 
                                ? 'يرجى مراجعة إدارة الحراك أو المحاولة مجدداً برفع صورة دقيقة أو معلومات صحيحة.' 
                                : 'Veuillez contacter le secrétariat pour en savoir plus ou resoumettre une photo de meilleure qualité.'}
                            </p>
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    /* Not found state */
                    <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-lg">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {isAr ? 'لم يتم العثور على أي طلب لهذا الرقم' : 'Aucune demande trouvée pour ce numéro'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isAr 
                          ? `يرجى التأكد من كتابة الرقم بشكل صحيح (مثال: 22240000000) أو قم بتسجيل انتساب جديد في علامة التبويب السابقة.` 
                          : `Veuillez vérifier le numéro saisi ou retourner sur l'onglet "Demander ma Carte" pour remplir le formulaire.`}
                      </p>
                      <button
                        onClick={() => { setActiveTab('join'); handleResetForm(); }}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 text-white rounded-lg font-bold text-xs"
                      >
                        {isAr ? 'تسجيل انتساب جديد الآن' : 'Remplir le formulaire'}
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </section>
  );
};
