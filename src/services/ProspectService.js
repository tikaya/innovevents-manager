/**
 * Service Prospect
 * @module services/ProspectService
 * 
 * Gère les demandes de devis (prospects) et leur conversion en clients
 * 
 * Cas gérés lors de la conversion :
 * - Client existant → Crée seulement l'événement
 * - Utilisateur existant sans client → Crée le client lié
 * - Rien n'existe → Crée tout (utilisateur + client + événement)
 */

const Prospect = require('../models/Prospect');
const Client = require('../models/Client');
const Evenement = require('../models/Evenement');
const Devis = require('../models/Devis');
const Utilisateur = require('../models/Utilisateur');
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

        // ✅ Vérifier que le prospect n'est pas déjà traité
        if (prospect.statut_prospect === 'converti') {
            throw new Error('Ce prospect a déjà été converti en client');
        }
        if (prospect.statut_prospect === 'echoue') {
            throw new Error('Ce prospect a déjà été rejeté');
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
     * 
     * ✅ GÈRE 3 CAS :
     * 1. Client existe déjà (même email) → Crée seulement l'événement
     * 2. Utilisateur existe mais pas de client → Crée le client lié à l'utilisateur
     * 3. Rien n'existe → Crée tout (utilisateur + client + événement)
     * 
     * @param {number} idProspect - ID du prospect
     * @param {object} clientData - Données du client (optionnel)
     * @param {object} evenementData - Données de l'événement (optionnel)
     * @returns {object} { client, evenement, user, isExistingClient }
     */
    static async convert(idProspect, clientData = {}, evenementData = {}) {
        const prospect = await Prospect.findById(idProspect);
        if (!prospect) {
            throw new Error('Prospect non trouvé');
        }

        // ✅ Vérifier que le prospect n'est pas déjà traité
        if (prospect.statut_prospect === 'converti') {
            throw new Error('Ce prospect a déjà été converti');
        }
        if (prospect.statut_prospect === 'echoue') {
            throw new Error('Ce prospect a été rejeté et ne peut plus être converti');
        }

        const dbClient = await getClient();
        const emailProspect = clientData.email_client || prospect.email_prospect;

        try {
            await dbClient.query('BEGIN');

            let user = null;
            let client = null;
            let tempPassword = null;
            let isExistingClient = false;
            let isExistingUser = false;

            // ============================================
            // ÉTAPE 1 : Vérifier si le CLIENT existe déjà
            // ============================================
            const existingClient = await Client.findByEmail(emailProspect);
            
            if (existingClient) {
                // ✅ CAS 1 : Le client existe déjà
                console.log(`📋 Client existant trouvé (ID: ${existingClient.id_client}) pour ${emailProspect}`);
                client = existingClient;
                isExistingClient = true;
                
                // Récupérer l'utilisateur associé
                if (existingClient.id_utilisateur) {
                    user = await Utilisateur.findById(existingClient.id_utilisateur);
                }
            } else {
                // ============================================
                // ÉTAPE 2 : Vérifier si l'UTILISATEUR existe
                // ============================================
                const existingUser = await Utilisateur.findByEmail(emailProspect);
                
                if (existingUser) {
                    // ✅ CAS 2 : Utilisateur existe mais pas de client
                    console.log(`👤 Utilisateur existant trouvé (ID: ${existingUser.id_utilisateur}) pour ${emailProspect}`);
                    user = existingUser;
                    isExistingUser = true;
                    
                    // Créer le client lié à cet utilisateur
                    client = await Client.create({
                        nom_entreprise_client: clientData.nom_entreprise_client || prospect.nom_entreprise,
                        nom_contact: clientData.nom_contact || prospect.nom_prospect,
                        prenom_contact: clientData.prenom_contact || prospect.prenom_prospect,
                        email_client: emailProspect,
                        telephone_client: clientData.telephone_client || prospect.telephone_prospect,
                        adresse_client: clientData.adresse_client || null,
                        code_postal_client: clientData.code_postal_client || null,
                        ville_client: clientData.ville_client || null,
                        id_prospect: idProspect,
                        id_utilisateur: existingUser.id_utilisateur
                    });
                    
                    console.log(`✅ Client créé (ID: ${client.id_client}) pour utilisateur existant`);
                } else {
                    // ✅ CAS 3 : Rien n'existe → Créer tout
                    console.log(`🆕 Nouveau client/utilisateur pour ${emailProspect}`);
                    
                    // Créer le compte utilisateur
                    const result = await AuthService.createClientAccount({
                        email: emailProspect,
                        nom: clientData.nom_contact || prospect.nom_prospect,
                        prenom: clientData.prenom_contact || prospect.prenom_prospect
                    });
                    
                    user = result.user;
                    tempPassword = result.tempPassword;
                    
                    // Créer le client
                    client = await Client.create({
                        nom_entreprise_client: clientData.nom_entreprise_client || prospect.nom_entreprise,
                        nom_contact: clientData.nom_contact || prospect.nom_prospect,
                        prenom_contact: clientData.prenom_contact || prospect.prenom_prospect,
                        email_client: emailProspect,
                        telephone_client: clientData.telephone_client || prospect.telephone_prospect,
                        adresse_client: clientData.adresse_client || null,
                        code_postal_client: clientData.code_postal_client || null,
                        ville_client: clientData.ville_client || null,
                        id_prospect: idProspect,
                        id_utilisateur: user.id_utilisateur
                    });
                    
                    console.log(`✅ Nouveau client créé (ID: ${client.id_client})`);
                }
            }

            // ============================================
            // ÉTAPE 3 : Créer l'événement
            // ============================================
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

            console.log(`🎉 Événement créé (ID: ${evenement.id_evenement}) pour client ${client.id_client}`);

            // ============================================
            // ÉTAPE 4 : Mettre à jour statut prospect
            // ============================================
            await Prospect.updateStatut(idProspect, 'converti');

            await dbClient.query('COMMIT');

            // ============================================
            // ÉTAPE 5 : Envoyer les emails appropriés
            // ============================================
            if (isExistingClient) {
                // Client existant → Email "nouvel événement créé"
                try {
                    await EmailService.sendNewEventForExistingClient(client, evenement);
                } catch (error) {
                    console.error('Erreur email nouvel événement:', error.message);
                }
            } else if (tempPassword) {
                // Nouveau client → Email avec identifiants
                try {
                    await EmailService.sendAccountCreated(user, tempPassword);
                } catch (error) {
                    console.error('Erreur email compte créé:', error.message);
                }
            } else if (isExistingUser) {
                // Utilisateur existant devenu client → Email de notification
                try {
                    await EmailService.sendClientProfileCreated(client);
                } catch (error) {
                    console.error('Erreur email profil client:', error.message);
                }
            }

            return { 
                client, 
                evenement, 
                user,
                isExistingClient,
                message: isExistingClient 
                    ? `Événement ajouté au client existant "${client.nom_entreprise_client}"`
                    : `Nouveau client "${client.nom_entreprise_client}" créé avec son événement`
            };
            
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
        const prospect = await Prospect.findById(id);
        if (!prospect) {
            throw new Error('Prospect non trouvé');
        }
        
        // ✅ Empêcher la suppression d'un prospect converti
        if (prospect.statut_prospect === 'converti') {
            throw new Error('Impossible de supprimer un prospect converti en client');
        }
        
        const deleted = await Prospect.delete(id);
        if (!deleted) {
            throw new Error('Erreur lors de la suppression');
        }
        return true;
    }

    /**
     * Recherche
     */
    static async search(term) {
        return Prospect.search(term);
    }

    /**
     * Compte les prospects en attente
     */
    static async countEnAttente() {
        return Prospect.countByStatut('a_contacter');
    }

    /**
     * Récupère les prospects récents
     */
    static async getRecents(limit = 5) {
        const prospects = await Prospect.findAll({ limit });
        return prospects.slice(0, limit);
    }
}

module.exports = ProspectService;