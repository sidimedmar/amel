import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Users table (Firebase Auth UID map)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Translation overrides
export const translations = pgTable('translations', {
  id: serial('id').primaryKey(),
  lang: text('lang').notNull(), // 'fr' | 'ar'
  key: text('key').notNull(),
  value: text('value').notNull(),
});

// Site static images overrides
export const siteImages = pgTable('site_images', {
  key: text('key').primaryKey(),
  src: text('src').notNull(), // base64 or URL
});

// Value cards
export const valueCards = pgTable('value_cards', {
  id: text('id').primaryKey(),
  titleFr: text('title_fr').notNull(),
  titleAr: text('title_ar').notNull(),
  descFr: text('desc_fr').notNull(),
  descAr: text('desc_ar').notNull(),
  icon: text('icon').notNull(),
});

// Campaigns
export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey(),
  titleFr: text('title_fr').notNull(),
  titleAr: text('title_ar').notNull(),
  descFr: text('desc_fr').notNull(),
  descAr: text('desc_ar').notNull(),
  targetMru: integer('target_mru').notNull(),
  collectedMru: integer('collected_mru').notNull(),
  category: text('category').notNull(),
  image: text('image').notNull(),
});

// Gallery Items
export const galleryItems = pgTable('gallery_items', {
  id: text('id').primaryKey(),
  src: text('src').notNull(),
  category: text('category').notNull(), // 'water' | 'political' | 'community'
  titleFr: text('title_fr').notNull(),
  titleAr: text('title_ar').notNull(),
  descFr: text('desc_fr').notNull(),
  descAr: text('desc_ar').notNull(),
  rotation: integer('rotation').default(0).notNull(),
});

// Timeline Events
export const timelineEvents = pgTable('timeline_events', {
  id: text('id').primaryKey(),
  year: text('year').notNull(),
  titleFr: text('title_fr').notNull(),
  titleAr: text('title_ar').notNull(),
  descFr: text('desc_fr').notNull(),
  descAr: text('desc_ar').notNull(),
});

// FAQ Items
export const faqItems = pgTable('faq_items', {
  id: text('id').primaryKey(),
  questionFr: text('question_fr').notNull(),
  questionAr: text('question_ar').notNull(),
  answerFr: text('answer_fr').notNull(),
  answerAr: text('answer_ar').notNull(),
});

// Budget Records
export const budgetRecords = pgTable('budget_records', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull(),
  titleFr: text('title_fr').notNull(),
  titleAr: text('title_ar').notNull(),
  allocatedMru: integer('allocated_mru').notNull(),
  spentMru: integer('spent_mru').notNull(),
});
