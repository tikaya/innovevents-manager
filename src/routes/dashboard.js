/**
 * Routes Dashboard
 * @module routes/dashboard
 */

const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', authenticate, authorize('admin'), DashboardController.getDashboard);
router.get('/prochains-evenements', authenticate, authorize('admin'), DashboardController.getProchainsEvenements);
router.get('/notes-recentes', authenticate, authorize('admin'), DashboardController.getNotesRecentes);
router.get('/kpis', authenticate, authorize('admin'), DashboardController.getKpis);

module.exports = router;
