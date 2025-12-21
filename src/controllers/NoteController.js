/**
 * Controller Note
 * @module controllers/NoteController
 */

const NoteService = require('../services/NoteService');
const { LogService, ACTION_TYPES } = require('../services/LogService');
const { asyncHandler } = require('../middlewares/errorHandler');

const getAll = asyncHandler(async (req, res) => {
    const notes = await NoteService.getAll(req.query);
    res.json({ success: true, data: notes });
});

const getById = asyncHandler(async (req, res) => {
    const note = await NoteService.getById(req.params.id);
    res.json({ success: true, data: note });
});

const getByEvenement = asyncHandler(async (req, res) => {
    const notes = await NoteService.getByEvenement(req.params.idEvenement);
    res.json({ success: true, data: notes });
});

const getGlobales = asyncHandler(async (req, res) => {
    const notes = await NoteService.getGlobales();
    res.json({ success: true, data: notes });
});

const getRecentes = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const notes = await NoteService.getRecentes(limit);
    res.json({ success: true, data: notes });
});

const create = asyncHandler(async (req, res) => {
    const note = await NoteService.create(req.body, req.user.id_utilisateur);
    
    // Log création note
    await LogService.log(
        ACTION_TYPES.CREATION_NOTE,
        req.user.id_utilisateur,
        { 
            id_note: note.id_note,
            id_evenement: note.id_evenement,
            contenu_apercu: note.contenu_note?.substring(0, 50)
        },
        req.clientIp
    );
    
    res.status(201).json({ success: true, data: note });
});

const update = asyncHandler(async (req, res) => {
    const note = await NoteService.update(req.params.id, req.body, req.user.id_utilisateur);
    
    // Log modification note
    await LogService.log(
        ACTION_TYPES.MODIFICATION_NOTE,
        req.user.id_utilisateur,
        { 
            id_note: parseInt(req.params.id),
            id_evenement: note.id_evenement
        },
        req.clientIp
    );
    
    res.json({ success: true, data: note });
});

const remove = asyncHandler(async (req, res) => {
    const note = await NoteService.getById(req.params.id);
    
    await NoteService.delete(req.params.id, req.user.id_utilisateur, req.user.role);
    
    // Log suppression note
    await LogService.log(
        ACTION_TYPES.SUPPRESSION_NOTE,
        req.user.id_utilisateur,
        { 
            id_note: parseInt(req.params.id),
            id_evenement: note.id_evenement
        },
        req.clientIp
    );
    
    res.json({ success: true, message: 'Note supprimée' });
});

module.exports = { getAll, getById, getByEvenement, getGlobales, getRecentes, create, update, remove };
