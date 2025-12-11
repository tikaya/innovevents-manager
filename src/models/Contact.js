/**
 * Model Contact
 * @module models/Contact
 */

const { query } = require('../config/database');

class Contact {
    /**
     * Trouve tous les messages de contact
     */
    static async findAll(filters = {}) {
        let sql = 'SELECT * FROM contact WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (filters.date_from) {
            sql += ` AND date_envoi_contact >= $${paramIndex++}`;
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            sql += ` AND date_envoi_contact <= $${paramIndex++}`;
            params.push(filters.date_to);
        }

        sql += ' ORDER BY date_envoi_contact DESC';

        if (filters.limit) {
            sql += ` LIMIT $${paramIndex++}`;
            params.push(filters.limit);
        }

        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Trouve un message par ID
     */
    static async findById(id) {
        const sql = 'SELECT * FROM contact WHERE id_contact = $1';
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Crée un nouveau message de contact
     */
    static async create(data) {
        const { nom_utilisateur_contact, email_contact, titre_contact, description_contact } = data;

        const sql = `
            INSERT INTO contact (nom_utilisateur_contact, email_contact, titre_contact, description_contact)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const params = [nom_utilisateur_contact || null, email_contact, titre_contact, description_contact];
        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Supprime un message de contact
     */
    static async delete(id) {
        const sql = 'DELETE FROM contact WHERE id_contact = $1';
        const result = await query(sql, [id]);
        return result.rowCount > 0;
    }

    /**
     * Compte les messages
     */
    static async count() {
        const sql = 'SELECT COUNT(*) as count FROM contact';
        const result = await query(sql);
        return parseInt(result.rows[0].count) || 0;
    }

    /**
     * Recherche dans les messages
     */
    static async search(searchTerm) {
        const sql = `
            SELECT * FROM contact
            WHERE titre_contact ILIKE $1
               OR description_contact ILIKE $1
               OR email_contact ILIKE $1
               OR nom_utilisateur_contact ILIKE $1
            ORDER BY date_envoi_contact DESC
        `;
        const result = await query(sql, [`%${searchTerm}%`]);
        return result.rows;
    }
}

module.exports = Contact;
