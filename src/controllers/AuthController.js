/**
 * Controller Auth
 * @module controllers/AuthController
 */

const AuthService = require('../services/AuthService');
const EmailService = require('../services/EmailService');
const { asyncHandler } = require('../middlewares/errorHandler');

const login = asyncHandler(async (req, res) => {
    const { email, mot_de_passe } = req.body;
    const result = await AuthService.login(email, mot_de_passe);
    res.json({ success: true, data: result });
});

const register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    try {
        await EmailService.sendWelcome(result.user);
    } catch (e) { console.error(e); }
    res.status(201).json({ success: true, data: result });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    if (result.user) {
        try {
            await EmailService.sendNewPassword(result.user, result.tempPassword);
        } catch (e) { console.error(e); }
    }
    res.json({ success: true, message: 'Si l\'email existe, un nouveau mot de passe a été envoyé' });
});

const changePassword = asyncHandler(async (req, res) => {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
    await AuthService.changePassword(req.user.id_utilisateur, ancien_mot_de_passe, nouveau_mot_de_passe);
    res.json({ success: true, message: 'Mot de passe modifié' });
});

const getMe = asyncHandler(async (req, res) => {
    res.json({ success: true, data: req.user });
});

module.exports = { login, register, forgotPassword, changePassword, getMe };
