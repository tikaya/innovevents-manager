/**
 * Service Employés
 * @module services/EmployeService
 */

const Utilisateur = require('../models/Utilisateur');

class EmployeService {
    /**
     * Liste tous les employés
     */
    static async getAll() {
        const employes = await Utilisateur.findAll({ role: 'employe' });
        return employes;
    }

    /**
     * Récupère un employé par ID
     */
    static async getById(id) {
        const employe = await Utilisateur.findById(id);
        
        if (!employe || employe.role !== 'employe') {
            throw new Error('Employé non trouvé');
        }
        
        return employe;
    }

    /**
     * Crée un nouvel employé
     */
    static async create(data) {
        const { email, nom, prenom, nom_utilisateur } = data;

        // Vérification email unique
        const existingEmail = await Utilisateur.findByEmail(email);
        if (existingEmail) {
            throw new Error('Cet email est déjà utilisé');
        }

        // Génération nom_utilisateur si non fourni
        let username = nom_utilisateur;
        if (!username) {
            username = `${prenom.toLowerCase()}_${nom.toLowerCase()}`.replace(/\s+/g, '_');
            let counter = 1;
            while (await Utilisateur.findByUsername(username)) {
                username = `${prenom.toLowerCase()}_${nom.toLowerCase()}_${counter}`.replace(/\s+/g, '_');
                counter++;
            }
        } else {
            // Vérification nom_utilisateur unique
            const existingUsername = await Utilisateur.findByUsername(username);
            if (existingUsername) {
                throw new Error('Ce nom d\'utilisateur est déjà utilisé');
            }
        }

        // Génération mot de passe temporaire
        const tempPassword = this.generateTempPassword();

        const employe = await Utilisateur.create({
            email,
            mot_de_passe: tempPassword,
            nom,
            prenom,
            nom_utilisateur: username,
            role: 'employe',
            doit_changer_mdp: true
        });

        return { employe, tempPassword };
    }

    /**
     * Met à jour un employé
     */
    static async update(id, data) {
        const { email, nom, prenom, nom_utilisateur, statut_utilisateur } = data;

        // Vérifier que l'employé existe
        const existing = await Utilisateur.findById(id);
        if (!existing || existing.role !== 'employe') {
            throw new Error('Employé non trouvé');
        }

        // Vérification email unique si modifié
        if (email && email !== existing.email) {
            const existingEmail = await Utilisateur.findByEmail(email);
            if (existingEmail) {
                throw new Error('Cet email est déjà utilisé');
            }
        }

        // Vérification nom_utilisateur unique si modifié
        if (nom_utilisateur && nom_utilisateur !== existing.nom_utilisateur) {
            const existingUsername = await Utilisateur.findByUsername(nom_utilisateur);
            if (existingUsername) {
                throw new Error('Ce nom d\'utilisateur est déjà utilisé');
            }
        }

        const employe = await Utilisateur.update(id, {
            email,
            nom,
            prenom,
            nom_utilisateur,
            statut_utilisateur
        });

        return employe;
    }

    /**
     * Réinitialise le mot de passe d'un employé
     */
    static async resetPassword(id) {
        const employe = await Utilisateur.findById(id);
        if (!employe || employe.role !== 'employe') {
            throw new Error('Employé non trouvé');
        }

        const tempPassword = this.generateTempPassword();
        await Utilisateur.updatePassword(id, tempPassword);
        await Utilisateur.update(id, { doit_changer_mdp: true });

        return { employe, tempPassword };
    }

    /**
     * Supprime un employé
     */
    static async remove(id) {
        const employe = await Utilisateur.findById(id);
        if (!employe || employe.role !== 'employe') {
            throw new Error('Employé non trouvé');
        }

        await Utilisateur.delete(id);
        return true;
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

module.exports = EmployeService;
