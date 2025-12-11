/**
 * Service d'authentification
 * @module services/AuthService
 */

const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

class AuthService {
        /**
     * Connexion utilisateur
     */
    static async login(email, password) {
        console.log('🔍 Login attempt:', email);
        
        const user = await Utilisateur.findByEmail(email);
        console.log('🔍 User found:', user ? 'YES' : 'NO');
        
        if (!user) {
            throw new Error('Email ou mot de passe incorrect');
        }

        console.log('🔍 User status:', user.statut_utilisateur);
        console.log('🔍 Hash from DB:', user.mot_de_passe);
        console.log('🔍 Password received:', password);

        if (user.statut_utilisateur !== 'actif') {
            throw new Error('Compte suspendu ou inactif');
        }

        const isValid = await Utilisateur.verifyPassword(password, user.mot_de_passe);
        console.log('🔍 Password valid:', isValid);
        
        if (!isValid) {
            throw new Error('Email ou mot de passe incorrect');
        }

        const token = this.generateToken(user);
        const { mot_de_passe, ...userWithoutPassword } = user;

        return {
            token,
            user: userWithoutPassword,
            doit_changer_mdp: user.doit_changer_mdp
        };
    }

    /**
     * Inscription (client uniquement)
     */
    static async register(data) {
        const { email, mot_de_passe, nom, prenom, nom_utilisateur } = data;

        // Vérification email unique
        const existingEmail = await Utilisateur.findByEmail(email);
        if (existingEmail) {
            throw new Error('Cet email est déjà utilisé');
        }

        // Vérification nom_utilisateur unique
        const existingUsername = await Utilisateur.findByUsername(nom_utilisateur);
        if (existingUsername) {
            throw new Error('Ce nom d\'utilisateur est déjà utilisé');
        }

        // Création avec rôle 'client'
        const user = await Utilisateur.create({
            email,
            mot_de_passe,
            nom,
            prenom,
            nom_utilisateur,
            role: 'client'
        });

        const token = this.generateToken(user);

        return { token, user };
    }

    /**
     * Génère un token JWT
     */
    static generateToken(user) {
        const payload = {
            id: user.id_utilisateur,
            email: user.email,
            role: user.role,
            nom_utilisateur: user.nom_utilisateur
        };

        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });
    }

    /**
     * Mot de passe oublié - génère un nouveau
     */
    static async forgotPassword(email) {
        const user = await Utilisateur.findByEmail(email);
        if (!user) {
            // Sécurité : ne pas révéler si l'email existe
            return true;
        }

        const tempPassword = this.generateTempPassword();
        await Utilisateur.updatePassword(user.id_utilisateur, tempPassword);
        await Utilisateur.update(user.id_utilisateur, { doit_changer_mdp: true });

        // Retourne le mot de passe pour l'envoyer par email
        return { user, tempPassword };
    }

    /**
     * Change le mot de passe
     */
    static async changePassword(userId, oldPassword, newPassword) {
        const user = await Utilisateur.findById(userId);
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        // Récupère le user avec mot de passe
        const userWithPwd = await Utilisateur.findByEmail(user.email);

        // Vérifie ancien mot de passe (sauf si doit_changer_mdp)
        if (!userWithPwd.doit_changer_mdp) {
            const isValid = await Utilisateur.verifyPassword(oldPassword, userWithPwd.mot_de_passe);
            if (!isValid) {
                throw new Error('Ancien mot de passe incorrect');
            }
        }

        await Utilisateur.updatePassword(userId, newPassword);
        return true;
    }

    /**
     * Génère un mot de passe temporaire
     */
    static generateTempPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        
        // Assure les règles
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%'[Math.floor(Math.random() * 5)];
        
        for (let i = 0; i < 8; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
        
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    /**
     * Crée un compte pour un nouveau client (depuis conversion prospect)
     */
    static async createClientAccount(data) {
        const { email, nom, prenom } = data;

        const existing = await Utilisateur.findByEmail(email);
        if (existing) {
            // Utilisateur existe déjà, retourne-le
            return { user: existing, tempPassword: null };
        }

        // Génère un nom d'utilisateur unique
        let nomUtilisateur = `${prenom.toLowerCase()}_${nom.toLowerCase()}`.replace(/\s+/g, '_');
        let counter = 1;
        while (await Utilisateur.findByUsername(nomUtilisateur)) {
            nomUtilisateur = `${prenom.toLowerCase()}_${nom.toLowerCase()}_${counter}`.replace(/\s+/g, '_');
            counter++;
        }

        const tempPassword = this.generateTempPassword();

        const user = await Utilisateur.create({
            email,
            mot_de_passe: tempPassword,
            nom,
            prenom,
            nom_utilisateur: nomUtilisateur,
            role: 'client',
            doit_changer_mdp: true
        });

        return { user, tempPassword };
    }
}

module.exports = AuthService;
