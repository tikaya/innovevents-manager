/**
 * Service de Journalisation (MongoDB)
 * @module services/LogService
 */

const { getDB } = require('../config/mongodb');

// Types d'actions standardisés
const ACTION_TYPES = {
    // Authentification
    CONNEXION_REUSSIE: 'CONNEXION_REUSSIE',
    CONNEXION_ECHOUEE: 'CONNEXION_ECHOUEE',
    DECONNEXION: 'DECONNEXION',
    MOT_DE_PASSE_OUBLIE: 'MOT_DE_PASSE_OUBLIE',
    CHANGEMENT_MOT_DE_PASSE: 'CHANGEMENT_MOT_DE_PASSE',
    
    // Clients
    CREATION_CLIENT: 'CREATION_CLIENT',
    MODIFICATION_CLIENT: 'MODIFICATION_CLIENT',
    SUPPRESSION_CLIENT: 'SUPPRESSION_CLIENT',
    
    // Événements
    CREATION_EVENEMENT: 'CREATION_EVENEMENT',
    MODIFICATION_EVENEMENT: 'MODIFICATION_EVENEMENT',
    MODIFICATION_STATUT_EVENEMENT: 'MODIFICATION_STATUT_EVENEMENT',
    SUPPRESSION_EVENEMENT: 'SUPPRESSION_EVENEMENT',
    
    // Devis
    CREATION_DEVIS: 'CREATION_DEVIS',
    GENERATION_DEVIS_PDF: 'GENERATION_DEVIS_PDF',
    ENVOI_DEVIS_EMAIL: 'ENVOI_DEVIS_EMAIL',
    ACCEPTATION_DEVIS: 'ACCEPTATION_DEVIS',
    REFUS_DEVIS: 'REFUS_DEVIS',
    MODIFICATION_DEVIS: 'MODIFICATION_DEVIS',
    
    // Prospects
    CREATION_PROSPECT: 'CREATION_PROSPECT',
    CONVERSION_PROSPECT: 'CONVERSION_PROSPECT',
    REJET_PROSPECT: 'REJET_PROSPECT',
    
    // Employés
    CREATION_EMPLOYE: 'CREATION_EMPLOYE',
    MODIFICATION_EMPLOYE: 'MODIFICATION_EMPLOYE',
    SUPPRESSION_EMPLOYE: 'SUPPRESSION_EMPLOYE',
    RESET_PASSWORD_EMPLOYE: 'RESET_PASSWORD_EMPLOYE',
    
    // Avis
    VALIDATION_AVIS: 'VALIDATION_AVIS',
    REFUS_AVIS: 'REFUS_AVIS',
    
    // Notes
    CREATION_NOTE: 'CREATION_NOTE',
    MODIFICATION_NOTE: 'MODIFICATION_NOTE',
    SUPPRESSION_NOTE: 'SUPPRESSION_NOTE',
    
    // Tâches
    MODIFICATION_STATUT_TACHE: 'MODIFICATION_STATUT_TACHE'
};

class LogService {
    /**
     * Crée une entrée de log
     * @param {string} typeAction - Type d'action (voir ACTION_TYPES)
     * @param {number|null} idUtilisateur - ID de l'utilisateur
     * @param {object} details - Détails contextuels
     * @param {string|null} ipAddress - Adresse IP (optionnel)
     */
    static async log(typeAction, idUtilisateur = null, details = {}, ipAddress = null) {
        try {
            const db = getDB();
            const logsCollection = db.collection('logs');
            
            const logEntry = {
                horodatage: new Date(),
                type_action: typeAction,
                id_utilisateur: idUtilisateur,
                details: {
                    ...details,
                    ...(ipAddress && { ip_address: ipAddress })
                }
            };
            
            await logsCollection.insertOne(logEntry);
            console.log(`📝 Log: ${typeAction}`, idUtilisateur ? `(User: ${idUtilisateur})` : '');
            
            return logEntry;
        } catch (error) {
            console.error('❌ Erreur journalisation:', error.message);
            // Ne pas faire échouer l'opération principale si le log échoue
            return null;
        }
    }

    /**
     * Récupère les logs avec filtres et pagination
     */
    static async getLogs(filters = {}, options = {}) {
        try {
            const db = getDB();
            const logsCollection = db.collection('logs');
            
            const query = {};
            
            // Filtres
            if (filters.type_action) {
                query.type_action = filters.type_action;
            }
            
            if (filters.id_utilisateur) {
                query.id_utilisateur = parseInt(filters.id_utilisateur);
            }
            
            if (filters.date_debut || filters.date_fin) {
                query.horodatage = {};
                if (filters.date_debut) {
                    query.horodatage.$gte = new Date(filters.date_debut);
                }
                if (filters.date_fin) {
                    query.horodatage.$lte = new Date(filters.date_fin);
                }
            }
            
            // Recherche texte dans les détails
            if (filters.search) {
                query.$or = [
                    { 'details.nom': { $regex: filters.search, $options: 'i' } },
                    { 'details.email': { $regex: filters.search, $options: 'i' } },
                    { 'details.nom_evenement': { $regex: filters.search, $options: 'i' } }
                ];
            }
            
            // Pagination
            const page = parseInt(options.page) || 1;
            const limit = parseInt(options.limit) || 50;
            const skip = (page - 1) * limit;
            
            // Requête
            const [logs, total] = await Promise.all([
                logsCollection
                    .find(query)
                    .sort({ horodatage: -1 })
                    .skip(skip)
                    .limit(limit)
                    .toArray(),
                logsCollection.countDocuments(query)
            ]);
            
            return {
                logs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('❌ Erreur récupération logs:', error.message);
            throw error;
        }
    }

    /**
     * Récupère les statistiques des logs
     */
    static async getStats() {
        try {
            const db = getDB();
            const logsCollection = db.collection('logs');
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const [
                totalLogs,
                logsToday,
                connexionsReussies,
                connexionsEchouees,
                actionsByType
            ] = await Promise.all([
                logsCollection.countDocuments(),
                logsCollection.countDocuments({ horodatage: { $gte: today } }),
                logsCollection.countDocuments({ type_action: ACTION_TYPES.CONNEXION_REUSSIE }),
                logsCollection.countDocuments({ type_action: ACTION_TYPES.CONNEXION_ECHOUEE }),
                logsCollection.aggregate([
                    { $group: { _id: '$type_action', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ]).toArray()
            ]);
            
            return {
                totalLogs,
                logsToday,
                connexionsReussies,
                connexionsEchouees,
                actionsByType: actionsByType.map(a => ({ type: a._id, count: a.count }))
            };
        } catch (error) {
            console.error('❌ Erreur stats logs:', error.message);
            throw error;
        }
    }

    /**
     * Récupère les types d'actions disponibles
     */
    static getActionTypes() {
        return ACTION_TYPES;
    }
}

module.exports = { LogService, ACTION_TYPES };
