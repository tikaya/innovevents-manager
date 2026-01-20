/**
 * Service de Journalisation (MongoDB)
 * @module services/LogService
 * 
 * Conforme RGPD :
 * - Anonymisation des données personnelles sur demande
 * - Purge automatique des logs anciens
 * - Export des données utilisateur
 */

const { getDB } = require('../config/mongodb');

// Types d'actions standardisés
const ACTION_TYPES = {
    // ============================================
    // AUTHENTIFICATION
    // ============================================
    CONNEXION_REUSSIE: 'CONNEXION_REUSSIE',
    CONNEXION_ECHOUEE: 'CONNEXION_ECHOUEE',
    DECONNEXION: 'DECONNEXION',
    MOT_DE_PASSE_OUBLIE: 'MOT_DE_PASSE_OUBLIE',
    CHANGEMENT_MOT_DE_PASSE: 'CHANGEMENT_MOT_DE_PASSE',
    
    // ============================================
    // CLIENTS
    // ============================================
    CREATION_CLIENT: 'CREATION_CLIENT',
    MODIFICATION_CLIENT: 'MODIFICATION_CLIENT',
    SUPPRESSION_CLIENT: 'SUPPRESSION_CLIENT',
    RESET_PASSWORD_CLIENT: 'RESET_PASSWORD_CLIENT',
    
    // ============================================
    // ÉVÉNEMENTS
    // ============================================
    CREATION_EVENEMENT: 'CREATION_EVENEMENT',
    MODIFICATION_EVENEMENT: 'MODIFICATION_EVENEMENT',
    MODIFICATION_STATUT_EVENEMENT: 'MODIFICATION_STATUT_EVENEMENT',
    SUPPRESSION_EVENEMENT: 'SUPPRESSION_EVENEMENT',
    
    // ============================================
    // DEVIS
    // ============================================
    CREATION_DEVIS: 'CREATION_DEVIS',
    MODIFICATION_DEVIS: 'MODIFICATION_DEVIS',
    SUPPRESSION_DEVIS: 'SUPPRESSION_DEVIS',
    GENERATION_DEVIS_PDF: 'GENERATION_DEVIS_PDF',
    ENVOI_DEVIS_EMAIL: 'ENVOI_DEVIS_EMAIL',
    ACCEPTATION_DEVIS: 'ACCEPTATION_DEVIS',
    REFUS_DEVIS: 'REFUS_DEVIS',
    DEMANDE_MODIFICATION_DEVIS: 'DEMANDE_MODIFICATION_DEVIS',
    
    // ============================================
    // PROSPECTS
    // ============================================
    CREATION_PROSPECT: 'CREATION_PROSPECT',
    MODIFICATION_PROSPECT: 'MODIFICATION_PROSPECT',
    SUPPRESSION_PROSPECT: 'SUPPRESSION_PROSPECT',
    CONVERSION_PROSPECT: 'CONVERSION_PROSPECT',
    REJET_PROSPECT: 'REJET_PROSPECT',
    
    // ============================================
    // EMPLOYÉS
    // ============================================
    CREATION_EMPLOYE: 'CREATION_EMPLOYE',
    MODIFICATION_EMPLOYE: 'MODIFICATION_EMPLOYE',
    SUPPRESSION_EMPLOYE: 'SUPPRESSION_EMPLOYE',
    RESET_PASSWORD_EMPLOYE: 'RESET_PASSWORD_EMPLOYE',
    
    // ============================================
    // AVIS
    // ============================================
    CREATION_AVIS: 'CREATION_AVIS',
    VALIDATION_AVIS: 'VALIDATION_AVIS',
    REFUS_AVIS: 'REFUS_AVIS',
    SUPPRESSION_AVIS: 'SUPPRESSION_AVIS',
    
    // ============================================
    // NOTES
    // ============================================
    CREATION_NOTE: 'CREATION_NOTE',
    MODIFICATION_NOTE: 'MODIFICATION_NOTE',
    SUPPRESSION_NOTE: 'SUPPRESSION_NOTE',
    
    // ============================================
    // TÂCHES
    // ============================================
    CREATION_TACHE: 'CREATION_TACHE',
    MODIFICATION_TACHE: 'MODIFICATION_TACHE',
    MODIFICATION_STATUT_TACHE: 'MODIFICATION_STATUT_TACHE',
    SUPPRESSION_TACHE: 'SUPPRESSION_TACHE',
    
    // ============================================
    // RGPD
    // ============================================
    EXPORT_DONNEES_RGPD: 'EXPORT_DONNEES_RGPD',
    SUPPRESSION_COMPTE_RGPD: 'SUPPRESSION_COMPTE_RGPD',
    ANONYMISATION_LOGS_RGPD: 'ANONYMISATION_LOGS_RGPD'
};

class LogService {
    /**
     * Crée une entrée de log
     * @param {string} typeAction - Type d'action (voir ACTION_TYPES)
     * @param {number|null} idUtilisateur - ID de l'utilisateur
     * @param {object} details - Détails contextuels
     * @param {string|null} ipAddress - Adresse IP (optionnel, RGPD)
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
                    // Note RGPD: L'IP est une donnée personnelle
                    // Elle sera anonymisée lors de la suppression du compte
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
                    { 'details.nom_evenement': { $regex: filters.search, $options: 'i' } },
                    { 'details.nom_entreprise': { $regex: filters.search, $options: 'i' } }
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
     * Récupère les logs d'un utilisateur spécifique
     * @param {number} idUtilisateur - ID de l'utilisateur
     */
    static async getByUserId(idUtilisateur) {
        try {
            const db = getDB();
            const logsCollection = db.collection('logs');
            
            const logs = await logsCollection
                .find({ id_utilisateur: parseInt(idUtilisateur) })
                .sort({ horodatage: -1 })
                .toArray();
            
            return logs;
        } catch (error) {
            console.error('❌ Erreur récupération logs utilisateur:', error.message);
            throw error;
        }
    }

    // ============================================
    // FONCTIONS RGPD
    // ============================================

    /**
     * Anonymise les logs d'un utilisateur (RGPD - Droit à l'effacement)
     * Conserve les logs pour l'historique mais supprime les données personnelles
     * 
     * @param {number} idUtilisateur - ID de l'utilisateur à anonymiser
     * @returns {number} Nombre de logs anonymisés
     */
    static async anonymizeUserLogs(idUtilisateur) {
        try {
            const db = getDB();
            const logsCollection = db.collection('logs');
            
            const result = await logsCollection.updateMany(
                { id_utilisateur: parseInt(idUtilisateur) },
                { 
                    $set: { 
                        'details.ip_address': 'ANONYMIZED',
                        'details.email': 'ANONYMIZED',
                        'details.nom': 'ANONYMIZED',
                        'details.prenom': 'ANONYMIZED',
                        'details.telephone': 'ANONYMIZED',
                        'details.nom_contact': 'ANONYMIZED',
                        'details.prenom_contact': 'ANONYMIZED',
                        id_utilisateur: null,
                        anonymise: true,
                        date_anonymisation: new Date()
                    }
                }
            );
            
            console.log(`🔒 RGPD: ${result.modifiedCount} logs anonymisés pour utilisateur ${idUtilisateur}`);
            
            // Log l'action d'anonymisation (sans données personnelles)
            await this.log(
                ACTION_TYPES.ANONYMISATION_LOGS_RGPD,
                null,
                { 
                    ancien_id_utilisateur: idUtilisateur,
                    nombre_logs_anonymises: result.modifiedCount
                }
            );
            
            return result.modifiedCount;
        } catch (error) {
            console.error('❌ Erreur anonymisation logs:', error.message);
            throw error;
        }
    }

    /**
     * Purge les logs de plus de X mois (RGPD - Limitation de conservation)
     * Recommandation : 24 mois pour les logs d'activité
     * 
     * @param {number} months - Nombre de mois de rétention (défaut: 24)
     * @returns {number} Nombre de logs purgés
     */
    static async purgeOldLogs(months = 24) {
        try {
            const db = getDB();
            const logsCollection = db.collection('logs');
            
            const dateLimit = new Date();
            dateLimit.setMonth(dateLimit.getMonth() - months);
            
            // Compter avant suppression
            const countBefore = await logsCollection.countDocuments({
                horodatage: { $lt: dateLimit }
            });
            
            if (countBefore === 0) {
                console.log(`🗑️ RGPD: Aucun log à purger (> ${months} mois)`);
                return 0;
            }
            
            const result = await logsCollection.deleteMany({
                horodatage: { $lt: dateLimit }
            });
            
            console.log(`🗑️ RGPD: ${result.deletedCount} logs purgés (> ${months} mois)`);
            
            // Log l'action de purge
            await this.log(
                ACTION_TYPES.ANONYMISATION_LOGS_RGPD,
                null,
                { 
                    action: 'PURGE_OLD_LOGS',
                    nombre_logs_purges: result.deletedCount,
                    retention_mois: months,
                    date_limite: dateLimit.toISOString()
                }
            );
            
            return result.deletedCount;
        } catch (error) {
            console.error('❌ Erreur purge logs:', error.message);
            throw error;
        }
    }

    /**
     * Exporte les logs d'un utilisateur (RGPD - Droit d'accès / Portabilité)
     * 
     * @param {number} idUtilisateur - ID de l'utilisateur
     * @returns {Array} Logs de l'utilisateur
     */
    static async exportUserLogs(idUtilisateur) {
        try {
            const db = getDB();
            const logsCollection = db.collection('logs');
            
            const logs = await logsCollection
                .find({ id_utilisateur: parseInt(idUtilisateur) })
                .sort({ horodatage: -1 })
                .toArray();
            
            // Log l'action d'export
            await this.log(
                ACTION_TYPES.EXPORT_DONNEES_RGPD,
                idUtilisateur,
                { 
                    nombre_logs_exportes: logs.length
                }
            );
            
            console.log(`📤 RGPD: ${logs.length} logs exportés pour utilisateur ${idUtilisateur}`);
            
            return logs;
        } catch (error) {
            console.error('❌ Erreur export logs:', error.message);
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