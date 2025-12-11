/**
 * Point d'entrée de l'application Innov'Events
 * @module index
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { checkConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES DE SÉCURITÉ
// ============================================

// Helmet - Sécurité HTTP headers
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Rate limiting - Protection brute force
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par IP
    message: { success: false, message: 'Trop de requêtes, réessayez plus tard' }
});
app.use('/api/auth', limiter);

// ============================================
// MIDDLEWARES GÉNÉRAUX
// ============================================

// Compression des réponses
app.use(compression());

// Parser JSON et URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Logging (dev uniquement)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ============================================
// FICHIERS STATIQUES
// ============================================

// Uploads (images événements)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// PDF des devis
app.use('/devis', express.static(path.join(__dirname, '../devis')));

// ============================================
// ROUTES
// ============================================

app.use('/api', routes);

// Route racine
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Innov\'Events v1.0',
        documentation: '/api/health'
    });
});

// ============================================
// GESTION DES ERREURS
// ============================================

app.use(notFound);
app.use(errorHandler);

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const startServer = async () => {
    try {
        // Test connexion PostgreSQL
        await checkConnection();
        console.log('✅ PostgreSQL connecté');

        // Démarrage serveur
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Serveur démarré sur le port ${PORT}`);
            console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 URL: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Erreur démarrage:', error.message);
        process.exit(1);
    }
};

// Gestion arrêt propre
process.on('SIGTERM', () => {
    console.log('👋 Arrêt du serveur...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 Arrêt du serveur...');
    process.exit(0);
});

startServer();

module.exports = app;