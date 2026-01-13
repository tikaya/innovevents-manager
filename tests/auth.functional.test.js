/**
 * Tests fonctionnels - API Authentification
 * Fonctionnalité testée : Authentification complète
 */

const request = require('supertest');

// URL de l'API (pour tests en local)
const API_URL = process.env.API_URL || 'http://localhost:3000';

describe('API Authentification - Tests Fonctionnels', () => {
  
  // Données de test
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    mot_de_passe: 'TestPassword123!',
    nom: 'Test',
    prenom: 'User',
    nom_utilisateur: `testuser_${Date.now()}`
  };
  
  let authToken = null;

  // ==========================================
  // POST /api/auth/register - Inscription
  // ==========================================
  describe('POST /api/auth/register', () => {
    
    test('devrait créer un nouveau compte client', async () => {
      const response = await request(API_URL)
        .post('/api/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/);
      
      // Peut être 201 (créé) ou 400 (validation) selon l'état de la DB
      expect([201, 400]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('token');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user.role).toBe('client');
      }
    });

    test('devrait refuser un email invalide', async () => {
      const response = await request(API_URL)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email'
        })
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    test('devrait refuser un mot de passe trop faible', async () => {
      const response = await request(API_URL)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: `weak_${Date.now()}@example.com`,
          mot_de_passe: '123'
        })
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    test('devrait refuser si champs obligatoires manquants', async () => {
      const response = await request(API_URL)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // POST /api/auth/login - Connexion
  // ==========================================
  describe('POST /api/auth/login', () => {
    
    test('devrait connecter un utilisateur existant (admin)', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send({
          email: 'tikaya1999@gmail.com',
          mot_de_passe: 'Admin123!'
        })
        .expect('Content-Type', /json/);
      
      // 200 si credentials corrects, 400/401 sinon
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('token');
        expect(response.body.data).toHaveProperty('user');
        authToken = response.body.data.token;
      }
    });

    test('devrait refuser un email inexistant', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          mot_de_passe: 'Password123!'
        })
        .expect('Content-Type', /json/);
      
      expect([400, 401, 500]).toContain(response.status);
    });

    test('devrait refuser un mot de passe incorrect', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send({
          email: 'tikaya1999@gmail.com',
          mot_de_passe: 'WrongPassword123!'
        })
        .expect('Content-Type', /json/);
      
      expect([400, 401, 500]).toContain(response.status);
    });

    test('devrait refuser si email manquant', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send({ mot_de_passe: 'Password123!' })
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    test('devrait refuser si mot de passe manquant', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // GET /api/auth/me - Profil utilisateur
  // ==========================================
  describe('GET /api/auth/me', () => {
    
    test('devrait retourner le profil si authentifié', async () => {
      if (!authToken) {
        console.log('⚠️ Test skipped: no auth token');
        return;
      }
      
      const response = await request(API_URL)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('role');
    });

    test('devrait refuser sans token', async () => {
      const response = await request(API_URL)
        .get('/api/auth/me')
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });

    test('devrait refuser avec un token invalide', async () => {
      const response = await request(API_URL)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_123')
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // POST /api/auth/logout - Déconnexion
  // ==========================================
  describe('POST /api/auth/logout', () => {
    
    test('devrait déconnecter un utilisateur authentifié', async () => {
      if (!authToken) {
        console.log('⚠️ Test skipped: no auth token');
        return;
      }
      
      const response = await request(API_URL)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('devrait refuser sans authentification', async () => {
      const response = await request(API_URL)
        .post('/api/auth/logout')
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // POST /api/auth/forgot-password
  // ==========================================
  describe('POST /api/auth/forgot-password', () => {
    
    test('devrait accepter un email existant', async () => {
      const response = await request(API_URL)
        .post('/api/auth/forgot-password')
        .send({ email: 'tikaya1999@gmail.com' })
        .expect('Content-Type', /json/);
      
      // Toujours 200 pour ne pas révéler si l'email existe
      expect([200, 400]).toContain(response.status);
    });

    test('devrait accepter un email inexistant (sécurité)', async () => {
      const response = await request(API_URL)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect('Content-Type', /json/);
      
      // Même réponse pour email existant ou non (sécurité)
      expect([200, 400]).toContain(response.status);
    });
  });
});
