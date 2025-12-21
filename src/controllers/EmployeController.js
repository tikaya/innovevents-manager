/**
 * Controller Employés
 * @module controllers/EmployeController
 */

const EmployeService = require('../services/EmployeService');
const EmailService = require('../services/EmailService');
const { LogService, ACTION_TYPES } = require('../services/LogService');
const { asyncHandler } = require('../middlewares/errorHandler');

const getAll = asyncHandler(async (req, res) => {
    const employes = await EmployeService.getAll();
    res.json({ success: true, data: employes });
});

const getById = asyncHandler(async (req, res) => {
    const employe = await EmployeService.getById(req.params.id);
    res.json({ success: true, data: employe });
});

const create = asyncHandler(async (req, res) => {
    const { employe, tempPassword } = await EmployeService.create(req.body);

    // Log création employé
    await LogService.log(
        ACTION_TYPES.CREATION_EMPLOYE,
        req.user.id_utilisateur,
        { 
            id_employe: employe.id_utilisateur,
            nom: `${employe.prenom} ${employe.nom}`,
            email: employe.email
        },
        req.clientIp
    );

    // Envoi email avec mot de passe (template spécifique employé)
    try {
        await EmailService.sendEmployeeAccountCreated(
            { 
                email: employe.email, 
                prenom: employe.prenom,
                nom: employe.nom,
                nom_utilisateur: employe.nom_utilisateur
            }, 
            tempPassword
        );
    } catch (e) {
        console.error('Erreur envoi email:', e);
    }

    res.status(201).json({ 
        success: true, 
        data: employe,
        message: 'Employé créé. Un email avec le mot de passe temporaire a été envoyé.'
    });
});

const update = asyncHandler(async (req, res) => {
    const employe = await EmployeService.update(req.params.id, req.body);
    
    // Log modification employé
    await LogService.log(
        ACTION_TYPES.MODIFICATION_EMPLOYE,
        req.user.id_utilisateur,
        { 
            id_employe: parseInt(req.params.id),
            nom: `${employe.prenom} ${employe.nom}`
        },
        req.clientIp
    );
    
    res.json({ success: true, data: employe });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { employe, tempPassword } = await EmployeService.resetPassword(req.params.id);

    // Log reset password
    await LogService.log(
        ACTION_TYPES.RESET_PASSWORD_EMPLOYE,
        req.user.id_utilisateur,
        { 
            id_employe: parseInt(req.params.id),
            email: employe.email
        },
        req.clientIp
    );

    // Envoi email avec nouveau mot de passe
    try {
        await EmailService.sendNewPassword(
            { email: employe.email, prenom: employe.prenom }, 
            tempPassword
        );
    } catch (e) {
        console.error('Erreur envoi email:', e);
    }

    res.json({ success: true, message: 'Nouveau mot de passe envoyé par email' });
});

const remove = asyncHandler(async (req, res) => {
    const employe = await EmployeService.getById(req.params.id);
    
    await EmployeService.remove(req.params.id);
    
    // Log suppression employé
    await LogService.log(
        ACTION_TYPES.SUPPRESSION_EMPLOYE,
        req.user.id_utilisateur,
        { 
            id_employe: parseInt(req.params.id),
            nom: `${employe.prenom} ${employe.nom}`,
            email: employe.email
        },
        req.clientIp
    );
    
    res.json({ success: true, message: 'Employé supprimé' });
});

module.exports = { getAll, getById, create, update, resetPassword, remove };
