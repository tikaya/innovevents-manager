/**
 * Service Avis
 * @module services/AvisService
 */

const Avis = require('../models/Avis');
const Evenement = require('../models/Evenement');
const Client = require('../models/Client');

class AvisService {
    static async getAll(filters = {}) {
        return Avis.findAll(filters);
    }

    static async getById(id) {
        const avis = await Avis.findById(id);
        if (!avis) throw new Error('Avis non trouvé');
        return avis;
    }

    static async getValides() {
        return Avis.findValides();
    }

    static async getEnAttente() {
        return Avis.findEnAttente();
    }

    static async create(data, idUtilisateur) {
        const client = await Client.findByUserId(idUtilisateur);
        if (!client) throw new Error('Client non trouvé');

        const evt = await Evenement.findById(data.id_evenement);
        if (!evt) throw new Error('Événement non trouvé');
        if (evt.id_client !== client.id_client) {
            throw new Error('Non autorisé');
        }
        if (evt.statut_evenement !== 'termine') {
            throw new Error('Événement non terminé');
        }

        const exists = await Avis.existsForClientAndEvent(client.id_client, data.id_evenement);
        if (exists) throw new Error('Avis déjà déposé');

        return Avis.create({
            note_avis: data.note_avis,
            commentaire_avis: data.commentaire_avis,
            id_evenement: data.id_evenement,
            id_client: client.id_client
        });
    }

    static async validate(id) {
        const avis = await Avis.updateStatut(id, 'valide');
        if (!avis) throw new Error('Avis non trouvé');
        return avis;
    }

    static async reject(id) {
        const avis = await Avis.updateStatut(id, 'refuse');
        if (!avis) throw new Error('Avis non trouvé');
        return avis;
    }

    static async delete(id) {
        const deleted = await Avis.delete(id);
        if (!deleted) throw new Error('Avis non trouvé');
        return true;
    }

    static async getAverageNote() {
        return Avis.getAverageNote();
    }
}

module.exports = AvisService;
