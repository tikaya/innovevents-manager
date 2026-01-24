# 🎉 Innov'Events Manager

Application web de gestion d'événements pour l'agence Innov'Events.

![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![Render](https://img.shields.io/badge/Deploy-Render-purple?logo=render)

---

## 🌐 Démo en ligne

| Service | URL |
|---------|-----|
| **Application** | [innovevents-frontend.onrender.com](https://innovevents-frontend.onrender.com) |
| **API** | [innovevents-manager.onrender.com](https://innovevents-manager.onrender.com) |

> ⏳ Premier accès lent (~30s) = serveur qui se réveille (plan gratuit)

---

## 📋 Sommaire

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation rapide (5 min)](#-installation-rapide-5-min)
- [Installation détaillée](#-installation-détaillée)
- [Accès à l'application](#-accès-à-lapplication)
- [Configuration des services externes](#-configuration-des-services-externes)
- [Commandes utiles](#-commandes-utiles)
- [Tests](#-tests)
- [Problèmes courants](#-problèmes-courants)
- [Structure du projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)

---

## ✨ Fonctionnalités

| Espace | Fonctionnalités |
|--------|-----------------|
| **🌐 Public** | Accueil, événements, demande de devis, contact, avis, RGPD |
| **👤 Client** | Dashboard, suivi événements, gestion devis, dépôt avis, profil |
| **👷 Employé** | Consultation clients/événements, notes, tâches, validation avis |
| **👑 Admin** | Gestion complète + prospects + devis PDF + employés + logs |

---

## 🛠 Technologies

| Backend | Frontend | Base de données | DevOps |
|---------|----------|-----------------|--------|
| Node.js 20 | React 19 | PostgreSQL 15 | Docker |
| Express.js | Vite | MongoDB 7 | GitHub Actions |
| JWT | Tailwind CSS | Cloudinary | Render |
| Nodemailer | React Router | | |

---

## 🚀 Installation rapide (5 min)

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et lancé
- [Git](https://git-scm.com/)

### Commandes

```bash
# 1. Cloner le projet
git clone https://github.com/VOTRE_USERNAME/innovevents-manager.git
cd innovevents-manager

# 2. Créer le fichier de configuration
cp .env.example .env

# 3. Lancer l'application
docker compose up -d --build

# 4. Vérifier que tout tourne
docker compose ps
```

### Accès

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:3000 |

### Compte admin par défaut

| Email | Mot de passe |
|-------|--------------|
| chloe@innovevents.com | Innovevents2024! |

> 💡 **Tip** : Pour charger les données de test complètes :
> ```bash
> docker compose exec app node database/seed.js
> ```

---

## 📝 Installation détaillée

### Étape 1 : Prérequis

Vérifiez que Docker est installé et lancé :

```bash
docker --version
# Docker version 24.x.x ou supérieur
```

### Étape 2 : Cloner le projet

```bash
git clone https://github.com/VOTRE_USERNAME/innovevents-manager.git
cd innovevents-manager
```

### Étape 3 : Configuration

```bash
# Copier le fichier d'exemple
cp .env.example .env
```

Le fichier `.env` contient des valeurs par défaut qui fonctionnent immédiatement avec Docker.

**Personnalisations optionnelles :**

| Variable | Pourquoi la modifier |
|----------|---------------------|
| `JWT_SECRET` | 🔒 **Obligatoire en production** - Sécurité |
| `SMTP_*` | Si vous voulez envoyer des emails |
| `CLOUDINARY_*` | Si vous voulez que les images persistent |

### Étape 4 : Lancer l'application

```bash
docker compose up -d --build
```

> ⏳ Première exécution : ~2-5 minutes (téléchargement des images)

### Étape 5 : Vérifier le statut

```bash
docker compose ps
```

Vous devez voir :

| Conteneur | Statut |
|-----------|--------|
| innovevents-app | ✅ Up |
| innovevents-frontend | ✅ Up |
| innovevents-postgres | ✅ Up |
| innovevents-mongodb | ✅ Up |
| innovevents-pgadmin | ✅ Up |
| innovevents-mongo-express | ✅ Up |

### Étape 6 : Voir les logs

```bash
# Tous les services
docker compose logs -f

# Un service spécifique
docker compose logs -f app
```

Attendez de voir :
```
✅ PostgreSQL connecté
✅ MongoDB connecté
🚀 Serveur démarré sur le port 3000
```

---

## 🌐 Accès à l'application

### Services principaux

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Application React |
| **Backend API** | http://localhost:3000 | API REST |
| **pgAdmin** | http://localhost:5050 | Interface PostgreSQL |
| **Mongo Express** | http://localhost:8081 | Interface MongoDB |

### Connexion pgAdmin

| Champ | Valeur |
|-------|--------|
| Email | `admin@admin.com` |
| Mot de passe | `admin123` |

Pour se connecter à PostgreSQL dans pgAdmin :
1. Clic droit "Servers" → "Register" → "Server"
2. **General** → Name: `InnovEvents`
3. **Connection** :
   - Host: `postgres` _(pas localhost !)_
   - Port: `5432`
   - Database: `innovevents_db`
   - Username: `innovevents`
   - Password: `innovevents123`

### Connexion Mongo Express

| Champ | Valeur |
|-------|--------|
| Username | `admin` |
| Password | `admin123` |

### Compte administrateur

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | chloe@innovevents.com | Innovevents2024! |

---

## ⚙️ Configuration des services externes

### 📷 Cloudinary (Stockage d'images)

**Sans Cloudinary** : Les images fonctionnent mais sont perdues à chaque redémarrage Docker.

**Avec Cloudinary** : Les images sont stockées de façon permanente.

1. Créez un compte gratuit sur [cloudinary.com](https://cloudinary.com/)
2. Dashboard → Copiez vos credentials
3. Ajoutez dans `.env` :

```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

4. Relancez : `docker compose up -d --build`

### 📧 Gmail SMTP (Envoi d'emails)

**Sans SMTP** : L'application fonctionne mais n'envoie pas d'emails.

1. Activez la [validation 2 étapes](https://myaccount.google.com/security) Google
2. Créez un [App Password](https://myaccount.google.com/apppasswords)
3. Ajoutez dans `.env` :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=votre_email@gmail.com
SMTP_FROM_NAME=Innov'Events
```

4. Relancez : `docker compose up -d`

---

## 🔧 Commandes utiles

### Docker Compose

> ⚠️ Utilisez `docker compose` (avec espace), pas `docker-compose`

```bash
# Démarrer
docker compose up -d

# Démarrer + rebuild (après modification de code ou dépendances)
docker compose up -d --build

# Arrêter
docker compose down

# Arrêter + supprimer les données (reset complet)
docker compose down -v

# Voir les logs en temps réel
docker compose logs -f

# Logs d'un service
docker compose logs -f app
docker compose logs -f frontend
docker compose logs -f postgres

# Statut des conteneurs
docker compose ps

# Redémarrer un service
docker compose restart app

# Exécuter une commande dans un conteneur
docker compose exec app npm install nouvelle-lib
```

### Accès direct aux conteneurs

```bash
# Shell dans le backend
docker compose exec app sh

# Shell dans PostgreSQL
docker compose exec postgres psql -U innovevents -d innovevents_db

# Shell dans MongoDB
docker compose exec mongodb mongosh -u innovevents -p innovevents123
```

---

## 🗃️ Base de données

### Initialisation automatique (Docker)

Avec Docker, la base de données est **automatiquement initialisée** au premier lancement grâce au fichier `database/init.sql`.

### Ajouter les données de test

```bash
# Depuis l'intérieur du conteneur
docker compose exec app node database/seed.js

# Ou initialisation complète (schéma + données)
docker compose exec app node database/init-db.js
```

### Scripts disponibles

| Script | Usage | Description |
|--------|-------|-------------|
| `database/init.sql` | Auto (Docker) | Crée les tables (schéma uniquement) |
| `database/seed.js` | Manuel | Ajoute les données de test |
| `database/init-db.js` | Manuel | Reset complet (schéma + données) |

### Données de test créées

| Table | Nombre | Exemples |
|-------|--------|----------|
| Utilisateurs | 6 | 1 admin, 2 employés, 3 clients |
| Prospects | 5 | 3 convertis, 1 à contacter, 1 échoué |
| Clients | 3 | Tech Solutions, StartUp Nation, Corporate Group |
| Événements | 4 | Séminaires, conférences, gala |
| Devis | 4 | Différents statuts |
| Prestations | 10 | Locations, traiteurs, animations |
| Notes | 5 | Notes sur événements |
| Tâches | 8 | À faire, en cours, terminées |
| Avis | 2 | Validé et en attente |
| Contacts | 3 | Messages du formulaire |

### Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | chloe@innovevents.com | Innovevents2024! |
| Employé | jose@innovevents.com | Innovevents2024! |
| Employé | marie@innovevents.com | Innovevents2024! |
| Client | pierre.bernard@entreprise.com | Innovevents2024! |
| Client | sophie.leroy@startup.fr | Innovevents2024! |
| Client | marc.petit@corporate.com | Innovevents2024! |

### Reset de la base de données

```bash
# Option 1 : Via le script (garde les volumes Docker)
docker compose exec app node database/init-db.js

# Option 2 : Reset complet (supprime tout)
docker compose down -v
docker compose up -d --build
```

---

## 🧪 Tests

```bash
# Tests backend (unitaires + intégration)
docker compose exec app npm test

# Tests frontend E2E
docker compose exec frontend npm run test:e2e
```

| Type | Framework | Nombre |
|------|-----------|--------|
| Unitaires | Jest | 21 |
| Intégration API | Jest + Supertest | 16 |
| End-to-End | Playwright | 10 |

---

## ❓ Problèmes courants

### `docker-compose: command not found`

**Solution** : Utilisez `docker compose` (avec espace)

```bash
# ❌ Ancien
docker-compose up -d

# ✅ Nouveau (Docker Desktop)
docker compose up -d
```

### `Cannot find module 'xxx'`

**Solution** : Rebuild les conteneurs

```bash
docker compose down
docker compose up -d --build
```

### `ENOTFOUND postgres` ou `Connection refused`

**Solution** : PostgreSQL n'est pas encore prêt

```bash
# Vérifiez le statut
docker compose ps

# Attendez et réessayez
docker compose restart app
```

### Les images disparaissent après redémarrage

**Solution** : Configurez Cloudinary (voir section Configuration)

### Port déjà utilisé

**Solution** : Modifiez les ports dans `docker-compose.yml` ou arrêtez le service existant

```bash
# Voir ce qui utilise le port 3000
lsof -i :3000

# Ou changez le port dans docker-compose.yml
ports:
  - "3001:3000"  # 3001 au lieu de 3000
```

### Reset complet (tout recommencer)

```bash
# Arrêter et supprimer tout
docker compose down -v

# Supprimer les images
docker rmi innovevents-manager-app innovevents-manager-frontend

# Relancer
docker compose up -d --build
```

---

## 📁 Structure du projet

```
innovevents-manager/
├── 📁 database/
│   └── init.sql              # Création des tables PostgreSQL
├── 📁 frontend/              # Application React
│   ├── 📁 src/
│   │   ├── 📁 components/    # Composants réutilisables
│   │   ├── 📁 pages/         # Pages de l'application
│   │   ├── 📁 context/       # Contextes React (Auth)
│   │   ├── 📁 services/      # Appels API (Axios)
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── 📁 src/                   # Backend Node.js
│   ├── 📁 config/            # Configuration (DB, Cloudinary)
│   ├── 📁 controllers/       # Logique des routes
│   ├── 📁 middlewares/       # Auth, validation, upload
│   ├── 📁 models/            # Requêtes SQL
│   ├── 📁 routes/            # Définition des routes
│   └── index.js              # Point d'entrée
├── 📁 tests/                 # Tests unitaires et E2E
├── docker-compose.yml        # Orchestration Docker
├── Dockerfile                # Image backend
├── .env.example              # Template configuration
└── package.json
```

---

## 📡 API Documentation

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion → retourne JWT |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/auth/me` | Profil (🔒 Auth) |

### Ressources

| Ressource | GET | POST | PUT | DELETE | Accès |
|-----------|-----|------|-----|--------|-------|
| `/api/prospects` | ✅ | ✅ | ✅ | ✅ | Admin |
| `/api/clients` | ✅ | ✅ | ✅ | ✅ | Admin |
| `/api/evenements` | ✅ | ✅ | ✅ | ✅ | Tous* |
| `/api/devis` | ✅ | ✅ | ✅ | ✅ | Admin, Client |
| `/api/avis` | ✅ | ✅ | ✅ | ✅ | Tous* |
| `/api/taches` | ✅ | ✅ | ✅ | ✅ | Admin, Employé |
| `/api/notes` | ✅ | ✅ | ✅ | ✅ | Admin, Employé |
| `/api/contact` | - | ✅ | - | - | Public |
| `/api/logs` | ✅ | - | - | - | Admin |

*Selon le rôle et la propriété des données

### Format des réponses

**Succès :**
```json
{
  "success": true,
  "data": { ... }
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

## 🚀 Déploiement

L'application est déployée sur **Render** avec :
- Backend : Web Service
- Frontend : Static Site
- PostgreSQL : Render PostgreSQL
- MongoDB : MongoDB Atlas
- Images : Cloudinary

Le déploiement est automatique via **GitHub Actions** à chaque push sur `main`.

---

## 📧 Contact

**Johann KOUAKOU** - Projet CDA (Concepteur Développeur d'Applications)

---

Développé avec ❤️ | 2025-2026