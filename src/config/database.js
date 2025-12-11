/**
 * Configuration PostgreSQL
 * @module config/database
 */

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'innovevents_dev',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Log des connexions en dev
pool.on('connect', () => {
    if (process.env.NODE_ENV === 'development') {
        console.log('📦 Nouvelle connexion PostgreSQL');
    }
});

pool.on('error', (err) => {
    console.error('❌ Erreur PostgreSQL:', err.message);
});

/**
 * Exécute une requête SQL
 */
const query = async (text, params) => {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Query:', { text: text.substring(0, 50), duration: `${duration}ms`, rows: result.rowCount });
    }
    
    return result;
};

/**
 * Obtient un client pour les transactions
 */
const getClient = async () => {
    const client = await pool.connect();
    const originalRelease = client.release.bind(client);
    
    client.release = () => {
        client.release = originalRelease;
        return originalRelease();
    };
    
    return client;
};

/**
 * Vérifie la connexion
 */
const checkConnection = async () => {
    try {
        const result = await pool.query('SELECT NOW()');
        return result.rows[0];
    } catch (error) {
        throw new Error(`Connexion PostgreSQL échouée: ${error.message}`);
    }
};

module.exports = {
    pool,
    query,
    getClient,
    checkConnection
};