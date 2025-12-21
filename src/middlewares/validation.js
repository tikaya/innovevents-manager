/**
 * Middleware de validation
 * @module middlewares/validation
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Gère les erreurs de validation
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Erreurs de validation',
            errors: errors.array()
        });
    }
    next();
};

/**
 * Validation mot de passe (8 car, maj, min, chiffre, spécial)
 */
const passwordRules = body('mot_de_passe')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
    .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial');

/**
 * Validation inscription
 */
const validateRegister = [
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('nom').trim().notEmpty().withMessage('Le nom est requis'),
    body('prenom').trim().notEmpty().withMessage('Le prénom est requis'),
    body('nom_utilisateur').trim().isLength({ min: 3 }).withMessage('Nom d\'utilisateur: 3 caractères minimum'),
    passwordRules,
    handleValidation
];

/**
 * Validation connexion
 */
const validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('mot_de_passe').notEmpty().withMessage('Mot de passe requis'),
    handleValidation
];

/**
 * Validation changement mot de passe
 */
const validatePasswordChange = [
    body('ancien_mot_de_passe').notEmpty().withMessage('Ancien mot de passe requis'),
    body('nouveau_mot_de_passe')
        .isLength({ min: 8 }).withMessage('8 caractères minimum')
        .matches(/[A-Z]/).withMessage('Une majuscule requise')
        .matches(/[a-z]/).withMessage('Une minuscule requise')
        .matches(/[0-9]/).withMessage('Un chiffre requis')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Un caractère spécial requis'),
    handleValidation
];

/**
 * Validation prospect (demande de devis)
 */
const validateProspect = [
    body('nom_entreprise').trim().notEmpty().withMessage('Nom entreprise requis'),
    body('nom_prospect').trim().notEmpty().withMessage('Nom requis'),
    body('prenom_prospect').trim().notEmpty().withMessage('Prénom requis'),
    body('email_prospect').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('telephone_prospect').trim().notEmpty().withMessage('Téléphone requis'),
    body('lieu_souhaite').trim().notEmpty().withMessage('Lieu requis'),
    body('type_evenement_souhaite').trim().notEmpty().withMessage('Type d\'événement requis'),
    body('date_souhaitee').isDate().withMessage('Date invalide'),
    body('nb_participants').isInt({ min: 1 }).withMessage('Nombre de participants invalide'),
    body('description_besoin').trim().notEmpty().withMessage('Description requise'),
    handleValidation
];

/**
 * Validation client
 */
const validateClient = [
    body('nom_entreprise_client').trim().notEmpty().withMessage('Nom entreprise requis'),
    body('nom_contact').trim().notEmpty().withMessage('Nom contact requis'),
    body('prenom_contact').trim().notEmpty().withMessage('Prénom contact requis'),
    body('email_client').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('telephone_client').trim().notEmpty().withMessage('Téléphone requis'),
    handleValidation
];

/**
 * Validation événement
 */
const validateEvenement = [
    body('nom_evenement').trim().notEmpty().withMessage('Nom événement requis'),
    body('date_debut').isDate().withMessage('Date début invalide'),
    body('date_fin').isDate().withMessage('Date fin invalide'),
    body('lieu_evenement').trim().notEmpty().withMessage('Lieu requis'),
    body('id_client').isInt().withMessage('Client requis'),
    handleValidation
];

/**
 * Validation prestation
 */
const validatePrestation = [
    body('libelle_prestation').trim().notEmpty().withMessage('Libellé requis'),
    body('montant_ht_prestation').isFloat({ min: 0 }).withMessage('Montant HT invalide'),
    handleValidation
];

/**
 * Validation note
 */
const validateNote = [
    body('contenu_note').trim().notEmpty().withMessage('Contenu requis'),
    handleValidation
];

/**
 * Validation tâche
 */
const validateTache = [
    body('titre_tache').trim().notEmpty().withMessage('Titre requis'),
    body('id_utilisateur').isInt().withMessage('Utilisateur assigné requis'),
    body('id_evenement').optional({ nullable: true }).isInt().withMessage('Événement invalide'),
    handleValidation
];

/**
 * Validation avis
 */
const validateAvis = [
    body('note_avis').isInt({ min: 1, max: 5 }).withMessage('Note entre 1 et 5 requise'),
    body('id_evenement').isInt().withMessage('Événement requis'),
    handleValidation
];

/**
 * Validation contact
 */
const validateContact = [
    body('email_contact').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('titre_contact').trim().notEmpty().withMessage('Titre requis'),
    body('description_contact').trim().notEmpty().withMessage('Description requise'),
    handleValidation
];

/**
 * Validation ID en paramètre
 */
const validateId = [
    param('id').isInt().withMessage('ID invalide'),
    handleValidation
];

module.exports = {
    handleValidation,
    validateRegister,
    validateLogin,
    validatePasswordChange,
    validateProspect,
    validateClient,
    validateEvenement,
    validatePrestation,
    validateNote,
    validateTache,
    validateAvis,
    validateContact,
    validateId
};
