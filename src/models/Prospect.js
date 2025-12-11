/**
 * Model Prospect
 * @module models/Prospect
 */

const { query } = require('../config/database');

class Prospect {
    /**
     * Trouve tous les prospects
     */
    static async findAll(filters = {}) {
        let sql = `SELECT * FROM prospect WHERE 1=1`;
        const params = [];
        let paramIndex = 1;

        if (filters.statut_prospect) {
            sql += ` AND statut_prospect = $${paramIndex++}`;
            params.push(filters.statut_prospect);
        }

        if (filters.type_evenement_souhaite) {
            sql += ` AND type_evenement_souhaite = $${paramIndex++}`;
            params.push(filters.type_evenement_souhaite);
        }

        sql += ' ORDER BY date_creation_prospect DESC';
        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Trouve un prospect par ID
     */
    static async findById(id) {
        const sql = 'SELECT * FROM prospect WHERE id_prospect = $1';
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Trouve un prospect par email
     */
    static async findByEmail(email) {
        const sql = 'SELECT * FROM prospect WHERE email_prospect = $1';
        const result = await query(sql, [email]);
        return result.rows[0] || null;
    }

    /**
     * Crée un nouveau prospect (demande de devis)
     */
    static async create(data) {
        const {
            nom_entreprise, nom_prospect, prenom_prospect, email_prospect,
            telephone_prospect, lieu_souhaite, type_evenement_souhaite,
            date_souhaitee, nb_participants, description_besoin
        } = data;

        const sql = `
            INSERT INTO prospect (
                nom_entreprise, nom_prospect, prenom_prospect, email_prospect,
                telephone_prospect, lieu_souhaite, type_evenement_souhaite,
                date_souhaitee, nb_participants, description_besoin
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const params = [
            nom_entreprise, nom_prospect, prenom_prospect, email_prospect,
            telephone_prospect, lieu_souhaite, type_evenement_souhaite,
            date_souhaitee, nb_participants, description_besoin
        ];

        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Met à jour un prospect
     */
    static async update(id, data) {
        const fields = [];
        const params = [];
        let paramIndex = 1;

        const allowedFields = [
            'nom_entreprise', 'nom_prospect', 'prenom_prospect', 'email_prospect',
            'telephone_prospect', 'lieu_souhaite', 'type_evenement_souhaite',
            'date_souhaitee', 'nb_participants', 'description_besoin',
            'statut_prospect', 'message_echec'
        ];

        for (const [key, value] of Object.entries(data)) {
            if (allowedFields.includes(key) && value !== undefined) {
                fields.push(`${key} = $${paramIndex++}`);
                params.push(value);
            }
        }

        if (fields.length === 0) return null;
        params.push(id);

        const sql = `
            UPDATE prospect
            SET ${fields.join(', ')}
            WHERE id_prospect = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);
        return result.rows[0] || null;
    }

    /**
     * Met à jour le statut d'un prospect
     */
    static async updateStatut(id, statut, messageEchec = null) {
        const sql = `
            UPDATE prospect
            SET statut_prospect = $1, message_echec = $2
            WHERE id_prospect = $3
            RETURNING *
        `;
        const result = await query(sql, [statut, messageEchec, id]);
        return result.rows[0] || null;
    }

    /**
     * Supprime un prospect
     */
    static async delete(id) {
        const sql = 'DELETE FROM prospect WHERE id_prospect = $1';
        const result = await query(sql, [id]);
        return result.rowCount > 0;
    }

    /**
     * Recherche de prospects
     */
    static async search(searchTerm) {
        const sql = `
            SELECT * FROM prospect
            WHERE nom_entreprise ILIKE $1
               OR nom_prospect ILIKE $1
               OR prenom_prospect ILIKE $1
               OR email_prospect ILIKE $1
            ORDER BY date_creation_prospect DESC
        `;
        const result = await query(sql, [`%${searchTerm}%`]);
        return result.rows;
    }
}

module.exports = Prospect;
