/**
 * Routes Devis
 * @module routes/devis
 */

const express = require('express');
const router = express.Router();
const DevisController = require('../controllers/DevisController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateId } = require('../middlewares/validation');

// Client connecté
router.get('/mine', authenticate, authorize('client'), DevisController.getMine);
router.post('/:id/accept', authenticate, authorize('client'), validateId, DevisController.accept);
router.post('/:id/refuse', authenticate, authorize('client'), validateId, DevisController.refuse);
router.post('/:id/modify', authenticate, authorize('client'), validateId, DevisController.requestModification);

// Admin/Employé
router.get('/', authenticate, authorize('admin', 'employe'), DevisController.getAll);
router.get('/:id', authenticate, authorize('admin', 'employe', 'client'), validateId, DevisController.getById);
router.get('/:id/pdf', authenticate, authorize('admin', 'employe', 'client'), validateId, DevisController.generatePdf);
router.post('/', authenticate, authorize('admin'), DevisController.create);
router.put('/:id', authenticate, authorize('admin'), validateId, DevisController.update);
router.post('/:id/send', authenticate, authorize('admin'), validateId, DevisController.sendToClient);
router.delete('/:id', authenticate, authorize('admin'), validateId, DevisController.remove);

module.exports = router;
