# 🎉 Innov'Events Manager

Application web de gestion d'événements pour l'agence Innov'Events.

![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7+-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-orange)
![Deploy](https://img.shields.io/badge/Deploy-Render-purple)

## 🌐 Démo en ligne

| Service | URL |
|---------|-----|
| **Frontend** | [https://innovevents-frontend.onrender.com](https://innovevents-frontend.onrender.com) |
| **Backend API** | [https://innovevents-manager.onrender.com](https://innovevents-manager.onrender.com) |

> ⚠️ **Note** : Le premier accès peut prendre ~30 secondes (plan gratuit Render).

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation locale](#-installation-locale)
- [Configuration](#-configuration)
- [Lancement](#-lancement)
- [Tests](#-tests)
- [Déploiement](#-déploiement)
- [CI/CD Pipeline](#-cicd-pipeline)
- [API Documentation](#-api-documentation)
- [Structure du projet](#-structure-du-projet)
- [Git Workflow](#-git-workflow)

---

## ✨ Fonctionnalités

### 🌐 Site Public
- Page d'accueil avec présentation de l'entreprise
- Catalogue des événements réalisés (avec filtres)
- Formulaire de demande de devis
- Page de contact
- Avis clients validés
- Mentions légales (RGPD)

### 👤 Espace Client
- Tableau de bord personnalisé
- Suivi des événements
- Gestion des devis (accepter/refuser/demander modification)
- Dépôt d'avis après événement
- Gestion du profil et suppression RGPD

### 👷 Espace Employé
- Consultation des clients et événements
- Gestion des notes collaboratives
- Suivi et mise à jour des tâches assignées
- Validation/refus des avis clients

### 👑 Espace Administrateur
- Tableau de bord avec KPIs
- Gestion complète des prospects
- Conversion prospect → client + événement
- Création et envoi de devis PDF
- Gestion des événements et prestations
- Upload d'images (stockage Cloudinary)
- Gestion des employés
- Journalisation des actions (MongoDB)
- Modération des avis

### 🔐 Sécurité
- Authentification JWT (access + refresh tokens)
- Hashage des mots de passe (bcrypt)
- Validation des entrées côté serveur
- Protection XSS (React + Helmet)
- Protection injection SQL (requêtes paramétrées)
- Rate limiting
- CORS configuré
- Changement de mot de passe obligatoire (première connexion)

---

## 🛠 Technologies

### Backend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Node.js | 20+ | Runtime JavaScript |
| Express.js | 4.x | Framework web |
| PostgreSQL | 15+ | Base de données relationnelle |
| MongoDB | 7+ | Journalisation (logs) |
| JWT | - | Authentification |
| Nodemailer | - | Envoi d'emails |
| PDFKit | - | Génération de devis PDF |
| Cloudinary | - | Stockage d'images (CDN) |

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 18+ | Bibliothèque UI |
| Vite | 5+ | Build tool |
| Tailwind CSS | 3+ | Framework CSS |
| React Router | 6+ | Navigation SPA |
| Axios | - | Client HTTP |
| Lucide React | - | Icônes |

### DevOps
| Technologie | Usage |
|-------------|-------|
| Docker | Conteneurisation |
| Docker Compose | Orchestration locale |
| GitHub Actions | CI/CD Pipeline |
| Render | Hébergement cloud |
| Docker Hub | Registry d'images |
| MongoDB Atlas | Base NoSQL cloud |
| Cloudinary | CDN images |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      ARCHITECTURE DE PRODUCTION                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   👨‍💻 Développeur                                                │
│        │                                                         │
│        ▼ git push                                                │
│   ┌─────────┐      ┌──────────────┐      ┌─────────────┐        │
│   │ GitHub  │ ───► │GitHub Actions│ ───► │ Docker Hub  │        │
│   └─────────┘      └──────────────┘      └─────────────┘        │
│                           │                                      │
│                           ▼ deploy                               │
│              ┌────────────────────────────┐                     │
│              │         RENDER             │                     │
│              │  ┌──────────┐ ┌─────────┐  │                     │
│              │  │ Backend  │ │Frontend │  │                     │
│              │  │  (API)   │ │  (SPA)  │  │                     │
│              │  └────┬─────┘ └─────────┘  │                     │
│              │       │                    │                     │
│              │  ┌────▼─────┐              │                     │
│              │  │PostgreSQL│              │                     │
│              │  └──────────┘              │                     │
│              └────────────────────────────┘                     │
│                      │                                          │
│         ┌────────────┼────────────┐                             │
│         ▼            ▼            ▼                             │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│   │ MongoDB  │ │Cloudinary│ │  SMTP    │                       │
│   │  Atlas   │ │  (CDN)   │ │ (Email)  │                       │
│   └──────────┘ └──────────┘ └──────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Prérequis

### Pour le développement local (Docker)
- [Docker](https://docs.docker.com/get-docker/) (v20+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2+)
- [Git](https://git-scm.com/downloads)

### Pour le développement local (sans Docker)
- [Node.js](https://nodejs.org/) (v20+)
- [PostgreSQL](https://www.postgresql.org/download/) (v15+)
- [MongoDB](https://www.mongodb.com/try/download/community) (v7+)

---

## 🚀 Installation locale

### 1. Cloner le repository
```bash
git clone https://github.com/VOTRE_USERNAME/innovevents-manager.git
cd innovevents-manager
```

### 2. Configurer les variables d'environnement
```bash
cp .env.example .env
```

### 3. Éditer le fichier `.env`
```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=innovevents
POSTGRES_PASSWORD=innovevents123
POSTGRES_DB=innovevents_db

# MongoDB (local)
MONGO_URI=mongodb://innovevents:innovevents123@mongodb:27017/innovevents_logs?authSource=admin

# JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_securise
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=votre_refresh_secret_encore_plus_long
JWT_REFRESH_EXPIRES_IN=7d

# SMTP (emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
SMTP_FROM=contact@innovevents.com
SMTP_FROM_NAME=Innov'Events

# Cloudinary (images)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

---

## 🎬 Lancement

### Avec Docker (Recommandé) 🐳

```bash
# Construire et démarrer tous les services
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f app

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes (reset complet)
docker-compose down -v
```

### Sans Docker

**Terminal 1 - Backend :**
```bash
npm install
npm run dev
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm install
npm run dev
```

### Accès aux services (local)

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Application React |
| **Backend API** | http://localhost:3000 | API REST |
| **PgAdmin** | http://localhost:5050 | Interface PostgreSQL |
| **Mongo Express** | http://localhost:8081 | Interface MongoDB |

### Comptes par défaut

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | chloe@innovevents.com | Innovevents2024! |

> ⚠️ **Important** : Changez les mots de passe par défaut en production !

---

## 🧪 Tests

Le projet inclut **47 tests** répartis en 3 catégories :

| Type | Framework | Nombre | Commande |
|------|-----------|--------|----------|
| Unitaires | Jest | 21 | `npm test` |
| Intégration (API) | Jest + Supertest | 16 | `npm test` |
| End-to-End | Playwright | 10 | `npm run test:e2e` |

### Lancer les tests

```bash
# Tous les tests unitaires et intégration
npm test

# Avec couverture de code
npm run test:coverage

# Tests E2E (nécessite l'app lancée)
npm run test:e2e

# Tests E2E avec interface visuelle
npm run test:e2e:ui
```

### Couverture des tests

| Module | Tests |
|--------|-------|
| Validation (mot de passe, email) | 8 |
| Calculs (TVA, montants) | 3 |
| Utilitaires (génération devis, rôles) | 4 |
| Statuts (événements, tâches) | 6 |
| API Auth (register, login, profil) | 16 |
| E2E (navigation, formulaires) | 10 |

---

## 🚀 Déploiement

### Services de production

| Service | Plateforme | URL |
|---------|------------|-----|
| Backend | Render (Web Service) | https://innovevents-manager.onrender.com |
| Frontend | Render (Static Site) | https://innovevents-frontend.onrender.com |
| PostgreSQL | Render | Connexion interne |
| MongoDB | MongoDB Atlas | Cluster cloud |
| Images | Cloudinary | CDN mondial |
| Docker Images | Docker Hub | tikaya/innovevents-manager |

### Variables d'environnement (Production)

À configurer sur Render (Backend Web Service) :

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://innovevents-frontend.onrender.com

# PostgreSQL (fourni par Render)
POSTGRES_HOST=xxx.render.com
POSTGRES_PORT=5432
POSTGRES_USER=xxx
POSTGRES_PASSWORD=xxx
POSTGRES_DB=innovevents_db

# MongoDB Atlas
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/innovevents_logs

# JWT
JWT_SECRET=xxx
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=xxx
JWT_REFRESH_EXPIRES_IN=7d

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

## 🔄 CI/CD Pipeline

Le projet utilise **GitHub Actions** pour l'intégration et le déploiement continus.

### Pipeline (5 étapes)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CI/CD PIPELINE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐     ┌──────────────┐                        │
│   │Tests Backend │     │Tests Frontend│    ← Étape 1 : Tests   │
│   │     🧪       │     │      🧪      │                        │
│   └──────┬───────┘     └──────┬───────┘                        │
│          │                    │                                 │
│          └────────┬───────────┘                                 │
│                   ▼                                             │
│          ┌──────────────┐                                       │
│          │ Build Docker │              ← Étape 2 : Build       │
│          │      🐳      │                                       │
│          └──────┬───────┘                                       │
│                 ▼                                               │
│          ┌──────────────┐                                       │
│          │Push Docker   │              ← Étape 3 : Push        │
│          │    Hub 📦    │                                       │
│          └──────┬───────┘                                       │
│                 ▼                                               │
│   ┌──────────────┐     ┌──────────────┐                        │
│   │Deploy Backend│     │Deploy Frontend│   ← Étape 4 : Deploy  │
│   │      🚀      │     │      🚀       │                        │
│   └──────┬───────┘     └──────┬────────┘                        │
│          │                    │                                 │
│          └────────┬───────────┘                                 │
│                   ▼                                             │
│          ┌──────────────┐                                       │
│          │   Notify 📢  │              ← Étape 5 : Résumé      │
│          └──────────────┘                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Déclencheurs

| Événement | Action |
|-----------|--------|
| Push sur `main` | Tests + Build + Deploy |
| Push sur `dev` | Tests + Build |
| Pull Request sur `main` | Tests uniquement |
| Manuel | Workflow dispatch |

### Secrets GitHub requis

| Secret | Description |
|--------|-------------|
| `DOCKER_USERNAME` | Username Docker Hub |
| `DOCKER_TOKEN` | Token d'accès Docker Hub |
| `RENDER_DEPLOY_HOOK_URL` | Webhook déploiement Backend |
| `RENDER_DEPLOY_HOOK_FRONTEND` | Webhook déploiement Frontend |

---

## 📡 API Documentation

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Déconnexion |
| POST | `/api/auth/refresh` | Rafraîchir le token |
| POST | `/api/auth/forgot-password` | Mot de passe oublié |
| PUT | `/api/auth/change-password` | Changer mot de passe |
| GET | `/api/auth/me` | Profil utilisateur |

### Ressources

| Ressource | Méthodes | Accès |
|-----------|----------|-------|
| `/api/prospects` | GET, POST, PUT, DELETE | Admin |
| `/api/clients` | GET, POST, PUT, DELETE | Admin, Employé |
| `/api/evenements` | GET, POST, PUT, DELETE | Admin, Employé, Client |
| `/api/devis` | GET, POST, PUT, DELETE | Admin, Client |
| `/api/prestations` | GET, POST, PUT, DELETE | Admin |
| `/api/avis` | GET, POST, PUT, DELETE | Admin, Employé, Client |
| `/api/taches` | GET, POST, PUT, DELETE | Admin, Employé |
| `/api/notes` | GET, POST, PUT, DELETE | Admin, Employé |
| `/api/contact` | POST | Public |
| `/api/logs` | GET | Admin |

### Format des réponses

**Succès :**
```json
{
  "success": true,
  "data": { ... },
  "message": "Opération réussie"
}
```

**Erreur :**
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

---

## 📁 Structure du projet

```
innovevents-manager/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # Pipeline GitHub Actions
├── src/                        # Code source backend
│   ├── config/                # Configuration (DB, MongoDB, Cloudinary)
│   ├── controllers/           # Contrôleurs API
│   ├── middlewares/           # Middlewares (auth, validation, upload)
│   ├── models/                # Modèles de données
│   ├── routes/                # Routes API
│   ├── services/              # Logique métier
│   ├── utils/                 # Utilitaires
│   └── app.js                 # Point d'entrée
├── frontend/                   # Code source frontend
│   ├── src/
│   │   ├── components/        # Composants React réutilisables
│   │   ├── pages/             # Pages de l'application
│   │   ├── context/           # Contextes React (Auth, Theme)
│   │   ├── services/          # Services API (Axios)
│   │   ├── hooks/             # Hooks personnalisés
│   │   └── App.jsx            # Composant principal
│   ├── public/                # Assets statiques
│   ├── Dockerfile             # Image Docker frontend
│   └── vite.config.js         # Configuration Vite
├── tests/                      # Tests
│   ├── unit/                  # Tests unitaires
│   ├── integration/           # Tests d'intégration API
│   └── e2e/                   # Tests End-to-End
├── docker-compose.yml          # Orchestration Docker (dev)
├── Dockerfile                  # Image Docker backend
├── .env.example               # Template variables d'environnement
├── package.json               # Dépendances backend
└── README.md                  # Ce fichier
```

---

## 🔀 Git Workflow

### Branches

| Branche | Description |
|---------|-------------|
| `main` | Production - Code stable, déploiement auto |
| `dev` | Développement - Intégration des features |

### Workflow

```bash
# 1. Créer une branche depuis dev
git checkout dev
git pull origin dev
git checkout -b feature/nom-fonctionnalite

# 2. Développer et commiter
git add .
git commit -m "feat: description de la fonctionnalité"

# 3. Pousser et créer une Pull Request
git push origin feature/nom-fonctionnalite

# 4. Après validation, merger dans dev puis main
git checkout dev
git merge feature/nom-fonctionnalite
git push origin dev

# 5. Déploiement en production
git checkout main
git merge dev
git push origin main  # Déclenche le déploiement automatique
```

### Convention de commits

| Préfixe | Description |
|---------|-------------|
| `feat:` | Nouvelle fonctionnalité |
| `fix:` | Correction de bug |
| `docs:` | Documentation |
| `style:` | Formatage (pas de changement de code) |
| `refactor:` | Refactorisation |
| `test:` | Ajout/modification de tests |
| `chore:` | Maintenance, dépendances |
| `ci:` | Configuration CI/CD |

---

## 🐛 Problèmes connus et solutions

| Problème | Cause | Solution |
|----------|-------|----------|
| Images disparaissent après redéploiement | Système de fichiers éphémère Render | Utiliser Cloudinary ✅ |
| Premier accès lent (~30s) | Spin-down du plan gratuit Render | Attendre ou upgrader le plan |
| Erreur CORS sur les images | Helmet bloquant | URLs Cloudinary HTTPS ✅ |

---

## 📧 Contact

**Innov'Events**
- 📧 Email : contact@innovevents.com
- 📞 Téléphone : 01 23 45 67 89
- 🌐 Site : https://innovevents-frontend.onrender.com

---

## 📄 Licence

Ce projet est développé dans le cadre d'une formation **Concepteur Développeur d'Applications (CDA)**.

---

Développé avec ❤️ par **Johann KOUAKOU** | 2024-2025