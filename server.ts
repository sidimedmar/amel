import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import {
  translations,
  siteImages,
  valueCards,
  campaigns,
  galleryItems,
  timelineEvents,
  faqItems,
  budgetRecords,
} from './src/db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from './src/middleware/auth.ts';

// Static Data defaults to seed with
import { TRANSLATIONS, IMAGES, VALUE_CARDS, CAMPAIGNS_DATA, GALLERY_ITEMS, TIMELINE_EVENTS, FAQ_DATA } from './src/data.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json({ limit: '15mb' }));

  // Seeding routine
  const seedDatabase = async () => {
    try {
      console.log("Checking database for seeding...");

      // 1. Translations
      const transCount = await db.select().from(translations).limit(1);
      if (transCount.length === 0) {
        console.log("Seeding translations...");
        const vals: any[] = [];
        for (const lang of ['fr', 'ar'] as const) {
          for (const [key, val] of Object.entries(TRANSLATIONS[lang])) {
            vals.push({ lang, key, value: val });
          }
        }
        // Insert in batches of 50 to avoid hitting limits
        for (let i = 0; i < vals.length; i += 50) {
          await db.insert(translations).values(vals.slice(i, i + 50));
        }
      }

      // 2. Site Images
      const imgCount = await db.select().from(siteImages).limit(1);
      if (imgCount.length === 0) {
        console.log("Seeding site images...");
        const vals = Object.entries(IMAGES).map(([key, src]) => ({ key, src }));
        await db.insert(siteImages).values(vals);
      }

      // 3. Value Cards
      const vcCount = await db.select().from(valueCards).limit(1);
      if (vcCount.length === 0) {
        console.log("Seeding value cards...");
        const vals = VALUE_CARDS.map(item => ({
          id: item.id,
          titleFr: item.title.fr,
          titleAr: item.title.ar,
          descFr: item.desc.fr,
          descAr: item.desc.ar,
          icon: item.icon,
        }));
        await db.insert(valueCards).values(vals);
      }

      // 4. Campaigns
      const campCount = await db.select().from(campaigns).limit(1);
      if (campCount.length === 0) {
        console.log("Seeding campaigns...");
        const vals = CAMPAIGNS_DATA.map(item => ({
          id: item.id,
          titleFr: item.title.fr,
          titleAr: item.title.ar,
          descFr: item.description.fr,
          descAr: item.description.ar,
          targetMru: 500000,
          collectedMru: 350000,
          category: item.category,
          image: item.image,
        }));
        await db.insert(campaigns).values(vals);
      }

      // 5. Gallery Items
      const galCount = await db.select().from(galleryItems).limit(1);
      if (galCount.length === 0) {
        console.log("Seeding gallery items...");
        const vals = GALLERY_ITEMS.map(item => ({
          id: item.id,
          src: item.src,
          category: item.category,
          titleFr: item.title.fr,
          titleAr: item.title.ar,
          descFr: item.description.fr,
          descAr: item.description.ar,
          rotation: item.rotation || 0,
        }));
        await db.insert(galleryItems).values(vals);
      }

      // 6. Timeline Events
      const timeCount = await db.select().from(timelineEvents).limit(1);
      if (timeCount.length === 0) {
        console.log("Seeding timeline events...");
        const vals = TIMELINE_EVENTS.map(item => ({
          id: item.id,
          year: item.date.fr,
          titleFr: item.title.fr,
          titleAr: item.title.ar,
          descFr: item.description.fr,
          descAr: item.description.ar,
        }));
        await db.insert(timelineEvents).values(vals);
      }

      // 7. FAQ Items
      const faqCount = await db.select().from(faqItems).limit(1);
      if (faqCount.length === 0) {
        console.log("Seeding faq items...");
        const vals = FAQ_DATA.map(item => ({
          id: item.id,
          questionFr: item.question.fr,
          questionAr: item.question.ar,
          answerFr: item.answer.fr,
          answerAr: item.answer.ar,
        }));
        await db.insert(faqItems).values(vals);
      }

      // 8. Budget Records
      const budCount = await db.select().from(budgetRecords).limit(1);
      if (budCount.length === 0) {
        console.log("Seeding budget records...");
        const defaultBudgets = [
          {
            id: "bud_1",
            campaignId: "camp_water_relief",
            titleFr: "Carburant, logistique et location de citernes (Kiffa)",
            titleAr: "الوقود واللوجستيات وتأجير صهاريج المياه (بلدية كيفه)",
            allocatedMru: 450000,
            spentMru: 450000,
          },
          {
            id: "bud_2",
            campaignId: "camp_water_relief",
            titleFr: "Achat d'eau pure aux stations de pompage",
            titleAr: "شراء المياه النقية من محطات الضخ المركزية",
            allocatedMru: 120000,
            spentMru: 120000,
          },
          {
            id: "bud_3",
            campaignId: "camp_political_rally",
            titleFr: "Tentes traditionnelles mauritaniennes & sonorisation",
            titleAr: "تأجير الخيام الموريتانية التقليدية وتجهيز الصوتيات",
            allocatedMru: 85000,
            spentMru: 82000,
          },
          {
            id: "bud_4",
            campaignId: "camp_youth_mentorship",
            titleFr: "Supports scolaires, cahiers, stylos pour les élèves",
            titleAr: "الأدوات المدرسية والكتب والدفاتر للتلاميذ",
            allocatedMru: 50000,
            spentMru: 48000,
          },
        ];
        await db.insert(budgetRecords).values(defaultBudgets);
      }

      console.log("Database seed check completed successfully.");
    } catch (err) {
      console.error("Error during database seeding:", err);
    }
  };

  // Seed on start
  await seedDatabase();

  // API - Get entire site data
  app.get('/api/site-data', async (req, res) => {
    try {
      // Re-trigger seed check in case it was reset
      await seedDatabase();

      // Fetch all tables
      const transRows = await db.select().from(translations);
      const imageRows = await db.select().from(siteImages);
      const vcRows = await db.select().from(valueCards);
      const campRows = await db.select().from(campaigns);
      const galRows = await db.select().from(galleryItems);
      const timeRows = await db.select().from(timelineEvents);
      const faqRows = await db.select().from(faqItems);
      const budRows = await db.select().from(budgetRecords);

      // Reconstruct translations
      const transObj: any = { fr: {}, ar: {} };
      transRows.forEach(row => {
        if (row.lang === 'fr' || row.lang === 'ar') {
          transObj[row.lang][row.key] = row.value;
        }
      });

      // Reconstruct site images
      const imagesObj: any = {};
      imageRows.forEach(row => {
        imagesObj[row.key] = row.src;
      });

      // Reconstruct value cards
      const valueCardsList = vcRows.map(row => ({
        id: row.id,
        icon: row.icon,
        title: { fr: row.titleFr, ar: row.titleAr },
        desc: { fr: row.descFr, ar: row.descAr },
        color: row.id === 'value_awareness' ? 'from-blue-600 to-indigo-700' :
               row.id === 'value_participation' ? 'from-amber-500 to-yellow-600' :
               'from-emerald-600 to-teal-700'
      }));

      // Reconstruct campaigns
      const campaignsList = campRows.map(row => {
        const matched = CAMPAIGNS_DATA.find(c => c.id === row.id);
        return {
          id: row.id,
          title: { fr: row.titleFr, ar: row.titleAr },
          description: { fr: row.descFr, ar: row.descAr },
          longDescription: matched?.longDescription || { fr: row.descFr, ar: row.descAr },
          date: matched?.date || { fr: "Juillet 2026", ar: "يوليو 2026" },
          status: matched?.status || "ongoing",
          image: row.image,
          category: row.category,
          stats: matched?.stats || [
            { label: { fr: "Objectif (MRU)", ar: "الهدف (أوقية)" }, value: row.targetMru.toLocaleString() },
            { label: { fr: "Collecté (MRU)", ar: "المحصل (أوقية)" }, value: row.collectedMru.toLocaleString() }
          ]
        };
      });

      // Reconstruct gallery items
      const galleryList = galRows.map(row => ({
        id: row.id,
        src: row.src,
        category: row.category,
        title: { fr: row.titleFr, ar: row.titleAr },
        description: { fr: row.descFr, ar: row.descAr },
        rotation: row.rotation
      }));

      // Reconstruct timeline
      const timelineList = timeRows.map(row => {
        const matched = TIMELINE_EVENTS.find(t => t.id === row.id);
        return {
          id: row.id,
          date: matched?.date || { fr: row.year, ar: row.year },
          title: { fr: row.titleFr, ar: row.titleAr },
          description: { fr: row.descFr, ar: row.descAr },
          iconName: matched?.iconName || "scroll"
        };
      });

      // Reconstruct FAQs
      const faqList = faqRows.map(row => ({
        id: row.id,
        question: { fr: row.questionFr, ar: row.questionAr },
        answer: { fr: row.answerFr, ar: row.answerAr }
      }));

      // Reconstruct budget records
      const budgetList = budRows.map(row => ({
        id: row.id,
        campaignId: row.campaignId,
        title: { fr: row.titleFr, ar: row.titleAr },
        allocatedMru: row.allocatedMru,
        spentMru: row.spentMru
      }));

      res.json({
        translations: transObj,
        images: imagesObj,
        valueCards: valueCardsList,
        campaignsData: campaignsList,
        galleryItems: galleryList,
        timelineEvents: timelineList,
        faqData: faqList,
        budgetRecords: budgetList
      });
    } catch (err: any) {
      console.error("Failed to load site data from DB:", err);
      res.status(500).json({ error: "Failed to fetch site data", details: err.message });
    }
  });

  // API - Update translation
  app.post('/api/translations', requireAuth, async (req, res) => {
    try {
      const { lang, key, value } = req.body;
      if (!lang || !key || value === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await db.select().from(translations).where(
        and(eq(translations.lang, lang), eq(translations.key, key))
      );

      if (existing.length > 0) {
        await db.update(translations)
          .set({ value })
          .where(and(eq(translations.lang, lang), eq(translations.key, key)));
      } else {
        await db.insert(translations).values({ lang, key, value });
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API - Update site static image
  app.post('/api/images', requireAuth, async (req, res) => {
    try {
      const { key, src } = req.body;
      if (!key || !src) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await db.select().from(siteImages).where(eq(siteImages.key, key));
      if (existing.length > 0) {
        await db.update(siteImages).set({ src }).where(eq(siteImages.key, key));
      } else {
        await db.insert(siteImages).values({ key, src });
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API - Save value card
  app.post('/api/value-cards', requireAuth, async (req, res) => {
    try {
      const { id, titleFr, titleAr, descFr, descAr, icon } = req.body;
      if (!id || !titleFr || !titleAr || !descFr || !descAr || !icon) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await db.select().from(valueCards).where(eq(valueCards.id, id));
      if (existing.length > 0) {
        await db.update(valueCards)
          .set({ titleFr, titleAr, descFr, descAr, icon })
          .where(eq(valueCards.id, id));
      } else {
        await db.insert(valueCards).values({ id, titleFr, titleAr, descFr, descAr, icon });
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API - Delete value card
  app.delete('/api/value-cards/:id', requireAuth, async (req, res) => {
    try {
      await db.delete(valueCards).where(eq(valueCards.id, req.params.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API - Save campaign
  app.post('/api/campaigns', requireAuth, async (req, res) => {
    try {
      const { id, titleFr, titleAr, descFr, descAr, targetMru, collectedMru, category, image } = req.body;
      if (!id || !titleFr || !titleAr || !descFr || !descAr || !category || !image) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await db.select().from(campaigns).where(eq(campaigns.id, id));
      if (existing.length > 0) {
        await db.update(campaigns)
          .set({ titleFr, titleAr, descFr, descAr, targetMru: targetMru || 0, collectedMru: collectedMru || 0, category, image })
          .where(eq(campaigns.id, id));
      } else {
        await db.insert(campaigns).values({ id, titleFr, titleAr, descFr, descAr, targetMru: targetMru || 0, collectedMru: collectedMru || 0, category, image });
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API - Delete campaign
  app.delete('/api/campaigns/:id', requireAuth, async (req, res) => {
    try {
      await db.delete(campaigns).where(eq(campaigns.id, req.params.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API - Save gallery item
  app.post('/api/gallery-items', requireAuth, async (req, res) => {
    try {
      const { id, src, category, titleFr, titleAr, descFr, descAr, rotation } = req.body;
      if (!id || !src || !category || !titleFr || !titleAr) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await db.select().from(galleryItems).where(eq(galleryItems.id, id));
      if (existing.length > 0) {
        await db.update(galleryItems)
          .set({ src, category, titleFr, titleAr, descFr: descFr || '', descAr: descAr || '', rotation: rotation || 0 })
          .where(eq(galleryItems.id, id));
      } else {
        await db.insert(galleryItems).values({ id, src, category, titleFr, titleAr, descFr: descFr || '', descAr: descAr || '', rotation: rotation || 0 });
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API - Delete gallery item
  app.delete('/api/gallery-items/:id', requireAuth, async (req, res) => {
    try {
      await db.delete(galleryItems).where(eq(galleryItems.id, req.params.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API - Save timeline event
  app.post('/api/timeline-events', requireAuth, async (req, res) => {
    try {
      const { id, year, titleFr, titleAr, descFr, descAr } = req.body;
      if (!id || !year || !titleFr || !titleAr || !descFr || !descAr) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await db.select().from(timelineEvents).where(eq(timelineEvents.id, id));
      if (existing.length > 0) {
        await db.update(timelineEvents)
          .set({ year, titleFr, titleAr, descFr, descAr })
          .where(eq(timelineEvents.id, id));
      } else {
        await db.insert(timelineEvents).values({ id, year, titleFr, titleAr, descFr, descAr });
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API - Delete timeline event
  app.delete('/api/timeline-events/:id', requireAuth, async (req, res) => {
    try {
      await db.delete(timelineEvents).where(eq(timelineEvents.id, req.params.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API - Save FAQ item
  app.post('/api/faq-items', requireAuth, async (req, res) => {
    try {
      const { id, questionFr, questionAr, answerFr, answerAr } = req.body;
      if (!id || !questionFr || !questionAr || !answerFr || !answerAr) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await db.select().from(faqItems).where(eq(faqItems.id, id));
      if (existing.length > 0) {
        await db.update(faqItems)
          .set({ questionFr, questionAr, answerFr, answerAr })
          .where(eq(faqItems.id, id));
      } else {
        await db.insert(faqItems).values({ id, questionFr, questionAr, answerFr, answerAr });
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API - Delete FAQ item
  app.delete('/api/faq-items/:id', requireAuth, async (req, res) => {
    try {
      await db.delete(faqItems).where(eq(faqItems.id, req.params.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API - Save budget record
  app.post('/api/budget-records', requireAuth, async (req, res) => {
    try {
      const { id, campaignId, titleFr, titleAr, allocatedMru, spentMru } = req.body;
      if (!id || !campaignId || !titleFr || !titleAr || allocatedMru === undefined || spentMru === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await db.select().from(budgetRecords).where(eq(budgetRecords.id, id));
      if (existing.length > 0) {
        await db.update(budgetRecords)
          .set({ campaignId, titleFr, titleAr, allocatedMru, spentMru })
          .where(eq(budgetRecords.id, id));
      } else {
        await db.insert(budgetRecords).values({ id, campaignId, titleFr, titleAr, allocatedMru, spentMru });
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API - Delete budget record
  app.delete('/api/budget-records/:id', requireAuth, async (req, res) => {
    try {
      await db.delete(budgetRecords).where(eq(budgetRecords.id, req.params.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API - Reset all to default (clears DB overrides to allow reseeding)
  app.post('/api/reset', requireAuth, async (req, res) => {
    try {
      await db.delete(translations);
      await db.delete(siteImages);
      await db.delete(valueCards);
      await db.delete(campaigns);
      await db.delete(galleryItems);
      await db.delete(timelineEvents);
      await db.delete(faqItems);
      await db.delete(budgetRecords);

      await seedDatabase();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite development middleware or production static files serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
