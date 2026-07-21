# 🕊️ Amel Hassi El Bkay — Portail Communautaire & Politique

Ce projet est une récréation intégrale et modernisée du site web et de l'identité de l'initiative citoyenne et politique **أمل حاسي البكاي** (Espoir de Hassi El Bkay), implantée dans la commune de **Kiffa (Mauritanie)** et dirigée par le **Dr. Mahmoud Ould Soueidane**.

La plateforme associe un design de niveau entreprise avec une expérience utilisateur bilingue (Français/Arabe) fluide, une navigation responsive rapide, un mode sombre et une génération dynamique de cartes d'adhésion virtuelles.

---

## 🎨 Caractéristiques Clés & UI/UX

1. **Logo Vectoriel Récréé (`Logo.tsx`)** : Un chef-d'œuvre SVG fluide reproduisant fidèlement l'emblème physique officiel (le rameau de la paix, la colombe blanche, les deux palmiers, et les trois cercles thématiques d'éveil).
2. **Support Multilingue Intégral (FR / AR)** : Traduction complète de l'interface en un seul clic, avec inversion automatique des axes d'alignement de la page via les attributs d'accessibilité `dir="rtl"` et `dir="ltr"`.
3. **Piliers Fondateurs Interactifs (`Values.tsx`)** : Présentation animée des trois fondements : **وعي (Conscience)**, **مشاركة (Participation)** et **تنمية (Développement)**.
4. **Catalogue d'Actions Terrain (`Campaigns.tsx`)** : Filtrage dynamique des campagnes majeures (Crise de l'eau, ralliements civiques avec le parti El Insaf, cours de soutien scolaire). Inclut des compteurs statistiques animés et des fiches d'impact détaillées dans des modaux fluides.
5. **Galerie d'Images Lightbox (`Gallery.tsx`)** : Un mur d'images interactif inspiré de la chronologie Facebook, avec zoom, filtres thématiques et défilement séquentiel plein écran de haute performance.
6. **Chronologie interactive (`Timeline.tsx`)** : Frise chronologique retraçant les grandes étapes de l'histoire du mouvement depuis janvier 2026.
7. **Formulaire d'Intégration & Reçu Virtuel (`ContactForm.tsx`)** : Enregistrement d'adhésion avec validation instantanée. Génère instantanément une **carte de membre virtuelle officielle et personnalisée** avec un identifiant unique (Ex: `AMEL-2026-8739`), le village sélectionné et la signature numérique du leader.

---

## 📂 Architecture & Structure du Projet (Échelle Entreprise)

Le projet est conçu de manière modulaire pour éviter le surpoids de fichiers uniques, garantissant un référencement propre et un chargement progressif.

```bash
├── /assets/                    # Fichiers de cache et d'environnement AI Studio
├── /src/
│   ├── /assets/images/         # Images haute résolution générées (Séquaya, Hero)
│   ├── /components/            # Composants Atomiques et Moléculaires réutilisables
│   │   ├── Logo.tsx            # Logo SVG officiel dessiné en courbes vectorielles pures
│   │   ├── Navbar.tsx          # Barre de navigation collante, sélecteur de langue, toggle sombre
│   │   ├── Hero.tsx            # Section d'accueil dynamique avec micro-statistiques
│   │   ├── Values.tsx          # Les 3 piliers fondateurs et citation phare
│   │   ├── Campaigns.tsx       # Grille de campagnes, badges d'état et modaux de lecture
│   │   ├── Gallery.tsx         # Galerie filtrable et module lightbox séquentiel
│   │   ├── Timeline.tsx        # Ligne de temps verticale alternée (ou liste mobile)
│   │   ├── FAQ.tsx             # Accordéon extensible des questions fondamentales
│   │   ├── ContactForm.tsx     # Formulaire d'adhésion et générateur de badge membre
│   │   └── Footer.tsx          # Pied de page informatif avec tags SEO et coordonnées
│   ├── types.ts                # Typage TypeScript strict pour la sécurité de la donnée
│   ├── data.ts                 # Dictionnaire de traduction et base de données simulée bilingue
│   ├── main.tsx                # Point d'entrée de montage React 19
│   ├── index.css               # Import global Tailwind CSS v4
│   └── App.tsx                 # Coordinateur global (Langue, Thème, Montage global)
├── package.json                # scripts de développement et dependances
├── vite.config.ts              # Configuration de build et alias Vite
├── tsconfig.json               # Configurations du compilateur TypeScript
└── metadata.json               # Données de configuration SEO de l'application
```

---

## 🛠️ Instructions d'Installation Locale

Suivez ces étapes pour installer et exécuter l'application sur votre environnement de développement local.

### Prérequis
* **Node.js** (v18.0.0 ou supérieur)
* **npm** ou **yarn**

### Étapes d'installation

1. **Cloner ou extraire les sources du projet** :
   ```bash
   cd amel-hassi-elbkay
   ```

2. **Installer les dépendances de l'application** :
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement local** :
   ```bash
   npm run dev
   ```
   *Le serveur démarre instantanément sur `http://localhost:3000`.*

4. **Compiler le projet pour la production** :
   ```bash
   npm run build
   ```
   *Génère des fichiers optimisés, minifiés et découpés dans le dossier `dist/`.*

---

## 🚀 Guide de Déploiement en Production

Le projet est entièrement statique (SPA performante) et ne requiert aucun serveur d'exécution dynamique coûteux, ce qui garantit un temps de chargement instantané (Core Web Vitals optimaux).

### ⚡ Option A : Déploiement Vercel (Recommandé, Gratuit et Instantané)

1. **Installer l'outil Vercel CLI** (ou connecter votre dépôt GitHub sur la plateforme Vercel) :
   ```bash
   npm install -g vercel
   ```
2. **Lancer le déploiement depuis la racine du projet** :
   ```bash
   vercel
   ```
3. Suivre les invites interactives :
   * Définir le répertoire de build sur `dist/`.
   * Définir la commande de build sur `npm run build`.
   * Vercel fournit un certificat SSL gratuit et un CDN mondial.

---

### 🐳 Option B : Déploiement Docker (Conteneurisé pour Cloud de niveau Entreprise)

Pour héberger ce portail sur Kubernetes ou sur un service de conteneur d'entreprise, vous pouvez utiliser ce fichier de configuration standard.

Créez un `Dockerfile` à la racine :

```dockerfile
# Étape 1 : Build de l'application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Serveur de production ultra-léger (Nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Copie d'une config nginx de base pour supporter le routage SPA si nécessaire
RUN echo "server { listen 3000; location / { root /usr/share/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

Construire et exécuter l'image :
```bash
# Construire l'image Docker
docker build -t amel-hassi-elbkay:1.0 .

# Exécuter le conteneur sur le port 3000
docker run -d -p 3000:3000 --name amel-portal amel-hassi-elbkay:1.0
```

---

## 🎯 Optimisations Core Web Vitals & SEO

* **Score Lighthouse attendu** : > 95% pour la performance, l'accessibilité, les meilleures pratiques et le SEO.
* **Typographie système moderne** : Évite les requêtes réseau vers Google Fonts, charge instantanément les polices système adaptées selon la direction de lecture (polices hautement lisibles pour l'Arabe et le Français).
* **Défilement optimisé** : Événements de scroll légers avec gestion de la transition d'opacité de la Navbar.
* **Lazy Loading des images** : Toutes les images non visibles au-dessus de la ligne de flottaison utilisent l'attribut natif `loading="lazy"`.
