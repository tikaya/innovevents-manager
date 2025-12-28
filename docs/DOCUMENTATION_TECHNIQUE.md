# 📚 Documentation Technique - Innov'Events

## Table des matières

1. [Gestion de version avec Git](#1-gestion-de-version-avec-git)
2. [Conteneurisation avec Docker](#2-conteneurisation-avec-docker)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Guide de déploiement](#4-guide-de-déploiement)

---

## 1. Gestion de version avec Git

### 1.1 Structure des branches

Le projet utilise une stratégie de branches **Git Flow simplifiée** :
```
main (production)
  │
  └── dev (développement)
        │
        ├── feature/xxx (nouvelles fonctionnalités)
        ├── fix/xxx (corrections de bugs)
        └── hotfix/xxx (corrections urgentes)
```

| Branche | Description | Protection |
|---------|-------------|------------|
| `main` | Code en production, stable | ✅ Protégée |
| `dev` | Développement, intégration | ✅ Protégée |
| `feature/*` | Nouvelles fonctionnalités | ❌ Temporaire |
| `fix/*` | Corrections de bugs | ❌ Temporaire |

### 1.2 Workflow de développement

#### Créer une nouvelle fonctionnalité
```bash
# 1. Se positionner sur dev et mettre à jour
git checkout dev
git pull origin dev

# 2. Créer une branche feature
git checkout -b feature/nom-fonctionnalite

# 3. Développer et commiter
git add .
git commit -m "feat: description de la fonctionnalité"

# 4. Pousser la branche
git push origin feature/nom-fonctionnalite

# 5. Créer une Pull Request vers dev sur GitHub

# 6. Après validation, merger dans dev
git checkout dev
git merge feature/nom-fonctionnalite
git push origin dev

# 7. Supprimer la branche feature
git branch -d feature/nom-fonctionnalite
```

#### Déployer en production
```bash
# 1. Mettre à jour main depuis dev
git checkout main
git pull origin main
git merge dev
git push origin main

# 2. Créer un tag de version
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

### 1.3 Convention de commits

Le projet suit la convention **Conventional Commits** :
```
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]
```

#### Types de commits

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat: ajout page de connexion` |
| `fix` | Correction de bug | `fix: erreur validation email` |
| `docs` | Documentation | `docs: mise à jour README` |
| `style` | Formatage (pas de changement de code) | `style: correction indentation` |
| `refactor` | Refactorisation | `refactor: optimisation requêtes SQL` |
| `test` | Ajout/modification de tests | `test: tests unitaires AuthService` |
| `chore` | Maintenance | `chore: mise à jour dépendances` |

#### Exemples de commits du projet
```
588fef8 docs: Ajout README.md et .env.example
1615684 fix(security): Sécurisation scripts avec variables d'environnement
efa0e4c feat: Journalisation MongoDB + Changement MDP obligatoire
6e9f27d dev front
```

### 1.4 Fichier .gitignore
```gitignore
# Dépendances
node_modules/
frontend/node_modules/

# Environnement
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*

# Build
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Fichiers temporaires sensibles
fix-*.js
*.local.js

# Uploads et fichiers générés
uploads/*
!uploads/.gitkeep
devis/*.pdf
```

---

## 2. Conteneurisation avec Docker

### 2.1 Vue d'ensemble de l'architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Network (innovevents-network)          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Frontend   │  │   Backend    │  │     PostgreSQL       │  │
│  │   (React)    │──│   (Node.js)  │──│   (Base de données)  │  │
│  │   :5173      │  │   :3000      │  │   :5432              │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                           │                    │                 │
│                           │          ┌─────────┴────────┐       │
│                           │          │     pgAdmin      │       │
│                           │          │     :5050        │       │
│                           │          └──────────────────┘       │
│                           │                                      │
│                    ┌──────┴───────┐  ┌──────────────────────┐   │
│                    │   MongoDB    │──│   Mongo Express      │   │
│                    │   :27017     │  │   :8081              │   │
│                    └──────────────┘  └──────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Services Docker

| Service | Image | Port externe | Port interne | Description |
|---------|-------|--------------|--------------|-------------|
| `app` | node:20-alpine (build) | 3000 | 3000 | API Backend Node.js |
| `frontend` | node:20-alpine (build) | 5173 | 5173 | Application React |
| `postgres` | postgres:15-alpine | 5433 | 5432 | Base de données SQL |
| `pgadmin` | dpage/pgadmin4 | 5050 | 80 | Interface admin PostgreSQL |
| `mongodb` | mongo:7 | 27018 | 27017 | Base de données NoSQL |
| `mongo-express` | mongo-express | 8081 | 8081 | Interface admin MongoDB |

### 2.3 Dockerfile Backend
```dockerfile
# Image de base Node.js Alpine (légère)
FROM node:20-alpine

# Répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du code source
COPY . .

# Port exposé
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "dev"]
```

**Explications :**
- `node:20-alpine` : Image légère (~50MB vs ~350MB pour l'image standard)
- `WORKDIR` : Définit le répertoire de travail
- `COPY package*.json ./` : Copie package.json et package-lock.json
- `RUN npm install` : Installe les dépendances (mis en cache Docker)
- `EXPOSE 3000` : Documente le port utilisé

### 2.4 Dockerfile Frontend
```dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# --host 0.0.0.0 permet l'accès depuis l'extérieur du conteneur
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 2.5 Docker Compose

#### Structure complète
```yaml
services:
  # ============================================
  # APPLICATION BACKEND (Node.js/Express)
  # ============================================
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: innovevents-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - .:/usr/src/app              # Code source (hot reload)
      - /usr/src/app/node_modules   # Préserve node_modules du conteneur
    environment:
      - NODE_ENV=development
      - POSTGRES_HOST=postgres      # Nom du service Docker
      - POSTGRES_PORT=5432
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      - MONGO_URI=mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017/${MONGO_DB}?authSource=admin
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - SMTP_FROM=${SMTP_FROM}
      - SMTP_FROM_NAME=${SMTP_FROM_NAME}
    depends_on:
      - postgres
      - mongodb
    networks:
      - innovevents-network

  # ============================================
  # APPLICATION FRONTEND (React/Vite)
  # ============================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: innovevents-frontend
    restart: unless-stopped
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/usr/src/app
      - /usr/src/app/node_modules
    environment:
      - VITE_API_URL=http://localhost:3000/api
    depends_on:
      - app
    networks:
      - innovevents-network

  # ============================================
  # BASE DE DONNÉES POSTGRESQL
  # ============================================
  postgres:
    image: postgres:15-alpine
    container_name: innovevents-postgres
    restart: unless-stopped
    ports:
      - "5433:5432"           # Port externe différent pour éviter conflits
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data    # Persistance des données
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql  # Script d'init
    networks:
      - innovevents-network

  # ============================================
  # PGADMIN - Interface PostgreSQL
  # ============================================
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: innovevents-pgadmin
    restart: unless-stopped
    ports:
      - "5050:80"
    environment:
      - PGADMIN_DEFAULT_EMAIL=${PGADMIN_EMAIL}
      - PGADMIN_DEFAULT_PASSWORD=${PGADMIN_PASSWORD}
    depends_on:
      - postgres
    networks:
      - innovevents-network

  # ============================================
  # BASE DE DONNÉES MONGODB (Journalisation)
  # ============================================
  mongodb:
    image: mongo:7
    container_name: innovevents-mongodb
    restart: unless-stopped
    ports:
      - "27018:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
      - MONGO_INITDB_DATABASE=${MONGO_DB}
    volumes:
      - mongodb-data:/data/db
    networks:
      - innovevents-network

  # ============================================
  # MONGO EXPRESS - Interface MongoDB
  # ============================================
  mongo-express:
    image: mongo-express:latest
    container_name: innovevents-mongo-express
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_ADMINUSERNAME=${MONGO_USER}
      - ME_CONFIG_MONGODB_ADMINPASSWORD=${MONGO_PASSWORD}
      - ME_CONFIG_MONGODB_SERVER=mongodb
      - ME_CONFIG_BASICAUTH_USERNAME=${MONGO_EXPRESS_USER}
      - ME_CONFIG_BASICAUTH_PASSWORD=${MONGO_EXPRESS_PASSWORD}
    depends_on:
      - mongodb
    networks:
      - innovevents-network

# ============================================
# VOLUMES PERSISTANTS
# ============================================
volumes:
  postgres-data:    # Données PostgreSQL
  mongodb-data:     # Données MongoDB

# ============================================
# RÉSEAU DOCKER
# ============================================
networks:
  innovevents-network:
    driver: bridge
```

### 2.6 Commandes Docker essentielles

#### Gestion des conteneurs
```bash
# Construire et démarrer tous les services
docker-compose up -d --build

# Voir les logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f app

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (ATTENTION: perte de données)
docker-compose down -v

# Redémarrer un service
docker-compose restart app

# Voir l'état des conteneurs
docker-compose ps
```

#### Accès aux conteneurs
```bash
# Accéder au shell du backend
docker exec -it innovevents-app sh

# Accéder à PostgreSQL
docker exec -it innovevents-postgres psql -U innovevents -d innovevents_db

# Accéder à MongoDB
docker exec -it innovevents-mongodb mongosh -u innovevents -p innovevents123 --authenticationDatabase admin
```

#### Maintenance
```bash
# Nettoyer les images non utilisées
docker image prune -a

# Nettoyer tout (conteneurs, images, volumes orphelins)
docker system prune -a

# Voir l'utilisation disque
docker system df
```

### 2.7 Variables d'environnement

Les variables sont définies dans le fichier `.env` à la racine du projet :
```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=innovevents
POSTGRES_PASSWORD=votre_mot_de_passe
POSTGRES_DB=innovevents_db

# MongoDB
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_USER=innovevents
MONGO_PASSWORD=votre_mot_de_passe
MONGO_DB=innovevents_db

# JWT
JWT_SECRET=votre_secret_jwt
JWT_EXPIRES_IN=24h

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_app
SMTP_FROM=contact@innovevents.com
SMTP_FROM_NAME=Innov'Events
```

> ⚠️ **Important** : Ne jamais commiter le fichier `.env` dans Git !

---

## 3. Architecture du projet

### 3.1 Structure des dossiers
```
innovevents-manager/
├── 📁 src/                     # Code source backend
│   ├── 📁 config/             # Configuration (DB, MongoDB)
│   │   ├── database.js        # Connexion PostgreSQL
│   │   ├── mongodb.js         # Connexion MongoDB
│   │   └── init.sql           # Script d'initialisation BDD
│   ├── �� controllers/        # Contrôleurs (logique HTTP)
│   │   ├── AuthController.js
│   │   ├── ClientController.js
│   │   ├── EvenementController.js
│   │   └── ...
│   ├── 📁 middlewares/        # Middlewares Express
│   │   ├── auth.js            # Authentification JWT
│   │   ├── validation.js      # Validation des entrées
│   │   └── errorHandler.js    # Gestion des erreurs
│   ├── 📁 models/             # Modèles de données
│   │   ├── Utilisateur.js
│   │   ├── Client.js
│   │   └── ...
│   ├── 📁 routes/             # Routes API
│   │   ├── index.js           # Point d'entrée routes
│   │   ├── auth.js
│   │   └── ...
│   ├── 📁 services/           # Logique métier
│   │   ├── AuthService.js
│   │   ├── EmailService.js
│   │   ├── LogService.js
│   │   └── ...
│   └── app.js                 # Point d'entrée application
│
├── 📁 frontend/               # Code source frontend
│   ├── 📁 src/
│   │   ├── 📁 components/     # Composants React réutilisables
│   │   │   ├── 📁 layout/     # Header, Footer, Sidebar
│   │   │   └── 📁 ui/         # Boutons, Modals, etc.
│   │   ├── 📁 pages/          # Pages de l'application
│   │   │   ├── 📁 public/     # Pages publiques
│   │   │   ├── 📁 auth/       # Connexion, Inscription
│   │   │   ├── 📁 admin/      # Espace administrateur
│   │   │   ├── 📁 client/     # Espace client
│   │   │   └── 📁 employe/    # Espace employé
│   │   ├── 📁 context/        # Contextes React (Auth)
│   │   ├── 📁 services/       # Services API (Axios)
│   │   └── App.jsx            # Composant principal
│   └── index.html
│
├── 📁 database/               # Scripts SQL
│   └── init.sql               # Initialisation BDD
│
├── 📁 docs/                   # Documentation
│   └── DOCUMENTATION_TECHNIQUE.md
│
├── 📁 uploads/                # Fichiers uploadés
├── 📁 devis/                  # PDFs générés
│
├── docker-compose.yml         # Configuration Docker
├── Dockerfile                 # Image Docker backend
├── .env                       # Variables d'environnement
├── .env.example              # Template des variables
├── .gitignore                # Fichiers ignorés par Git
├── package.json              # Dépendances backend
└── README.md                 # Guide d'installation
```

### 3.2 Flux de données
```
┌─────────────┐     HTTP      ┌─────────────┐     SQL      ┌─────────────┐
│   Client    │ ───────────── │   Backend   │ ───────────  │ PostgreSQL  │
│   (React)   │   REST API    │  (Express)  │              │             │
└─────────────┘               └─────────────┘              └─────────────┘
                                     │
                                     │ Logs
                                     ▼
                              ┌─────────────┐
                              │   MongoDB   │
                              │   (Logs)    │
                              └─────────────┘
```

---

## 4. Guide de déploiement

### 4.1 Déploiement local (développement)
```bash
# 1. Cloner le projet
git clone https://github.com/votre-username/innovevents-manager.git
cd innovevents-manager

# 2. Configurer les variables d'environnement
cp .env.example .env
nano .env  # Éditer avec vos valeurs

# 3. Lancer avec Docker
docker-compose up -d --build

# 4. Vérifier que tout fonctionne
docker-compose ps
docker-compose logs -f
```

### 4.2 Accès aux services

| Service | URL | Identifiants |
|---------|-----|--------------|
| Frontend | http://localhost:5173 | - |
| Backend API | http://localhost:3000 | - |
| pgAdmin | http://localhost:5050 | Voir .env |
| Mongo Express | http://localhost:8081 | Voir .env |

### 4.3 Déploiement production (recommandations)

1. **Modifier les Dockerfiles** pour la production :
   - Utiliser `npm run build` au lieu de `npm run dev`
   - Servir le frontend avec Nginx

2. **Sécuriser les variables** :
   - Utiliser des secrets Docker ou un gestionnaire de secrets
   - Ne jamais exposer les mots de passe

3. **Configurer un reverse proxy** (Nginx/Traefik) :
   - SSL/TLS (HTTPS)
   - Load balancing

4. **Monitoring** :
   - Ajouter des healthchecks Docker
   - Configurer des alertes

---

## 📝 Auteur

**Innov'Events** - Projet de gestion d'événements

---

*Documentation générée le 28/12/2024*
