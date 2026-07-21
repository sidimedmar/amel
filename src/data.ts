/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TranslationDict, ValueCard, CampaignItem, GalleryItem, TestimonialItem, TimelineEvent, FAQItem } from './types';

// Let's import the generated image paths. We will define them as relative paths so they resolve correctly in React.
export const IMAGES = {
  hero: '/src/assets/images/hassi_elbkay_hero_1784646659688.jpg',
  water: '/src/assets/images/water_distribution_1784646680966.jpg',
  // High quality authentic local images (replaces all unsplash references)
  political: '/src/assets/images/mauritanian_assembly_meeting_1784649421682.jpg',
  community: '/src/assets/images/mauritanian_carpet_gathering_1784649438139.jpg',
  youth: '/src/assets/images/mauritanian_youth_carpet_1784649783373.jpg',
  well: '/src/assets/images/mauritania_desert_well_1784649452573.jpg',
  // Facebook page images recreated
  facebookCistern: '/src/assets/images/mauritania_desert_water_tanker_1784649402425.jpg',
  facebookMeeting: '/src/assets/images/mauritanian_assembly_meeting_1784649421682.jpg',
  facebookGathering: '/src/assets/images/mauritanian_carpet_gathering_1784649438139.jpg',
  facebookWell: '/src/assets/images/mauritania_desert_well_1784649452573.jpg',
  facebookLineup: '/src/assets/images/mauritanian_group_lineup_1784649763868.jpg',
  facebookYouthCarpet: '/src/assets/images/mauritanian_youth_carpet_1784649783373.jpg',
  facebookPoster: '/src/assets/images/dr_soueidane_civic_poster_1784649797098.jpg',
  facebookMeetingWomen: '/src/assets/images/mauritanian_meeting_women_1784649809981.jpg',
};

export const TRANSLATIONS: Record<'fr' | 'ar', TranslationDict> = {
  fr: {
    navHome: "Accueil",
    navValues: "Nos Piliers",
    navCampaigns: "Nos Actions",
    navGallery: "Galerie",
    navTimeline: "Notre Histoire",
    navFAQ: "FAQ",
    navContact: "Nous Rejoindre",
    
    heroBadge: "Mouvement Social & Politique à Kiffa",
    heroTitle: "L'Espoir de Hassi El Bekay",
    heroSubtitle: "Sous la direction du Dr. Mahfoudh Ould Soueidane, nous unissons la jeunesse, les cadres et les citoyens de Hassi El Bekay pour la sensibilisation, la solidarité active et le développement durable.",
    heroCTA: "Rejoindre le Mouvement",
    heroSecondaryCTA: "Découvrir nos actions",
    
    valuesTitle: "Les Trois Piliers de Notre Engagement",
    valuesSubtitle: "Gravés au cœur de notre identité, ces principes guident chacune de nos actions sur le terrain.",
    value1Title: "Conscience (وعي)",
    value1Desc: "Renforcer l'éducation civique, informer les populations sur leurs droits, et former la jeunesse à devenir des leaders responsables de demain.",
    value2Title: "Participation (مشاركة)",
    value2Desc: "S'impliquer activement dans les instances politiques et civiles pour porter haut la voix et les revendications de nos villages.",
    value3Title: "Développement (تنمية)",
    value3Desc: "Apporter des solutions concrètes aux besoins vitaux, comme l'accès à l'eau potable, l'entraide sociale et la valorisation économique locale.",

    campaignsTitle: "Campagnes Clés sur le Terrain",
    campaignsSubtitle: "De la crise de l'eau aux alliances politiques structurantes, découvrez comment nous transformons la vie locale.",
    campaignStatusOngoing: "En Cours",
    campaignStatusCompleted: "Réalisé",
    campaignLearnMore: "Voir les détails",

    galleryTitle: "Témoignages Visuels",
    gallerySubtitle: "Moments forts de nos rassemblements politiques, campagnes humanitaires de distribution d'eau et chantiers communautaires.",
    galleryFilterAll: "Tout",
    galleryFilterWater: "Campagne d'Eau",
    galleryFilterPolitical: "Rassemblements",
    galleryFilterCommunity: "Vie Citoyenne",

    timelineTitle: "Chronologie de Notre Impact",
    timelineSubtitle: "Suivez l'évolution du mouvement, des premiers rassemblements de quartier jusqu'aux alliances régionales majeures.",

    faqTitle: "Questions Fréquentes",
    faqSubtitle: "Tout savoir sur le mouvement Amel Hassi El Bekay, ses objectifs et son mode de fonctionnement.",

    contactTitle: "Devenir Membre Actif",
    contactSubtitle: "Rejoignez des centaines de jeunes et de cadres engagés pour Hassi El Bekay. Remplissez le formulaire d'adhésion pour participer à l'aventure.",
    contactName: "Nom Complet",
    contactEmail: "Adresse Email",
    contactPhone: "Numéro de Téléphone (WhatsApp)",
    contactVillage: "Votre Village / Quartier",
    contactMessage: "Pourquoi souhaitez-vous nous rejoindre ?",
    contactSubmit: "Soumettre ma Demande",
    contactSubmitting: "Enregistrement en cours...",
    contactSuccessTitle: "Demande Envoyée avec Succès !",
    contactSuccessDesc: "Merci pour votre engagement. Votre reçu de membre virtuel a été généré. Notre équipe vous contactera par WhatsApp très bientôt.",
    contactSuccessCTA: "Fermer",
    footerText: "Mouvement civique et politique œuvrant pour l'émancipation, le développement et la représentativité équitable des populations de Hassi El Bekay (Kiffa, Mauritanie).",
    footerRights: "Tous droits réservés. Conçu pour le progrès social et la solidarité nationale.",
    footerSEOInfo: "Amel Hassi El Bekay - Dr. Mahfoudh Ould Soueidane - Kiffa - Mauritanie - El Insaf",
    footerLeader: "Dr. Mahfoudh Ould Soueidane",
    footerPhoneLabel: "WhatsApp & Appel",
    footerPhoneVal: "+222 4673 3465",
    footerEmailLabel: "Adresse Email",
    footerEmailVal: "contact@hassi-elbkay.org",
    footerAddressLabel: "Quartier Général",
    footerAddressVal: "Hassi El Bekay, Commune de Kiffa, Mauritanie",
    footerShortcutsHeading: "Raccourcis",
    footerContactHeading: "Coordonnées de l'Initiative"
  },
  ar: {
    navHome: "الرئيسية",
    navValues: "مرتكزاتنا",
    navCampaigns: "أنشطتنا",
    navGallery: "معرض الصور",
    navTimeline: "مسارنا التاريخي",
    navFAQ: "الأسئلة الشائعة",
    navContact: "انضم إلينا",
    
    heroBadge: "حراك اجتماعي وسياسي في كيفه",
    heroTitle: "أمل حاسي البكاي",
    heroSubtitle: "بقيادة الدكتور محفوظ ولد اسويدانه، نجمع طاقات الشباب، الأطر والفاعلين في حاسي البكاي من أجل التوعية، التنمية والتمثيل العادل والمشاركة الفعالة.",
    heroCTA: "انضم إلى المبادرة",
    heroSecondaryCTA: "اكتشف أنشطتنا",
    
    valuesTitle: "المرتكزات الثلاثة لرؤيتنا",
    valuesSubtitle: "مبادئ راسخة مستوحاة من شعارنا توجه كل خطوة نخطوها لخدمة المجتمع.",
    value1Title: "وعي",
    value1Desc: "ترسيخ الثقافة المدنية، توعية السكان بحقوقهم، وتأهيل الشباب ليكونوا قادة التغيير الإيجابي وبناء المستقبل.",
    value2Title: "مشاركة",
    value2Desc: "المشاركة الفعالة في المشهد السياسي والمدني لإيصال صوت سكان قرى حاسي البكاي إلى مراكز صنع القرار.",
    value3Title: "تنمية",
    value3Desc: "تقديم حلول ملموسة للاحتياجات الأساسية كأزمة المياه، ومشاريع التضامن الاجتماعي لتعزيز صمود القرى.",

    campaignsTitle: "حملاتنا الميدانية",
    campaignsSubtitle: "من حملات السقاية لمواجهة العطش إلى اللقاءات السياسية الكبرى، نحدث الفارق على الأرض.",
    campaignStatusOngoing: "جاري",
    campaignStatusCompleted: "منجز",
    campaignLearnMore: "عرض التفاصيل",

    galleryTitle: "التوثيق المرئي",
    gallerySubtitle: "لحظات قوية من لقاءاتنا السياسية، وحملاتنا الإنسانية لتوزيع المياه، والأنشطة المجتمعية.",
    galleryFilterAll: "الكل",
    galleryFilterWater: "حملة السقاية",
    galleryFilterPolitical: "اللقاءات",
    galleryFilterCommunity: "النشاط المدني",

    timelineTitle: "مسار الأثر والتمكين",
    timelineSubtitle: "تابع تطور الحراك من أولى اللقاءات المحلية إلى التحالفات الإقليمية الكبرى.",

    faqTitle: "الأسئلة الشائعة",
    faqSubtitle: "كل ما تود معرفته عن حراك أمل حاسي البكاي، أهدافه وكيفية الإسهام فيه.",

    contactTitle: "استمارة الانضمام والانتساب",
    contactSubtitle: "سجل الآن لتكون جزءاً من هذا المشروع الطموح الساعي للتغيير الإيجابي والتنمية في حاسي البكاي.",
    contactName: "الاسم الكامل",
    contactEmail: "البريد الإلكتروني",
    contactPhone: "رقم الهاتف (الواتساب)",
    contactVillage: "القرية / الحي",
    contactMessage: "ما هي دوافع انضمامك إلينا؟",
    contactSubmit: "إرسال طلب الانتساب",
    contactSubmitting: "جاري تسجيل البيانات...",
    contactSuccessTitle: "تم إرسال طلبك بنجاح!",
    contactSuccessDesc: "نشكرك على انضمامك. تم إصدار بطاقة انتساب افتراضية مؤقتة. سيتواصل معك أحد منسقينا عبر الواتساب في أقرب وقت.",
    contactSuccessCTA: "إغلاق",

    footerText: "حراك شبابي وسياسي يعمل من أجل وعي وتنمية وتمثيل عادل لسكان قرى حاسي البكاي ببلدية كيفه، موريتانيا.",
    footerRights: "جميع الحقوق محفوظة. حراك أمل حاسي البكاي.",
    footerSEOInfo: "أمل حاسي البكاي - الدكتور محفوظ ولد اسويدانه - كيفه - الإنصاف - موريتانيا",
    footerLeader: "الدكتور محفوظ ولد اسويدانه",
    footerPhoneLabel: "واتساب واتصال",
    footerPhoneVal: "+222 4673 3465",
    footerEmailLabel: "البريد الإلكتروني",
    footerEmailVal: "contact@hassi-elbkay.org",
    footerAddressLabel: "المقر الرئيسي",
    footerAddressVal: "حاسي البكاي، بلدية كيفه، موريتانيا",
    footerShortcutsHeading: "روابط سريعة",
    footerContactHeading: "معلومات الاتصال"
  }
};

export const VALUE_CARDS: ValueCard[] = [
  {
    id: "value_awareness",
    icon: "book",
    title: { fr: "وعي (Conscience)", ar: "وعي" },
    desc: {
      fr: "Nous soutenons la scolarité, la formation et l'éveil intellectuel de la jeunesse pour contrer l'ignorance et créer une élite engagée.",
      ar: "نعمل على دعم التعليم والتثقيف وبناء جيل واعٍ متسلح بالمعرفة ليشارك بفعالية في مسيرة البناء والتغيير."
    },
    color: "from-blue-600 to-indigo-700"
  },
  {
    id: "value_participation",
    icon: "users",
    title: { fr: "مشاركة (Participation)", ar: "مشاركة" },
    desc: {
      fr: "Une inclusion active dans la vie civique locale et le processus démocratique en coordination with le parti au pouvoir (El Insaf).",
      ar: "المشاركة السياسية والمدنية الواسعة لضمان إيصال أصوات ومطالب تجمعاتنا السكنية والدفاع عنها بنزاهة."
    },
    color: "from-amber-500 to-yellow-600"
  },
  {
    id: "value_development",
    icon: "sprout",
    title: { fr: "تنمية (Développement)", ar: "تنمية" },
    desc: {
      fr: "De l'adduction d'eau potable au soutien sanitaire, nous finançons des projets pour améliorer la résilience des familles face à la précarité.",
      ar: "إطلاق المبادرات التنموية الحيوية، وتوفير الخدمات الأساسية كالسقاية والمساعدات الإنسانية والاجتماعية المستمرة."
    },
    color: "from-emerald-600 to-teal-700"
  }
];

export const CAMPAIGNS_DATA: CampaignItem[] = [
  {
    id: "camp_water_relief",
    title: {
      fr: "Campagne Majeure d'Alimentation en Eau Potable",
      ar: "حملة السقاية الكبرى لمواجهة العطش"
    },
    description: {
      fr: "Distribution gratuite d'eau potable par camions-citernes dans les villages de Hassi El Bekay touchés par une grave pénurie estivale.",
      ar: "تسيير صهاريج مياه صالحة للشرب لصالح القرى الأكثر تضرراً من أزمة عطش الصيف في عموم تجمعات حاسي البكاي."
    },
    longDescription: {
      fr: "Durant la saison sèche, les nappes phréatiques s'épuisent et les forages locaux peinent à subvenir aux besoins. Notre mouvement a loué et mobilisé des camions-citernes pour distribuer des dizaines de tonnes d'eau par jour dans les quartiers reculés. Cette action d'urgence a soulagé des centaines de familles.",
      ar: "خلال فصل الصيف الحار، تتراجع مستويات المياه الجوفية وتتفاقم أزمة العطش بشكل حاد. تجاوباً مع نداء الاستغاثة، بادر حراكنا بتأجير وإطلاق شاحنات صهاريج ضخمة لنقل وتوزيع مئات الأطنان من المياه العذبة يومياً، مما أسهم في فك الخناق عن مئات الأسر في القرى المعزولة."
    },
    date: { fr: "Juin 2026", ar: "يونيو 2026" },
    status: "completed",
    image: IMAGES.water,
    category: "water",
    stats: [
      { label: { fr: "Litres Distribués", ar: "لتر من الماء" }, value: "350,000+" },
      { label: { fr: "Villages Bénéficiaires", ar: "قرية مستفيدة" }, value: "12" },
      { label: { fr: "Familles Soutenues", ar: "أسرة مدعومة" }, value: "850+" }
    ]
  },
  {
    id: "camp_political_rally",
    title: {
      fr: "Rassemblement de l'Espoir & Coopération Politique",
      ar: "مؤتمر كتلة أمل لدعم الإصلاح والتحالف"
    },
    description: {
      fr: "Assemblée générale des cadres et jeunes avec les représentants du parti El Insaf pour appuyer le programme national de développement.",
      ar: "لقاءات تشاورية كبرى جمعت شباب وأطر الحراك بوفد قيادي من حزب الإنصاف لترسيخ التعاون السياسي والتنموي."
    },
    longDescription: {
      fr: "Sous l'égide du Dr. Soueidane, nous avons organisé plusieurs meetings politiques majeurs. L'objectif : structurer la voix des jeunes et des cadres de Kiffa, consolider notre alliance stratégique avec le parti El Insaf, et s'assurer que les besoins en infrastructures routières, sanitaires et scolaires soient portés à l'agenda national.",
      ar: "تحت رعاية الدكتور محفوظ ولد اسويدانه، تم عقد تجمعات سياسية حاشدة لتأطير العمل الشبابي والنسوي بحاسي البكاي. اللقاءات توجت بتعزيز التنسيق مع قيادة حزب الإنصاف ودعم برنامج فخامة رئيس الجمهورية، مع تقديم عريضة مطلبية تشمل فك العزلة وتحسين الخدمات الصحية والمدرسية."
    },
    date: { fr: "Juillet 2026", ar: "يوليو 2026" },
    status: "ongoing",
    image: IMAGES.political,
    category: "political",
    stats: [
      { label: { fr: "Participants Actifs", ar: "مشارك في المؤتمرات" }, value: "1,200+" },
      { label: { fr: "Cadres Engagés", ar: "إطار ووجيه مسجل" }, value: "45" },
      { label: { fr: "Accords Signés", ar: "بروتوكولات تنسيق" }, value: "3" }
    ]
  },
  {
    id: "camp_youth_mentorship",
    title: {
      fr: "Caravane Culturelle et Soutien Scolaire",
      ar: "قافلة التوعية الثقافية ودعم التعليم"
    },
    description: {
      fr: "Cours de soutien gratuits pour les candidats aux examens nationaux et caravane de sensibilisation sur la citoyenneté.",
      ar: "تنظيم فصول تقوية مجانية للمقبلين على المسابقات الوطنية مع جولات لتشجيع التمدرس ومحاربة الأمية."
    },
    longDescription: {
      fr: "Conformément au pilier Conscience (وعي), nos jeunes diplômés ont dispensé des cours d'appui intensifs en mathématiques, sciences et langues aux élèves de Hassi El Bekay. En parallèle, nous menons des séminaires communautaires sur l'importance du vote, la citoyenneté et la lutte contre le chômage des jeunes.",
      ar: "انطلاقاً من مبدأ الوعي، تطوع نخبة من معلمي وأساتذة الحراك لتقديم دروس تقوية مكثفة لطلاب الشهادات الوطنية في قرى البلدية. واكب ذلك ورش عمل توعوية حول دور الشباب في التنمية المحلية والوقاية من السلوكيات الضارة وحث المجتمع على ضرورة تمكين المرأة والشباب."
    },
    date: { fr: "Juillet 2026", ar: "يوليو 2026" },
    status: "ongoing",
    image: IMAGES.community,
    category: "community",
    stats: [
      { label: { fr: "Élèves Accompagnés", ar: "تلميذ مستفيد" }, value: "180" },
      { label: { fr: "Enseignants Volontaires", ar: "مدرس متطوع" }, value: "14" },
      { label: { fr: "Conférences Civiques", ar: "ندوة تثقيفية" }, value: "6" }
    ]
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal_water_1",
    src: IMAGES.water,
    category: "water",
    title: { fr: "Distribution d'Eau Potable - Hassi El Bekay", ar: "حملة توزيع المياه الصالحة للشرب" },
    description: { fr: "Notre camion-citerne approvisionnant les familles dans les quartiers les plus touchés par la sécheresse.", ar: "صهريج المياه التابع للحراك يغذي العائلات في الأحياء الأكثر تضرراً من موجة الجفاف." }
  },
  {
    id: "gal_political_1",
    src: IMAGES.political,
    category: "political",
    title: { fr: "Rassemblement Politique de l'Espoir", ar: "المؤتمر السياسي لكتلة أمل" },
    description: { fr: "Réunion des cadres du mouvement avec la coordination du parti El Insaf pour discuter des besoins d'infrastructure.", ar: "اجتماع أطر ومنتسبي الحراك مع منسقية حزب الإنصاف لمناقشة الاحتياجات الخدمية والتنموية." }
  },
  {
    id: "gal_community_1",
    src: IMAGES.community,
    category: "community",
    title: { fr: "Réunion Communautaire sous la Tente", ar: "اللقاء التشاوري تحت الخيمة الموريتانية" },
    description: { fr: "Session d'échange civique avec les sages et les résidents des villages pour identifier les priorités locales.", ar: "جلسة حوارية مع الوجهاء والشباب لتحديد أولويات التدخل الاجتماعي والتنموي في القرى." }
  },
  {
    id: "gal_water_2",
    src: IMAGES.well,
    category: "water",
    title: { fr: "Forage d'un Puits Communautaire", ar: "بئر المياه الرعوي في الصحراء" },
    description: { fr: "Aménagement d'une zone d'abreuvoir et point d'eau sécurisé pour les éleveurs et habitants des villages.", ar: "توفير نقطة مياه آمنة وسقاية للمواشي لصالح المنمين وسكان القرى الرعوية." }
  },
  {
    id: "gal_political_2",
    src: IMAGES.facebookLineup,
    category: "political",
    title: { fr: "Alignement des Cadres du Mouvement", ar: "اصطفاف أطر ومنسقي حراك أمل" },
    description: { fr: "Les dirigeants du mouvement unis pour le changement et le développement inclusif de Kiffa.", ar: "قادة الحراك مصطفون دعماً للتغيير الإيجابي والتنمية الشاملة في كيفه." }
  },
  {
    id: "gal_community_2",
    src: IMAGES.facebookYouthCarpet,
    category: "community",
    title: { fr: "Session d'Orientation de la Jeunesse", ar: "اجتماع اللجنة الشبابية للحراك" },
    description: { fr: "Les jeunes cadres planifiant les caravanes de sensibilisation civique et de cours de soutien.", ar: "الشباب يخططون لإطلاق قوافل التوعية المدنية وفصول التقوية الدراسية." }
  },
  {
    id: "gal_political_3",
    src: IMAGES.facebookPoster,
    category: "political",
    title: { fr: "Affiche Civique - Dr. Mahfoudh", ar: "الملصق الإعلامي للدكتور محفوظ" },
    description: { fr: "Poster présentant la charte d'Amel Hassi El Bekay et l'importance de l'engagement civique.", ar: "ملصق يعرض ميثاق حراك أمل حاسي البكاي وأهمية المشاركة الفعالة." }
  },
  {
    id: "gal_community_3",
    src: IMAGES.facebookMeetingWomen,
    category: "community",
    title: { fr: "Rassemblement des Femmes du Mouvement", ar: "الاجتماع النسوي الكبير للحراك" },
    description: { fr: "Mobilisation exceptionnelle de la commission des femmes pour l'autonomisation et l'éveil social.", ar: "حشد مميز للجنة النسائية لدعم التمكين والتعليم والتثقيف الاجتماعي." }
  }
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "test_1",
    name: { fr: "Moustapha Ould Brahim", ar: "مصطفى ولد إبراهيم" },
    role: { fr: "Représentant des jeunes, Village de Hassi El Bekay", ar: "ممثل شبابي، قرى حاسي البكاي" },
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    quote: {
      fr: "Grâce à la campagne d'eau lancée par le Dr. Mahfoudh Ould Soueidane, nos enfants n'ont plus à marcher des kilomètres sous un soleil de plomb. Amel Hassi El Bekay agit là où d'autres se contentent de promettre.",
      ar: "بفضل حملة السقاية التي أطلقها الدكتور محفوظ ولد اسويدانه، لم يعد أطفالنا بحاجة لقطع مسافات طويلة تحت الشمس الحارقة لجلب الماء."
    }
  },
  {
    id: "test_2",
    name: { fr: "Dr. Aminata Dia", ar: "د. أميناتا ديا" },
    role: { fr: "Cadre universitaire, originaire de Kiffa", ar: "أستاذ جامعي، من أطر مقاطعة كيفه" },
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
    quote: {
      fr: "Amel Hassi El Bekay réinvente le militantisme à Kiffa. C'est l'alliance parfaite entre l'expertise des cadres universitaires et la dynamique de terrain des jeunes. C'est l'espoir du renouveau régional.",
      ar: "حراك أمل حاسي البكاي يمثل نموذجاً متميزاً للعمل السياسي والتنموي في كيفه، حيث يجمع بين النخبة الأكاديمية وحماسة الشباب الميداني لخدمة القضايا العادلة."
    }
  }
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "time_1",
    date: { fr: "Janvier 2026", ar: "يناير 2026" },
    title: { fr: "La Naissance de l'Idée", ar: "تبلور الفكرة والتشاور الأول" },
    description: {
      fr: "Premières réunions informelles convoquées par le Dr. Mahfoudh Ould Soueidane avec de jeunes diplômés chômeurs et des notables à Kiffa.",
      ar: "عقد أولى الجلسات التشاورية بمبادرة من الدكتور محفوظ مع مجموعة من حملة الشهادات ووجهاء كيفه لتشخيص العقبات التنموية."
    },
    iconName: "lightbulb"
  },
  {
    id: "time_2",
    date: { fr: "Avril 2026", ar: "أبريل 2026" },
    title: { fr: "Lancement Officiel de la Charte", ar: "إطلاق ميثاق أمل حاسي البكاي" },
    description: {
      fr: "Rédaction collective de la charte reposant sur les 3 piliers (وعي, مشاركة, تنمية) et adhésion de plus de 300 membres initiaux.",
      ar: "صياغة الميثاق التأسيسي القائم على المرتكزات الثلاثة (وعي - مشاركة - تنمية) والتوقيع عليه من طرف أزيد من 300 عضو مؤسس."
    },
    iconName: "scroll"
  },
  {
    id: "time_3",
    date: { fr: "Juin 2026", ar: "يونيو 2026" },
    title: { fr: "Action Eau Solidaire (Séquaya)", ar: "إطلاق حملة السقاية الكبرى" },
    description: {
      fr: "Lancement de la caravane d'eau potable d'urgence face aux vagues de chaleur, touchant directement 12 villages assoiffés.",
      ar: "بدء حملة سقاية كبرى بتوفير صهاريج المياه الصالحة للشرب لفك العزلة والعطش عن 12 قرية متضررة."
    },
    iconName: "droplet"
  },
  {
    id: "time_4",
    date: { fr: "Juillet 2026", ar: "يوليو 2026" },
    title: { fr: "Alliances Politiques Stratégiques", ar: "التحالف والتنسيق مع حزب الإنصاف" },
    description: {
      fr: "Rapprochement et réunions majeures avec la direction régionale d'El Insaf pour formaliser le rôle moteur de notre jeunesse.",
      ar: "تنظيم استقبالات حاشدة واجتماعات مكثفة مع المنسقية الجهوية لحزب الإنصاف لتأكيد حضورنا التنموي والسياسي المؤثر."
    },
    iconName: "handshake"
  }
];

export const FAQ_DATA: FAQItem[] = [
  {
    id: "faq_1",
    question: {
      fr: "Qu'est-ce que le mouvement Amel Hassi El Bekay ?",
      ar: "ما هو حراك أمل حاسي البكاي؟"
    },
    answer: {
      fr: "C'est un mouvement citoyen, social et politique créé à Kiffa (Mauritanie). Notre but est de rassembler les jeunes, les intellectuels et les habitants des villages de Hassi El Bekay pour mener des actions de développement (comme l'approvisionnement en eau), sensibiliser les citoyens (pilier Conscience) et assurer une juste représentation politique de nos localités.",
      ar: "هو تجمع مدني واجتماعي وسياسي تأسس في بلدية كيفه بموريتانيا. يهدف إلى توحيد طاقات الشباب والمثقفين والأهالي في تجمعات حاسي البكاي للنهوض بالمنطقة عبر إطلاق مبادرات تنموية (كالسقاية)، ونشر الوعي الثقافي والسياسي، وضمان التمثيل العادل لسكان هذه القرى في مراكز القرار."
    }
  },
  {
    id: "faq_2",
    question: {
      fr: "Qui dirige ce mouvement ?",
      ar: "من يقود هذا الحراك؟"
    },
    answer: {
      fr: "Le mouvement est initié et présidé par le Dr. Mahfoudh Ould Soueidane (الدكتور محفوظ ولد اسويدانه), chercheur, cadre de la région et militant infatigable du progrès social, assisté par un bureau de coordination composé de jeunes cadres, d'universitaires et de représentants de chaque village de Hassi El Bekay.",
      ar: "يقود المبادرة الدكتور محفوظ ولد اسويدانه، وهو باحث وأحد أطر المنطقة البارزين المهتمين بالعمل الاجتماعي والتنموي، بالتنسيق مع مكتب تنفيذي يضم نخبة من الكفاءات الشبابية والوجهاء والنشطاء الممثلين لمختلف قرى وتجمعات حاسي البكاي."
    }
  },
  {
    id: "faq_3",
    question: {
      fr: "Quelle est votre relation avec le parti El Insaf ?",
      ar: "ما هي طبيعة علاقتكم بحزب الإنصاف؟"
    },
    answer: {
      fr: "Nous soutenons activement les réformes nationales et la vision de développement portées par le Président de la République Mohamed Ould Cheikh El Ghazouani. C'est pourquoi nous agissons en synergie et en étroite collaboration politique avec le parti au pouvoir, El Insaf, afin d'assurer l'intégration de nos villages dans les grands projets de l'État.",
      ar: "نحن ندعم بقوة مسيرة الإصلاح والبناء التي يقودها فخامة رئيس الجمهورية محمد ولد الشيخ الغزواني. وانطلاقاً من ذلك، ننسق سياسياً وميدانياً مع حزب الإنصاف الحاكم كشريك استراتيجي لإيصال قضايا قرانا ومطالبها ودمجها في المشاريع الخدمية للدولة."
    }
  },
  {
    id: "faq_4",
    question: {
      fr: "Comment sont financées vos actions, comme la distribution d'eau ?",
      ar: "كيف يتم تمويل الأنشطة والمبادرات كحملات السقاية؟"
    },
    answer: {
      fr: "Nos actions reposent entièrement sur les cotisations volontaires de nos cadres, des ressortissants de la diaspora de Kiffa, des dons de généreux bienfaiteurs, et l'apport direct de nos leaders fondateurs comme le Dr. Soueidane, complétés par des partenariats de solidarité locale.",
      ar: "تعتمد أنشطتنا بالكامل على الاشتراكات الطوعية لأطر الحراك، وتبرعات الفاعلين والخيرين من أبناء المنطقة في الداخل والمهجر، والدعم المباشر والمستمر من مؤسس الحراك الدكتور محفوظ ولد اسويدانه، لتوفير الحلول السريعة والفعالة للأزمات المحلية."
    }
  },
  {
    id: "faq_5",
    question: {
      fr: "Qui peut rejoindre le mouvement et comment ?",
      ar: "من يحق له الانضمام للحراك وكيف يتم ذلك؟"
    },
    answer: {
      fr: "Le mouvement est ouvert à toutes les citoyennes et tous les citoyens originaires ou résidants à Hassi El Bekay et Kiffa, en particulier les jeunes, cadres, militants associatifs et sages. Vous pouvez adhérer gratuitement via le formulaire de contact de ce site ou en contactant nos délégués locaux.",
      ar: "الانضمام مفتوح لجميع المواطنين والمواطنات المقيمين في تجمعات حاسي البكاي وعموم بلدية كيفه، وخاصة الشباب والنساء والأطر المستعدين للبذل والعطاء من أجل الصالح العام. يمكنك التسجيل مباشرة عبر استمارة الانتساب في هذا الموقع مجاناً."
    }
  }
];

export const HASSI_VILLAGES = [
  "Hassi El Bekay Centre (حاسي البكاي المركز)",
  "Oum Lekeit (أم لكيط)",
  "Gueroual (كروال)",
  "El Mechra (المشرع)",
  "Dar El Barka (دار البركة)",
  "Tewfig (التوفيق)",
  "Tizent (تيزنت)",
  "Dar Naim (دار النعيم)",
  "El Wafaa (الوفاء)"
];
