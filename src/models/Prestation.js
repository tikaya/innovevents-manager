/**
 * Model Prestation
 * @module models/Prestation
 */

const { query } = require('../config/database');

class Prestation {
    /**
     * Trouve toutes les prestations d'un devis
     */
    static async findByDevis(idDevis) {
        const sql = `SELECT * FROM prestation WHERE id_devis = $1 ORDER BY id_prestation ASC`;
        const result = await query(sql, [idDevis]);
        return result.rows;
    }

    /**
     * Trouve une prestation par ID
     */
    static async findById(id) {
        const sql = 'SELECT * FROM prestation WHERE id_prestation = $1';
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Crée une nouvelle prestation
     */
    static async create(data) {
        const { libelle_prestation, montant_ht_prestation, id_devis } = data;

        const sql = `
            INSERT INTO prestation (libelle_prestation, montant_ht_prestation, id_devis)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await query(sql, [libelle_prestation, montant_ht_prestation, id_devis]);
        return result.rows[0];
    }

    /**
     * Crée plusieurs prestations d'un coup
     */
    static async createMany(prestations, idDevis) {
        if (!prestations || prestations.length === 0) return [];

        const values = [];
        const params = [];
        let paramIndex = 1;

        for (const p of prestations) {
            values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
            params.push(p.libelle_prestation, p.montant_ht_prestation, idDevis);
        }

        const sql = `
            INSERT INTO prestation (libelle_prestation, montant_ht_prestation, id_devis)
            VALUES ${values.join(', ')}
            RETURNING *
        `;

        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Met à jour une prestation
     */
    static async update(id, data) {
        const { libelle_prestation, montant_ht_prestation } = data;

        const sql = `
            UPDATE prestation
            SET libelle_prestation = COALESCE($1, libelle_prestation),
                montant_ht_prestation = COALESCE($2, montant_ht_prestation)
            WHERE id_prestation = $3
            RETURNING *
        `;
        const result = await query(sql, [libelle_prestation, montant_ht_prestation, id]);
        return result.rows[0] || null;
    }

    /**
     * Supprime une prestation
     */
    static async delete(id) {
        const sql = 'DELETE FROM prestation WHERE id_prestation = $1';
        const result = await query(sql, [id]);
        return result.rowCount > 0;
    }

    /**
     * Supprime toutes les prestations d'un devis
     */
    static async deleteByDevis(idDevis) {
        const sql = 'DELETE FROM prestation WHERE id_devis = $1';
        const result = await query(sql, [idDevis]);
        return result.rowCount;
    }

    /**
     * Calcule le total HT des prestations d'un devis
     */
    static async getTotalHT(idDevis) {
        const sql = `SELECT COALESCE(SUM(montant_ht_prestation), 0) as total FROM prestation WHERE id_devis = $1`;
        const result = await query(sql, [idDevis]);
        return parseFloat(result.rows[0].total) || 0;
    }
}

module.exports = Prestation;
