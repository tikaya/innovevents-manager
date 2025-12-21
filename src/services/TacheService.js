/**
 * Service Tache
 * @module services/TacheService
 */

const Tache = require('../models/Tache');
const Evenement = require('../models/Evenement');
const Utilisateur = require('../models/Utilisateur');

class TacheService {
    static async getAll(filters = {}) {
        return Tache.findAll(filters);
    }

    static async getById(id) {
        const tache = await Tache.findById(id);
        if (!tache) throw new Error('Tâche non trouvée');
        return tache;
    }

    static async getByEvenement(idEvenement) {
        return Tache.findByEvenement(idEvenement);
    }

    static async getByUtilisateur(idUtilisateur) {
        return Tache.findByUtilisateur(idUtilisateur);
    }

    static async getEnRetard() {
        return Tache.findEnRetard();
    }

    static async create(data) {
        // Vérifier l'événement seulement si fourni
        if (data.id_evenement) {
            const evt = await Evenement.findById(data.id_evenement);
            if (!evt) throw new Error('Événement non trouvé');
        }

        const user = await Utilisateur.findById(data.id_utilisateur);
        if (!user) throw new Error('Utilisateur non trouvé');
        if (!['employe', 'admin'].includes(user.role)) {
            throw new Error('Assignation employés uniquement');
        }

        return Tache.create(data);
    }

    static async update(id, data) {
        if (data.id_utilisateur) {
            const user = await Utilisateur.findById(data.id_utilisateur);
            if (!user || !['employe', 'admin'].includes(user.role)) {
                throw new Error('Assignation employés uniquement');
            }
        }
        
        // Vérifier l'événement seulement si fourni
        if (data.id_evenement) {
            const evt = await Evenement.findById(data.id_evenement);
            if (!evt) throw new Error('Événement non trouvé');
        }
        
        const tache = await Tache.update(id, data);
        if (!tache) throw new Error('Tâche non trouvée');
        return tache;
    }

    static async updateStatut(id, statut, idUtilisateur) {
        const valid = ['a_faire', 'en_cours', 'termine'];
        if (!valid.includes(statut)) throw new Error('Statut invalide');

        const tache = await Tache.findById(id);
        if (!tache) throw new Error('Tâche non trouvée');
        if (tache.id_utilisateur !== idUtilisateur) {
            throw new Error('Seul l\'assigné peut modifier le statut');
        }

        return Tache.updateStatut(id, statut);
    }

    static async delete(id) {
        const deleted = await Tache.delete(id);
        if (!deleted) throw new Error('Tâche non trouvée');
        return true;
    }

    static async countByStatut(idEvenement = null) {
        return Tache.countByStatut(idEvenement);
    }
}

module.exports = TacheService;
