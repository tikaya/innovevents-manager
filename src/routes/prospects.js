/**
 * Routes Prospects
 * @module routes/prospects
 */

const express = require('express');
const router = express.Router();
const ProspectController = require('../controllers/ProspectController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateProspect, validateId } = require('../middlewares/validation');

// Public
router.post('/', validateProspect, ProspectController.create);

// Admin/Employé
router.get('/', authenticate, authorize('admin', 'employe'), ProspectController.getAll);
router.get('/search', authenticate, authorize('admin', 'employe'), ProspectController.search);
router.get('/:id', authenticate, authorize('admin', 'employe'), validateId, ProspectController.getById);
router.put('/:id', authenticate, authorize('admin', 'employe'), validateId, ProspectController.update);
router.post('/:id/convert', authenticate, authorize('admin'), validateId, ProspectController.convert);
router.post('/:id/reject', authenticate, authorize('admin'), validateId, ProspectController.reject);
router.delete('/:id', authenticate, authorize('admin'), validateId, ProspectController.remove);

module.exports = router;
