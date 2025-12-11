/**
 * Service de génération PDF
 * @module services/PdfService
 */

const PDFDocument = require('pdfkit');

class PdfService {
    /**
     * Génère un PDF de devis
     */
    static async generateDevis(devis) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // En-tête
                this.addHeader(doc);

                // Infos client
                this.addClientInfo(doc, devis);

                // Détails devis
                this.addDevisDetails(doc, devis);

                // Tableau prestations
                this.addPrestationsTable(doc, devis);

                // Totaux
                this.addTotals(doc, devis);

                // Conditions
                this.addConditions(doc);

                // Pied de page
                this.addFooter(doc);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * En-tête
     */
    static addHeader(doc) {
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text("Innov'Events", 50, 50);

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#7f8c8d')
           .text('Organisation d\'événements professionnels', 50, 80);

        doc.moveTo(50, 110)
           .lineTo(550, 110)
           .strokeColor('#3498db')
           .lineWidth(2)
           .stroke();
    }

    /**
     * Informations client
     */
    static addClientInfo(doc, devis) {
        const startY = 130;

        // Innov'Events
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text("INNOV'EVENTS", 50, startY);

        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#333')
           .text('123 Avenue de l\'Événement', 50, startY + 15)
           .text('75001 Paris', 50, startY + 27)
           .text('contact@innovevents.com', 50, startY + 39);

        // Client
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text('CLIENT', 350, startY);

        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#333')
           .text(devis.nom_entreprise_client, 350, startY + 15)
           .text(`${devis.prenom_contact} ${devis.nom_contact}`, 350, startY + 27)
           .text(devis.adresse_client || '', 350, startY + 39)
           .text(`${devis.code_postal_client || ''} ${devis.ville_client || ''}`, 350, startY + 51)
           .text(devis.email_client, 350, startY + 63);
    }

    /**
     * Détails du devis
     */
    static addDevisDetails(doc, devis) {
        const startY = 230;

        // Titre DEVIS
        doc.rect(50, startY, 500, 40)
           .fillColor('#3498db')
           .fill();

        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#fff')
           .text('DEVIS', 60, startY + 12);

        doc.fontSize(10)
           .text(devis.numero_devis, 200, startY + 14);

        // Infos
        const infoY = startY + 55;
        const dateCreation = new Date(devis.date_creation_devis).toLocaleDateString('fr-FR');
        const dateDebut = new Date(devis.date_debut).toLocaleDateString('fr-FR');

        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#333');

        doc.text(`Date du devis: ${dateCreation}`, 50, infoY);
        doc.text(`Validité: 30 jours`, 50, infoY + 14);
        doc.text(`Événement: ${devis.nom_evenement}`, 250, infoY);
        doc.text(`Date: ${dateDebut}`, 250, infoY + 14);
        doc.text(`Lieu: ${devis.lieu_evenement}`, 250, infoY + 28);
    }

    /**
     * Tableau des prestations
     */
    static addPrestationsTable(doc, devis) {
        const startY = 340;
        const prestations = devis.prestations || [];

        // En-tête tableau
        doc.rect(50, startY, 500, 25)
           .fillColor('#ecf0f1')
           .fill();

        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text('DÉSIGNATION', 60, startY + 8)
           .text('MONTANT HT', 450, startY + 8, { width: 90, align: 'right' });

        // Lignes
        let currentY = startY + 25;
        doc.font('Helvetica').fillColor('#333');

        prestations.forEach((prestation, index) => {
            if (index % 2 === 0) {
                doc.rect(50, currentY, 500, 22).fillColor('#f9f9f9').fill();
            }

            doc.fillColor('#333')
               .text(prestation.libelle_prestation, 60, currentY + 6, { width: 350 })
               .text(`${parseFloat(prestation.montant_ht_prestation).toFixed(2)} €`, 450, currentY + 6, { width: 90, align: 'right' });

            currentY += 22;
        });

        doc.moveTo(50, currentY).lineTo(550, currentY).strokeColor('#bdc3c7').lineWidth(1).stroke();

        return currentY;
    }

    /**
     * Totaux
     */
    static addTotals(doc, devis) {
        const startY = 340 + ((devis.prestations?.length || 0) * 22) + 45;

        doc.rect(350, startY, 200, 80).fillColor('#f8f9fa').fill();

        doc.fontSize(9).font('Helvetica').fillColor('#333');

        doc.text('Total HT:', 360, startY + 10)
           .text(`${devis.total_ht.toFixed(2)} €`, 460, startY + 10, { width: 80, align: 'right' });

        doc.text(`TVA (${devis.taux_tva}%):`, 360, startY + 28)
           .text(`${devis.montant_tva.toFixed(2)} €`, 460, startY + 28, { width: 80, align: 'right' });

        doc.moveTo(360, startY + 48).lineTo(540, startY + 48).strokeColor('#3498db').lineWidth(1).stroke();

        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text('Total TTC:', 360, startY + 56)
           .text(`${devis.total_ttc.toFixed(2)} €`, 460, startY + 56, { width: 80, align: 'right' });
    }

    /**
     * Conditions
     */
    static addConditions(doc) {
        const y = doc.y + 50;

        if (y < 650) {
            doc.fontSize(8)
               .font('Helvetica-Bold')
               .fillColor('#7f8c8d')
               .text('CONDITIONS DE RÈGLEMENT', 50, y);

            doc.fontSize(7)
               .font('Helvetica')
               .text('• Acompte de 30% à la signature', 50, y + 12)
               .text('• Solde 15 jours avant l\'événement', 50, y + 22)
               .text('• Règlement par virement ou chèque', 50, y + 32);
        }
    }

    /**
     * Pied de page
     */
    static addFooter(doc) {
        const pageHeight = doc.page.height;

        doc.fontSize(7)
           .font('Helvetica')
           .fillColor('#95a5a6')
           .text(
               "Innov'Events - SARL au capital de 10 000€ - SIRET: 123 456 789 00012",
               50,
               pageHeight - 40,
               { width: 500, align: 'center' }
           );
    }
}

module.exports = PdfService;
