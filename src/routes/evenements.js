/**
 * Routes Evenements
 * @module routes/evenements
 */

const express = require('express');
const router = express.Router();
const EvenementController = require('../controllers/EvenementController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateEvenement, validateId } = require('../middlewares/validation');
const { uploadEvenement } = require('../middlewares/upload');

// Public
router.get('/public', EvenementController.getPublic);
router.get('/types', EvenementController.getTypes);
router.get('/themes', EvenementController.getThemes);

// Client connecté
router.get('/mine', authenticate, authorize('client'), EvenementController.getMine);

// Admin/Employé
router.get('/', authenticate, authorize('admin', 'employe'), EvenementController.getAll);
router.get('/prochains', authenticate, authorize('admin', 'employe'), EvenementController.getProchains);
router.get('/:id', authenticate, authorize('admin', 'employe', 'client'), validateId, EvenementController.getById);
router.post('/', authenticate, authorize('admin'), validateEvenement, EvenementController.create);
router.put('/:id', authenticate, authorize('admin'), validateId, EvenementController.update);
router.patch('/:id/statut', authenticate, authorize('admin'), validateId, EvenementController.updateStatut);
router.delete('/:id', authenticate, authorize('admin'), validateId, EvenementController.remove);

// ✅ Routes upload image (admin uniquement)
router.post('/:id/image', authenticate, authorize('admin'), uploadEvenement.single('image'), EvenementController.uploadImage);
router.delete('/:id/image', authenticate, authorize('admin'), EvenementController.deleteImage);

module.exports = router;