/**
 * Model Utilisateur
 * @module models/Utilisateur
 */

const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class Utilisateur {
    /**
     * Trouve tous les utilisateurs
     */
    static async findAll(filters = {}) {
        let sql = `
            SELECT id_utilisateur, email, nom, prenom, nom_utilisateur, role, 
                   statut_utilisateur, doit_changer_mdp, date_creation, date_modification
            FROM utilisateur
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.role) {
            sql += ` AND role = $${paramIndex++}`;
            params.push(filters.role);
        }

        if (filters.statut) {
            sql += ` AND statut_utilisateur = $${paramIndex++}`;
            params.push(filters.statut);
        }

        sql += ' ORDER BY date_creation DESC';
        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Trouve un utilisateur par ID
     */
    static async findById(id) {
        const sql = `
            SELECT id_utilisateur, email, nom, prenom, nom_utilisateur, role, 
                   statut_utilisateur, doit_changer_mdp, date_creation, date_modification
            FROM utilisateur
            WHERE id_utilisateur = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Trouve un utilisateur par email (avec mot de passe pour auth)
     */
    static async findByEmail(email) {
        const sql = `
            SELECT id_utilisateur, email, mot_de_passe, nom, prenom, nom_utilisateur, 
                   role, statut_utilisateur, doit_changer_mdp, date_creation
            FROM utilisateur
            WHERE email = $1
        `;
        const result = await query(sql, [email]);
        return result.rows[0] || null;
    }

    /**
     * Trouve par nom d'utilisateur
     */
    static async findByUsername(nomUtilisateur) {
        const sql = `SELECT * FROM utilisateur WHERE nom_utilisateur = $1`;
        const result = await query(sql, [nomUtilisateur]);
        return result.rows[0] || null;
    }

    /**
     * Crée un nouvel utilisateur
     */
    static async create(data) {
        const { email, mot_de_passe, nom, prenom, nom_utilisateur, role, doit_changer_mdp = false } = data;
        
        // Hashage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

        const sql = `
            INSERT INTO utilisateur (email, mot_de_passe, nom, prenom, nom_utilisateur, role, doit_changer_mdp)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id_utilisateur, email, nom, prenom, nom_utilisateur, role, statut_utilisateur, date_creation
        `;
        const params = [email, hashedPassword, nom, prenom, nom_utilisateur, role, doit_changer_mdp];
        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Met à jour un utilisateur
     */
    static async update(id, data) {
        const fields = [];
        const params = [];
        let paramIndex = 1;

        const allowedFields = ['email', 'nom', 'prenom', 'nom_utilisateur', 'role', 'statut_utilisateur', 'doit_changer_mdp'];

        for (const [key, value] of Object.entries(data)) {
            if (allowedFields.includes(key) && value !== undefined) {
                fields.push(`${key} = $${paramIndex++}`);
                params.push(value);
            }
        }

        if (fields.length === 0) return null;

        fields.push(`date_modification = CURRENT_TIMESTAMP`);
        params.push(id);

        const sql = `
            UPDATE utilisateur
            SET ${fields.join(', ')}
            WHERE id_utilisateur = $${paramIndex}
            RETURNING id_utilisateur, email, nom, prenom, nom_utilisateur, role, statut_utilisateur, date_modification
        `;

        const result = await query(sql, params);
        return result.rows[0] || null;
    }

    /**
     * Met à jour le mot de passe
     */
    static async updatePassword(id, newPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const sql = `
            UPDATE utilisateur
            SET mot_de_passe = $1, doit_changer_mdp = FALSE, date_modification = CURRENT_TIMESTAMP
            WHERE id_utilisateur = $2
        `;
        const result = await query(sql, [hashedPassword, id]);
        return result.rowCount > 0;
    }

    /**
     * Vérifie le mot de passe
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Supprime un utilisateur
     */
    static async delete(id) {
        const sql = 'DELETE FROM utilisateur WHERE id_utilisateur = $1';
        const result = await query(sql, [id]);
        return result.rowCount > 0;
    }
}

module.exports = Utilisateur;