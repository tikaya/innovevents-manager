# 🍃 Guide MongoDB Atlas - Créer un Cluster de A à Z

Guide simple en français pour créer et configurer un cluster MongoDB Atlas gratuit.

---

## 📋 Table des matières

1. [Créer un compte](#étape-1--créer-un-compte)
2. [Créer un cluster gratuit](#étape-2--créer-un-cluster-gratuit)
3. [Créer un utilisateur de base de données](#étape-3--créer-un-utilisateur-de-base-de-données)
4. [Configurer l'accès réseau](#étape-4--configurer-laccès-réseau)
5. [Obtenir la Connection String](#étape-5--obtenir-la-connection-string)
6. [Tester la connexion](#étape-6--tester-la-connexion)

---

## Étape 1 : Créer un compte

### 1.1 Accéder au site

1. Ouvre ton navigateur
2. Va sur : **https://www.mongodb.com/atlas**
3. Clique sur **"Try Free"** (en haut à droite)

### 1.2 Créer le compte

| Option | Description |
|--------|-------------|
| **Sign up with Google** | ⭐ Le plus rapide |
| **Sign up with GitHub** | ✅ Très bien aussi |
| **Email + Password** | ✅ Classique |

4. Choisis ton option préférée
5. Remplis les informations demandées
6. Valide ton email si nécessaire

---

## Étape 2 : Créer un cluster gratuit

### 2.1 Lancer la création

Après connexion, tu arrives sur le Dashboard.

1. Clique sur **"Build a Database"** ou **"Create"**

### 2.2 Choisir le plan GRATUIT

```
┌─────────────────────────────────────────────┐
│         Choisis le plan M0 FREE             │
│                                             │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│   │   M0    │  │Serverless│ │Dedicated│   │
│   │  FREE   │  │  Payant  │ │  Payant │   │
│   │   ✅    │  │    ❌    │ │    ❌   │   │
│   └─────────┘  └─────────┘  └─────────┘   │
└─────────────────────────────────────────────┘
```

### 2.3 Configurer le cluster

| Paramètre | Valeur recommandée |
|-----------|-------------------|
| **Provider** | AWS |
| **Region** | `eu-west-3 (Paris)` ou `eu-central-1 (Frankfurt)` |
| **Cluster Name** | `mon-cluster` (ou le nom de ton projet) |

2. Clique sur **"Create Deployment"** ou **"Create"**
3. Attends 1-3 minutes que le cluster soit créé

---

## Étape 3 : Créer un utilisateur de base de données

### 3.1 Accéder à Database Access

1. Dans le menu gauche, clique sur **"Database Access"** (sous SECURITY)

```
┌─────────────────────┐
│  SECURITY           │
├─────────────────────┤
│  Database Access ←  │
│  Network Access     │
└─────────────────────┘
```

### 3.2 Créer l'utilisateur

1. Clique sur **"+ Add New Database User"**

2. Remplis les informations :

| Champ | Valeur |
|-------|--------|
| **Authentication Method** | Password |
| **Username** | `mon_utilisateur` (ex: `app_user`) |
| **Password** | Clique sur **"Autogenerate Secure Password"** |

3. **⚠️ IMPORTANT : COPIE LE MOT DE PASSE** et garde-le en sécurité !

4. **Database User Privileges** : Sélectionne **"Read and write to any database"**

5. Clique sur **"Add User"**

### 3.3 Format du mot de passe

Si tu crées ton propre mot de passe, évite les caractères spéciaux compliqués.

**✅ Bon exemple :** `MonMotDePasse123`

**❌ Évite :** `Pass@word#123!` (les caractères spéciaux posent des problèmes dans l'URL)

Si tu dois utiliser des caractères spéciaux, encode-les :

| Caractère | Encodage URL |
|-----------|--------------|
| `@` | `%40` |
| `#` | `%23` |
| `!` | `%21` |
| `%` | `%25` |
| `/` | `%2F` |
| `:` | `%3A` |

---

## Étape 4 : Configurer l'accès réseau

### 4.1 Accéder à Network Access

1. Dans le menu gauche, clique sur **"Network Access"** (sous SECURITY)

### 4.2 Autoriser toutes les connexions

Pour permettre à ton application (hébergée n'importe où) de se connecter :

1. Clique sur **"+ Add IP Address"**

2. Clique sur **"ALLOW ACCESS FROM ANYWHERE"**
   - Cela ajoute `0.0.0.0/0`

3. Clique sur **"Confirm"**

```
┌─────────────────────────────────────────────┐
│  IP Access List                             │
├─────────────────────────────────────────────┤
│  0.0.0.0/0    Allow anywhere    ✅ Active   │
└─────────────────────────────────────────────┘
```

### ⚠️ Note sur la sécurité

`0.0.0.0/0` autorise toutes les IPs. C'est pratique pour le développement et les hébergeurs cloud (Render, Heroku, etc.) dont les IPs changent.

Pour plus de sécurité en production, tu peux restreindre aux IPs spécifiques de ton hébergeur.

---

## Étape 5 : Obtenir la Connection String

### 5.1 Accéder à la connection string

1. Dans le menu gauche, clique sur **"Database"** (sous DEPLOYMENT)

2. Sur ton cluster, clique sur **"Connect"**

3. Choisis **"Drivers"**

### 5.2 Copier la connection string

Tu verras quelque chose comme :

```
mongodb+srv://mon_utilisateur:<db_password>@mon-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

1. Clique sur l'icône 📋 pour copier

2. Colle dans un fichier texte (Notepad, VS Code)

### 5.3 Modifier la connection string

**Remplace `<db_password>` par ton vrai mot de passe :**

```
mongodb+srv://mon_utilisateur:MonMotDePasse123@mon-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Ajoute le nom de ta base de données avant le `?` :**

```
mongodb+srv://mon_utilisateur:MonMotDePasse123@mon-cluster.xxxxx.mongodb.net/ma_base_de_donnees?retryWrites=true&w=majority
```

### 5.4 Ta connection string finale

```
mongodb+srv://UTILISATEUR:MOT_DE_PASSE@CLUSTER.xxxxx.mongodb.net/NOM_BASE?retryWrites=true&w=majority
```

| Élément | Description | Exemple |
|---------|-------------|---------|
| `UTILISATEUR` | Ton username créé à l'étape 3 | `app_user` |
| `MOT_DE_PASSE` | Ton mot de passe | `MonMotDePasse123` |
| `CLUSTER` | Nom de ton cluster | `mon-cluster` |
| `xxxxx` | ID unique (ne pas modifier) | `csdnari` |
| `NOM_BASE` | Nom de ta base de données | `ma_base` |

---

## Étape 6 : Tester la connexion

### 6.1 Test rapide avec Node.js

Crée un fichier `test-mongo.js` :

```javascript
const mongoose = require('mongoose');

// Ta connection string
const MONGO_URI = 'mongodb+srv://UTILISATEUR:MOT_DE_PASSE@CLUSTER.xxxxx.mongodb.net/NOM_BASE?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connexion MongoDB réussie !');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion :', err.message);
    process.exit(1);
  });
```

Lance le test :

```bash
node test-mongo.js
```

### 6.2 Résultat attendu

```
✅ Connexion MongoDB réussie !
```

### 6.3 Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Authentication failed` | Mauvais mot de passe | Vérifie le mot de passe dans Database Access |
| `IP not whitelisted` | IP non autorisée | Ajoute `0.0.0.0/0` dans Network Access |
| `ENOTFOUND` | URL mal formée | Vérifie la connection string |
| `Invalid scheme` | Manque `mongodb+srv://` | Vérifie le début de l'URL |

---

## 📋 Checklist finale

- [ ] Compte MongoDB Atlas créé
- [ ] Cluster M0 (gratuit) créé
- [ ] Utilisateur de base de données créé
- [ ] Mot de passe noté en sécurité
- [ ] Network Access : `0.0.0.0/0` ajouté
- [ ] Connection string copiée et modifiée
- [ ] Test de connexion réussi

---

## 🔧 Utilisation dans ton projet

### Dans ton fichier `.env` :

```env
MONGO_URI=mongodb+srv://utilisateur:motdepasse@cluster.xxxxx.mongodb.net/ma_base?retryWrites=true&w=majority
```

### Dans ton code Node.js :

```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));
```

---

## 📚 Ressources utiles

| Ressource | Lien |
|-----------|------|
| Documentation MongoDB Atlas | https://www.mongodb.com/docs/atlas/ |
| Documentation Mongoose | https://mongoosejs.com/docs/ |
| MongoDB University (cours gratuits) | https://university.mongodb.com/ |

---

## ⏱️ Temps estimé

| Étape | Durée |
|-------|-------|
| Créer un compte | 2 min |
| Créer un cluster | 3 min |
| Créer un utilisateur | 2 min |
| Configurer le réseau | 1 min |
| Obtenir la connection string | 2 min |
| **Total** | **~10 minutes** |

---

**🎉 Félicitations ! Tu as configuré MongoDB Atlas avec succès !**
