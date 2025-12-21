/**
 * Controller Auth
 * @module controllers/AuthController
 */

const AuthService = require('../services/AuthService');
const EmailService = require('../services/EmailService');
const { LogService, ACTION_TYPES } = require('../services/LogService');
const { asyncHandler } = require('../middlewares/errorHandler');

const login = asyncHandler(async (req, res) => {
    const { email, mot_de_passe } = req.body;
    const clientIp = req.clientIp;
    
    try {
        const result = await AuthService.login(email, mot_de_passe);
        
        // Log connexion réussie
        await LogService.log(
            ACTION_TYPES.CONNEXION_REUSSIE,
            result.user.id_utilisateur,
            { 
                email: result.user.email,
                role: result.user.role
            },
            clientIp
        );
        
        res.json({ success: true, data: result });
    } catch (error) {
        // Log connexion échouée
        await LogService.log(
            ACTION_TYPES.CONNEXION_ECHOUEE,
            null,
            { email },
            clientIp
        );
        throw error;
    }
});

const register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    
    try {
        await EmailService.sendWelcome(result.user);
    } catch (e) { 
        console.error('Erreur email:', e); 
    }
    
    res.status(201).json({ success: true, data: result });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    
    if (result.user) {
        // Log demande mot de passe oublié
        await LogService.log(
            ACTION_TYPES.MOT_DE_PASSE_OUBLIE,
            result.user.id_utilisateur,
            { email },
            req.clientIp
        );
        
        try {
            await EmailService.sendNewPassword(result.user, result.tempPassword);
        } catch (e) { 
            console.error('Erreur email:', e); 
        }
    }
    
    res.json({ success: true, message: 'Si l\'email existe, un nouveau mot de passe a été envoyé' });
});

const changePassword = asyncHandler(async (req, res) => {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
    await AuthService.changePassword(req.user.id_utilisateur, ancien_mot_de_passe, nouveau_mot_de_passe);
    
    // Log changement mot de passe
    await LogService.log(
        ACTION_TYPES.CHANGEMENT_MOT_DE_PASSE,
        req.user.id_utilisateur,
        { email: req.user.email },
        req.clientIp
    );
    
    res.json({ success: true, message: 'Mot de passe modifié' });
});

const logout = asyncHandler(async (req, res) => {
    // Log déconnexion
    await LogService.log(
        ACTION_TYPES.DECONNEXION,
        req.user.id_utilisateur,
        { 
            email: req.user.email,
            role: req.user.role
        },
        req.clientIp
    );
    
    res.json({ success: true, message: 'Déconnexion réussie' });
});

const getMe = asyncHandler(async (req, res) => {
    res.json({ success: true, data: req.user });
});

module.exports = { login, register, forgotPassword, changePassword, logout, getMe };
