/**
 * Router principal
 * @module routes
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const prospectRoutes = require('./prospects');
const clientRoutes = require('./clients');
const evenementRoutes = require('./evenements');
const devisRoutes = require('./devis');
const noteRoutes = require('./notes');
const tacheRoutes = require('./taches');
const avisRoutes = require('./avis');
const contactRoutes = require('./contacts');
const dashboardRoutes = require('./dashboard');
const employeRoutes = require('./employes');
const logRoutes = require('./logs');

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
router.use('/auth', authRoutes);
router.use('/prospects', prospectRoutes);
router.use('/clients', clientRoutes);
router.use('/evenements', evenementRoutes);
router.use('/devis', devisRoutes);
router.use('/notes', noteRoutes);
router.use('/taches', tacheRoutes);
router.use('/avis', avisRoutes);
router.use('/contacts', contactRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/employes', employeRoutes);
router.use('/logs', logRoutes);

module.exports = router;
