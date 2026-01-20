/**
 * Service Devis
 * @module services/DevisService
 */

const Devis = require('../models/Devis');
const Prestation = require('../models/Prestation');
const Client = require('../models/Client');
const Evenement = require('../models/Evenement'); // ✅ AJOUT
const EmailService = require('./EmailService');
const PdfService = require('./PdfService');
const { getClient } = require('../config/database');

class DevisService {
    static async getAll(filters = {}) {
        return Devis.findAll(filters);
    }

    static async getById(id) {
        const devis = await Devis.findById(id);
        if (!devis) throw new Error('Devis non trouvé');
        
        const prestations = await Prestation.findByDevis(id);
        const totaux = await Devis.calculateTotals(id);
        
        return { ...devis, prestations, ...totaux };
    }

    static async getByUserId(idUtilisateur) {
        const client = await Client.findByUserId(idUtilisateur);
        if (!client) throw new Error('Client non trouvé');
        return Devis.findAll({ id_client: client.id_client });
    }

    static async create(idEvenement, prestations = [], tauxTva = 20) {
        const dbClient = await getClient();
        try {
            await dbClient.query('BEGIN');
            
            // ✅ Vérifier que l'événement existe
            const evenement = await Evenement.findById(idEvenement);
            if (!evenement) {
                throw new Error('Événement non trouvé');
            }

            // ✅ Optionnel : Vérifier qu'il n'y a pas déjà un devis actif
            const devisExistants = await Devis.findByEvenement(idEvenement);
            const devisActif = devisExistants.find(d => 
                !['refuse', 'annule'].includes(d.statut_devis)
            );
            if (devisActif) {
                throw new Error(`Un devis actif existe déjà pour cet événement (${devisActif.numero_devis})`);
            }

            const numeroDevis = await Devis.generateNumero();
            const devis = await Devis.create({
                numero_devis: numeroDevis,
                taux_tva: tauxTva,
                statut_devis: 'brouillon',
                id_evenement: idEvenement
            });

            if (prestations.length > 0) {
                await Prestation.createMany(prestations, devis.id_devis);
            }

            await dbClient.query('COMMIT');
            return this.getById(devis.id_devis);
        } catch (error) {
            await dbClient.query('ROLLBACK');
            throw error;
        } finally {
            dbClient.release();
        }
    }

    static async update(id, data) {
        const devis = await Devis.findById(id);
        if (!devis) throw new Error('Devis non trouvé');
        if (devis.statut_devis === 'accepte') throw new Error('Devis accepté non modifiable');

        const dbClient = await getClient();
        try {
            await dbClient.query('BEGIN');

            if (data.taux_tva !== undefined) {
                await Devis.update(id, { taux_tva: data.taux_tva });
            }

            if (data.prestations) {
                await Prestation.deleteByDevis(id);
                if (data.prestations.length > 0) {
                    await Prestation.createMany(data.prestations, id);
                }
            }

            // ✅ Si statut "modification", repasser en "brouillon" après modif
            if (devis.statut_devis === 'modification') {
                await Devis.update(id, { statut_devis: 'brouillon', motif_modification: null });
            }

            await dbClient.query('COMMIT');
            return this.getById(id);
        } catch (error) {
            await dbClient.query('ROLLBACK');
            throw error;
        } finally {
            dbClient.release();
        }
    }

    static async generatePdf(id) {
        const devis = await this.getById(id);
        const pdfBuffer = await PdfService.generateDevis(devis);
        await Devis.updatePdfPath(id, `/devis/${devis.numero_devis}.pdf`);
        return pdfBuffer;
    }

    static async sendToClient(id) {
        const devis = await this.getById(id);
        const pdfBuffer = await this.generatePdf(id);
        await EmailService.sendDevis(devis, pdfBuffer);
        await Devis.updateStatut(id, 'etude_client');
        return this.getById(id);
    }

    static async accept(id, idUtilisateur) {
        const devis = await this.getById(id);
        const client = await Client.findByUserId(idUtilisateur);
        if (!client || client.id_client !== devis.id_client) {
            throw new Error('Non autorisé');
        }

        // ✅ Vérifier que le devis peut être accepté
        if (!['etude_client', 'envoye'].includes(devis.statut_devis)) {
            throw new Error('Ce devis ne peut pas être accepté');
        }

        await Devis.updateStatut(id, 'accepte');
        
        // ✅ AJOUT : Mettre à jour le statut de l'événement
        await Evenement.updateStatut(devis.id_evenement, 'confirme');
        
        try {
            await EmailService.sendDevisResponse(devis, 'accepte');
        } catch (e) { console.error('Erreur email acceptation:', e.message); }
        
        return this.getById(id);
    }

    static async refuse(id, idUtilisateur) {
        const devis = await this.getById(id);
        const client = await Client.findByUserId(idUtilisateur);
        if (!client || client.id_client !== devis.id_client) {
            throw new Error('Non autorisé');
        }

        // ✅ Vérifier que le devis peut être refusé
        if (!['etude_client', 'envoye'].includes(devis.statut_devis)) {
            throw new Error('Ce devis ne peut pas être refusé');
        }

        await Devis.updateStatut(id, 'refuse');
        
        try {
            await EmailService.sendDevisResponse(devis, 'refuse');
        } catch (e) { console.error('Erreur email refus:', e.message); }
        
        return this.getById(id);
    }

    static async requestModification(id, idUtilisateur, motif) {
        if (!motif || !motif.trim()) throw new Error('Motif obligatoire');
        
        const devis = await this.getById(id);
        const client = await Client.findByUserId(idUtilisateur);
        if (!client || client.id_client !== devis.id_client) {
            throw new Error('Non autorisé');
        }

        // ✅ Vérifier que le devis peut être modifié
        if (!['etude_client', 'envoye'].includes(devis.statut_devis)) {
            throw new Error('Ce devis ne peut pas être modifié');
        }

        await Devis.updateStatut(id, 'modification', motif.trim());
        
        try {
            await EmailService.sendDevisResponse(devis, 'modification', motif.trim());
        } catch (e) { console.error('Erreur email modification:', e.message); }
        
        return this.getById(id);
    }

    static async delete(id) {
        const devis = await Devis.findById(id);
        if (!devis) throw new Error('Devis non trouvé');
        if (devis.statut_devis === 'accepte') throw new Error('Devis accepté non supprimable');
        return Devis.delete(id);
    }

    static async getAcceptesRecents(limit = 10) {
        return Devis.findAcceptesRecents(limit);
    }
}

module.exports = DevisService;