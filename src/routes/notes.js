/**
 * Routes Notes
 * @module routes/notes
 */

const express = require('express');
const router = express.Router();
const NoteController = require('../controllers/NoteController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateNote, validateId } = require('../middlewares/validation');

router.get('/', authenticate, authorize('admin', 'employe'), NoteController.getAll);
router.get('/globales', authenticate, authorize('admin', 'employe'), NoteController.getGlobales);
router.get('/recentes', authenticate, authorize('admin', 'employe'), NoteController.getRecentes);
router.get('/evenement/:idEvenement', authenticate, authorize('admin', 'employe'), NoteController.getByEvenement);
router.get('/:id', authenticate, authorize('admin', 'employe'), validateId, NoteController.getById);
router.post('/', authenticate, authorize('admin', 'employe'), validateNote, NoteController.create);
router.put('/:id', authenticate, authorize('admin', 'employe'), validateId, NoteController.update);
router.delete('/:id', authenticate, authorize('admin', 'employe'), validateId, NoteController.remove);

module.exports = router;
