/**
 * Service Evenement
 * @module services/EvenementService
 */

const Evenement = require('../models/Evenement');
const Client = require('../models/Client');

class EvenementService {
    static async getAll(filters = {}) {
        return Evenement.findAll(filters);
    }

    static async getPublic(filters = {}) {
        return Evenement.findPublic(filters);
    }

    static async getById(id) {
        const evenement = await Evenement.findById(id);
        if (!evenement) throw new Error('Événement non trouvé');
        return evenement;
    }

    static async getByClient(idClient) {
        return Evenement.findAll({ id_client: idClient });
    }

    static async getByUserId(idUtilisateur) {
        const client = await Client.findByUserId(idUtilisateur);
        if (!client) throw new Error('Client non trouvé');
        return Evenement.findAll({ id_client: client.id_client });
    }

    static async create(data) {
        const client = await Client.findById(data.id_client);
        if (!client) throw new Error('Client non trouvé');

        if (new Date(data.date_fin) < new Date(data.date_debut)) {
            throw new Error('Date fin avant date début');
        }

        return Evenement.create(data);
    }

    static async update(id, data) {
        if (data.date_debut && data.date_fin) {
            if (new Date(data.date_fin) < new Date(data.date_debut)) {
                throw new Error('Date fin avant date début');
            }
        }
        const evenement = await Evenement.update(id, data);
        if (!evenement) throw new Error('Événement non trouvé');
        return evenement;
    }

    static async updateStatut(id, statut) {
        const valid = ['brouillon', 'en_attente', 'accepte', 'en_cours', 'termine', 'annule'];
        if (!valid.includes(statut)) throw new Error('Statut invalide');
        
        const evenement = await Evenement.updateStatut(id, statut);
        if (!evenement) throw new Error('Événement non trouvé');
        return evenement;
    }

    static async delete(id) {
        const deleted = await Evenement.delete(id);
        if (!deleted) throw new Error('Événement non trouvé');
        return true;
    }

    static async getProchains(idClient = null) {
        return Evenement.findProchains(idClient);
    }

    static async getTypes() {
        return Evenement.getTypes();
    }

    static async getThemes() {
        return Evenement.getThemes();
    }

    static async countBrouillons() {
        return Evenement.countBrouillons();
    }
}

module.exports = EvenementService;