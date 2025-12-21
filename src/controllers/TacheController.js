/**
 * Controller Tache
 * @module controllers/TacheController
 */

const TacheService = require('../services/TacheService');
const { LogService, ACTION_TYPES } = require('../services/LogService');
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
    // Récupérer l'ancien statut avant modification
    const ancienneTache = await TacheService.getById(req.params.id);
    const ancienStatut = ancienneTache.statut_tache;
    
    const tache = await TacheService.update(req.params.id, req.body);
    
    // Log si le statut a changé
    if (req.body.statut_tache && req.body.statut_tache !== ancienStatut) {
        await LogService.log(
            ACTION_TYPES.MODIFICATION_STATUT_TACHE,
            req.user.id_utilisateur,
            { 
                id_tache: parseInt(req.params.id),
                titre_tache: tache.titre_tache,
                ancien_statut: ancienStatut,
                nouveau_statut: req.body.statut_tache
            },
            req.clientIp
        );
    }
    
    res.json({ success: true, data: tache });
});

const updateStatut = asyncHandler(async (req, res) => {
    const { statut } = req.body;
    
    // Récupérer l'ancien statut
    const ancienneTache = await TacheService.getById(req.params.id);
    const ancienStatut = ancienneTache.statut_tache;
    
    const tache = await TacheService.updateStatut(req.params.id, statut, req.user.id_utilisateur);
    
    // Log modification statut tâche
    await LogService.log(
        ACTION_TYPES.MODIFICATION_STATUT_TACHE,
        req.user.id_utilisateur,
        { 
            id_tache: parseInt(req.params.id),
            titre_tache: tache.titre_tache,
            ancien_statut: ancienStatut,
            nouveau_statut: statut
        },
        req.clientIp
    );
    
    res.json({ success: true, data: tache });
});

const remove = asyncHandler(async (req, res) => {
    await TacheService.delete(req.params.id);
    res.json({ success: true, message: 'Tâche supprimée' });
});

module.exports = { getAll, getById, getByEvenement, getMine, getEnRetard, create, update, updateStatut, remove };
