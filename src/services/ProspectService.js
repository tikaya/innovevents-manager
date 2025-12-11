/**
 * Service Prospect
 * @module services/ProspectService
 */

const Prospect = require('../models/Prospect');
const Client = require('../models/Client');
const Evenement = require('../models/Evenement');
const Devis = require('../models/Devis');
const AuthService = require('./AuthService');
const EmailService = require('./EmailService');
const { getClient } = require('../config/database');

class ProspectService {
    /**
     * Récupère tous les prospects
     */
    static async getAll(filters = {}) {
        return Prospect.findAll(filters);
    }

    /**
     * Récupère un prospect par ID
     */
    static async getById(id) {
        const prospect = await Prospect.findById(id);
        if (!prospect) {
            throw new Error('Prospect non trouvé');
        }
        return prospect;
    }

    /**
     * Crée une demande de devis (prospect)
     */
    static async create(data) {
        const prospect = await Prospect.create(data);

        // Email à Innov'Events
        try {
            await EmailService.sendNewProspect(prospect);
        } catch (error) {
            console.error('Erreur email notification:', error.message);
        }

        // Email confirmation au prospect
        try {
            await EmailService.sendProspectConfirmation(prospect);
        } catch (error) {
            console.error('Erreur email confirmation:', error.message);
        }

        return prospect;
    }

    /**
     * Met à jour un prospect
     */
    static async update(id, data) {
        const prospect = await Prospect.update(id, data);
        if (!prospect) {
            throw new Error('Prospect non trouvé');
        }
        return prospect;
    }

    /**
     * Marque comme échoué
     */
    static async reject(id, messageEchec) {
        const prospect = await Prospect.findById(id);
        if (!prospect) {
            throw new Error('Prospect non trouvé');
        }

        const updated = await Prospect.updateStatut(id, 'echoue', messageEchec);

        // Email au prospect
        try {
            await EmailService.sendProspectRejection(prospect, messageEchec);
        } catch (error) {
            console.error('Erreur email rejet:', error.message);
        }

        return updated;
    }

    /**
     * Convertit un prospect en client + événement
     */
    static async convert(idProspect, clientData = {}, evenementData = {}) {
        const prospect = await Prospect.findById(idProspect);
        if (!prospect) {
            throw new Error('Prospect non trouvé');
        }

        if (prospect.statut_prospect === 'converti') {
            throw new Error('Ce prospect a déjà été converti');
        }

        const dbClient = await getClient();

        try {
            await dbClient.query('BEGIN');

            // 1. Créer compte utilisateur
            const { user, tempPassword } = await AuthService.createClientAccount({
                email: clientData.email_client || prospect.email_prospect,
                nom: clientData.nom_contact || prospect.nom_prospect,
                prenom: clientData.prenom_contact || prospect.prenom_prospect
            });

            // 2. Créer le client
            const client = await Client.create({
                nom_entreprise_client: clientData.nom_entreprise_client || prospect.nom_entreprise,
                nom_contact: clientData.nom_contact || prospect.nom_prospect,
                prenom_contact: clientData.prenom_contact || prospect.prenom_prospect,
                email_client: clientData.email_client || prospect.email_prospect,
                telephone_client: clientData.telephone_client || prospect.telephone_prospect,
                adresse_client: clientData.adresse_client || null,
                code_postal_client: clientData.code_postal_client || null,
                ville_client: clientData.ville_client || null,
                id_prospect: idProspect,
                id_utilisateur: user.id_utilisateur
            });

            // 3. Créer l'événement
            const evenement = await Evenement.create({
                nom_evenement: evenementData.nom_evenement || `${prospect.type_evenement_souhaite} - ${prospect.nom_entreprise}`,
                date_debut: evenementData.date_debut || prospect.date_souhaitee,
                heure_debut: evenementData.heure_debut || null,
                date_fin: evenementData.date_fin || prospect.date_souhaitee,
                heure_fin: evenementData.heure_fin || null,
                lieu_evenement: evenementData.lieu_evenement || prospect.lieu_souhaite,
                type_evenement: evenementData.type_evenement || prospect.type_evenement_souhaite,
                theme_evenement: evenementData.theme_evenement || null,
                statut_evenement: 'brouillon',
                visible_public: false,
                accord_client_affichage: false,
                id_client: client.id_client
            });

            // 4. Mettre à jour statut prospect
            await Prospect.updateStatut(idProspect, 'converti');

            await dbClient.query('COMMIT');

            // Email au nouveau client
            try {
                await EmailService.sendAccountCreated(user, tempPassword);
            } catch (error) {
                console.error('Erreur email compte créé:', error.message);
            }

            return { client, evenement, user };
        } catch (error) {
            await dbClient.query('ROLLBACK');
            throw error;
        } finally {
            dbClient.release();
        }
    }

    /**
     * Supprime un prospect
     */
    static async delete(id) {
        const deleted = await Prospect.delete(id);
        if (!deleted) {
            throw new Error('Prospect non trouvé');
        }
        return true;
    }

    /**
     * Recherche
     */
    static async search(term) {
        return Prospect.search(term);
    }
}

module.exports = ProspectService;
