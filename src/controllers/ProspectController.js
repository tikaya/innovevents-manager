/**
 * Controller Prospect
 * @module controllers/ProspectController
 */

const ProspectService = require('../services/ProspectService');
const { LogService, ACTION_TYPES } = require('../services/LogService');
const { asyncHandler } = require('../middlewares/errorHandler');

const getAll = asyncHandler(async (req, res) => {
    const prospects = await ProspectService.getAll(req.query);
    res.json({ success: true, data: prospects });
});

const getById = asyncHandler(async (req, res) => {
    const prospect = await ProspectService.getById(req.params.id);
    res.json({ success: true, data: prospect });
});

const create = asyncHandler(async (req, res) => {
    const prospect = await ProspectService.create(req.body);
    
    // Log création prospect (pas d'utilisateur connecté car formulaire public)
    await LogService.log(
        ACTION_TYPES.CREATION_PROSPECT,
        null,
        { 
            id_prospect: prospect.id_prospect,
            nom_entreprise: prospect.nom_entreprise,
            email: prospect.email_prospect,
            type_evenement: prospect.type_evenement_souhaite
        },
        req.clientIp
    );
    
    res.status(201).json({ success: true, data: prospect, message: 'Merci pour votre demande. Chloé vous recontactera dans les plus brefs délais.' });
});

const update = asyncHandler(async (req, res) => {
    const prospect = await ProspectService.update(req.params.id, req.body);
    res.json({ success: true, data: prospect });
});

const reject = asyncHandler(async (req, res) => {
    const { message_echec } = req.body;
    const prospect = await ProspectService.reject(req.params.id, message_echec);
    
    // Log rejet prospect
    await LogService.log(
        ACTION_TYPES.REJET_PROSPECT,
        req.user.id_utilisateur,
        { 
            id_prospect: parseInt(req.params.id),
            nom_entreprise: prospect.nom_entreprise,
            motif: message_echec
        },
        req.clientIp
    );
    
    res.json({ success: true, data: prospect });
});

const convert = asyncHandler(async (req, res) => {
    const { client, evenement } = req.body;
    const prospect = await ProspectService.getById(req.params.id);
    const result = await ProspectService.convert(req.params.id, client, evenement);
    
    // Log conversion prospect
    await LogService.log(
        ACTION_TYPES.CONVERSION_PROSPECT,
        req.user.id_utilisateur,
        { 
            id_prospect: parseInt(req.params.id),
            nom_entreprise: prospect.nom_entreprise,
            id_client: result.client?.id_client,
            id_evenement: result.evenement?.id_evenement
        },
        req.clientIp
    );
    
    res.json({ success: true, data: result });
});

const remove = asyncHandler(async (req, res) => {
    // Récupérer le prospect AVANT suppression pour le log
    const prospect = await ProspectService.getById(req.params.id);
    
    await ProspectService.delete(req.params.id);
    
    // Log suppression prospect
    await LogService.log(
        ACTION_TYPES.SUPPRESSION_PROSPECT,
        req.user.id_utilisateur,
        { 
            id_prospect: parseInt(req.params.id),
            nom_entreprise: prospect.nom_entreprise,
            email: prospect.email_prospect
        },
        req.clientIp
    );
    
    res.json({ success: true, message: 'Prospect supprimé' });
});

const search = asyncHandler(async (req, res) => {
    const prospects = await ProspectService.search(req.query.q);
    res.json({ success: true, data: prospects });
});

module.exports = { getAll, getById, create, update, reject, convert, remove, search };