/**
 * Service Client
 * @module services/ClientService
 */

const Client = require('../models/Client');
const Utilisateur = require('../models/Utilisateur');
const EmailService = require('./EmailService');
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

    /**
     * Génère un nom d'utilisateur unique
     */
    static async generateUsername(prenom, nom) {
        let nomUtilisateur = `${prenom.toLowerCase()}_${nom.toLowerCase()}`
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
        
        let counter = 1;
        let baseUsername = nomUtilisateur;
        
        while (await Utilisateur.findByUsername(nomUtilisateur)) {
            nomUtilisateur = `${baseUsername}_${counter}`;
            counter++;
        }
        
        return nomUtilisateur;
    }

    /**
     * Crée un client avec son compte utilisateur
     */
    static async create(data) {
        // Vérifier si l'email existe déjà dans client
        const existingClient = await Client.findByEmail(data.email_client);
        if (existingClient) throw new Error('Email déjà utilisé pour un client');

        // Vérifier si l'email existe déjà dans utilisateur
        const existingUser = await Utilisateur.findByEmail(data.email_client);
        if (existingUser) throw new Error('Email déjà utilisé pour un compte');

        const dbClient = await getClient();
        
        try {
            await dbClient.query('BEGIN');

            // 1. Générer mot de passe temporaire
            const tempPassword = this.generateTempPassword();

            // 2. Générer nom_utilisateur unique
            const nomUtilisateur = await this.generateUsername(data.prenom_contact, data.nom_contact);

            // 3. Créer l'utilisateur
            const utilisateur = await Utilisateur.create({
                email: data.email_client,
                mot_de_passe: tempPassword,
                nom: data.nom_contact,
                prenom: data.prenom_contact,
                nom_utilisateur: nomUtilisateur,
                role: 'client',
                doit_changer_mdp: true
            });

            // 4. Créer le client lié à l'utilisateur
            const client = await Client.create({
                ...data,
                id_utilisateur: utilisateur.id_utilisateur
            });

            await dbClient.query('COMMIT');

            // 5. Envoyer email avec identifiants
            try {
                await EmailService.sendAccountCreated(
                    { 
                        email: data.email_client, 
                        prenom: data.prenom_contact 
                    }, 
                    tempPassword
                );
            } catch (emailError) {
                console.error('Erreur envoi email:', emailError);
            }

            return { client, tempPassword };

        } catch (error) {
            await dbClient.query('ROLLBACK');
            throw error;
        } finally {
            dbClient.release();
        }
    }

    /**
     * Crée un client depuis un prospect (sans créer de nouveau compte si déjà existant)
     */
    static async createFromProspect(data, idUtilisateur = null) {
        const existingClient = await Client.findByEmail(data.email_client);
        if (existingClient) throw new Error('Email déjà utilisé');

        // Si pas d'utilisateur fourni, en créer un
        if (!idUtilisateur) {
            const existingUser = await Utilisateur.findByEmail(data.email_client);
            
            if (existingUser) {
                idUtilisateur = existingUser.id_utilisateur;
            } else {
                // Générer nom_utilisateur unique
                const nomUtilisateur = await this.generateUsername(data.prenom_contact, data.nom_contact);
                
                const tempPassword = this.generateTempPassword();
                const utilisateur = await Utilisateur.create({
                    email: data.email_client,
                    mot_de_passe: tempPassword,
                    nom: data.nom_contact,
                    prenom: data.prenom_contact,
                    nom_utilisateur: nomUtilisateur,
                    role: 'client',
                    doit_changer_mdp: true
                });
                idUtilisateur = utilisateur.id_utilisateur;

                // Envoyer email
                try {
                    await EmailService.sendAccountCreated(
                        { email: data.email_client, prenom: data.prenom_contact },
                        tempPassword
                    );
                } catch (e) {
                    console.error('Erreur email:', e);
                }
            }
        }

        return Client.create({ ...data, id_utilisateur: idUtilisateur });
    }

    static async update(id, data) {
        const client = await Client.findById(id);
        if (!client) throw new Error('Client non trouvé');

        // Si l'email change, vérifier l'unicité et mettre à jour l'utilisateur aussi
        if (data.email_client && data.email_client !== client.email_client) {
            const existingClient = await Client.findByEmail(data.email_client);
            if (existingClient && existingClient.id_client !== parseInt(id)) {
                throw new Error('Email déjà utilisé');
            }

            // Mettre à jour l'email de l'utilisateur aussi
            if (client.id_utilisateur) {
                await Utilisateur.update(client.id_utilisateur, { email: data.email_client });
            }
        }

        // Mettre à jour nom/prénom de l'utilisateur si modifiés
        if (client.id_utilisateur && (data.nom_contact || data.prenom_contact)) {
            const updateUser = {};
            if (data.nom_contact) updateUser.nom = data.nom_contact;
            if (data.prenom_contact) updateUser.prenom = data.prenom_contact;
            await Utilisateur.update(client.id_utilisateur, updateUser);
        }

        const updatedClient = await Client.update(id, data);
        if (!updatedClient) throw new Error('Client non trouvé');
        return updatedClient;
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

    /**
     * Réinitialise le mot de passe d'un client
     */
    static async resetPassword(id) {
        const client = await Client.findById(id);
        if (!client) throw new Error('Client non trouvé');
        if (!client.id_utilisateur) throw new Error('Ce client n\'a pas de compte utilisateur');

        const tempPassword = this.generateTempPassword();
        await Utilisateur.updatePassword(client.id_utilisateur, tempPassword);
        await Utilisateur.update(client.id_utilisateur, { doit_changer_mdp: true });

        // Envoyer email
        try {
            await EmailService.sendNewPassword(
                { email: client.email_client, prenom: client.prenom_contact },
                tempPassword
            );
        } catch (e) {
            console.error('Erreur email:', e);
        }

        return { client, tempPassword };
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

    /**
     * Génère un mot de passe temporaire
     */
    static generateTempPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%'[Math.floor(Math.random() * 5)];
        
        for (let i = 0; i < 8; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
        
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
}

module.exports = ClientService;
