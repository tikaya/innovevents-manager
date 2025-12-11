/**
 * Routes Taches
 * @module routes/taches
 */

const express = require('express');
const router = express.Router();
const TacheController = require('../controllers/TacheController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateTache, validateId } = require('../middlewares/validation');

router.get('/', authenticate, authorize('admin', 'employe'), TacheController.getAll);
router.get('/mine', authenticate, authorize('admin', 'employe'), TacheController.getMine);
router.get('/en-retard', authenticate, authorize('admin', 'employe'), TacheController.getEnRetard);
router.get('/evenement/:idEvenement', authenticate, authorize('admin', 'employe'), TacheController.getByEvenement);
router.get('/:id', authenticate, authorize('admin', 'employe'), validateId, TacheController.getById);
router.post('/', authenticate, authorize('admin'), validateTache, TacheController.create);
router.put('/:id', authenticate, authorize('admin'), validateId, TacheController.update);
router.patch('/:id/statut', authenticate, authorize('admin', 'employe'), validateId, TacheController.updateStatut);
router.delete('/:id', authenticate, authorize('admin'), validateId, TacheController.remove);

module.exports = router;
