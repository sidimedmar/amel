/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, User, Mail, Phone, MapPin, Check, RefreshCw, Award, ArrowRight, Shield } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS, HASSI_VILLAGES } from '../data';
import { Logo } from './Logo';
import { useEditable } from '../context/EditableContext';

interface FormState {
  name: string;
  email: string;
  phone: string;
  village: string;
  message: string;
}

export const ContactForm: React.FC = () => {
  const { currentLang, t } = useEditable();
  
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    village: HASSI_VILLAGES[0],
    message: ''
  });

  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [generatedId, setGeneratedId] = useState<string>('');

  const validate = () => {
    const newErrors: Partial<FormState> = {};
    if (!form.name.trim()) newErrors.name = currentLang === 'fr' ? "Le nom est obligatoire" : "الاسم مطلوب";
    if (!form.phone.trim()) newErrors.phone = currentLang === 'fr' ? "Le téléphone WhatsApp est obligatoire" : "رقم الواتساب مطلوب";
    
    // Check email pattern if provided
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = currentLang === 'fr' ? "Adresse email invalide" : "البريد الإلكتروني غير صحيح";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name as keyof FormState]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');

    // Simulate API storage & virtual card generation
    setTimeout(() => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setGeneratedId(`AMEL-2026-${randomNum}`);
      setStatus('success');
    }, 1500);
  };

  const handleReset = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      village: HASSI_VILLAGES[0],
      message: ''
    });
    setStatus('idle');
  };

  return (
    <section
      id="contact"
      className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-850"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display mb-4 tracking-tight flex items-center justify-center gap-2">
            <Award className="w-8 h-8 text-amber-500" />
            <span>{t.contactTitle}</span>
          </h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t.contactSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
          
          {/* Left panel: Info & Values representation */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <Logo className="w-20 h-20 mb-8 bg-white/10 p-2.5 rounded-2xl border border-white/10" />
                
                <h3 className="text-2xl font-black font-display text-white mb-4">
                  {currentLang === 'fr' ? "Pourquoi vous engager ?" : "لماذا تنتسب إلينا؟"}
                </h3>
                
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-8 font-normal">
                  {currentLang === 'fr' 
                    ? "En devenant membre, vous contribuez activement au développement de nos villages, vous aidez à organiser les secours d'eau et soutenez l'éveil intellectuel de la jeunesse."
                    : "بانضمامك إلينا، تساهم في إحداث تغيير حقيقي بالمنطقة وتدعم بشكل مباشر مشاريع التنمية المحلية والسقاية والتأطير الثقافي للشباب."}
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    { textFr: "Accès prioritaire aux actions de bénévolat", textAr: "الأولوية في المشاركة بالعمل التطوعي" },
                    { textFr: "Intégration au groupe de discussion WhatsApp officiel", textAr: "الانضمamt لمجموعات نقاش الأطر والشباب الرسمية" },
                    { textFr: "Participation aux assemblées électorales locales", textAr: "المساهمة في صياغة القرارات السياسية" },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-slate-200 text-xs sm:text-sm">
                      <div className="p-1 rounded-full bg-amber-500 text-slate-900 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{currentLang === 'fr' ? item.textFr : item.textAr}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verified Badge */}
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                <Shield className="w-8 h-8 text-amber-400 shrink-0" />
                <div className="text-left rtl:text-right">
                  <p className="text-xs text-white font-bold uppercase tracking-wider">
                    {currentLang === 'fr' ? "Mouvement Certifié" : "حراك مدني مرخص"}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {currentLang === 'fr' ? "Sous l'égide du Dr. Soueidane" : "تحت إشراف الدكتور محفوظ ولد اسويدانه"}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right panel: Active Form / Virtual Card */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm min-h-[500px] flex flex-col justify-center">
            
            {status !== 'success' ? (
              <form onSubmit={handleSubmit} className="space-y-6" id="membership-form">
                {/* Name */}
                <div className="flex flex-col text-left rtl:text-right">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    {t.contactName} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder={currentLang === 'fr' ? "Ex: Ahmed Ould Mohamed" : "مثال: أحمد ولد محمد"}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none transition-all ${
                        errors.name
                          ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                          : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name}</p>}
                </div>

                {/* Email (Optional) */}
                <div className="flex flex-col text-left rtl:text-right">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    {t.contactEmail} ({currentLang === 'fr' ? "Optionnel" : "اختياري"})
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Ex: contact@hassi.org"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none transition-all ${
                        errors.email
                          ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                          : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.email}</p>}
                </div>

                {/* Phone WhatsApp */}
                <div className="flex flex-col text-left rtl:text-right">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    {t.contactPhone} *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Ex: +222 4000 0000"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none transition-all ${
                        errors.phone
                          ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                          : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.phone}</p>}
                </div>

                {/* Selected Village Cluster Dropdown */}
                <div className="flex flex-col text-left rtl:text-right">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    {t.contactVillage}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      name="village"
                      value={form.village}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 appearance-none"
                    >
                      {HASSI_VILLAGES.map((v, vIdx) => (
                        <option key={vIdx} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col text-left rtl:text-right">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    {t.contactMessage}
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder={currentLang === 'fr' ? "Vos compétences ou votre message d'appui..." : "اكتب دوافعك للمشاركة أو مؤهلاتك لدعم المبادرة..."}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>

                {/* Submit Trigger */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ${
                    status === 'submitting'
                      ? 'bg-blue-600/70 dark:bg-amber-500/70 cursor-not-allowed'
                      : 'bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-900'
                  }`}
                  id="submit-membership-btn"
                >
                  {status === 'submitting' ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{t.contactSubmitting}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t.contactSubmit}</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              // Sensational UX: Render Virtual Membership Card
              <div className="space-y-6 text-center animate-fade-in" id="membership-receipt-card">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-full text-emerald-600 dark:text-emerald-400 inline-flex mb-2 border border-emerald-100 dark:border-emerald-900">
                  <Check className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-black font-display text-slate-950 dark:text-white">
                  {t.contactSuccessTitle}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                  {t.contactSuccessDesc}
                </p>

                {/* The Virtual Member Card Frame */}
                <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white rounded-2xl p-6 shadow-2xl relative border-2 border-amber-500 overflow-hidden text-left max-w-sm mx-auto">
                  {/* Glowing decoration watermarks */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
                  
                  {/* Header Row */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Logo className="w-10 h-10 bg-white/15 p-1 rounded-lg" />
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
                          أمل حاسي البكاي
                        </p>
                        <p className="text-[8px] text-slate-300">AMEL HASSI EL BKAY</p>
                      </div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-bold tracking-widest">
                      {currentLang === 'fr' ? "MEMBRE ACTIF" : "منتسب نشط"}
                    </span>
                  </div>

                  {/* Card Content Row */}
                  <div className="space-y-3.5 relative z-10">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        {currentLang === 'fr' ? "Nom complet" : "الاسم الكامل"}
                      </p>
                      <p className="text-sm font-bold text-white font-display">
                        {form.name}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          {currentLang === 'fr' ? "Village / Quartier" : "القرية / الحي"}
                        </p>
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {form.village.split(' ')[0]}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          {currentLang === 'fr' ? "Identifiant" : "رقم العضوية"}
                        </p>
                        <p className="text-xs font-mono font-bold text-amber-300">
                          {generatedId}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          {currentLang === 'fr' ? "Adhésion" : "تاريخ الانتساب"}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-300">
                          Juillet 2026
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          {currentLang === 'fr' ? "WhatsApp" : "الواتساب"}
                        </p>
                        <p className="text-[10px] font-mono font-semibold text-slate-300 truncate">
                          {form.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card footer details & signature */}
                  <div className="mt-5 border-t border-white/10 pt-3 flex items-center justify-between text-[8px] text-slate-400">
                    <span>{currentLang === 'fr' ? "Généré numériquement" : "صادر إلكترونياً"}</span>
                    <span className="font-serif italic text-amber-300">Dr. Soueidane Signature</span>
                  </div>

                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700"
                    id="new-adhesion-btn"
                  >
                    <span>{currentLang === 'fr' ? "Nouvelle Adhésion" : "تسجيل انتساب آخر"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
