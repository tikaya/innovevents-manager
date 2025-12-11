/**
 * Routes Auth
 * @module routes/auth
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middlewares/auth');
const { validateLogin, validateRegister, validatePasswordChange } = require('../middlewares/validation');

router.post('/login', validateLogin, AuthController.login);
router.post('/register', validateRegister, AuthController.register);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/change-password', authenticate, validatePasswordChange, AuthController.changePassword);
router.get('/me', authenticate, AuthController.getMe);

module.exports = router;
