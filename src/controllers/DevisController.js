/**
 * Controller Devis
 * @module controllers/DevisController
 */

const DevisService = require('../services/DevisService');
const { asyncHandler } = require('../middlewares/errorHandler');

const getAll = asyncHandler(async (req, res) => {
    const devis = await DevisService.getAll(req.query);
    res.json({ success: true, data: devis });
});

const getById = asyncHandler(async (req, res) => {
    const devis = await DevisService.getById(req.params.id);
    res.json({ success: true, data: devis });
});

const getMine = asyncHandler(async (req, res) => {
    const devis = await DevisService.getByUserId(req.user.id_utilisateur);
    res.json({ success: true, data: devis });
});

const create = asyncHandler(async (req, res) => {
    const { id_evenement, prestations, taux_tva } = req.body;
    const devis = await DevisService.create(id_evenement, prestations, taux_tva);
    res.status(201).json({ success: true, data: devis });
});

const update = asyncHandler(async (req, res) => {
    const devis = await DevisService.update(req.params.id, req.body);
    res.json({ success: true, data: devis });
});

const generatePdf = asyncHandler(async (req, res) => {
    const pdfBuffer = await DevisService.generatePdf(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=devis-${req.params.id}.pdf`);
    res.send(pdfBuffer);
});

const sendToClient = asyncHandler(async (req, res) => {
    const devis = await DevisService.sendToClient(req.params.id);
    res.json({ success: true, data: devis, message: 'Devis envoyé au client' });
});

const accept = asyncHandler(async (req, res) => {
    const devis = await DevisService.accept(req.params.id, req.user.id_utilisateur);
    res.json({ success: true, data: devis });
});

const refuse = asyncHandler(async (req, res) => {
    const devis = await DevisService.refuse(req.params.id, req.user.id_utilisateur);
    res.json({ success: true, data: devis });
});

const requestModification = asyncHandler(async (req, res) => {
    const { motif } = req.body;
    const devis = await DevisService.requestModification(req.params.id, req.user.id_utilisateur, motif);
    res.json({ success: true, data: devis });
});

const remove = asyncHandler(async (req, res) => {
    await DevisService.delete(req.params.id);
    res.json({ success: true, message: 'Devis supprimé' });
});

module.exports = { getAll, getById, getMine, create, update, generatePdf, sendToClient, accept, refuse, requestModification, remove };
