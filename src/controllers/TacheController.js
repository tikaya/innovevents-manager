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
    
    await LogService.log(
        ACTION_TYPES.CREATION_TACHE,
        req.user.id_utilisateur,
        { 
            id_tache: tache.id_tache,
            titre_tache: tache.titre_tache,
            id_evenement: tache.id_evenement,
            id_assignee: tache.id_utilisateur
        },
        req.clientIp
    );
    
    res.status(201).json({ success: true, data: tache });
});

// ✅ CORRECTION : Passer le rôle au service
const update = asyncHandler(async (req, res) => {
    const tache = await TacheService.update(req.params.id, req.body, req.user.role);
    
    await LogService.log(
        ACTION_TYPES.MODIFICATION_TACHE,
        req.user.id_utilisateur,
        { 
            id_tache: parseInt(req.params.id),
            titre_tache: tache.titre_tache,
            champs_modifies: Object.keys(req.body)
        },
        req.clientIp
    );
    
    res.json({ success: true, data: tache });
});

// ✅ CORRECTION : Passer le rôle au service
const updateStatut = asyncHandler(async (req, res) => {
    const { statut } = req.body;
    
    const ancienneTache = await TacheService.getById(req.params.id);
    const ancienStatut = ancienneTache.statut_tache;
    
    const tache = await TacheService.updateStatut(
        req.params.id, 
        statut, 
        req.user.id_utilisateur,
        req.user.role
    );
    
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
    const tache = await TacheService.getById(req.params.id);
    
    await TacheService.delete(req.params.id);
    
    await LogService.log(
        ACTION_TYPES.SUPPRESSION_TACHE,
        req.user.id_utilisateur,
        { 
            id_tache: parseInt(req.params.id),
            titre_tache: tache.titre_tache,
            id_evenement: tache.id_evenement
        },
        req.clientIp
    );
    
    res.json({ success: true, message: 'Tâche supprimée' });
});

module.exports = { getAll, getById, getByEvenement, getMine, getEnRetard, create, update, updateStatut, remove };