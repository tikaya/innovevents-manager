/**
 * Routes Logs (Journalisation)
 * @module routes/logs
 */

const express = require('express');
const router = express.Router();
const { LogService, ACTION_TYPES } = require('../services/LogService');
const { authenticate, authorize } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');

// Toutes les routes nécessitent d'être admin
router.use(authenticate, authorize('admin'));

// GET /api/logs - Liste des logs avec filtres
router.get('/', asyncHandler(async (req, res) => {
    const filters = {
        type_action: req.query.type_action,
        id_utilisateur: req.query.id_utilisateur,
        date_debut: req.query.date_debut,
        date_fin: req.query.date_fin,
        search: req.query.search
    };
    
    const options = {
        page: req.query.page,
        limit: req.query.limit
    };
    
    const result = await LogService.getLogs(filters, options);
    res.json({ success: true, data: result });
}));

// GET /api/logs/stats - Statistiques
router.get('/stats', asyncHandler(async (req, res) => {
    const stats = await LogService.getStats();
    res.json({ success: true, data: stats });
}));

// GET /api/logs/types - Types d'actions disponibles
router.get('/types', asyncHandler(async (req, res) => {
    res.json({ success: true, data: ACTION_TYPES });
}));

module.exports = router;
