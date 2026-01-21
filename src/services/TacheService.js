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

    // ✅ CORRECTION : Réservé à l'admin, sans changement de statut via cette méthode
    static async update(id, data, userRole) {
        // Seul l'admin peut modifier une tâche via cette méthode
        if (userRole !== 'admin') {
            throw new Error('Seul l\'administrateur peut modifier une tâche');
        }
        
        // Retirer statut_tache pour forcer passage par updateStatut
        const { statut_tache, ...dataWithoutStatut } = data;
        
        if (dataWithoutStatut.id_utilisateur) {
            const user = await Utilisateur.findById(dataWithoutStatut.id_utilisateur);
            if (!user || !['employe', 'admin'].includes(user.role)) {
                throw new Error('Assignation employés uniquement');
            }
        }
        
        if (dataWithoutStatut.id_evenement) {
            const evt = await Evenement.findById(dataWithoutStatut.id_evenement);
            if (!evt) throw new Error('Événement non trouvé');
        }
        
        const tache = await Tache.update(id, dataWithoutStatut);
        if (!tache) throw new Error('Tâche non trouvée');
        return tache;
    }

    // ✅ CORRECTION : Admin autorisé + contrôle progression
    static async updateStatut(id, statut, idUtilisateur, userRole) {
        const valid = ['a_faire', 'en_cours', 'termine'];
        if (!valid.includes(statut)) throw new Error('Statut invalide');

        const tache = await Tache.findById(id);
        if (!tache) throw new Error('Tâche non trouvée');
        
        // Admin peut modifier n'importe quelle tâche
        const isAdmin = userRole === 'admin';
        const isAssignee = tache.id_utilisateur === idUtilisateur;
        
        if (!isAdmin && !isAssignee) {
            throw new Error('Seul l\'assigné ou l\'administrateur peut modifier le statut');
        }

        // Contrôle de progression des statuts (sauf admin qui peut tout faire)
        if (!isAdmin) {
            const progressionValide = {
                'a_faire': ['en_cours'],
                'en_cours': ['termine', 'a_faire'],
                'termine': ['en_cours']
            };
            
            const statutActuel = tache.statut_tache;
            const transitionsAutorisees = progressionValide[statutActuel] || [];
            
            if (!transitionsAutorisees.includes(statut)) {
                throw new Error(`Transition invalide : ${statutActuel} → ${statut}`);
            }
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