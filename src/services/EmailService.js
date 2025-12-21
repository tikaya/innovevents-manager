/**
 * Service d'envoi d'emails
 * @module services/EmailService
 */

const nodemailer = require('nodemailer');

class EmailService {
    static transporter = null;

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
    <!-- Preheader (texte aperçu dans la boîte mail) -->
    <div style="display: none; max-height: 0; overflow: hidden;">
        ${preheader}
    </div>
    
    <!-- Container principal -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${this.colors.blancCasse};">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Email wrapper -->
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ${this.colors.bleuRoyal} 0%, #2563EB 100%); padding: 30px 40px; border-radius: 16px 16px 0 0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <!-- Logo -->
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
                    
                    <!-- Corps du message -->
                    <tr>
                        <td style="background-color: ${this.colors.blanc}; padding: 40px; border-left: 1px solid #E5E7EB; border-right: 1px solid #E5E7EB;">
                            ${content}
                            
                            ${showButton ? `
                            <!-- Bouton CTA -->
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
                    
                    <!-- Séparateur doré -->
                    <tr>
                        <td style="background-color: ${this.colors.or}; height: 4px;"></td>
                    </tr>
                    
                    <!-- Footer -->
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
                                        
                                        <!-- Contact -->
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
                                        
                                        <!-- Réseaux sociaux -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 20px auto 0;">
                                            <tr>
                                                <td style="padding: 0 8px;">
                                                    <a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: ${this.colors.bleuRoyal}; border-radius: 50%; text-align: center; line-height: 32px; text-decoration: none;">
                                                        <span style="color: ${this.colors.blanc}; font-size: 14px;">f</span>
                                                    </a>
                                                </td>
                                                <td style="padding: 0 8px;">
                                                    <a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: ${this.colors.bleuRoyal}; border-radius: 50%; text-align: center; line-height: 32px; text-decoration: none;">
                                                        <span style="color: ${this.colors.blanc}; font-size: 14px;">in</span>
                                                    </a>
                                                </td>
                                                <td style="padding: 0 8px;">
                                                    <a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: ${this.colors.bleuRoyal}; border-radius: 50%; text-align: center; line-height: 32px; text-decoration: none;">
                                                        <span style="color: ${this.colors.blanc}; font-size: 14px;">ig</span>
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

    /**
     * Génère une boîte d'information stylée
     */
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
                <p style="margin: 0; color: ${this.colors.grisArdoise}; font-size: 14px;">
                    ${c.icon} ${content}
                </p>
            </div>
        `;
    }

    /**
     * Génère un tableau stylé
     */
    static getStyledTable(rows) {
        let html = `
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; border-collapse: collapse;">
        `;
        
        rows.forEach((row, index) => {
            const bgColor = index % 2 === 0 ? this.colors.blancCasse : this.colors.blanc;
            html += `
                <tr style="background-color: ${bgColor};">
                    <td style="padding: 12px 16px; border: 1px solid #E5E7EB; font-weight: bold; color: ${this.colors.grisArdoise}; width: 40%;">
                        ${row.label}
                    </td>
                    <td style="padding: 12px 16px; border: 1px solid #E5E7EB; color: ${this.colors.gris};">
                        ${row.value}
                    </td>
                </tr>
            `;
        });
        
        html += '</table>';
        return html;
    }

    /**
     * Génère une boîte de code/mot de passe stylée
     */
    static getCodeBox(code) {
        return `
            <div style="background: linear-gradient(135deg, ${this.colors.bleuRoyal} 0%, #2563EB 100%); padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
                <p style="color: ${this.colors.bleuCiel}; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                    Votre code
                </p>
                <p style="color: ${this.colors.blanc}; margin: 0; font-family: 'Courier New', monospace; font-size: 28px; font-weight: bold; letter-spacing: 3px;">
                    ${code}
                </p>
            </div>
        `;
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

        if (options.attachments) {
            mailOptions.attachments = options.attachments;
        }

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
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">
                Bienvenue chez Innov'Events ! 🎉
            </h1>
            
            <p style="color: ${this.colors.grisArdoise}; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${user.prenom} ${user.nom}</strong>,
            </p>
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                Nous sommes ravis de vous accueillir dans la famille Innov'Events ! Votre compte a été créé avec succès.
            </p>
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Vous pouvez dès maintenant vous connecter à votre espace personnel pour découvrir nos services et suivre vos événements.
            </p>
            
            ${this.getInfoBox('Connectez-vous avec votre email et le mot de passe que vous avez choisi lors de votre inscription.', 'info')}
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 24px 0 0 0;">
                À très bientôt pour créer ensemble des événements exceptionnels !
            </p>
            
            <p style="color: ${this.colors.grisArdoise}; font-size: 15px; margin: 24px 0 0 0;">
                Cordialement,<br>
                <strong style="color: ${this.colors.bleuRoyal};">L'équipe Innov'Events</strong>
            </p>
        `;

        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Accéder à mon espace',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/connexion`,
            preheader: 'Bienvenue chez Innov\'Events ! Votre compte a été créé avec succès.'
        });

        await this.send({
            to: user.email,
            subject: '🎉 Bienvenue chez Innov\'Events !',
            text: `Bienvenue ${user.prenom} ${user.nom}, votre compte a été créé avec succès.`,
            html
        });
    }

    /**
     * Email nouveau mot de passe
     */
    static async sendNewPassword(user, tempPassword) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">
                Réinitialisation de mot de passe 🔐
            </h1>
            
            <p style="color: ${this.colors.grisArdoise}; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${user.prenom}</strong>,
            </p>
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Votre mot de passe a été réinitialisé. Voici votre nouveau mot de passe temporaire :
            </p>
            
            ${this.getCodeBox(tempPassword)}
            
            ${this.getInfoBox('<strong>Important :</strong> Pour des raisons de sécurité, vous devrez changer ce mot de passe lors de votre prochaine connexion.', 'warning')}
            
            <p style="color: ${this.colors.gris}; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                Si vous n'êtes pas à l'origine de cette demande, veuillez nous contacter immédiatement.
            </p>
            
            <p style="color: ${this.colors.grisArdoise}; font-size: 15px; margin: 24px 0 0 0;">
                Cordialement,<br>
                <strong style="color: ${this.colors.bleuRoyal};">L'équipe Innov'Events</strong>
            </p>
        `;

        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Se connecter',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/connexion`,
            preheader: 'Votre nouveau mot de passe temporaire Innov\'Events'
        });

        await this.send({
            to: user.email,
            subject: '🔐 Innov\'Events - Nouveau mot de passe',
            text: `Votre nouveau mot de passe temporaire est : ${tempPassword}`,
            html
        });
    }

    /**
     * Email création compte client (depuis conversion prospect)
     */
    static async sendAccountCreated(user, tempPassword) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">
                Votre espace client est prêt ! 🎊
            </h1>
            
            <p style="color: ${this.colors.grisArdoise}; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${user.prenom}</strong>,
            </p>
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Suite à votre demande de devis, nous avons le plaisir de vous informer que votre espace client personnalisé a été créé !
            </p>
            
            <div style="background-color: ${this.colors.blancCasse}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 16px 0; font-size: 16px;">
                    📧 Vos identifiants de connexion
                </h3>
                ${this.getStyledTable([
                    { label: 'Email', value: user.email },
                    { label: 'Mot de passe', value: `<code style="background: ${this.colors.bleuCiel}; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code>` }
                ])}
            </div>
            
            ${this.getInfoBox('<strong>Important :</strong> Pour votre sécurité, vous devrez changer ce mot de passe lors de votre première connexion.', 'warning')}
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 24px 0 0 0;">
                Depuis votre espace client, vous pourrez :
            </p>
            <ul style="color: ${this.colors.gris}; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                <li>Consulter et répondre à vos devis</li>
                <li>Suivre l'avancement de vos événements</li>
                <li>Déposer des avis sur nos prestations</li>
                <li>Gérer vos informations personnelles</li>
            </ul>
            
            <p style="color: ${this.colors.grisArdoise}; font-size: 15px; margin: 24px 0 0 0;">
                Cordialement,<br>
                <strong style="color: ${this.colors.bleuRoyal};">L'équipe Innov'Events</strong>
            </p>
        `;

        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Accéder à mon espace client',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/connexion`,
            preheader: 'Votre espace client Innov\'Events est maintenant disponible !'
        });

        await this.send({
            to: user.email,
            subject: '🎊 Innov\'Events - Votre espace client est prêt !',
            text: `Vos identifiants : Email: ${user.email}, Mot de passe: ${tempPassword}`,
            html
        });
    }

    /**
     * Notification nouvelle demande de devis (à Innov'Events)
     */
    static async sendNewProspect(prospect) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">
                Nouvelle demande de devis 📋
            </h1>
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Une nouvelle demande de devis vient d'être soumise sur le site.
            </p>
            
            <div style="background-color: ${this.colors.blancCasse}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 16px 0; font-size: 16px;">
                    🏢 Informations du prospect
                </h3>
                ${this.getStyledTable([
                    { label: 'Entreprise', value: prospect.nom_entreprise },
                    { label: 'Contact', value: `${prospect.prenom_prospect} ${prospect.nom_prospect}` },
                    { label: 'Email', value: `<a href="mailto:${prospect.email_prospect}" style="color: ${this.colors.bleuRoyal};">${prospect.email_prospect}</a>` },
                    { label: 'Téléphone', value: `<a href="tel:${prospect.telephone_prospect}" style="color: ${this.colors.bleuRoyal};">${prospect.telephone_prospect}</a>` }
                ])}
            </div>
            
            <div style="background-color: ${this.colors.blancCasse}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 16px 0; font-size: 16px;">
                    📅 Détails de l'événement
                </h3>
                ${this.getStyledTable([
                    { label: 'Type', value: `<span style="background: ${this.colors.or}; color: ${this.colors.bleuRoyal}; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 13px;">${prospect.type_evenement_souhaite}</span>` },
                    { label: 'Date souhaitée', value: prospect.date_souhaitee ? new Date(prospect.date_souhaitee).toLocaleDateString('fr-FR') : 'Non précisée' },
                    { label: 'Lieu', value: prospect.lieu_souhaite || 'Non précisé' },
                    { label: 'Participants', value: `${prospect.nb_participants || 'Non précisé'} personnes` },
                    { label: 'Budget', value: prospect.budget_estime || 'Non précisé' }
                ])}
            </div>
            
            ${prospect.description_besoin ? `
            <div style="background-color: ${this.colors.bleuCiel}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 12px 0; font-size: 16px;">
                    💬 Description du besoin
                </h3>
                <p style="color: ${this.colors.grisArdoise}; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">
                    ${prospect.description_besoin}
                </p>
            </div>
            ` : ''}
        `;

        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Voir dans l\'admin',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/prospects`,
            preheader: `Nouvelle demande de ${prospect.nom_entreprise} - ${prospect.type_evenement_souhaite}`
        });

        await this.send({
            to: process.env.SMTP_FROM,
            subject: `📋 Nouvelle demande - ${prospect.nom_entreprise}`,
            text: `Nouvelle demande de ${prospect.prenom_prospect} ${prospect.nom_prospect} - ${prospect.nom_entreprise}`,
            html
        });
    }

    /**
     * Confirmation demande de devis (au prospect)
     */
    static async sendProspectConfirmation(prospect) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">
                Merci pour votre confiance ! 🙏
            </h1>
            
            <p style="color: ${this.colors.grisArdoise}; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${prospect.prenom_prospect}</strong>,
            </p>
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Nous avons bien reçu votre demande de devis et nous vous en remercions ! Notre équipe l'examine avec attention et vous recontactera dans les <strong>24 à 48 heures</strong>.
            </p>
            
            <div style="background-color: ${this.colors.blancCasse}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 16px 0; font-size: 16px;">
                    📋 Récapitulatif de votre demande
                </h3>
                ${this.getStyledTable([
                    { label: 'Type d\'événement', value: prospect.type_evenement_souhaite },
                    { label: 'Date souhaitée', value: prospect.date_souhaitee ? new Date(prospect.date_souhaitee).toLocaleDateString('fr-FR') : 'À définir' },
                    { label: 'Lieu', value: prospect.lieu_souhaite || 'À définir' },
                    { label: 'Nombre de participants', value: prospect.nb_participants || 'À définir' }
                ])}
            </div>
            
            ${this.getInfoBox('En attendant, n\'hésitez pas à consulter nos réalisations sur notre site pour vous inspirer !', 'info')}
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 24px 0 0 0;">
                À très bientôt !
            </p>
            
            <p style="color: ${this.colors.grisArdoise}; font-size: 15px; margin: 24px 0 0 0;">
                Cordialement,<br>
                <strong style="color: ${this.colors.bleuRoyal};">L'équipe Innov'Events</strong>
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
            subject: '✅ Innov\'Events - Demande reçue !',
            text: 'Merci pour votre demande. Notre équipe vous recontactera rapidement.',
            html
        });
    }

    /**
     * Email rejet prospect
     */
    static async sendProspectRejection(prospect, messageEchec) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">
                Suite à votre demande
            </h1>
            
            <p style="color: ${this.colors.grisArdoise}; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${prospect.prenom_prospect}</strong>,
            </p>
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Nous avons attentivement étudié votre demande et nous sommes au regret de ne pas pouvoir y donner suite pour le moment.
            </p>
            
            ${messageEchec ? `
            <div style="background-color: #FEF2F2; border-left: 4px solid ${this.colors.rouge}; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
                <p style="margin: 0; color: ${this.colors.grisArdoise}; font-size: 14px; line-height: 1.6;">
                    <strong>Motif :</strong><br>
                    ${messageEchec}
                </p>
            </div>
            ` : ''}
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 24px 0 0 0;">
                Nous restons néanmoins à votre entière disposition pour tout autre projet événementiel. N'hésitez pas à nous recontacter !
            </p>
            
            <p style="color: ${this.colors.grisArdoise}; font-size: 15px; margin: 24px 0 0 0;">
                Cordialement,<br>
                <strong style="color: ${this.colors.bleuRoyal};">L'équipe Innov'Events</strong>
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
            subject: 'Innov\'Events - Suite à votre demande',
            text: `Nous ne pouvons pas donner suite à votre demande. ${messageEchec || ''}`,
            html
        });
    }

    /**
     * Email envoi devis
     */
    static async sendDevis(devis, pdfBuffer) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">
                Votre devis est prêt ! 📄
            </h1>
            
            <p style="color: ${this.colors.grisArdoise}; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${devis.prenom_contact}</strong>,
            </p>
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Nous avons le plaisir de vous transmettre le devis pour votre événement. Vous trouverez ci-joint tous les détails de notre proposition.
            </p>
            
            <div style="background: linear-gradient(135deg, ${this.colors.bleuRoyal} 0%, #2563EB 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="color: ${this.colors.bleuCiel}; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                    Référence devis
                </p>
                <p style="color: ${this.colors.blanc}; margin: 0 0 16px 0; font-family: monospace; font-size: 24px; font-weight: bold;">
                    ${devis.numero_devis}
                </p>
                <p style="color: ${this.colors.or}; margin: 0; font-size: 18px; font-weight: bold;">
                    ${devis.nom_evenement}
                </p>
            </div>
            
            ${this.getInfoBox('Le devis est disponible en pièce jointe de cet email au format PDF.', 'info')}
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 24px 0;">
                Depuis votre espace client, vous pouvez :
            </p>
            <ul style="color: ${this.colors.gris}; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0 0 24px 0;">
                <li><strong style="color: #059669;">Accepter</strong> le devis</li>
                <li><strong style="color: ${this.colors.rouge};">Refuser</strong> le devis</li>
                <li><strong style="color: ${this.colors.or};">Demander des modifications</strong></li>
            </ul>
            
            <p style="color: ${this.colors.grisArdoise}; font-size: 15px; margin: 24px 0 0 0;">
                Cordialement,<br>
                <strong style="color: ${this.colors.bleuRoyal};">L'équipe Innov'Events</strong>
            </p>
        `;

        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Accéder à mon espace',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/devis`,
            preheader: `Votre devis ${devis.numero_devis} pour ${devis.nom_evenement} est disponible !`
        });

        if (!this.transporter) this.init();

        return this.transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
            to: devis.email_client,
            subject: `📄 Devis ${devis.numero_devis} - ${devis.nom_evenement}`,
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
        const configs = {
            accepte: { emoji: '✅', label: 'accepté', color: '#059669', bgColor: '#D1FAE5' },
            refuse: { emoji: '❌', label: 'refusé', color: this.colors.rouge, bgColor: '#FEE2E2' },
            modification: { emoji: '✏️', label: 'modification demandée', color: this.colors.or, bgColor: '#FEF3C7' }
        };
        const config = configs[action] || configs.modification;
        
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">
                Réponse à un devis ${config.emoji}
            </h1>
            
            <div style="background-color: ${config.bgColor}; border-radius: 12px; padding: 20px; margin: 0 0 24px 0; text-align: center;">
                <p style="margin: 0; color: ${config.color}; font-size: 20px; font-weight: bold;">
                    Devis ${config.label.toUpperCase()}
                </p>
            </div>
            
            <div style="background-color: ${this.colors.blancCasse}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                ${this.getStyledTable([
                    { label: 'Référence', value: `<strong>${devis.numero_devis}</strong>` },
                    { label: 'Client', value: devis.nom_entreprise_client },
                    { label: 'Événement', value: devis.nom_evenement },
                    { label: 'Montant', value: `${devis.montant_total?.toLocaleString('fr-FR')} €` }
                ])}
            </div>
            
            ${motif ? `
            <div style="background-color: ${this.colors.bleuCiel}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 12px 0; font-size: 16px;">
                    💬 Motif / Commentaire du client
                </h3>
                <p style="color: ${this.colors.grisArdoise}; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">
                    ${motif}
                </p>
            </div>
            ` : ''}
        `;

        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Voir le devis',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/devis`,
            preheader: `Le devis ${devis.numero_devis} a été ${config.label}`
        });

        await this.send({
            to: process.env.SMTP_FROM,
            subject: `${config.emoji} Devis ${devis.numero_devis} - ${config.label}`,
            text: `Le devis ${devis.numero_devis} a été ${config.label}. ${motif || ''}`,
            html
        });
    }

    /**
     * Email formulaire contact
     */
    static async sendContact(contact) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">
                Nouveau message de contact 📬
            </h1>
            
            <div style="background-color: ${this.colors.blancCasse}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 16px 0; font-size: 16px;">
                    👤 Informations de l'expéditeur
                </h3>
                ${this.getStyledTable([
                    { label: 'Nom', value: contact.nom_utilisateur_contact || 'Non renseigné' },
                    { label: 'Email', value: `<a href="mailto:${contact.email_contact}" style="color: ${this.colors.bleuRoyal};">${contact.email_contact}</a>` },
                    { label: 'Sujet', value: contact.titre_contact }
                ])}
            </div>
            
            <div style="background-color: ${this.colors.bleuCiel}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 12px 0; font-size: 16px;">
                    💬 Message
                </h3>
                <p style="color: ${this.colors.grisArdoise}; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">
                    ${contact.description_contact}
                </p>
            </div>
        `;

        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Répondre par email',
            buttonUrl: `mailto:${contact.email_contact}?subject=Re: ${contact.titre_contact}`,
            preheader: `Message de ${contact.nom_utilisateur_contact || 'un visiteur'} - ${contact.titre_contact}`
        });

        await this.send({
            to: process.env.SMTP_FROM,
            subject: `📬 Contact - ${contact.titre_contact}`,
            text: `Message de ${contact.nom_utilisateur_contact || 'Anonyme'}: ${contact.description_contact}`,
            html
        });
    }

    /**
     * Email compte employé créé
     */
    static async sendEmployeeAccountCreated(user, tempPassword) {
        const content = `
            <h1 style="color: ${this.colors.bleuRoyal}; margin: 0 0 24px 0; font-size: 28px;">
                Bienvenue dans l'équipe ! 👋
            </h1>
            
            <p style="color: ${this.colors.grisArdoise}; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${user.prenom}</strong>,
            </p>
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Votre compte employé Innov'Events a été créé. Vous pouvez maintenant accéder à votre espace de travail.
            </p>
            
            <div style="background-color: ${this.colors.blancCasse}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: ${this.colors.bleuRoyal}; margin: 0 0 16px 0; font-size: 16px;">
                    🔑 Vos identifiants de connexion
                </h3>
                ${this.getStyledTable([
                    { label: 'Email', value: user.email },
                    { label: 'Nom d\'utilisateur', value: `@${user.nom_utilisateur}` },
                    { label: 'Mot de passe', value: `<code style="background: ${this.colors.bleuCiel}; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code>` }
                ])}
            </div>
            
            ${this.getInfoBox('<strong>Important :</strong> Pour des raisons de sécurité, vous devrez changer ce mot de passe lors de votre première connexion.', 'warning')}
            
            <p style="color: ${this.colors.gris}; font-size: 15px; line-height: 1.6; margin: 24px 0;">
                Depuis votre espace employé, vous pourrez :
            </p>
            <ul style="color: ${this.colors.gris}; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                <li>Consulter les informations clients</li>
                <li>Suivre les événements en cours</li>
                <li>Gérer vos tâches assignées</li>
                <li>Ajouter des notes collaboratives</li>
                <li>Modérer les avis clients</li>
            </ul>
            
            <p style="color: ${this.colors.grisArdoise}; font-size: 15px; margin: 24px 0 0 0;">
                Bienvenue dans l'aventure !<br>
                <strong style="color: ${this.colors.bleuRoyal};">L'équipe Innov'Events</strong>
            </p>
        `;

        const html = this.getBaseTemplate(content, {
            showButton: true,
            buttonText: 'Accéder à mon espace',
            buttonUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/connexion`,
            preheader: 'Bienvenue dans l\'équipe Innov\'Events ! Vos identifiants de connexion'
        });

        await this.send({
            to: user.email,
            subject: '👋 Bienvenue dans l\'équipe Innov\'Events !',
            text: `Bienvenue ${user.prenom} ! Vos identifiants : Email: ${user.email}, Mot de passe: ${tempPassword}`,
            html
        });
    }
}

module.exports = EmailService;
