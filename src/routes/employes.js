/**
 * Routes Employés
 * @module routes/employes
 */

const express = require('express');
const router = express.Router();
const EmployeController = require('../controllers/EmployeController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateId } = require('../middlewares/validation');

// Toutes les routes nécessitent d'être admin
router.use(authenticate, authorize('admin'));

router.get('/', EmployeController.getAll);
router.get('/:id', validateId, EmployeController.getById);
router.post('/', EmployeController.create);
router.put('/:id', validateId, EmployeController.update);
router.post('/:id/reset-password', validateId, EmployeController.resetPassword);
router.delete('/:id', validateId, EmployeController.remove);

module.exports = router;
