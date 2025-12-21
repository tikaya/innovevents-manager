/**
 * Controller Devis
 * @module controllers/DevisController
 */

const DevisService = require('../services/DevisService');
const { LogService, ACTION_TYPES } = require('../services/LogService');
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
    
    // Log création devis
    await LogService.log(
        ACTION_TYPES.CREATION_DEVIS,
        req.user.id_utilisateur,
        { 
            id_devis: devis.id_devis,
            numero_devis: devis.numero_devis,
            id_evenement: id_evenement,
            montant_total: devis.montant_ttc
        },
        req.clientIp
    );
    
    res.status(201).json({ success: true, data: devis });
});

const update = asyncHandler(async (req, res) => {
    const devis = await DevisService.update(req.params.id, req.body);
    
    // Log modification devis
    await LogService.log(
        ACTION_TYPES.MODIFICATION_DEVIS,
        req.user.id_utilisateur,
        { 
            id_devis: parseInt(req.params.id),
            numero_devis: devis.numero_devis
        },
        req.clientIp
    );
    
    res.json({ success: true, data: devis });
});

const generatePdf = asyncHandler(async (req, res) => {
    const devis = await DevisService.getById(req.params.id);
    const pdfBuffer = await DevisService.generatePdf(req.params.id);
    
    // Log génération PDF
    await LogService.log(
        ACTION_TYPES.GENERATION_DEVIS_PDF,
        req.user.id_utilisateur,
        { 
            id_devis: parseInt(req.params.id),
            numero_devis: devis.numero_devis,
            id_evenement: devis.id_evenement
        },
        req.clientIp
    );
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=devis-${req.params.id}.pdf`);
    res.send(pdfBuffer);
});

const sendToClient = asyncHandler(async (req, res) => {
    const devis = await DevisService.sendToClient(req.params.id);
    
    // Log envoi email
    await LogService.log(
        ACTION_TYPES.ENVOI_DEVIS_EMAIL,
        req.user.id_utilisateur,
        { 
            id_devis: parseInt(req.params.id),
            numero_devis: devis.numero_devis,
            email_client: devis.email_client
        },
        req.clientIp
    );
    
    res.json({ success: true, data: devis, message: 'Devis envoyé au client' });
});

const accept = asyncHandler(async (req, res) => {
    const devis = await DevisService.accept(req.params.id, req.user.id_utilisateur);
    
    // Log acceptation devis
    await LogService.log(
        ACTION_TYPES.ACCEPTATION_DEVIS,
        req.user.id_utilisateur,
        { 
            id_devis: parseInt(req.params.id),
            numero_devis: devis.numero_devis
        },
        req.clientIp
    );
    
    res.json({ success: true, data: devis });
});

const refuse = asyncHandler(async (req, res) => {
    const devis = await DevisService.refuse(req.params.id, req.user.id_utilisateur);
    
    // Log refus devis
    await LogService.log(
        ACTION_TYPES.REFUS_DEVIS,
        req.user.id_utilisateur,
        { 
            id_devis: parseInt(req.params.id),
            numero_devis: devis.numero_devis
        },
        req.clientIp
    );
    
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
