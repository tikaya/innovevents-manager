/**
 * Configuration MongoDB
 * @module config/mongodb
 */

const { MongoClient } = require('mongodb');

let client = null;
let db = null;

const connectMongoDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 
            `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=admin`;
        
        console.log('🔄 Connexion à MongoDB...');
        
        client = new MongoClient(uri);
        await client.connect();
        
        db = client.db(process.env.MONGO_DB || 'innovevents_db');
        
        // Vérifier la connexion
        await db.command({ ping: 1 });
        console.log('✅ MongoDB connecté');
        
        // Créer les index pour optimiser les requêtes
        await createIndexes();
        
        return db;
    } catch (error) {
        console.error('❌ Erreur connexion MongoDB:', error.message);
        throw error;
    }
};

const createIndexes = async () => {
    try {
        const logsCollection = db.collection('logs');
        
        // Index sur l'horodatage (tri par date)
        await logsCollection.createIndex({ horodatage: -1 });
        
        // Index sur le type d'action (filtrage)
        await logsCollection.createIndex({ type_action: 1 });
        
        // Index sur l'utilisateur (filtrage)
        await logsCollection.createIndex({ id_utilisateur: 1 });
        
        // Index composé pour les recherches fréquentes
        await logsCollection.createIndex({ type_action: 1, horodatage: -1 });
        
        console.log('✅ Index MongoDB créés');
    } catch (error) {
        console.error('⚠️ Erreur création index:', error.message);
    }
};

const getDB = () => {
    if (!db) {
        throw new Error('MongoDB non connecté. Appelez connectMongoDB() d\'abord.');
    }
    return db;
};

const closeMongoDB = async () => {
    if (client) {
        await client.close();
        console.log('🔌 MongoDB déconnecté');
    }
};

module.exports = {
    connectMongoDB,
    getDB,
    closeMongoDB
};
