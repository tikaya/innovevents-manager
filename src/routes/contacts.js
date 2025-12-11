/**
 * Routes Contacts
 * @module routes/contacts
 */

const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/ContactController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateContact, validateId } = require('../middlewares/validation');

// Public
router.post('/', validateContact, ContactController.create);

// Admin
router.get('/', authenticate, authorize('admin'), ContactController.getAll);
router.get('/search', authenticate, authorize('admin'), ContactController.search);
router.get('/:id', authenticate, authorize('admin'), validateId, ContactController.getById);
router.delete('/:id', authenticate, authorize('admin'), validateId, ContactController.remove);

module.exports = router;

