/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Navigation, Droplets, HeartPulse, GraduationCap, ShieldCheck, ExternalLink, CheckCircle2, Sparkles } from 'lucide-react';
import { useEditable } from '../context/EditableContext';
import { ShareButtons } from './ShareButtons';
import { InterventionPoint } from '../types';

export const INTERVENTION_POINTS: InterventionPoint[] = [
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
  }
];

export const InterventionMap: React.FC = () => {
  const { currentLang, t, interventionPoints } = useEditable();
  const pointsList = interventionPoints && interventionPoints.length > 0 ? interventionPoints : INTERVENTION_POINTS;
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPoint, setSelectedPoint] = useState<InterventionPoint | null>(pointsList[0]);
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');

  React.useEffect(() => {
    if (!selectedPoint && pointsList.length > 0) {
      setSelectedPoint(pointsList[0]);
    } else if (selectedPoint && !pointsList.find(p => p.id === selectedPoint.id)) {
      setSelectedPoint(pointsList[0] || null);
    }
  }, [pointsList]);

  const filteredPoints = pointsList.filter(pt => {
    if (activeCategory === 'all') return true;
    return pt.category === activeCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'water':
        return <Droplets className="w-4 h-4 text-cyan-500" />;
      case 'health':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'youth':
        return <GraduationCap className="w-4 h-4 text-amber-500" />;
      case 'hq':
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      default:
        return <MapPin className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'water':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      case 'health':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'youth':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'hq':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 font-bold';
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    }
  };

  const currentLat = selectedPoint?.lat || 16.6167;
  const currentLng = selectedPoint?.lng || -11.4000;

  return (
    <section id="map" className="py-20 bg-slate-100 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/20">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>
              {t.mapBadge || (currentLang === 'fr' 
                ? "Carte des Interventions & Ancrage Territorial" 
                : "خريطة التدخلات والتواجد الميداني")}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight mb-4">
            {t.mapTitle || (currentLang === 'fr' 
              ? "Zones d'Influence & Actions à Kiffa et Nouakchott et Nema" 
              : "نقاط التدخل والتأثير بكيفه ونواكشوط والنعمة")}
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            {t.mapSubtitle || (currentLang === 'fr' 
              ? "Explorez les points d'adduction d'eau, forages solaires, bureaux de coordination à Nouakchott, caravanes médicales et permanences citoyennes du mouvement Amel Hassi El Bkay." 
              : "استعرض خريطة الآبار، محطات توزيع المياه، مكاتب التنسيق بنواكشوط، والقوافل الطبية والمقرات الشعبية التابعة لحركة أمل حاسي البكاي.")}
          </p>
        </div>

        {/* Category Filters Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'all', labelFr: 'Tous les points', labelAr: 'جميع النقاط' },
            { id: 'hq', labelFr: 'Sièges & Bureaux', labelAr: 'المقرات ومكاتب التنسيق' },
            { id: 'water', labelFr: 'Distribution Eau', labelAr: 'توزيع المياه' },
            { id: 'youth', labelFr: 'Jeunesse & Éducation', labelAr: 'الشباب والتعليم' },
            { id: 'health', labelFr: 'Santé Mobile', labelAr: 'الرعاية الصحية' },
            { id: 'social', labelFr: 'Entraide & Solidarité', labelAr: 'التضامن والدعم الاجتماعي' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveCategory(btn.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeCategory === btn.id
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-black'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80'
              }`}
            >
              {currentLang === 'fr' ? btn.labelFr : btn.labelAr}
            </button>
          ))}
        </div>

        {/* Grid: Interactive Map + Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Map View Frame (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative min-h-[460px] sm:min-h-[540px] flex flex-col">
            
            {/* Map Top Bar */}
            <div className="bg-slate-950/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between z-10 text-white">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  {currentLang === 'fr' 
                    ? `Carte Interactive - ${selectedPoint ? (currentLang === 'fr' ? selectedPoint.locationName.fr : selectedPoint.locationName.ar) : "Kiffa, Nouakchott & Nema"}` 
                    : `خريطة تفاعلية - ${selectedPoint ? (currentLang === 'fr' ? selectedPoint.locationName.fr : selectedPoint.locationName.ar) : "كيفه، نواكشوط والنعمة"}`}
                </span>
              </div>

              {/* Satellite / Street Map Toggle */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
                <button
                  onClick={() => setMapType('street')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${mapType === 'street' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}
                >
                  {currentLang === 'fr' ? "Plan" : "خريطة"}
                </button>
                <button
                  onClick={() => setMapType('satellite')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${mapType === 'satellite' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}
                >
                  {currentLang === 'fr' ? "Satellite" : "أقمار صناعية"}
                </button>
              </div>
            </div>

            {/* Live Interactive Embed dynamically centered on selected location */}
            <div className="relative flex-1 w-full bg-slate-950 min-h-[400px]">
              <iframe
                title="Interactive Intervention Map"
                className="w-full h-full min-h-[420px] sm:min-h-[480px] border-0 filter brightness-95 contrast-105"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentLng - 0.05}%2C${currentLat - 0.05}%2C${currentLng + 0.05}%2C${currentLat + 0.05}&layer=${mapType === 'satellite' ? 'hot' : 'mapnik'}&marker=${currentLat}%2C${currentLng}`}
                loading="lazy"
              />

              {/* Custom Interactive Pins Overlay representing the selected point */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-end">
                <div className="bg-slate-950/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-white max-w-sm shadow-xl pointer-events-auto">
                  <p className="text-[11px] font-mono text-amber-400 font-bold mb-1 uppercase tracking-wider">
                    {currentLang === 'fr' ? "Sélectionnez un point sur la liste" : "اختر نقطة من القائمة لاستعراض التفاصيل"}
                  </p>
                  <p className="text-xs text-slate-300">
                    {selectedPoint 
                      ? (currentLang === 'fr' ? selectedPoint.title.fr : selectedPoint.title.ar)
                      : (currentLang === 'fr' ? "Cliquez ci-contre pour voir les détails" : "انقر لرؤية التفاصيل")}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Intervention Points List & Details Panel (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* List of Sites */}
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span>{currentLang === 'fr' ? "Lieux d'intervention" : "مواقع التدخل"}</span>
                <span className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                  {filteredPoints.length}
                </span>
              </h3>

              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {filteredPoints.map(point => {
                  const isSelected = selectedPoint?.id === point.id;
                  return (
                    <div
                      key={point.id}
                      onClick={() => setSelectedPoint(point)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/60 dark:bg-amber-500/20 shadow-md ring-2 ring-amber-500/30'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${getCategoryBadgeClass(point.category)}`}>
                          {getCategoryIcon(point.category)}
                        </div>
                        <div className="flex-1 min-w-0 text-left rtl:text-right">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {currentLang === 'fr' ? point.title.fr : point.title.ar}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate">{currentLang === 'fr' ? point.locationName.fr : point.locationName.ar}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Card for Selected Point */}
            {selectedPoint && (
              <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden animate-fade-in">
                
                {/* Image header */}
                <div className="relative h-32 rounded-2xl overflow-hidden mb-4 border border-white/10">
                  <img
                    src={selectedPoint.image}
                    alt={currentLang === 'fr' ? selectedPoint.title.fr : selectedPoint.title.ar}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(selectedPoint.category)}`}>
                      {currentLang === 'fr' ? selectedPoint.locationName.fr : selectedPoint.locationName.ar}
                    </span>
                    
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{currentLang === 'fr' ? "Actif" : "نشط"}</span>
                    </span>
                  </div>
                </div>

                {/* Title & Desc */}
                <h4 className="text-base font-bold font-display text-white mb-2 text-left rtl:text-right">
                  {currentLang === 'fr' ? selectedPoint.title.fr : selectedPoint.title.ar}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed mb-4 text-left rtl:text-right">
                  {currentLang === 'fr' ? selectedPoint.description.fr : selectedPoint.description.ar}
                </p>

                {/* Impact Highlight */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-xs font-bold text-amber-300">
                    {currentLang === 'fr' ? selectedPoint.impactStats.fr : selectedPoint.impactStats.ar}
                  </p>
                </div>

                {/* External Google Maps directions + Share */}
                <div className="pt-3 border-t border-slate-800 flex flex-col gap-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedPoint.lat},${selectedPoint.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{currentLang === 'fr' ? "Ouvrir dans Google Maps" : "فتح الموقع في خرائط Google"}</span>
                  </a>

                  {/* Share buttons */}
                  <ShareButtons
                    title={currentLang === 'fr' ? selectedPoint.title.fr : selectedPoint.title.ar}
                    description={currentLang === 'fr' ? selectedPoint.description.fr : selectedPoint.description.ar}
                    currentLang={currentLang}
                    compact={true}
                  />
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
