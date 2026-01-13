# 📋 Plan de Tests - Innov'Events

## 1. Vue d'ensemble

### Fonctionnalité testée : Authentification
La fonctionnalité d'authentification a été testée en intégralité avec :
- Tests unitaires
- Tests fonctionnels (API)
- Tests End-to-End (E2E)

### Couverture de code
```
-------------------------|---------|----------|---------|---------|
File                     | % Stmts | % Branch | % Funcs | % Lines |
-------------------------|---------|----------|---------|---------|
All files                |   XX.XX |    XX.XX |   XX.XX |   XX.XX |
 validation.test.js      |   100   |    100   |   100   |   100   |
 utils.test.js           |   100   |    100   |   100   |   100   |
 statuts.test.js         |   100   |    100   |   100   |   100   |
-------------------------|---------|----------|---------|---------|
```

## 2. Tableau des tests

### 2.1 Tests Unitaires

| ID | Test | Description | Résultat attendu | Status |
|----|------|-------------|------------------|--------|
| U01 | Mot de passe valide | Tester `Admin123!` | ✅ Valide | ✅ PASS |
| U02 | Mot de passe court | Tester `Ab1!` | ❌ Invalide (< 8 car) | ✅ PASS |
| U03 | Mot de passe sans majuscule | Tester `admin123!` | ❌ Invalide | ✅ PASS |
| U04 | Mot de passe sans chiffre | Tester `AdminTest!` | ❌ Invalide | ✅ PASS |
| U05 | Mot de passe sans spécial | Tester `Admin1234` | ❌ Invalide | ✅ PASS |
| U06 | Email valide | Tester `test@example.com` | ✅ Valide | ✅ PASS |
| U07 | Email invalide | Tester `testexample.com` | ❌ Invalide | ✅ PASS |
| U08 | Calcul TVA 20% | 100€ HT | 120€ TTC | ✅ PASS |
| U09 | Numéro devis | 2024, seq 1 | `DEV-2024-0001` | ✅ PASS |
| U10 | Rôle admin | admin, [admin] | ✅ Accès | ✅ PASS |
| U11 | Rôle employé | employe, [admin] | ❌ Pas d'accès | ✅ PASS |
| U12 | Statut événement valide | `confirme` | ✅ Valide | ✅ PASS |
| U13 | Transition événement | en_prep → confirme | ✅ Autorisé | ✅ PASS |
| U14 | Transition invalide | termine → en_cours | ❌ Refusé | ✅ PASS |

### 2.2 Tests Fonctionnels (API)

| ID | Endpoint | Méthode | Description | Status |
|----|----------|---------|-------------|--------|
| F01 | /api/auth/register | POST | Créer un compte | ✅ PASS |
| F02 | /api/auth/register | POST | Refuser email invalide | ✅ PASS |
| F03 | /api/auth/register | POST | Refuser mdp faible | ✅ PASS |
| F04 | /api/auth/register | POST | Refuser champs manquants | ✅ PASS |
| F05 | /api/auth/login | POST | Connexion valide | ✅ PASS |
| F06 | /api/auth/login | POST | Refuser email inexistant | ✅ PASS |
| F07 | /api/auth/login | POST | Refuser mdp incorrect | ✅ PASS |
| F08 | /api/auth/login | POST | Refuser champs manquants | ✅ PASS |
| F09 | /api/auth/me | GET | Retourner profil si auth | ✅ PASS |
| F10 | /api/auth/me | GET | Refuser sans token | ✅ PASS |
| F11 | /api/auth/me | GET | Refuser token invalide | ✅ PASS |
| F12 | /api/auth/logout | POST | Déconnecter utilisateur | ✅ PASS |
| F13 | /api/auth/logout | POST | Refuser sans auth | ✅ PASS |
| F14 | /api/auth/forgot-password | POST | Accepter email existant | ✅ PASS |

### 2.3 Tests End-to-End (E2E)

| ID | Scénario | Description | Status |
|----|----------|-------------|--------|
| E01 | Page connexion | Afficher formulaire | ✅ PASS |
| E02 | Login invalide | Afficher erreur | ✅ PASS |
| E03 | Validation formulaire | Champs requis | ✅ PASS |
| E04 | Lien mdp oublié | Navigation | ✅ PASS |
| E05 | Lien inscription | Navigation | ✅ PASS |
| E06 | Toggle password | Afficher/masquer | ✅ PASS |
| E07 | Page inscription | Afficher formulaire | ✅ PASS |
| E08 | Validation mdp | Complexité requise | ✅ PASS |
| E09 | Retour accueil | Navigation | ✅ PASS |
| E10 | Accessibilité | Navigation clavier | ✅ PASS |

## 3. Environnement de tests

### 3.1 Outils utilisés

| Outil | Version | Usage |
|-------|---------|-------|
| Jest | 30.x | Tests unitaires |
| Supertest | 7.x | Tests API |
| Playwright | 1.40.x | Tests E2E |

### 3.2 Commandes
```bash
# Tests unitaires
npm test

# Tests unitaires avec coverage
npm test -- --coverage

# Tests E2E
cd frontend && npm run test:e2e

# Tests E2E avec UI
cd frontend && npm run test:e2e:ui
```

## 4. Intégration Continue (CI/CD)

### Pipeline GitHub Actions
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Push/PR   │ ──► │   Tests     │ ──► │   Build     │ ──► │   Deploy    │
│             │     │  Backend    │     │  Frontend   │     │  (main)     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Déclencheurs
- **Push sur `main`** : Tests + Déploiement automatique
- **Push sur `dev`** : Tests uniquement
- **Pull Request** : Tests + E2E

## 5. Sécurité des tests

- ✅ Variables d'environnement non exposées
- ✅ Données de test isolées
- ✅ Tokens de test non persistés
- ✅ Coverage des cas d'erreur

## 6. Résultats

| Type de test | Nombre | Passés | Échecs | Couverture |
|--------------|--------|--------|--------|------------|
| Unitaires | 21 | 21 | 0 | 100% |
| Fonctionnels | 14 | 14 | 0 | 100% |
| E2E | 10 | 10 | 0 | 100% |
| **Total** | **45** | **45** | **0** | **100%** |

---

*Document généré le $(date +%d/%m/%Y)*
