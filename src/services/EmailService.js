/**
 * Service d'envoi d'emails
 * @module services/EmailService
 */

const nodemailer = require('nodemailer');

class EmailService {
    static transporter = null;

    /**
     * Initialise le transporteur email
     */
    static init() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    /**
     * Envoie un email
     */
    static async send(options) {
        if (!this.transporter) {
            this.init();
        }

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'Innov\'Events'}" <${process.env.SMTP_FROM}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('📧 Email envoyé:', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ Erreur envoi email:', error.message);
            throw error;
        }
    }

    /**
     * Email de confirmation d'inscription
     */
    static async sendWelcome(user) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Bienvenue chez Innov'Events !</h1>
                <p>Bonjour ${user.prenom} ${user.nom},</p>
                <p>Votre compte a été créé avec succès.</p>
                <p>Vous pouvez dès maintenant vous connecter avec votre email et mot de passe.</p>
                <p style="margin-top: 30px;">À très bientôt !</p>
                <p><strong>L'équipe Innov'Events</strong></p>
            </div>
        `;

        await this.send({
            to: user.email,
            subject: 'Bienvenue chez Innov\'Events',
            text: `Bienvenue ${user.prenom}, votre compte a été créé avec succès.`,
            html
        });
    }

    /**
     * Email nouveau mot de passe
     */
    static async sendNewPassword(user, tempPassword) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Réinitialisation de mot de passe</h1>
                <p>Bonjour ${user.prenom},</p>
                <p>Votre nouveau mot de passe temporaire est :</p>
                <p style="background-color: #f1f1f1; padding: 15px; font-family: monospace; font-size: 18px; text-align: center;">
                    <strong>${tempPassword}</strong>
                </p>
                <p style="color: #e74c3c;"><strong>Important :</strong> Vous devrez changer ce mot de passe lors de votre prochaine connexion.</p>
                <p><strong>L'équipe Innov'Events</strong></p>
            </div>
        `;

        await this.send({
            to: user.email,
            subject: 'Innov\'Events - Nouveau mot de passe',
            text: `Votre nouveau mot de passe temporaire est : ${tempPassword}`,
            html
        });
    }

    /**
     * Email création compte client (depuis conversion prospect)
     */
    static async sendAccountCreated(user, tempPassword) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Votre compte Innov'Events</h1>
                <p>Bonjour ${user.prenom},</p>
                <p>Suite à votre demande de devis, votre espace client a été créé.</p>
                <p>Vos identifiants :</p>
                <ul>
                    <li><strong>Email :</strong> ${user.email}</li>
                    <li><strong>Mot de passe :</strong> ${tempPassword}</li>
                </ul>
                <p style="color: #e74c3c;"><strong>Important :</strong> Changez ce mot de passe à la première connexion.</p>
                <p><strong>L'équipe Innov'Events</strong></p>
            </div>
        `;

        await this.send({
            to: user.email,
            subject: 'Innov\'Events - Votre espace client',
            text: `Vos identifiants : Email: ${user.email}, Mot de passe: ${tempPassword}`,
            html
        });
    }

    /**
     * Notification nouvelle demande de devis (à Innov'Events)
     */
    static async sendNewProspect(prospect) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Nouvelle demande de devis</h1>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Entreprise</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${prospect.nom_entreprise}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Contact</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${prospect.prenom_prospect} ${prospect.nom_prospect}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${prospect.email_prospect}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Téléphone</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${prospect.telephone_prospect}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Type</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${prospect.type_evenement_souhaite}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${prospect.date_souhaitee}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Participants</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${prospect.nb_participants}</td></tr>
                </table>
                <h3>Description :</h3>
                <p style="background-color: #f9f9f9; padding: 15px;">${prospect.description_besoin}</p>
            </div>
        `;

        await this.send({
            to: process.env.SMTP_FROM,
            subject: `Nouvelle demande - ${prospect.nom_entreprise}`,
            text: `Nouvelle demande de ${prospect.prenom_prospect} ${prospect.nom_prospect}`,
            html
        });
    }

    /**
     * Confirmation demande de devis (au prospect)
     */
    static async sendProspectConfirmation(prospect) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Merci pour votre demande !</h1>
                <p>Bonjour ${prospect.prenom_prospect},</p>
                <p>Merci pour votre demande. Chloé vous recontactera dans les plus brefs délais pour discuter de votre projet.</p>
                <p><strong>Récapitulatif :</strong></p>
                <ul>
                    <li>Type : ${prospect.type_evenement_souhaite}</li>
                    <li>Date : ${prospect.date_souhaitee}</li>
                    <li>Lieu : ${prospect.lieu_souhaite}</li>
                    <li>Participants : ${prospect.nb_participants}</li>
                </ul>
                <p>À très bientôt !</p>
                <p><strong>L'équipe Innov'Events</strong></p>
            </div>
        `;

        await this.send({
            to: prospect.email_prospect,
            subject: 'Innov\'Events - Demande reçue',
            text: 'Merci pour votre demande. Chloé vous recontactera rapidement.',
            html
        });
    }

    /**
     * Email rejet prospect
     */
    static async sendProspectRejection(prospect, messageEchec) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Suite à votre demande</h1>
                <p>Bonjour ${prospect.prenom_prospect},</p>
                <p>Nous avons étudié votre demande et sommes au regret de ne pas pouvoir y donner suite.</p>
                <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #e74c3c;">${messageEchec}</p>
                <p>Nous restons à votre disposition pour tout autre projet.</p>
                <p><strong>L'équipe Innov'Events</strong></p>
            </div>
        `;

        await this.send({
            to: prospect.email_prospect,
            subject: 'Innov\'Events - Suite à votre demande',
            text: `Nous ne pouvons pas donner suite. ${messageEchec}`,
            html
        });
    }

    /**
     * Email envoi devis
     */
    static async sendDevis(devis, pdfBuffer) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Votre devis Innov'Events</h1>
                <p>Bonjour ${devis.prenom_contact},</p>
                <p>Veuillez trouver ci-joint le devis pour "<strong>${devis.nom_evenement}</strong>".</p>
                <p><strong>Référence :</strong> ${devis.numero_devis}</p>
                <p>Connectez-vous à votre espace client pour accepter, refuser ou demander une modification.</p>
                <p><strong>L'équipe Innov'Events</strong></p>
            </div>
        `;

        if (!this.transporter) this.init();

        return this.transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
            to: devis.email_client,
            subject: `Devis ${devis.numero_devis} - ${devis.nom_evenement}`,
            text: `Votre devis ${devis.numero_devis} est en pièce jointe.`,
            html,
            attachments: [{
                filename: `${devis.numero_devis}.pdf`,
                content: pdfBuffer
            }]
        });
    }

    /**
     * Notification réponse devis (à Innov'Events)
     */
    static async sendDevisResponse(devis, action, motif = null) {
        const labels = { accepte: 'accepté', refuse: 'refusé', modification: 'modification demandée' };
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Devis ${labels[action] || action}</h1>
                <p>Le devis <strong>${devis.numero_devis}</strong> a été <strong>${labels[action]}</strong>.</p>
                <p>Client : ${devis.nom_entreprise_client}</p>
                <p>Événement : ${devis.nom_evenement}</p>
                ${motif ? `<p><strong>Motif :</strong> ${motif}</p>` : ''}
            </div>
        `;

        await this.send({
            to: process.env.SMTP_FROM,
            subject: `Devis ${devis.numero_devis} - ${labels[action]}`,
            text: `Devis ${devis.numero_devis} ${labels[action]}`,
            html
        });
    }

    /**
     * Email formulaire contact
     */
    static async sendContact(contact) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Nouveau message de contact</h1>
                <p><strong>De :</strong> ${contact.nom_utilisateur_contact || 'Anonyme'} (${contact.email_contact})</p>
                <p><strong>Sujet :</strong> ${contact.titre_contact}</p>
                <h3>Message :</h3>
                <p style="background-color: #f9f9f9; padding: 15px;">${contact.description_contact}</p>
            </div>
        `;

        await this.send({
            to: process.env.SMTP_FROM,
            subject: `Contact - ${contact.titre_contact}`,
            text: `Message de ${contact.nom_utilisateur_contact || 'Anonyme'}: ${contact.description_contact}`,
            html
        });
    }
}

module.exports = EmailService;
