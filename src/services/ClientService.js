/**
 * Service Client
 * @module services/ClientService
 */

const Client = require('../models/Client');
const Utilisateur = require('../models/Utilisateur');
const { getClient } = require('../config/database');

class ClientService {
    static async getAll(filters = {}) {
        return Client.findAll(filters);
    }

    static async getById(id) {
        const client = await Client.findById(id);
        if (!client) throw new Error('Client non trouvé');
        return client;
    }

    static async getByUserId(idUtilisateur) {
        const client = await Client.findByUserId(idUtilisateur);
        if (!client) throw new Error('Client non trouvé');
        return client;
    }

    static async create(data) {
        const existing = await Client.findByEmail(data.email_client);
        if (existing) throw new Error('Email déjà utilisé');
        return Client.create(data);
    }

    static async update(id, data) {
        if (data.email_client) {
            const existing = await Client.findByEmail(data.email_client);
            if (existing && existing.id_client !== id) {
                throw new Error('Email déjà utilisé');
            }
        }
        const client = await Client.update(id, data);
        if (!client) throw new Error('Client non trouvé');
        return client;
    }

    static async delete(id) {
        const client = await Client.findById(id);
        if (!client) throw new Error('Client non trouvé');

        const dbClient = await getClient();
        try {
            await dbClient.query('BEGIN');
            await Client.delete(id);
            if (client.id_utilisateur) {
                await Utilisateur.delete(client.id_utilisateur);
            }
            await dbClient.query('COMMIT');
            return true;
        } catch (error) {
            await dbClient.query('ROLLBACK');
            throw error;
        } finally {
            dbClient.release();
        }
    }

    static async search(term) {
        return Client.search(term);
    }

    static async getEvenements(idClient) {
        return Client.getEvenements(idClient);
    }

    static async countActifs() {
        return Client.countActifs();
    }
}

module.exports = ClientService;
