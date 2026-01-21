# 🎉 Innov'Events Manager

Application web de gestion d'événements pour l'agence Innov'Events.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7+-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Lancement](#-lancement)
- [Accès à l'application](#-accès-à-lapplication)
- [Structure du projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)
- [Git Workflow](#-git-workflow)

## ✨ Fonctionnalités

### 🌐 Site Public
- Page d'accueil avec présentation de l'entreprise
- Catalogue des événements réalisés
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
- Gestion des employés
- Journalisation des actions (MongoDB)
- Modération des avis

### 🔐 Sécurité
- Authentification JWT
- Hashage des mots de passe (bcrypt)
- Validation des entrées
- Protection CSRF
- Rate limiting
- Changement de mot de passe obligatoire (première connexion)

## 🛠 Technologies

### Backend
- **Node.js** (v18+) - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de données relationnelle
- **MongoDB** - Base de données NoSQL (journalisation)
- **JWT** - Authentification
- **Nodemailer** - Envoi d'emails
- **PDFKit** - Génération de PDF

### Frontend
- **React 18** - Bibliothèque UI
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **React Router** - Navigation
- **Axios** - Client HTTP
- **Lucide React** - Icônes

### DevOps
- **Docker** & **Docker Compose** - Conteneurisation
- **Git** - Versioning

## 📦 Prérequis

- [Docker](https://docs.docker.com/get-docker/) (v20+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2+)
- [Git](https://git-scm.com/downloads)

**OU** pour une installation sans Docker :
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/download/) (v15+)
- [MongoDB](https://www.mongodb.com/try/download/community) (v7+)

## 🚀 Installation

### 1. Cloner le repository
```bash
git clone https://github.com/VOTRE_USERNAME/innovevents-manager.git
cd innovevents-manager
```

### 2. Configurer les variables d'environnement
```bash
cp .env.example .env
```

Éditer le fichier `.env` avec vos valeurs :
```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=innovevents
POSTGRES_PASSWORD=votre_mot_de_passe_securise
POSTGRES_DB=innovevents_db

# MongoDB
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_USER=innovevents
MONGO_PASSWORD=votre_mot_de_passe_mongo
MONGO_DB=innovevents_db

# JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_securise
JWT_EXPIRES_IN=24h

# SMTP (pour les emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
SMTP_FROM=contact@innovevents.com
SMTP_FROM_NAME=Innov'Events
```

## ⚙️ Configuration

### Option 1 : Avec Docker (Recommandé)

Aucune configuration supplémentaire nécessaire. Docker gère tout !

### Option 2 : Sans Docker

1. **Installer les dépendances backend :**
```bash
npm install
```

2. **Installer les dépendances frontend :**
```bash
cd frontend
npm install
cd ..
```

3. **Créer la base de données PostgreSQL :**
```bash
psql -U postgres -c "CREATE DATABASE innovevents_db;"
psql -U postgres -c "CREATE USER innovevents WITH PASSWORD 'votre_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE innovevents_db TO innovevents;"
```

4. **Exécuter les migrations :**
```bash
psql -U innovevents -d innovevents_db -f src/config/init.sql
```

## 🎬 Lancement

### Avec Docker (Recommandé)
```bash
# Construire et démarrer tous les services
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### Sans Docker

**Terminal 1 - Backend :**
```bash
npm run dev
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```

## 🌐 Accès à l'application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Application React |
| **Backend API** | http://localhost:3000 | API REST |
| **PgAdmin** | http://localhost:5050 | Interface PostgreSQL |
| **Mongo Express** | http://localhost:8081 | Interface MongoDB |

### Comptes par défaut

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | tikaya1999@gmail.com | Admin1234 |

> ⚠️ **Important** : Changez les mots de passe par défaut en production !

## 📁 Structure du projet
```
innovevents-manager/
├── src/                    # Code source backend
│   ├── config/            # Configuration (DB, MongoDB)
│   ├── controllers/       # Contrôleurs API
│   ├── middlewares/       # Middlewares Express
│   ├── models/            # Modèles de données
│   ├── routes/            # Routes API
│   ├── services/          # Logique métier
│   └── app.js             # Point d'entrée
├── frontend/              # Code source frontend
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── pages/         # Pages de l'application
│   │   ├── context/       # Contextes React
│   │   ├── services/      # Services API
│   │   └── App.jsx        # Composant principal
│   └── index.html
├── uploads/               # Fichiers uploadés
├── devis/                 # PDFs des devis générés
├── docker-compose.yml     # Configuration Docker
├── Dockerfile            # Image Docker backend
├── .env                  # Variables d'environnement
└── README.md             # Ce fichier
```

## 📡 API Documentation

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/logout` | Déconnexion |
| POST | `/api/auth/forgot-password` | Mot de passe oublié |
| POST | `/api/auth/change-password` | Changer mot de passe |

### Ressources principales

| Ressource | Endpoints | Accès |
|-----------|-----------|-------|
| Prospects | `/api/prospects` | Admin |
| Clients | `/api/clients` | Admin, Employé |
| Événements | `/api/evenements` | Admin, Employé, Client |
| Devis | `/api/devis` | Admin, Client |
| Avis | `/api/avis` | Admin, Employé, Client |
| Tâches | `/api/taches` | Admin, Employé |
| Notes | `/api/notes` | Admin, Employé |
| Logs | `/api/logs` | Admin |

## 🔀 Git Workflow

### Branches

| Branche | Description |
|---------|-------------|
| `main` | Production - Code stable |
| `dev` | Développement - Nouvelles fonctionnalités |

### Workflow

1. **Créer une branche depuis `dev` :**
```bash
git checkout dev
git pull origin dev
git checkout -b feature/nom-fonctionnalite
```

2. **Développer et commiter :**
```bash
git add .
git commit -m "feat: description de la fonctionnalité"
```

3. **Pousser et créer une Pull Request :**
```bash
git push origin feature/nom-fonctionnalite
```

4. **Après validation, merger dans `dev` puis `main` :**
```bash
git checkout dev
git merge feature/nom-fonctionnalite
git checkout main
git merge dev
```

### Convention de commits

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage
- `refactor:` Refactorisation
- `test:` Tests
- `chore:` Maintenance

## 🧪 Tests
```bash
# Lancer les tests
npm test

# Avec couverture
npm run test:coverage
```

## 📧 Contact

**Innov'Events**
- Email : contact@innovevents.com
- Téléphone : 01 23 45 67 89

---

Développé avec ❤️ par TIKAYA pour le projet Innov'Events
