# 🚀 Guide Complet : Déployer une Application sur Render

> Guide en français simple pour déployer une application Full-Stack (Backend + Frontend + Base de données) sur Render.

---

## 📋 Table des matières

1. [Prérequis](#1---prérequis)
2. [Comprendre l'architecture](#2---comprendre-larchitecture)
3. [Créer un compte Render](#3---créer-un-compte-render)
4. [Déployer PostgreSQL](#4---déployer-postgresql-base-de-données)
5. [Configurer MongoDB Atlas](#5---configurer-mongodb-atlas-optionnel)
6. [Déployer le Backend](#6---déployer-le-backend-web-service)
7. [Déployer le Frontend](#7---déployer-le-frontend-static-site)
8. [Configurer le CI/CD automatique](#8---configurer-le-cicd-automatique)
9. [Dépannage courant](#9---dépannage-courant)
10. [Checklist finale](#10---checklist-finale)

---

## 1 - Prérequis

Avant de commencer, assure-toi d'avoir :

| Élément | Description |
|---------|-------------|
| ✅ Code sur GitHub | Ton projet doit être pushé sur un repo GitHub |
| ✅ Compte GitHub | Pour connecter Render à ton repo |
| ✅ Application qui fonctionne en local | Teste TOUJOURS en local avant de déployer |
| ✅ Variables d'environnement listées | Note toutes les variables `.env` nécessaires |

---

## 2 - Comprendre l'architecture

### Schéma simplifié

```
┌─────────────────────────────────────────────────────────────┐
│                     UTILISATEUR                             │
│                   (navigateur web)                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              STATIC SITE (Frontend)                         │
│              - React / Vue / Angular                        │
│              - Fichiers HTML/CSS/JS                         │
│              - Ce que l'utilisateur VOIT                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Requêtes API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              WEB SERVICE (Backend)                          │
│              - Node.js / Python / Java                      │
│              - API REST                                     │
│              - Logique métier                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (Base de données)                     │
│              - PostgreSQL / MySQL                           │
│              - Stockage des données                         │
└─────────────────────────────────────────────────────────────┘
```

### Les 3 types de services Render

| Type | Usage | Gratuit ? | Exemple |
|------|-------|:---------:|---------|
| **Database** | Base de données PostgreSQL | ✅ (limité) | Stocker utilisateurs, produits, etc. |
| **Web Service** | Backend avec serveur | ✅ (limité) | API Node.js, Python Flask, etc. |
| **Static Site** | Frontend sans serveur | ✅ (illimité) | React, Vue, HTML/CSS/JS |

---

## 3 - Créer un compte Render

### Étapes

1. Va sur **https://render.com**
2. Clique sur **"Get Started for Free"**
3. Connecte-toi avec **GitHub** (recommandé) ou email
4. Autorise Render à accéder à tes repos GitHub

### Conseil

> 🔑 Utilise la connexion GitHub : ça facilite le déploiement automatique de tes projets.

---

## 4 - Déployer PostgreSQL (Base de données)

### Étape 4.1 : Créer la base de données

1. Va sur **https://dashboard.render.com**
2. Clique sur **"New +"** → **"PostgreSQL"**

### Étape 4.2 : Remplir le formulaire

| Champ | Valeur | Explication |
|-------|--------|-------------|
| **Name** | `nom-de-ton-projet-db` | Nom de ta base (ex: `innovevents-db`) |
| **Database** | `nom_base` | Nom de la BDD (ex: `innovevents`) |
| **User** | `nom_user` | Utilisateur (ex: `innovevents_user`) |
| **Region** | `Frankfurt (EU Central)` | Choisis le plus proche de tes utilisateurs |
| **PostgreSQL Version** | `15` ou `16` | Version récente recommandée |
| **Instance Type** | `Free` | Gratuit (limité à 1GB, expire après 90 jours) |

### Étape 4.3 : Créer et récupérer les infos

1. Clique sur **"Create Database"**
2. Attends ~2 minutes que la base soit prête
3. **IMPORTANT** : Note ces informations dans la section **"Connections"**

| Variable | Où la trouver |
|----------|---------------|
| `POSTGRES_HOST` | Hostname (ex: `dpg-xxx.frankfurt-postgres.render.com`) |
| `POSTGRES_PORT` | Port (généralement `5432`) |
| `POSTGRES_USER` | Username |
| `POSTGRES_PASSWORD` | Password (clique sur "Show" pour voir) |
| `POSTGRES_DB` | Database |
| `DATABASE_URL` | Internal Database URL (pour connexion interne) |

### ⚠️ Attention

> La base gratuite **expire après 90 jours**. Pense à sauvegarder tes données ou passer en payant pour un vrai projet.

---

## 5 - Configurer MongoDB Atlas (Optionnel)

> Utilise MongoDB Atlas si tu as besoin d'une base NoSQL (pour les logs, données non structurées, etc.)

### Étape 5.1 : Créer un compte

1. Va sur **https://www.mongodb.com/atlas**
2. Clique sur **"Try Free"**
3. Crée un compte (email ou Google)

### Étape 5.2 : Créer un cluster

1. Clique sur **"Build a Database"**
2. Choisis **"M0 FREE"** (gratuit, 512MB)
3. Provider : **AWS**
4. Region : **eu-west-1 (Ireland)** ou **eu-central-1 (Frankfurt)**
5. Cluster Name : `nom-de-ton-projet`
6. Clique sur **"Create Deployment"**

### Étape 5.3 : Créer un utilisateur

| Champ | Valeur |
|-------|--------|
| Username | `admin` ou ton choix |
| Password | Génère un mot de passe fort (note-le !) |

### Étape 5.4 : Configurer l'accès réseau

1. Va dans **"Network Access"** (menu gauche)
2. Clique sur **"Add IP Address"**
3. Clique sur **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Clique sur **"Confirm"**

> ⚠️ "Allow Access from Anywhere" est nécessaire pour que Render puisse se connecter.

### Étape 5.5 : Récupérer l'URI de connexion

1. Va dans **"Database"** → **"Connect"**
2. Choisis **"Drivers"**
3. Copie l'URI qui ressemble à :

```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

4. Remplace `<password>` par ton vrai mot de passe
5. Ajoute le nom de ta base avant `?` :

```
mongodb+srv://admin:motdepasse@cluster0.xxxxx.mongodb.net/nom_base?retryWrites=true&w=majority
```

---

## 6 - Déployer le Backend (Web Service)

### Étape 6.1 : Préparer ton code

Assure-toi que ton projet a :

```
projet/
├── package.json          # Avec scripts "start" et "build" (si nécessaire)
├── src/
│   └── index.js          # Point d'entrée (ou app.js, server.js)
├── .env.example          # Liste des variables d'environnement nécessaires
└── ...
```

**Dans `package.json`, vérifie le script `start` :**

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

**Ton serveur doit écouter sur `process.env.PORT` :**

```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
```

### Étape 6.2 : Créer le Web Service

1. Va sur **https://dashboard.render.com**
2. Clique sur **"New +"** → **"Web Service"**
3. Connecte ton repo GitHub (ou "Public Git repository" si public)

### Étape 6.3 : Remplir le formulaire

| Champ | Valeur | Explication |
|-------|--------|-------------|
| **Name** | `nom-de-ton-projet` | Nom du service (ex: `innovevents-api`) |
| **Region** | `Frankfurt (EU Central)` | Même région que ta base PostgreSQL |
| **Branch** | `main` | Branche à déployer |
| **Root Directory** | *(vide ou chemin)* | Si backend dans un sous-dossier (ex: `backend`) |
| **Runtime** | `Node` | Ou Python, Go, etc. selon ton projet |
| **Build Command** | `npm install` | Commande pour installer les dépendances |
| **Start Command** | `npm start` | Commande pour démarrer l'application |
| **Instance Type** | `Free` | Gratuit (limité, se met en veille après 15min d'inactivité) |

### Étape 6.4 : Configurer les variables d'environnement

Clique sur **"Advanced"** → **"Add Environment Variable"**

Ajoute TOUTES les variables de ton `.env` :

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `POSTGRES_HOST` | *(copié depuis ta DB Render)* |
| `POSTGRES_PORT` | `5432` |
| `POSTGRES_USER` | *(copié depuis ta DB Render)* |
| `POSTGRES_PASSWORD` | *(copié depuis ta DB Render)* |
| `POSTGRES_DB` | *(copié depuis ta DB Render)* |
| `MONGO_URI` | *(copié depuis MongoDB Atlas)* |
| `JWT_SECRET` | *(une chaîne secrète longue)* |
| ... | ... |

### Étape 6.5 : Déployer

1. Clique sur **"Create Web Service"**
2. Attends que le déploiement se termine (~3-5 minutes)
3. Vérifie les logs pour voir si tout est OK
4. Ton backend est accessible à : `https://nom-du-service.onrender.com`

### Étape 6.6 : Tester

Ouvre dans ton navigateur :
- `https://nom-du-service.onrender.com/` → Doit afficher un message
- `https://nom-du-service.onrender.com/api/health` → Doit retourner un JSON

---

## 7 - Déployer le Frontend (Static Site)

### Étape 7.1 : Préparer ton code

**Structure attendue :**

```
frontend/
├── package.json          # Avec script "build"
├── src/
├── public/
│   └── _redirects        # IMPORTANT pour les SPA !
├── index.html
└── ...
```

**Créer le fichier `_redirects` (OBLIGATOIRE pour React/Vue/Angular) :**

```bash
echo '/* /index.html 200' > frontend/public/_redirects
```

> Ce fichier permet aux routes React (ex: `/login`, `/dashboard`) de fonctionner correctement.

**Configurer l'URL de l'API :**

Dans ton code frontend, utilise une variable d'environnement :

```javascript
// Exemple avec Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Exemple avec Create React App
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

### Étape 7.2 : Créer le Static Site

1. Va sur **https://dashboard.render.com**
2. Clique sur **"New +"** → **"Static Site"**
3. Connecte ton repo GitHub

### Étape 7.3 : Remplir le formulaire

| Champ | Valeur | Explication |
|-------|--------|-------------|
| **Name** | `nom-de-ton-projet-frontend` | Ex: `innovevents-frontend` |
| **Branch** | `main` | Branche à déployer |
| **Root Directory** | `frontend` | Chemin vers ton frontend (si dans un sous-dossier) |
| **Build Command** | `npm install && npm run build` | Installe et compile |
| **Publish Directory** | `dist` | Dossier généré par le build (Vite = `dist`, CRA = `build`) |

### Étape 7.4 : Ajouter les variables d'environnement

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://nom-backend.onrender.com/api` |

> Remplace `nom-backend` par le nom de ton Web Service.

### Étape 7.5 : Déployer

1. Clique sur **"Create Static Site"**
2. Attends ~2-3 minutes
3. Ton frontend est accessible à : `https://nom-frontend.onrender.com`

---

## 8 - Configurer le CI/CD automatique

### Option A : Auto-Deploy (par défaut)

Par défaut, Render redéploie automatiquement quand tu push sur la branche configurée (`main`).

**Pour vérifier :**
1. Va dans ton service → **"Settings"**
2. Vérifie que **"Auto-Deploy"** est sur **"Yes"**

### Option B : Deploy Hook (pour GitHub Actions)

Si tu veux contrôler quand déployer (après les tests par exemple) :

1. Va dans ton service → **"Settings"**
2. Descends jusqu'à **"Deploy Hook"**
3. Clique sur **"Create Deploy Hook"**
4. Copie l'URL générée

**Ajouter le secret dans GitHub :**

1. Va sur ton repo GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Clique sur **"New repository secret"**
3. Name : `RENDER_DEPLOY_HOOK_URL`
4. Value : *(colle l'URL du Deploy Hook)*

**Créer le workflow GitHub Actions :**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render Deploy
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```

---

## 9 - Dépannage courant

### ❌ Erreur : "Build failed"

**Causes possibles :**
- Erreur dans le code (vérifie les logs)
- Dépendance manquante dans `package.json`
- Mauvais chemin pour Root Directory ou Publish Directory

**Solution :**
```bash
# Teste le build en local
npm run build
```

---

### ❌ Erreur : "Connection refused" (PostgreSQL)

**Causes possibles :**
- Mauvais host/port/user/password
- Base de données pas encore prête

**Solution :**
1. Vérifie que les variables correspondent EXACTEMENT à celles dans Render
2. Attention aux majuscules/minuscules !
3. Utilise le bouton 📋 pour copier les valeurs

---

### ❌ Erreur : "MongoNetworkError"

**Causes possibles :**
- IP non autorisée dans MongoDB Atlas
- URI mal formatée

**Solution :**
1. Va dans MongoDB Atlas → **Network Access**
2. Vérifie que `0.0.0.0/0` est autorisé
3. Vérifie l'URI : `mongodb+srv://user:password@cluster.xxxxx.mongodb.net/database?retryWrites=true&w=majority`

---

### ❌ Page blanche sur le frontend

**Causes possibles :**
- Fichier `_redirects` manquant
- `VITE_API_URL` mal configurée
- Erreur JavaScript (ouvre la console F12)

**Solution :**
1. Vérifie que `public/_redirects` existe avec `/* /index.html 200`
2. Vérifie la variable d'environnement `VITE_API_URL`

---

### ❌ Les routes `/login`, `/dashboard` retournent "Not Found"

**Cause :**
- Fichier `_redirects` manquant ou mal placé

**Solution :**
```bash
echo '/* /index.html 200' > frontend/public/_redirects
git add .
git commit -m "fix: add _redirects for SPA"
git push
```

---

### ❌ Le backend se met en veille (lent à répondre)

**Cause :**
- Plan gratuit : le serveur s'éteint après 15 min d'inactivité

**Solutions :**
1. Accepter le délai (~30 sec au premier appel)
2. Utiliser un service de "ping" gratuit (UptimeRobot, cron-job.org)
3. Passer au plan payant ($7/mois)

---

## 10 - Checklist finale

### Avant de déployer

- [ ] Code pushé sur GitHub (branche `main`)
- [ ] Application testée en local
- [ ] Liste des variables d'environnement prête
- [ ] Script `start` dans `package.json` (backend)
- [ ] Script `build` dans `package.json` (frontend)
- [ ] Fichier `_redirects` créé (frontend SPA)

### Pendant le déploiement

- [ ] PostgreSQL créé et infos notées
- [ ] MongoDB Atlas configuré (si utilisé)
- [ ] Web Service créé avec toutes les variables
- [ ] Static Site créé avec `VITE_API_URL`

### Après le déploiement

- [ ] Backend répond sur `/api/health`
- [ ] Frontend s'affiche correctement
- [ ] Connexion à la base de données OK
- [ ] Toutes les fonctionnalités testées

---

## 📚 Ressources utiles

| Ressource | Lien |
|-----------|------|
| Documentation Render | https://render.com/docs |
| Documentation MongoDB Atlas | https://www.mongodb.com/docs/atlas/ |
| Render Status | https://status.render.com |

---

## 🎉 Félicitations !

Si tu as suivi toutes ces étapes, ton application est maintenant en ligne et accessible au monde entier !

---

*Guide créé pour le projet Innov'Events - Examen CDA*
*Dernière mise à jour : Janvier 2026*
