/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'fr' | 'ar';

export interface TranslationDict {
  navHome: string;
  navValues: string;
  navCampaigns: string;
  navGallery: string;
  navTimeline: string;
  navFAQ: string;
  navContact: string;
  
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCTA: string;
  heroSecondaryCTA: string;
  
  valuesTitle: string;
  valuesSubtitle: string;
  value1Title: string;
  value1Desc: string;
  value2Title: string;
  value2Desc: string;
  value3Title: string;
  value3Desc: string;

  campaignsTitle: string;
  campaignsSubtitle: string;
  campaignStatusOngoing: string;
  campaignStatusCompleted: string;
  campaignLearnMore: string;

  galleryTitle: string;
  gallerySubtitle: string;
  galleryFilterAll: string;
  galleryFilterWater: string;
  galleryFilterPolitical: string;
  galleryFilterCommunity: string;

  timelineTitle: string;
  timelineSubtitle: string;

  faqTitle: string;
  faqSubtitle: string;

  contactTitle: string;
  contactSubtitle: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactVillage: string;
  contactMessage: string;
  contactSubmit: string;
  contactSubmitting: string;
  contactSuccessTitle: string;
  contactSuccessDesc: string;
  contactSuccessCTA: string;

  footerText: string;
  footerRights: string;
  footerSEOInfo: string;
  footerLeader: string;
  footerPhoneLabel: string;
  footerPhoneVal: string;
  footerEmailLabel: string;
  footerEmailVal: string;
  footerAddressLabel: string;
  footerAddressVal: string;
  footerShortcutsHeading: string;
  footerContactHeading: string;
}

export interface ValueCard {
  id: string;
  icon: string;
  title: { fr: string; ar: string };
  desc: { fr: string; ar: string };
  color: string;
}

export interface CampaignItem {
  id: string;
  title: { fr: string; ar: string };
  description: { fr: string; ar: string };
  longDescription: { fr: string; ar: string };
  date: { fr: string; ar: string };
  status: 'ongoing' | 'completed';
  image: string;
  category: 'water' | 'political' | 'community';
  stats: { label: { fr: string; ar: string }; value: string }[];
}

export interface GalleryItem {
  id: string;
  src: string;
  category: 'water' | 'political' | 'community';
  title: { fr: string; ar: string };
  description: { fr: string; ar: string };
  rotation?: number;
}

export interface TestimonialItem {
  id: string;
  name: { fr: string; ar: string };
  role: { fr: string; ar: string };
  avatar: string;
  quote: { fr: string; ar: string };
}

export interface TimelineEvent {
  id: string;
  date: { fr: string; ar: string };
  title: { fr: string; ar: string };
  description: { fr: string; ar: string };
  iconName: string;
}

export interface FAQItem {
  id: string;
  question: { fr: string; ar: string };
  answer: { fr: string; ar: string };
}
