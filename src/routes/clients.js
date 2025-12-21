/**
 * Routes Clients
 * @module routes/clients
 */

const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateClient, validateId } = require('../middlewares/validation');

// Client connecté
router.get('/me', authenticate, authorize('client'), ClientController.getMe);
router.put('/me', authenticate, authorize('client'), ClientController.updateMe);
router.delete('/me', authenticate, authorize('client'), ClientController.deleteMe);

// Admin/Employé
router.get('/', authenticate, authorize('admin', 'employe'), ClientController.getAll);
router.get('/search', authenticate, authorize('admin', 'employe'), ClientController.search);
router.get('/:id', authenticate, authorize('admin', 'employe'), validateId, ClientController.getById);
router.get('/:id/evenements', authenticate, authorize('admin', 'employe'), validateId, ClientController.getEvenements);

// Admin seulement
router.post('/', authenticate, authorize('admin'), validateClient, ClientController.create);
router.put('/:id', authenticate, authorize('admin'), validateId, ClientController.update);
router.post('/:id/reset-password', authenticate, authorize('admin'), validateId, ClientController.resetPassword);
router.delete('/:id', authenticate, authorize('admin'), validateId, ClientController.remove);

module.exports = router;
