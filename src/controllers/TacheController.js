/**
 * Controller Tache
 * @module controllers/TacheController
 */

const TacheService = require('../services/TacheService');
const { asyncHandler } = require('../middlewares/errorHandler');

const getAll = asyncHandler(async (req, res) => {
    const taches = await TacheService.getAll(req.query);
    res.json({ success: true, data: taches });
});

const getById = asyncHandler(async (req, res) => {
    const tache = await TacheService.getById(req.params.id);
    res.json({ success: true, data: tache });
});

const getByEvenement = asyncHandler(async (req, res) => {
    const taches = await TacheService.getByEvenement(req.params.idEvenement);
    res.json({ success: true, data: taches });
});

const getMine = asyncHandler(async (req, res) => {
    const taches = await TacheService.getByUtilisateur(req.user.id_utilisateur);
    res.json({ success: true, data: taches });
});

const getEnRetard = asyncHandler(async (req, res) => {
    const taches = await TacheService.getEnRetard();
    res.json({ success: true, data: taches });
});

const create = asyncHandler(async (req, res) => {
    const tache = await TacheService.create(req.body);
    res.status(201).json({ success: true, data: tache });
});

const update = asyncHandler(async (req, res) => {
    const tache = await TacheService.update(req.params.id, req.body);
    res.json({ success: true, data: tache });
});

const updateStatut = asyncHandler(async (req, res) => {
    const { statut } = req.body;
    const tache = await TacheService.updateStatut(req.params.id, statut, req.user.id_utilisateur);
    res.json({ success: true, data: tache });
});

const remove = asyncHandler(async (req, res) => {
    await TacheService.delete(req.params.id);
    res.json({ success: true, message: 'Tâche supprimée' });
});

module.exports = { getAll, getById, getByEvenement, getMine, getEnRetard, create, update, updateStatut, remove };
