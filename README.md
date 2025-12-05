# Innov'Events Manager

Application de gestion pour l'agence événementielle Innov'Events.

## 📋 Description

Innov'Events Manager est une application web permettant de gérer :
- Les clients et prospects
- Les événements (séminaires, conférences)
- Les propositions commerciales
- La facturation

## 🛠️ Stack technique

- **Backend** : Node.js / Express
- **Base de données relationnelle** : PostgreSQL
- **Base de données NoSQL** : MongoDB
- **Containerisation** : Docker

## 📦 Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé
- Git

## 🚀 Installation

### 1. Cloner le repository
```bash
git clone https://github.com/TON_USERNAME/innovevents-manager.git
cd innovevents-manager
```

### 2. Configurer les variables d'environnement

Copie le fichier d'exemple et modifie les valeurs :
```bash
cp .env.example .env
```

Remplis le fichier `.env` avec tes propres valeurs.

### 3. Lancer l'application
```bash
docker compose up --build
```

### 4. Vérifier que tout fonctionne

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| pgAdmin | http://localhost:5050 |
| Mongo Express | http://localhost:8081 |

## 🐳 Services Docker

| Container | Description | Port |
|-----------|-------------|------|
| innovevents-app | Application Node.js/Express | 3000 |
| innovevents-postgres | Base de données PostgreSQL | 5433 |
| innovevents-mongodb | Base de données MongoDB | 27018 |
| innovevents-pgadmin | Interface PostgreSQL | 5050 |
| innovevents-mongo-express | Interface MongoDB | 8081 |

## 📁 Structure du projet
```
innovevents-manager/
├── src/
│   └── index.js          # Point d'entrée de l'application
├── docker-compose.yml    # Configuration des services Docker
├── Dockerfile            # Image Docker pour Node.js
├── .dockerignore         # Fichiers ignorés par Docker
├── .env.example          # Exemple de variables d'environnement
├── .gitignore            # Fichiers ignorés par Git
├── package.json          # Dépendances Node.js
└── README.md             # Ce fichier
```

## 🔧 Commandes utiles
```bash
# Démarrer les containers
docker compose up

# Démarrer en arrière-plan
docker compose up -d

# Arrêter les containers
docker compose down

# Voir les logs
docker compose logs

# Voir les logs d'un service spécifique
docker compose logs app

# Reconstruire les images
docker compose up --build

# Supprimer les containers ET les données
docker compose down -v
```

## 🌿 Branches Git

| Branche | Description |
|---------|-------------|
| `main` | Version stable (production) |
| `dev` | Développement en cours |

## 👥 Auteur

- [Tikaya](https://github.com/tikaya)

## 📄 Licence

Ce projet est développé dans le cadre d'un examen CDA.