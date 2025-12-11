/**
 * Routes Avis
 * @module routes/avis
 */

const express = require('express');
const router = express.Router();
const AvisController = require('../controllers/AvisController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateAvis, validateId } = require('../middlewares/validation');

// Public
router.get('/public', AvisController.getValides);
router.get('/average', AvisController.getAverage);

// Client
router.post('/', authenticate, authorize('client'), validateAvis, AvisController.create);

// Admin/Employé
router.get('/', authenticate, authorize('admin', 'employe'), AvisController.getAll);
router.get('/pending', authenticate, authorize('admin', 'employe'), AvisController.getEnAttente);
router.get('/:id', authenticate, authorize('admin', 'employe'), validateId, AvisController.getById);
router.patch('/:id/validate', authenticate, authorize('admin', 'employe'), validateId, AvisController.validate);
router.patch('/:id/reject', authenticate, authorize('admin', 'employe'), validateId, AvisController.reject);
router.delete('/:id', authenticate, authorize('admin'), validateId, AvisController.remove);

module.exports = router;
