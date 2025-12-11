/**
 * Model Avis
 * @module models/Avis
 */

const { query } = require('../config/database');

class Avis {
    /**
     * Trouve tous les avis
     */
    static async findAll(filters = {}) {
        let sql = `
            SELECT a.*, 
                   e.nom_evenement, e.date_debut, e.type_evenement,
                   c.nom_entreprise_client, c.nom_contact, c.prenom_contact
            FROM avis a
            INNER JOIN evenement e ON a.id_evenement = e.id_evenement
            INNER JOIN client c ON a.id_client = c.id_client
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.statut_avis) {
            sql += ` AND a.statut_avis = $${paramIndex++}`;
            params.push(filters.statut_avis);
        }

        if (filters.id_evenement) {
            sql += ` AND a.id_evenement = $${paramIndex++}`;
            params.push(filters.id_evenement);
        }

        if (filters.id_client) {
            sql += ` AND a.id_client = $${paramIndex++}`;
            params.push(filters.id_client);
        }

        sql += ' ORDER BY a.date_creation_avis DESC';
        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Trouve les avis validés (page publique)
     */
    static async findValides() {
        const sql = `
            SELECT a.*, 
                   e.nom_evenement, e.type_evenement,
                   c.nom_entreprise_client, c.prenom_contact
            FROM avis a
            INNER JOIN evenement e ON a.id_evenement = e.id_evenement
            INNER JOIN client c ON a.id_client = c.id_client
            WHERE a.statut_avis = 'valide'
            ORDER BY a.date_creation_avis DESC
        `;
        const result = await query(sql);
        return result.rows;
    }

    /**
     * Trouve les avis en attente de validation
     */
    static async findEnAttente() {
        const sql = `
            SELECT a.*, 
                   e.nom_evenement,
                   c.nom_entreprise_client, c.nom_contact, c.prenom_contact
            FROM avis a
            INNER JOIN evenement e ON a.id_evenement = e.id_evenement
            INNER JOIN client c ON a.id_client = c.id_client
            WHERE a.statut_avis = 'en_attente'
            ORDER BY a.date_creation_avis DESC
        `;
        const result = await query(sql);
        return result.rows;
    }

    /**
     * Trouve un avis par ID
     */
    static async findById(id) {
        const sql = `
            SELECT a.*, 
                   e.nom_evenement, e.date_debut,
                   c.nom_entreprise_client, c.nom_contact, c.prenom_contact
            FROM avis a
            INNER JOIN evenement e ON a.id_evenement = e.id_evenement
            INNER JOIN client c ON a.id_client = c.id_client
            WHERE a.id_avis = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Vérifie si un avis existe déjà pour un client et un événement
     */
    static async existsForClientAndEvent(idClient, idEvenement) {
        const sql = `SELECT COUNT(*) as count FROM avis WHERE id_client = $1 AND id_evenement = $2`;
        const result = await query(sql, [idClient, idEvenement]);
        return parseInt(result.rows[0].count) > 0;
    }

    /**
     * Crée un nouvel avis
     */
    static async create(data) {
        const { note_avis, commentaire_avis, id_evenement, id_client } = data;

        const sql = `
            INSERT INTO avis (note_avis, commentaire_avis, id_evenement, id_client)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const params = [note_avis, commentaire_avis || null, id_evenement, id_client];
        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Met à jour un avis
     */
    static async update(id, data) {
        const { note_avis, commentaire_avis } = data;

        const sql = `
            UPDATE avis
            SET note_avis = COALESCE($1, note_avis),
                commentaire_avis = COALESCE($2, commentaire_avis)
            WHERE id_avis = $3
            RETURNING *
        `;
        const result = await query(sql, [note_avis, commentaire_avis, id]);
        return result.rows[0] || null;
    }

    /**
     * Met à jour le statut d'un avis (validation/refus)
     */
    static async updateStatut(id, statut) {
        const sql = `UPDATE avis SET statut_avis = $1 WHERE id_avis = $2 RETURNING *`;
        const result = await query(sql, [statut, id]);
        return result.rows[0] || null;
    }

    /**
     * Supprime un avis
     */
    static async delete(id) {
        const sql = 'DELETE FROM avis WHERE id_avis = $1';
        const result = await query(sql, [id]);
        return result.rowCount > 0;
    }

    /**
     * Calcule la moyenne des notes
     */
    static async getAverageNote() {
        const sql = `SELECT AVG(note_avis) as moyenne FROM avis WHERE statut_avis = 'valide'`;
        const result = await query(sql);
        return parseFloat(result.rows[0].moyenne) || 0;
    }

    /**
     * Compte les avis par statut
     */
    static async countByStatut() {
        const sql = `SELECT statut_avis, COUNT(*) as count FROM avis GROUP BY statut_avis`;
        const result = await query(sql);
        return result.rows;
    }
}

module.exports = Avis;
