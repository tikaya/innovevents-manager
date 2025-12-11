/**
 * Model Client
 * @module models/Client
 */

const { query } = require('../config/database');

class Client {
    /**
     * Trouve tous les clients
     */
    static async findAll(filters = {}) {
        let sql = `
            SELECT c.*, 
                   u.email as utilisateur_email, u.nom as utilisateur_nom, u.prenom as utilisateur_prenom,
                   p.nom_entreprise as prospect_entreprise
            FROM client c
            LEFT JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
            LEFT JOIN prospect p ON c.id_prospect = p.id_prospect
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.ville) {
            sql += ` AND c.ville_client = $${paramIndex++}`;
            params.push(filters.ville);
        }

        if (filters.id_utilisateur) {
            sql += ` AND c.id_utilisateur = $${paramIndex++}`;
            params.push(filters.id_utilisateur);
        }

        sql += ' ORDER BY c.date_creation_client DESC';
        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Trouve un client par ID
     */
    static async findById(id) {
        const sql = `
            SELECT c.*, 
                   u.email as utilisateur_email, u.nom as utilisateur_nom, u.prenom as utilisateur_prenom
            FROM client c
            LEFT JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
            WHERE c.id_client = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Trouve un client par email
     */
    static async findByEmail(email) {
        const sql = 'SELECT * FROM client WHERE email_client = $1';
        const result = await query(sql, [email]);
        return result.rows[0] || null;
    }

    /**
     * Trouve un client par ID utilisateur
     */
    static async findByUserId(idUtilisateur) {
        const sql = 'SELECT * FROM client WHERE id_utilisateur = $1';
        const result = await query(sql, [idUtilisateur]);
        return result.rows[0] || null;
    }

    /**
     * Crée un nouveau client
     */
    static async create(data) {
        const {
            nom_entreprise_client, nom_contact, prenom_contact, email_client,
            telephone_client, adresse_client, code_postal_client, ville_client,
            id_prospect, id_utilisateur
        } = data;

        const sql = `
            INSERT INTO client (
                nom_entreprise_client, nom_contact, prenom_contact, email_client,
                telephone_client, adresse_client, code_postal_client, ville_client,
                id_prospect, id_utilisateur
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const params = [
            nom_entreprise_client, nom_contact, prenom_contact, email_client,
            telephone_client, adresse_client || null, code_postal_client || null,
            ville_client || null, id_prospect || null, id_utilisateur || null
        ];

        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Met à jour un client
     */
    static async update(id, data) {
        const fields = [];
        const params = [];
        let paramIndex = 1;

        const allowedFields = [
            'nom_entreprise_client', 'nom_contact', 'prenom_contact', 'email_client',
            'telephone_client', 'adresse_client', 'code_postal_client', 'ville_client',
            'id_utilisateur'
        ];

        for (const [key, value] of Object.entries(data)) {
            if (allowedFields.includes(key) && value !== undefined) {
                fields.push(`${key} = $${paramIndex++}`);
                params.push(value);
            }
        }

        if (fields.length === 0) return null;

        fields.push(`date_modification_client = CURRENT_TIMESTAMP`);
        params.push(id);

        const sql = `
            UPDATE client
            SET ${fields.join(', ')}
            WHERE id_client = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);
        return result.rows[0] || null;
    }

    /**
     * Supprime un client
     */
    static async delete(id) {
        const sql = 'DELETE FROM client WHERE id_client = $1';
        const result = await query(sql, [id]);
        return result.rowCount > 0;
    }

    /**
     * Compte les clients actifs
     */
    static async countActifs() {
        const sql = `
            SELECT COUNT(DISTINCT c.id_client) as count
            FROM client c
            INNER JOIN evenement e ON c.id_client = e.id_client
            WHERE e.statut_evenement IN ('accepte', 'en_cours')
        `;
        const result = await query(sql);
        return parseInt(result.rows[0].count) || 0;
    }

    /**
     * Recherche de clients
     */
    static async search(searchTerm) {
        const sql = `
            SELECT c.*, u.email as utilisateur_email
            FROM client c
            LEFT JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
            WHERE c.nom_entreprise_client ILIKE $1
               OR c.nom_contact ILIKE $1
               OR c.prenom_contact ILIKE $1
               OR c.email_client ILIKE $1
            ORDER BY c.date_creation_client DESC
        `;
        const result = await query(sql, [`%${searchTerm}%`]);
        return result.rows;
    }

    /**
     * Historique des événements d'un client
     */
    static async getEvenements(idClient) {
        const sql = `
            SELECT e.*, d.numero_devis, d.statut_devis
            FROM evenement e
            LEFT JOIN devis d ON e.id_evenement = d.id_evenement
            WHERE e.id_client = $1
            ORDER BY e.date_debut DESC
        `;
        const result = await query(sql, [idClient]);
        return result.rows;
    }
}

module.exports = Client;
