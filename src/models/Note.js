/**
 * Model Note
 * @module models/Note
 */

const { query } = require('../config/database');

class Note {
    /**
     * Trouve toutes les notes
     */
    static async findAll(filters = {}) {
        let sql = `
            SELECT n.*, 
                   u.nom as auteur_nom, u.prenom as auteur_prenom,
                   e.nom_evenement
            FROM note n
            INNER JOIN utilisateur u ON n.id_utilisateur = u.id_utilisateur
            LEFT JOIN evenement e ON n.id_evenement = e.id_evenement
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.id_evenement) {
            sql += ` AND n.id_evenement = $${paramIndex++}`;
            params.push(filters.id_evenement);
        }

        if (filters.id_utilisateur) {
            sql += ` AND n.id_utilisateur = $${paramIndex++}`;
            params.push(filters.id_utilisateur);
        }

        if (filters.est_globale !== undefined) {
            sql += ` AND n.est_globale = $${paramIndex++}`;
            params.push(filters.est_globale);
        }

        sql += ' ORDER BY n.date_creation_note DESC';

        if (filters.limit) {
            sql += ` LIMIT $${paramIndex++}`;
            params.push(filters.limit);
        }

        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Trouve les notes d'un événement
     */
    static async findByEvenement(idEvenement) {
        const sql = `
            SELECT n.*, u.nom as auteur_nom, u.prenom as auteur_prenom
            FROM note n
            INNER JOIN utilisateur u ON n.id_utilisateur = u.id_utilisateur
            WHERE n.id_evenement = $1
            ORDER BY n.date_creation_note DESC
        `;
        const result = await query(sql, [idEvenement]);
        return result.rows;
    }

    /**
     * Trouve les notes globales
     */
    static async findGlobales() {
        const sql = `
            SELECT n.*, u.nom as auteur_nom, u.prenom as auteur_prenom
            FROM note n
            INNER JOIN utilisateur u ON n.id_utilisateur = u.id_utilisateur
            WHERE n.est_globale = TRUE
            ORDER BY n.date_creation_note DESC
        `;
        const result = await query(sql);
        return result.rows;
    }

    /**
     * Trouve les dernières notes (widget dashboard)
     */
    static async findRecentes(limit = 5) {
        const sql = `
            SELECT n.*, 
                   u.nom as auteur_nom, u.prenom as auteur_prenom,
                   e.nom_evenement
            FROM note n
            INNER JOIN utilisateur u ON n.id_utilisateur = u.id_utilisateur
            LEFT JOIN evenement e ON n.id_evenement = e.id_evenement
            ORDER BY n.date_creation_note DESC
            LIMIT $1
        `;
        const result = await query(sql, [limit]);
        return result.rows;
    }

    /**
     * Trouve une note par ID
     */
    static async findById(id) {
        const sql = `
            SELECT n.*, 
                   u.nom as auteur_nom, u.prenom as auteur_prenom,
                   e.nom_evenement
            FROM note n
            INNER JOIN utilisateur u ON n.id_utilisateur = u.id_utilisateur
            LEFT JOIN evenement e ON n.id_evenement = e.id_evenement
            WHERE n.id_note = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Crée une nouvelle note
     */
    static async create(data) {
        const { contenu_note, est_globale = false, id_utilisateur, id_evenement } = data;

        const sql = `
            INSERT INTO note (contenu_note, est_globale, id_utilisateur, id_evenement)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const params = [contenu_note, est_globale, id_utilisateur, id_evenement || null];
        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Met à jour une note
     */
    static async update(id, data) {
        const { contenu_note, est_globale } = data;

        const sql = `
            UPDATE note
            SET contenu_note = COALESCE($1, contenu_note),
                est_globale = COALESCE($2, est_globale),
                date_modification_note = CURRENT_TIMESTAMP
            WHERE id_note = $3
            RETURNING *
        `;
        const result = await query(sql, [contenu_note, est_globale, id]);
        return result.rows[0] || null;
    }

    /**
     * Supprime une note
     */
    static async delete(id) {
        const sql = 'DELETE FROM note WHERE id_note = $1';
        const result = await query(sql, [id]);
        return result.rowCount > 0;
    }
}

module.exports = Note;
