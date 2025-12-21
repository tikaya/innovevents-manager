/**
 * Controller Avis
 * @module controllers/AvisController
 */

const AvisService = require('../services/AvisService');
const { LogService, ACTION_TYPES } = require('../services/LogService');
const { asyncHandler } = require('../middlewares/errorHandler');

const getAll = asyncHandler(async (req, res) => {
    const avis = await AvisService.getAll(req.query);
    res.json({ success: true, data: avis });
});

const getById = asyncHandler(async (req, res) => {
    const avis = await AvisService.getById(req.params.id);
    res.json({ success: true, data: avis });
});

const getValides = asyncHandler(async (req, res) => {
    const avis = await AvisService.getValides();
    res.json({ success: true, data: avis });
});

const getEnAttente = asyncHandler(async (req, res) => {
    const avis = await AvisService.getEnAttente();
    res.json({ success: true, data: avis });
});

const create = asyncHandler(async (req, res) => {
    const avis = await AvisService.create(req.body, req.user.id_utilisateur);
    res.status(201).json({ success: true, data: avis });
});

const validate = asyncHandler(async (req, res) => {
    const avis = await AvisService.validate(req.params.id);
    
    // Log validation avis
    await LogService.log(
        ACTION_TYPES.VALIDATION_AVIS,
        req.user.id_utilisateur,
        { 
            id_avis: parseInt(req.params.id),
            note: avis.note_avis,
            id_evenement: avis.id_evenement
        },
        req.clientIp
    );
    
    res.json({ success: true, data: avis });
});

const reject = asyncHandler(async (req, res) => {
    const avis = await AvisService.reject(req.params.id);
    
    // Log refus avis
    await LogService.log(
        ACTION_TYPES.REFUS_AVIS,
        req.user.id_utilisateur,
        { 
            id_avis: parseInt(req.params.id),
            note: avis.note_avis,
            id_evenement: avis.id_evenement
        },
        req.clientIp
    );
    
    res.json({ success: true, data: avis });
});

const remove = asyncHandler(async (req, res) => {
    await AvisService.delete(req.params.id);
    res.json({ success: true, message: 'Avis supprimé' });
});

const getAverage = asyncHandler(async (req, res) => {
    const moyenne = await AvisService.getAverageNote();
    res.json({ success: true, data: { moyenne } });
});

module.exports = { getAll, getById, getValides, getEnAttente, create, validate, reject, remove, getAverage };
