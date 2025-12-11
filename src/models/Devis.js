/**
 * Model Devis
 * @module models/Devis
 */

const { query } = require('../config/database');

class Devis {
    /**
     * Trouve tous les devis
     */
    static async findAll(filters = {}) {
        let sql = `
            SELECT d.*, 
                   e.nom_evenement, e.date_debut, e.lieu_evenement,
                   c.id_client, c.nom_entreprise_client, c.email_client
            FROM devis d
            INNER JOIN evenement e ON d.id_evenement = e.id_evenement
            INNER JOIN client c ON e.id_client = c.id_client
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.statut_devis) {
            sql += ` AND d.statut_devis = $${paramIndex++}`;
            params.push(filters.statut_devis);
        }

        if (filters.id_evenement) {
            sql += ` AND d.id_evenement = $${paramIndex++}`;
            params.push(filters.id_evenement);
        }

        if (filters.id_client) {
            sql += ` AND c.id_client = $${paramIndex++}`;
            params.push(filters.id_client);
        }

        sql += ' ORDER BY d.date_creation_devis DESC';
        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Trouve un devis par ID
     */
    static async findById(id) {
        const sql = `
            SELECT d.*, 
                   e.nom_evenement, e.date_debut, e.date_fin, e.lieu_evenement, e.type_evenement,
                   c.id_client, c.nom_entreprise_client, c.nom_contact, c.prenom_contact,
                   c.email_client, c.telephone_client, c.adresse_client, c.code_postal_client, c.ville_client
            FROM devis d
            INNER JOIN evenement e ON d.id_evenement = e.id_evenement
            INNER JOIN client c ON e.id_client = c.id_client
            WHERE d.id_devis = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    /**
     * Trouve un devis par numéro
     */
    static async findByNumero(numero) {
        const sql = `
            SELECT d.*, e.nom_evenement, c.nom_entreprise_client
            FROM devis d
            INNER JOIN evenement e ON d.id_evenement = e.id_evenement
            INNER JOIN client c ON e.id_client = c.id_client
            WHERE d.numero_devis = $1
        `;
        const result = await query(sql, [numero]);
        return result.rows[0] || null;
    }

    /**
     * Trouve les devis d'un événement
     */
    static async findByEvenement(idEvenement) {
        const sql = `SELECT * FROM devis WHERE id_evenement = $1 ORDER BY date_creation_devis DESC`;
        const result = await query(sql, [idEvenement]);
        return result.rows;
    }
/**
     * Génère un numéro de devis unique
     */
    static async generateNumero() {
        const year = new Date().getFullYear();
        const sql = `
            SELECT numero_devis FROM devis 
            WHERE numero_devis LIKE $1 
            ORDER BY numero_devis DESC 
            LIMIT 1
        `;
        const result = await query(sql, [`DEV-${year}-%`]);
        
        let nextNum = 1;
        if (result.rows.length > 0) {
            const lastNumero = result.rows[0].numero_devis;
            const lastNum = parseInt(lastNumero.split('-')[2]);
            nextNum = lastNum + 1;
        }
        
        return `DEV-${year}-${String(nextNum).padStart(4, '0')}`;
    }
    
    /**
     * Crée un nouveau devis
     */
    static async create(data) {
        const { numero_devis, taux_tva = 20.00, statut_devis = 'brouillon', id_evenement } = data;

        const sql = `
            INSERT INTO devis (numero_devis, taux_tva, statut_devis, id_evenement)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await query(sql, [numero_devis, taux_tva, statut_devis, id_evenement]);
        return result.rows[0];
    }

    /**
     * Met à jour un devis
     */
    static async update(id, data) {
        const fields = [];
        const params = [];
        let paramIndex = 1;

        const allowedFields = ['taux_tva', 'statut_devis', 'motif_modification', 'chemin_pdf'];

        for (const [key, value] of Object.entries(data)) {
            if (allowedFields.includes(key) && value !== undefined) {
                fields.push(`${key} = $${paramIndex++}`);
                params.push(value);
            }
        }

        if (fields.length === 0) return null;
        params.push(id);

        const sql = `
            UPDATE devis
            SET ${fields.join(', ')}
            WHERE id_devis = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);
        return result.rows[0] || null;
    }

    /**
     * Met à jour le statut d'un devis
     */
    static async updateStatut(id, statut, motif = null) {
        let sql;
        let params;

        if (statut === 'etude_client') {
            sql = `UPDATE devis SET statut_devis = $1, date_envoi_devis = CURRENT_TIMESTAMP WHERE id_devis = $2 RETURNING *`;
            params = [statut, id];
        } else if (['accepte', 'refuse'].includes(statut)) {
            sql = `UPDATE devis SET statut_devis = $1, date_reponse_client = CURRENT_TIMESTAMP WHERE id_devis = $2 RETURNING *`;
            params = [statut, id];
        } else if (statut === 'modification') {
            sql = `UPDATE devis SET statut_devis = $1, motif_modification = $2 WHERE id_devis = $3 RETURNING *`;
            params = [statut, motif, id];
        } else {
            sql = `UPDATE devis SET statut_devis = $1 WHERE id_devis = $2 RETURNING *`;
            params = [statut, id];
        }

        const result = await query(sql, params);
        return result.rows[0] || null;
    }

    /**
     * Met à jour le chemin du PDF
     */
    static async updatePdfPath(id, cheminPdf) {
        const sql = `UPDATE devis SET chemin_pdf = $1 WHERE id_devis = $2 RETURNING *`;
        const result = await query(sql, [cheminPdf, id]);
        return result.rows[0] || null;
    }

    /**
     * Supprime un devis
     */
    static async delete(id) {
        const sql = 'DELETE FROM devis WHERE id_devis = $1';
        const result = await query(sql, [id]);
        return result.rowCount > 0;
    }

    /**
     * Calcule les totaux d'un devis
     */
    static async calculateTotals(id) {
        const sql = `
            SELECT 
                d.taux_tva,
                COALESCE(SUM(p.montant_ht_prestation), 0) as total_ht,
                COALESCE(SUM(p.montant_ht_prestation), 0) * d.taux_tva / 100 as montant_tva,
                COALESCE(SUM(p.montant_ht_prestation), 0) * (1 + d.taux_tva / 100) as total_ttc
            FROM devis d
            LEFT JOIN prestation p ON d.id_devis = p.id_devis
            WHERE d.id_devis = $1
            GROUP BY d.id_devis, d.taux_tva
        `;
        const result = await query(sql, [id]);
        if (result.rows[0]) {
            return {
                taux_tva: parseFloat(result.rows[0].taux_tva),
                total_ht: parseFloat(result.rows[0].total_ht),
                montant_tva: parseFloat(result.rows[0].montant_tva),
                total_ttc: parseFloat(result.rows[0].total_ttc)
            };
        }
        return { taux_tva: 20, total_ht: 0, montant_tva: 0, total_ttc: 0 };
    }

    /**
     * Trouve les devis acceptés récents
     */
    static async findAcceptesRecents(limit = 10) {
        const sql = `
            SELECT d.*, e.nom_evenement, c.nom_entreprise_client
            FROM devis d
            INNER JOIN evenement e ON d.id_evenement = e.id_evenement
            INNER JOIN client c ON e.id_client = c.id_client
            WHERE d.statut_devis = 'accepte'
            ORDER BY d.date_reponse_client DESC
            LIMIT $1
        `;
        const result = await query(sql, [limit]);
        return result.rows;
    }
}

module.exports = Devis;
