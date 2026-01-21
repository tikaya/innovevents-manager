/**
 * Model Evenement
 * @module models/Evenement
 */

const { query } = require('../config/database');

class Evenement {
    /**
     * Trouve tous les événements
     */
    static async findAll(filters = {}) {
        let sql = `
            SELECT e.*, 
                   c.nom_entreprise_client, c.nom_contact, c.prenom_contact, c.email_client
            FROM evenement e
            INNER JOIN client c ON e.id_client = c.id_client
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.statut_evenement) {
            sql += ` AND e.statut_evenement = $${paramIndex++}`;
            params.push(filters.statut_evenement);
        }

        if (filters.type_evenement) {
            sql += ` AND e.type_evenement = $${paramIndex++}`;
            params.push(filters.type_evenement);
        }

        if (filters.theme_evenement) {
            sql += ` AND e.theme_evenement ILIKE $${paramIndex++}`;
            params.push(`%${filters.theme_evenement}%`);
        }

        if (filters.date_debut_from) {
            sql += ` AND e.date_debut >= $${paramIndex++}`;
            params.push(filters.date_debut_from);
        }

        if (filters.date_debut_to) {
            sql += ` AND e.date_debut <= $${paramIndex++}`;
            params.push(filters.date_debut_to);
        }

        if (filters.id_client) {
            sql += ` AND e.id_client = $${paramIndex++}`;
            params.push(filters.id_client);
        }

        sql += ' ORDER BY e.date_debut DESC';
        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Trouve les événements publics (page publique)
     */
    static async findPublic(filters = {}) {
        let sql = `
            SELECT e.id_evenement, e.nom_evenement, e.date_debut, e.heure_debut, 
                   e.date_fin, e.heure_fin, e.lieu_evenement, e.type_evenement,
                   e.theme_evenement, e.image_evenement
            FROM evenement e
            WHERE e.visible_public = TRUE 
              AND e.accord_client_affichage = TRUE
              AND e.statut_evenement != 'brouillon'
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.type_evenement) {
            sql += ` AND e.type_evenement = $${paramIndex++}`;
            params.push(filters.type_evenement);
        }

        if (filters.theme_evenement) {
            sql += ` AND e.theme_evenement ILIKE $${paramIndex++}`;
            params.push(`%${filters.theme_evenement}%`);
        }

        if (filters.date_debut_from) {
            sql += ` AND e.date_debut >= $${paramIndex++}`;
            params.push(filters.date_debut_from);
        }

        if (filters.date_debut_to) {
            sql += ` AND e.date_debut <= $${paramIndex++}`;
            params.push(filters.date_debut_to);
        }

        sql += ' ORDER BY e.date_debut DESC';
        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Trouve un événement par ID
     */
    static async findById(id) {
        const sql = `
            SELECT e.*, 
                   c.nom_entreprise_client, c.nom_contact, c.prenom_contact, 
                   c.email_client, c.telephone_client
            FROM evenement e
            INNER JOIN client c ON e.id_client = c.id_client
            WHERE e.id_evenement = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Crée un nouvel événement
     */
    static async create(data) {
        const {
            nom_evenement, date_debut, heure_debut, date_fin, heure_fin,
            lieu_evenement, type_evenement, theme_evenement,
            statut_evenement = 'brouillon', visible_public = false,
            accord_client_affichage = false, image_evenement, id_client
        } = data;

        const sql = `
            INSERT INTO evenement (
                nom_evenement, date_debut, heure_debut, date_fin, heure_fin,
                lieu_evenement, type_evenement, theme_evenement, statut_evenement,
                visible_public, accord_client_affichage, image_evenement, id_client
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;
        const params = [
            nom_evenement, date_debut, heure_debut || null, date_fin, heure_fin || null,
            lieu_evenement, type_evenement || null, theme_evenement || null, statut_evenement,
            visible_public, accord_client_affichage, image_evenement || null, id_client
        ];

        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Met à jour un événement
     */
    static async update(id, data) {
        const fields = [];
        const params = [];
        let paramIndex = 1;

        const allowedFields = [
            'nom_evenement', 'date_debut', 'heure_debut', 'date_fin', 'heure_fin',
            'lieu_evenement', 'type_evenement', 'theme_evenement', 'statut_evenement',
            'visible_public', 'accord_client_affichage', 'image_evenement'
        ];

        for (const [key, value] of Object.entries(data)) {
            if (allowedFields.includes(key) && value !== undefined) {
                fields.push(`${key} = $${paramIndex++}`);
                params.push(value);
            }
        }

        if (fields.length === 0) return null;

        fields.push(`date_modification_evt = CURRENT_TIMESTAMP`);
        params.push(id);

        const sql = `
            UPDATE evenement
            SET ${fields.join(', ')}
            WHERE id_evenement = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);
        return result.rows[0] || null;
    }

    /**
     * Met à jour le statut
     */
    static async updateStatut(id, statut) {
        const sql = `
            UPDATE evenement
            SET statut_evenement = $1, date_modification_evt = CURRENT_TIMESTAMP
            WHERE id_evenement = $2
            RETURNING *
        `;
        const result = await query(sql, [statut, id]);
        return result.rows[0] || null;
    }

    /**
     * Supprime un événement
     */
    static async delete(id) {
        const sql = 'DELETE FROM evenement WHERE id_evenement = $1';
        const result = await query(sql, [id]);
        return result.rowCount > 0;
    }

    /**
     * Trouve les 3 prochains événements (widget dashboard)
     */
    static async findProchains(idClient = null) {
        let sql = `
            SELECT e.*, c.nom_entreprise_client
            FROM evenement e
            INNER JOIN client c ON e.id_client = c.id_client
            WHERE e.date_debut >= CURRENT_DATE
              AND e.statut_evenement NOT IN ('termine', 'annule')
        `;
        const params = [];

        if (idClient) {
            sql += ' AND e.id_client = $1';
            params.push(idClient);
        }

        sql += ' ORDER BY e.date_debut ASC LIMIT 3';
        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Compte les événements brouillon
     */
    static async countBrouillons() {
        const sql = `SELECT COUNT(*) as count FROM evenement WHERE statut_evenement = 'brouillon'`;
        const result = await query(sql);
        return parseInt(result.rows[0].count) || 0;
    }

    /**
     * Liste des types d'événements
     */
    static async getTypes() {
        const sql = `SELECT DISTINCT type_evenement FROM evenement WHERE type_evenement IS NOT NULL ORDER BY type_evenement`;
        const result = await query(sql);
        return result.rows.map(r => r.type_evenement);
    }

    /**
     * Liste des thèmes
     */
    static async getThemes() {
        const sql = `SELECT DISTINCT theme_evenement FROM evenement WHERE theme_evenement IS NOT NULL ORDER BY theme_evenement`;
        const result = await query(sql);
        return result.rows.map(r => r.theme_evenement);
    }
}

module.exports = Evenement;