/**
 * Controller Evenement
 * @module controllers/EvenementController
 */

const EvenementService = require('../services/EvenementService');
const { asyncHandler } = require('../middlewares/errorHandler');

const getAll = asyncHandler(async (req, res) => {
    const evenements = await EvenementService.getAll(req.query);
    res.json({ success: true, data: evenements });
});

const getPublic = asyncHandler(async (req, res) => {
    const evenements = await EvenementService.getPublic(req.query);
    res.json({ success: true, data: evenements });
});

const getById = asyncHandler(async (req, res) => {
    const evenement = await EvenementService.getById(req.params.id);
    res.json({ success: true, data: evenement });
});

const getMine = asyncHandler(async (req, res) => {
    const evenements = await EvenementService.getByUserId(req.user.id_utilisateur);
    res.json({ success: true, data: evenements });
});

const getProchains = asyncHandler(async (req, res) => {
    const evenements = await EvenementService.getProchains();
    res.json({ success: true, data: evenements });
});

const create = asyncHandler(async (req, res) => {
    const evenement = await EvenementService.create(req.body);
    res.status(201).json({ success: true, data: evenement });
});

const update = asyncHandler(async (req, res) => {
    const evenement = await EvenementService.update(req.params.id, req.body);
    res.json({ success: true, data: evenement });
});

const updateStatut = asyncHandler(async (req, res) => {
    const { statut } = req.body;
    const evenement = await EvenementService.updateStatut(req.params.id, statut);
    res.json({ success: true, data: evenement });
});

const remove = asyncHandler(async (req, res) => {
    await EvenementService.delete(req.params.id);
    res.json({ success: true, message: 'Événement supprimé' });
});

const getTypes = asyncHandler(async (req, res) => {
    const types = await EvenementService.getTypes();
    res.json({ success: true, data: types });
});

const getThemes = asyncHandler(async (req, res) => {
    const themes = await EvenementService.getThemes();
    res.json({ success: true, data: themes });
});

module.exports = { getAll, getPublic, getById, getMine, getProchains, create, update, updateStatut, remove, getTypes, getThemes };
