/**
 * Controller Devis
 * @module controllers/DevisController
 */

const DevisService = require('../services/DevisService');
const Client = require('../models/Client'); // ✅ AJOUT
const { LogService, ACTION_TYPES } = require('../services/LogService');
const { asyncHandler } = require('../middlewares/errorHandler');

const getAll = asyncHandler(async (req, res) => {
    const devis = await DevisService.getAll(req.query);
    res.json({ success: true, data: devis });
});

const getById = asyncHandler(async (req, res) => {
    const devis = await DevisService.getById(req.params.id);
    
    // ✅ Vérifier que le client ne voit que SES devis
    if (req.user.role === 'client') {
        const client = await Client.findByUserId(req.user.id_utilisateur);
        if (!client || client.id_client !== devis.id_client) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé à ce devis' });
        }
    }
    
    res.json({ success: true, data: devis });
});

const getMine = asyncHandler(async (req, res) => {
    const devis = await DevisService.getByUserId(req.user.id_utilisateur);
    res.json({ success: true, data: devis });
});

const create = asyncHandler(async (req, res) => {
    const { id_evenement, prestations, taux_tva } = req.body;
    
    if (!id_evenement) {
        return res.status(400).json({ success: false, message: 'Événement requis' });
    }
    
    const devis = await DevisService.create(id_evenement, prestations, taux_tva);
    
    // Log création devis
    await LogService.log(
        ACTION_TYPES.CREATION_DEVIS,
        req.user.id_utilisateur,
        { 
            id_devis: devis.id_devis,
            numero_devis: devis.numero_devis,
            id_evenement: id_evenement,
            montant_total: devis.total_ttc
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
    
    // ✅ Vérifier que le client ne télécharge que SES PDF
    if (req.user.role === 'client') {
        const client = await Client.findByUserId(req.user.id_utilisateur);
        if (!client || client.id_client !== devis.id_client) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé à ce devis' });
        }
    }
    
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
    res.setHeader('Content-Disposition', `attachment; filename=${devis.numero_devis}.pdf`);
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
            numero_devis: devis.numero_devis,
            id_evenement: devis.id_evenement
        },
        req.clientIp
    );
    
    res.json({ success: true, data: devis, message: 'Devis accepté avec succès' });
});

const refuse = asyncHandler(async (req, res) => {
    const devis = await DevisService.refuse(req.params.id, req.user.id_utilisateur);
    
    // Log refus devis
    await LogService.log(
        ACTION_TYPES.REFUS_DEVIS,
        req.user.id_utilisateur,
        { 
            id_devis: parseInt(req.params.id),
            numero_devis: devis.numero_devis,
            id_evenement: devis.id_evenement
        },
        req.clientIp
    );
    
    res.json({ success: true, data: devis, message: 'Devis refusé' });
});

const requestModification = asyncHandler(async (req, res) => {
    const { motif } = req.body;
    
    if (!motif || !motif.trim()) {
        return res.status(400).json({ success: false, message: 'Motif de modification requis' });
    }
    
    const devis = await DevisService.requestModification(req.params.id, req.user.id_utilisateur, motif);
    
    // Log demande modification
    await LogService.log(
        ACTION_TYPES.DEMANDE_MODIFICATION_DEVIS || 'DEMANDE_MODIFICATION_DEVIS',
        req.user.id_utilisateur,
        { 
            id_devis: parseInt(req.params.id),
            numero_devis: devis.numero_devis,
            motif: motif.substring(0, 100) // Tronquer pour le log
        },
        req.clientIp
    );
    
    res.json({ success: true, data: devis, message: 'Demande de modification envoyée' });
});

const remove = asyncHandler(async (req, res) => {
    const devis = await DevisService.getById(req.params.id);
    await DevisService.delete(req.params.id);
    
    // Log suppression
    await LogService.log(
        ACTION_TYPES.SUPPRESSION_DEVIS || 'SUPPRESSION_DEVIS',
        req.user.id_utilisateur,
        { 
            id_devis: parseInt(req.params.id),
            numero_devis: devis.numero_devis
        },
        req.clientIp
    );
    
    res.json({ success: true, message: 'Devis supprimé' });
});

module.exports = { getAll, getById, getMine, create, update, generatePdf, sendToClient, accept, refuse, requestModification, remove };