/**
 * Model Tache
 * @module models/Tache
 */

const { query } = require('../config/database');

class Tache {
    /**
     * Trouve toutes les tâches
     */
    static async findAll(filters = {}) {
        let sql = `
            SELECT t.*, 
                   u.nom as assignee_nom, u.prenom as assignee_prenom,
                   e.nom_evenement
            FROM tache t
            INNER JOIN utilisateur u ON t.id_utilisateur = u.id_utilisateur
            INNER JOIN evenement e ON t.id_evenement = e.id_evenement
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.id_evenement) {
            sql += ` AND t.id_evenement = $${paramIndex++}`;
            params.push(filters.id_evenement);
        }

        if (filters.id_utilisateur) {
            sql += ` AND t.id_utilisateur = $${paramIndex++}`;
            params.push(filters.id_utilisateur);
        }

        if (filters.statut_tache) {
            sql += ` AND t.statut_tache = $${paramIndex++}`;
            params.push(filters.statut_tache);
        }

        sql += ' ORDER BY t.date_echeance ASC NULLS LAST, t.date_creation_tache DESC';
        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Trouve les tâches d'un événement
     */
    static async findByEvenement(idEvenement) {
        const sql = `
            SELECT t.*, u.nom as assignee_nom, u.prenom as assignee_prenom
            FROM tache t
            INNER JOIN utilisateur u ON t.id_utilisateur = u.id_utilisateur
            WHERE t.id_evenement = $1
            ORDER BY t.date_echeance ASC NULLS LAST
        `;
        const result = await query(sql, [idEvenement]);
        return result.rows;
    }

    /**
     * Trouve les tâches d'un utilisateur (mes tâches)
     */
    static async findByUtilisateur(idUtilisateur) {
        const sql = `
            SELECT t.*, e.nom_evenement
            FROM tache t
            INNER JOIN evenement e ON t.id_evenement = e.id_evenement
            WHERE t.id_utilisateur = $1
            ORDER BY t.date_echeance ASC NULLS LAST
        `;
        const result = await query(sql, [idUtilisateur]);
        return result.rows;
    }

    /**
     * Trouve une tâche par ID
     */
    static async findById(id) {
        const sql = `
            SELECT t.*, 
                   u.nom as assignee_nom, u.prenom as assignee_prenom,
                   e.nom_evenement
            FROM tache t
            INNER JOIN utilisateur u ON t.id_utilisateur = u.id_utilisateur
            INNER JOIN evenement e ON t.id_evenement = e.id_evenement
            WHERE t.id_tache = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Crée une nouvelle tâche
     */
    static async create(data) {
        const {
            titre_tache, description_tache, statut_tache = 'a_faire',
            date_echeance, id_utilisateur, id_evenement
        } = data;

        const sql = `
            INSERT INTO tache (titre_tache, description_tache, statut_tache, date_echeance, id_utilisateur, id_evenement)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const params = [titre_tache, description_tache || null, statut_tache, date_echeance || null, id_utilisateur, id_evenement];
        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Met à jour une tâche
     */
    static async update(id, data) {
        const fields = [];
        const params = [];
        let paramIndex = 1;

        const allowedFields = ['titre_tache', 'description_tache', 'statut_tache', 'date_echeance', 'id_utilisateur'];

        for (const [key, value] of Object.entries(data)) {
            if (allowedFields.includes(key) && value !== undefined) {
                fields.push(`${key} = $${paramIndex++}`);
                params.push(value);
            }
        }

        if (fields.length === 0) return null;
        params.push(id);

        const sql = `
            UPDATE tache
            SET ${fields.join(', ')}
            WHERE id_tache = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);
        return result.rows[0] || null;
    }

    /**
     * Met à jour le statut d'une tâche
     */
    static async updateStatut(id, statut) {
        const sql = `UPDATE tache SET statut_tache = $1 WHERE id_tache = $2 RETURNING *`;
        const result = await query(sql, [statut, id]);
        return result.rows[0] || null;
    }

    /**
     * Supprime une tâche
     */
    static async delete(id) {
        const sql = 'DELETE FROM tache WHERE id_tache = $1';
        const result = await query(sql, [id]);
        return result.rowCount > 0;
    }

    /**
     * Trouve les tâches en retard
     */
    static async findEnRetard() {
        const sql = `
            SELECT t.*, 
                   u.nom as assignee_nom, u.prenom as assignee_prenom,
                   e.nom_evenement
            FROM tache t
            INNER JOIN utilisateur u ON t.id_utilisateur = u.id_utilisateur
            INNER JOIN evenement e ON t.id_evenement = e.id_evenement
            WHERE t.date_echeance < CURRENT_DATE
              AND t.statut_tache != 'termine'
            ORDER BY t.date_echeance ASC
        `;
        const result = await query(sql);
        return result.rows;
    }

    /**
     * Compte les tâches par statut
     */
    static async countByStatut(idEvenement = null) {
        let sql = `SELECT statut_tache, COUNT(*) as count FROM tache`;
        const params = [];

        if (idEvenement) {
            sql += ' WHERE id_evenement = $1';
            params.push(idEvenement);
        }

        sql += ' GROUP BY statut_tache';
        const result = await query(sql, params);
        return result.rows;
    }
}

module.exports = Tache;
