/**
 * Service d'envoi d'emails avec Resend
 * @module services/EmailService
 */

const { Resend } = require('resend');

class EmailService {
    static resend = null;

    // Couleurs de la charte graphique
    static colors = {
        bleuRoyal: '#1E3A8A',
        or: '#D4AF37',
        grisArdoise: '#334155',
        bleuCiel: '#E0F2FE',
        blancCasse: '#FAFAF9',
        blanc: '#FFFFFF',
        gris: '#6B7280',
        rouge: '#DC2626'
    };

    /**
     * Initialise Resend
     */
    static init() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    /**
     * Envoie un email (NON-BLOQUANT en cas d'erreur)
     */
 static async send(options) {
    if (!this.resend) {
        this.init();
    }

    try {
        const result = await this.resend.emails.send({
            from: process.env.RESEND_FROM || "Innov'Events <onboarding@resend.dev>",
            to: [options.to],
            subject: options.subject,
            text: options.text,
            html: options.html,
            attachments: options.attachments || []
        });
        
        // ✅ Vérifier si Resend a retourné une erreur
        if (result.error) {
            console.error('❌ Erreur Resend:', result.error.message, '| To:', options.to);
            return null;
        }
        
        console.log('📧 Email envoyé via Resend:', result.data?.id, '| To:', options.to);
        return result;
    } catch (error) {
        console.error('❌ Erreur envoi email Resend:', error.message, '| To:', options.to);
        return null;
    }
}
    /**
     * Template de base pour tous les emails
     */
    static getBaseTemplate(content, options = {}) {
        const { showButton = false, buttonText = '', buttonUrl = '', preheader = '' } = options;
        
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Innov'Events</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${this.colors.blancCasse};">
    <div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${this.colors.blancCasse};">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
                    <tr>
                        <td style="background: linear-gradient(135deg, ${this.colors.bleuRoyal} 0%, #2563EB 100%); padding: 30px 40px; border-radius: 16px 16px 0 0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <div style="display: flex; align-items: center;">
                                            <span style="color: ${this.colors.or}; font-size: 24px; margin-right: 8px;">✦</span>
                                            <span style="font-size: 24px; font-weight: bold; color: ${this.colors.blanc};">
                                                Innov'<span style="color: ${this.colors.or};">Events</span>
                                            </span>
                                        </div>
                                        <p style="color: ${this.colors.bleuCiel}; margin: 8px 0 0 0; font-size: 14px;">
                                            Créateurs d'événements exceptionnels
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: ${this.colors.blanc}; padding: 40px; border-left: 1px solid #E5E7EB; border-right: 1px solid #E5E7EB;">
                            ${content}
                            ${showButton ? `
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="${buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, ${this.colors.or} 0%, #C9A227 100%); color: ${this.colors.bleuRoyal}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(212, 175, 55, 0.3);">
                                            ${buttonText}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            ` : ''}
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: ${this.colors.or}; height: 4px;"></td>
                    </tr>
                    <tr>
                        <td style="background-color: ${this.colors.grisArdoise}; padding: 30px 40px; border-radius: 0 0 16px 16px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <p style="color: ${this.colors.blanc}; font-weight: bold; margin: 0 0 8px 0; font-size: 16px;">
                                            <span style="color: ${this.colors.or};">✦</span> Innov'Events
                                        </p>
                                        <p style="color: #9CA3AF; margin: 0 0 16px 0; font-size: 13px;">
                                            Votre partenaire événementiel de confiance
                                        </p>
                                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                                            <tr>
                                                <td style="padding: 0 12px;">
                                                    <a href="mailto:contact@innovevents.fr" style="color: ${this.colors.bleuCiel}; text-decoration: none; font-size: 13px;">
                                                        📧 contact@innovevents.fr
                                                    </a>
                                                </td>
                                                <td style="padding: 0 12px;">
                                                    <a href="tel:+33123456789" style="color: ${this.colors.bleuCiel}; text-decoration: none; font-size: 13px;">
                                                        📞 01 23 45 67 89
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="color: #6B7280; margin: 20px 0 0 0; font-size: 11px;">
                                            © ${new Date().getFullYear()} Innov'Events - Tous droits réservés
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
    }

    static getInfoBox(content, type = 'info') {
        const colors = {
            info: { bg: this.colors.bleuCiel, border: this.colors.bleuRoyal, icon: 'ℹ️' },
            warning: { bg: '#FEF3C7', border: this.colors.or, icon: '⚠️' },
            success: { bg: '#D1FAE5', border: '#059669', icon: '✅' },
            error: { bg: '#FEE2E2', border: this.colors.rouge, icon: '❌' }
        };
        const c = colors[type] || colors.info;
        return `
            <div style="background-color: ${c.bg}; border-left: 4px solid ${c.border}; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
                <p style="margin: 0; color: ${this.colors.grisArdoise}; font-size: 14px;">${c.icon} ${content}</p>
            </div>
        `;
    }

    static getStyledTable(rows) {
        let html = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; border-collapse: collapse;">`;
        rows.forEach((row, index) => {
            const bgColor = index % 2 === 0 ? this.colors.blancCasse : this.colors.blanc;
            html += `
                <tr style="background-color: ${bgColor};">
                    <td style="padding: 12px 16px; border: 1px solid #E5E7EB; font-weight: bold; color: ${this.colors.grisArdoise}; width: 40%;">${row.label}</td>
                    <td style="padding: 12px 16px; border: 1px solid #E5E7EB; color: ${this.colors.gris};">${row.value}</td>
                </tr>
            `;
        });
        html += '</table>';
        return html;
    }

    static getCodeBox(code) {
        return `
            <div style="background: linear-gradient(135deg, ${this.colors.bleuRoyal} 0%, #2563EB 100%); padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
                <p style="color: ${this.colors.bleuCiel}; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Votre code</p>
                <p style="color: ${this.colors.blanc}; margin: 0; font-family: 'Courier New', monospace; font-size: 28px; font-weight: bold; letter-spacing: 3px;">${code}</p>
            </div>
        `;
    }

    static async sendWelcome(user) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">Bienvenue chez Innov'Events ! 🎉</h1>
            <p style="color: ${this.colors.grisArdoise}; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${user.prenom} ${user.nom}</strong>,
            </p>
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                Nous sommes ravis de vous accueillir dans la famille Innov'Events ! Votre compte a été créé avec succès.
            </p>
            ${this.getInfoBox('Connectez-vous avec votre email et le mot de passe que vous avez choisi lors de votre inscription.', 'info')}
            <p style="color: ${this.colors.grisArdoise}; font-size: 15px; margin: 24px 0 0 0;">
                Cordialement,<br><strong style="color: ${this.colors.bleuRoyal};">L'équipe Innov'Events</strong>
            </p>
        `;
        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Accéder à mon espace',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/connexion`,
            preheader: "Bienvenue chez Innov'Events !"
        });
        await this.send({
            to: user.email,
            subject: "🎉 Bienvenue chez Innov'Events !",
            text: `Bienvenue ${user.prenom} ${user.nom}, votre compte a été créé avec succès.`,
            html
        });
    }

    static async sendNewPassword(user, tempPassword) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">Réinitialisation de mot de passe 🔐</h1>
            <p style="color: ${this.colors.grisArdoise}; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${user.prenom}</strong>,
            </p>
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Votre mot de passe a été réinitialisé. Voici votre nouveau mot de passe temporaire :
            </p>
            ${this.getCodeBox(tempPassword)}
            ${this.getInfoBox('<strong>Important :</strong> Pour des raisons de sécurité, vous devrez changer ce mot de passe lors de votre prochaine connexion.', 'warning')}
            <p style="color: ${this.colors.grisArdoise}; font-size: 15px; margin: 24px 0 0 0;">
                Cordialement,<br><strong style="color: ${this.colors.bleuRoyal};">L'équipe Innov'Events</strong>
            </p>
        `;
        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Se connecter',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/connexion`,
            preheader: "Votre nouveau mot de passe Innov'Events"
        });
        await this.send({
            to: user.email,
            subject: "🔐 Innov'Events - Nouveau mot de passe",
            text: `Votre nouveau mot de passe temporaire est : ${tempPassword}`,
            html
        });
    }

    static async sendAccountCreated(user, tempPassword) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">Votre espace client est prêt ! 🎊</h1>
            <p style="color: ${this.colors.grisArdoise}; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${user.prenom}</strong>,
            </p>
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Suite à votre demande de devis, nous avons le plaisir de vous informer que votre espace client personnalisé a été créé !
            </p>
            <div style="background-color: ${this.colors.blancCasse}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 16px 0; font-size: 16px;">📧 Vos identifiants de connexion</h3>
                ${this.getStyledTable([
                    { label: 'Email', value: user.email },
                    { label: 'Mot de passe', value: `<code style="background: ${this.colors.bleuCiel}; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code>` }
                ])}
            </div>
            ${this.getInfoBox('<strong>Important :</strong> Pour votre sécurité, vous devrez changer ce mot de passe lors de votre première connexion.', 'warning')}
            <p style="color: ${this.colors.grisArdoise}; font-size: 15px; margin: 24px 0 0 0;">
                Cordialement,<br><strong style="color: ${this.colors.bleuRoyal};">L'équipe Innov'Events</strong>
            </p>
        `;
        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Accéder à mon espace client',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/connexion`,
            preheader: "Votre espace client Innov'Events est maintenant disponible !"
        });
        await this.send({
            to: user.email,
            subject: "🎊 Innov'Events - Votre espace client est prêt !",
            text: `Vos identifiants : Email: ${user.email}, Mot de passe: ${tempPassword}`,
            html
        });
    }

    static async sendNewProspect(prospect) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">Nouvelle demande de devis 📋</h1>
            <div style="background-color: ${this.colors.blancCasse}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 16px 0; font-size: 16px;">🏢 Informations du prospect</h3>
                ${this.getStyledTable([
                    { label: 'Entreprise', value: prospect.nom_entreprise },
                    { label: 'Contact', value: `${prospect.prenom_prospect} ${prospect.nom_prospect}` },
                    { label: 'Email', value: prospect.email_prospect },
                    { label: 'Téléphone', value: prospect.telephone_prospect }
                ])}
            </div>
            <div style="background-color: ${this.colors.blancCasse}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 16px 0; font-size: 16px;">📅 Détails de l'événement</h3>
                ${this.getStyledTable([
                    { label: 'Type', value: prospect.type_evenement_souhaite },
                    { label: 'Date souhaitée', value: prospect.date_souhaitee ? new Date(prospect.date_souhaitee).toLocaleDateString('fr-FR') : 'Non précisée' },
                    { label: 'Lieu', value: prospect.lieu_souhaite || 'Non précisé' },
                    { label: 'Participants', value: prospect.nb_participants || 'Non précisé' }
                ])}
            </div>
        `;
        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: "Voir dans l'admin",
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/prospects`,
            preheader: `Nouvelle demande de ${prospect.nom_entreprise}`
        });
        await this.send({
            to: process.env.ADMIN_EMAIL || process.env.SMTP_FROM,
            subject: `📋 Nouvelle demande - ${prospect.nom_entreprise}`,
            text: `Nouvelle demande de ${prospect.prenom_prospect} ${prospect.nom_prospect}`,
            html
        });
    }

    static async sendProspectConfirmation(prospect) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">Merci pour votre confiance ! 🙏</h1>
            <p style="color: ${this.colors.grisArdoise}; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${prospect.prenom_prospect}</strong>,
            </p>
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Nous avons bien reçu votre demande de devis et nous vous en remercions ! Notre équipe l'examine avec attention et vous recontactera dans les <strong>24 à 48 heures</strong>.
            </p>
            <div style="background-color: ${this.colors.blancCasse}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 16px 0; font-size: 16px;">📋 Récapitulatif de votre demande</h3>
                ${this.getStyledTable([
                    { label: "Type d'événement", value: prospect.type_evenement_souhaite },
                    { label: 'Date souhaitée', value: prospect.date_souhaitee ? new Date(prospect.date_souhaitee).toLocaleDateString('fr-FR') : 'À définir' },
                    { label: 'Lieu', value: prospect.lieu_souhaite || 'À définir' },
                    { label: 'Nombre de participants', value: prospect.nb_participants || 'À définir' }
                ])}
            </div>
            ${this.getInfoBox("En attendant, n'hésitez pas à consulter nos réalisations sur notre site pour vous inspirer !", 'info')}
            <p style="color: ${this.colors.grisArdoise}; font-size: 15px; margin: 24px 0 0 0;">
                À très bientôt !<br><strong style="color: ${this.colors.bleuRoyal};">L'équipe Innov'Events</strong>
            </p>
        `;
        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Découvrir nos événements',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/evenements`,
            preheader: 'Nous avons bien reçu votre demande de devis !'
        });
        await this.send({
            to: prospect.email_prospect,
            subject: "✅ Innov'Events - Demande reçue !",
            text: 'Merci pour votre demande. Notre équipe vous recontactera rapidement.',
            html
        });
    }

    static async sendProspectRejection(prospect, messageEchec) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">Suite à votre demande</h1>
            <p style="color: ${this.colors.grisArdoise}; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${prospect.prenom_prospect}</strong>,
            </p>
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Nous avons attentivement étudié votre demande et nous sommes au regret de ne pas pouvoir y donner suite pour le moment.
            </p>
            ${messageEchec ? this.getInfoBox(messageEchec, 'error') : ''}
            <p style="color: ${this.colors.grisArdoise}; font-size: 15px; margin: 24px 0 0 0;">
                Cordialement,<br><strong style="color: ${this.colors.bleuRoyal};">L'équipe Innov'Events</strong>
            </p>
        `;
        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Nous contacter',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/contact`,
            preheader: 'Suite à votre demande de devis'
        });
        await this.send({
            to: prospect.email_prospect,
            subject: "Innov'Events - Suite à votre demande",
            text: `Nous ne pouvons pas donner suite à votre demande. ${messageEchec || ''}`,
            html
        });
    }

    static async sendDevis(devis, pdfBuffer) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">Votre devis est prêt ! 📄</h1>
            <p style="color: ${this.colors.grisArdoise}; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${devis.prenom_contact}</strong>,
            </p>
            <div style="background: linear-gradient(135deg, ${this.colors.bleuRoyal} 0%, #2563EB 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="color: ${this.colors.bleuCiel}; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase;">Référence devis</p>
                <p style="color: ${this.colors.blanc}; margin: 0 0 16px 0; font-family: monospace; font-size: 24px; font-weight: bold;">${devis.numero_devis}</p>
                <p style="color: ${this.colors.or}; margin: 0; font-size: 18px; font-weight: bold;">${devis.nom_evenement}</p>
            </div>
            ${this.getInfoBox('Le devis est disponible en pièce jointe de cet email au format PDF.', 'info')}
            <p style="color: ${this.colors.grisArdoise}; font-size: 15px; margin: 24px 0 0 0;">
                Cordialement,<br><strong style="color: ${this.colors.bleuRoyal};">L'équipe Innov'Events</strong>
            </p>
        `;
        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Accéder à mon espace',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/devis`,
            preheader: `Votre devis ${devis.numero_devis} est disponible !`
        });
        await this.send({
            to: devis.email_client,
            subject: `📄 Devis ${devis.numero_devis} - ${devis.nom_evenement}`,
            text: `Votre devis ${devis.numero_devis} est en pièce jointe.`,
            html,
            attachments: [{
                filename: `${devis.numero_devis}.pdf`,
                content: pdfBuffer.toString('base64')
            }]
        });
    }

    static async sendDevisResponse(devis, action, motif = null) {
        const configs = {
            accepte: { emoji: '✅', label: 'accepté', color: '#059669', bgColor: '#D1FAE5' },
            refuse: { emoji: '❌', label: 'refusé', color: this.colors.rouge, bgColor: '#FEE2E2' },
            modification: { emoji: '✏️', label: 'modification demandée', color: this.colors.or, bgColor: '#FEF3C7' }
        };
        const config = configs[action] || configs.modification;
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">Réponse à un devis ${config.emoji}</h1>
            <div style="background-color: ${config.bgColor}; border-radius: 12px; padding: 20px; margin: 0 0 24px 0; text-align: center;">
                <p style="margin: 0; color: ${config.color}; font-size: 20px; font-weight: bold;">Devis ${config.label.toUpperCase()}</p>
            </div>
            <div style="background-color: ${this.colors.blancCasse}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                ${this.getStyledTable([
                    { label: 'Référence', value: `<strong>${devis.numero_devis}</strong>` },
                    { label: 'Client', value: devis.nom_entreprise_client },
                    { label: 'Événement', value: devis.nom_evenement },
                    { label: 'Montant', value: `${devis.montant_total?.toLocaleString('fr-FR')} €` }
                ])}
            </div>
            ${motif ? `<div style="background-color: ${this.colors.bleuCiel}; border-radius: 12px; padding: 24px; margin: 24px 0;"><h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 12px 0; font-size: 16px;">💬 Commentaire du client</h3><p style="margin: 0; white-space: pre-wrap;">${motif}</p></div>` : ''}
        `;
        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Voir le devis',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/devis`,
            preheader: `Le devis ${devis.numero_devis} a été ${config.label}`
        });
        await this.send({
            to: process.env.ADMIN_EMAIL || process.env.SMTP_FROM,
            subject: `${config.emoji} Devis ${devis.numero_devis} - ${config.label}`,
            text: `Le devis ${devis.numero_devis} a été ${config.label}. ${motif || ''}`,
            html
        });
    }

    static async sendContact(contact) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">Nouveau message de contact 📬</h1>
            <div style="background-color: ${this.colors.blancCasse}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 16px 0; font-size: 16px;">👤 Informations de l'expéditeur</h3>
                ${this.getStyledTable([
                    { label: 'Nom', value: contact.nom_utilisateur_contact || 'Non renseigné' },
                    { label: 'Email', value: contact.email_contact },
                    { label: 'Sujet', value: contact.titre_contact }
                ])}
            </div>
            <div style="background-color: ${this.colors.bleuCiel}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 12px 0; font-size: 16px;">💬 Message</h3>
                <p style="margin: 0; white-space: pre-wrap;">${contact.description_contact}</p>
            </div>
        `;
        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Répondre par email',
            buttonUrl: `mailto:${contact.email_contact}?subject=Re: ${contact.titre_contact}`,
            preheader: `Message de ${contact.nom_utilisateur_contact || 'un visiteur'}`
        });
        await this.send({
            to: process.env.ADMIN_EMAIL || process.env.SMTP_FROM,
            subject: `📬 Contact - ${contact.titre_contact}`,
            text: `Message de ${contact.nom_utilisateur_contact || 'Anonyme'}: ${contact.description_contact}`,
            html
        });
    }

    static async sendEmployeeAccountCreated(user, tempPassword) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">Bienvenue dans l'équipe ! 👋</h1>
            <p style="color: ${this.colors.grisArdoise}; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${user.prenom}</strong>,
            </p>
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Votre compte employé Innov'Events a été créé. Vous pouvez maintenant accéder à votre espace de travail.
            </p>
            <div style="background-color: ${this.colors.blancCasse}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 16px 0; font-size: 16px;">🔑 Vos identifiants de connexion</h3>
                ${this.getStyledTable([
                    { label: 'Email', value: user.email },
                    { label: "Nom d'utilisateur", value: `@${user.nom_utilisateur}` },
                    { label: 'Mot de passe', value: `<code style="background: ${this.colors.bleuCiel}; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code>` }
                ])}
            </div>
            ${this.getInfoBox('<strong>Important :</strong> Pour des raisons de sécurité, vous devrez changer ce mot de passe lors de votre première connexion.', 'warning')}
            <p style="color: ${this.colors.grisArdoise}; font-size: 15px; margin: 24px 0 0 0;">
                Bienvenue dans l'aventure !<br><strong style="color: ${this.colors.bleuRoyal};">L'équipe Innov'Events</strong>
            </p>
        `;
        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Accéder à mon espace',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/connexion`,
            preheader: "Bienvenue dans l'équipe Innov'Events !"
        });
        await this.send({
            to: user.email,
            subject: "👋 Bienvenue dans l'équipe Innov'Events !",
            text: `Bienvenue ${user.prenom} ! Vos identifiants : Email: ${user.email}, Mot de passe: ${tempPassword}`,
            html
        });
    }
}

module.exports = EmailService;
