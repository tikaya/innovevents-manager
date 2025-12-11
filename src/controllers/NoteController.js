/**
 * Controller Note
 * @module controllers/NoteController
 */

const NoteService = require('../services/NoteService');
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
    res.status(201).json({ success: true, data: note });
});

const update = asyncHandler(async (req, res) => {
    const note = await NoteService.update(req.params.id, req.body, req.user.id_utilisateur);
    res.json({ success: true, data: note });
});

const remove = asyncHandler(async (req, res) => {
    await NoteService.delete(req.params.id, req.user.id_utilisateur, req.user.role);
    res.json({ success: true, message: 'Note supprimée' });
});

module.exports = { getAll, getById, getByEvenement, getGlobales, getRecentes, create, update, remove };
