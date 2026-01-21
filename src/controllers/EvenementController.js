/**
 * Controller Evenement
 * @module controllers/EvenementController
 */

const EvenementService = require('../services/EvenementService');
const { LogService, ACTION_TYPES } = require('../services/LogService');
const { asyncHandler } = require('../middlewares/errorHandler');
const path = require('path');
const fs = require('fs');

/**
 * Récupère tous les événements
 */
const getAll = asyncHandler(async (req, res) => {
    const evenements = await EvenementService.getAll(req.query);
    res.json({ success: true, data: evenements });
});

/**
 * Récupère un événement par ID
 */
const getById = asyncHandler(async (req, res) => {
    const evenement = await EvenementService.getById(req.params.id);
    res.json({ success: true, data: evenement });
});

/**
 * Récupère les événements publics (pour la page visiteur)
 */
const getPublic = asyncHandler(async (req, res) => {
    const evenements = await EvenementService.getPublic(req.query);
    res.json({ success: true, data: evenements });
});

/**
 * Récupère les événements d'un client
 */
const getByClient = asyncHandler(async (req, res) => {
    const evenements = await EvenementService.getByClient(req.params.idClient);
    res.json({ success: true, data: evenements });
});

/**
 * Récupère les événements de l'utilisateur connecté (client)
 */
const getMine = asyncHandler(async (req, res) => {
    const evenements = await EvenementService.getByClient(req.user.id_client);
    res.json({ success: true, data: evenements });
});

/**
 * Récupère les prochains événements
 */
const getProchains = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const evenements = await EvenementService.getProchains(limit);
    res.json({ success: true, data: evenements });
});

/**
 * Crée un nouvel événement
 */
const create = asyncHandler(async (req, res) => {
    const evenement = await EvenementService.create(req.body);
    
    // Log création événement
    await LogService.log(
        ACTION_TYPES.CREATION_EVENEMENT,
        req.user.id_utilisateur,
        { 
            id_evenement: evenement.id_evenement,
            nom_evenement: evenement.nom_evenement,
            id_client: evenement.id_client
        },
        req.clientIp
    );
    
    res.status(201).json({ success: true, data: evenement });
});

/**
 * Met à jour un événement
 */
const update = asyncHandler(async (req, res) => {
    // Récupérer l'ancien événement pour le log
    const ancienEvenement = await EvenementService.getById(req.params.id);
    const ancienStatut = ancienEvenement.statut_evenement;
    
    const evenement = await EvenementService.update(req.params.id, req.body);
    
    // Log si le statut a changé
    if (req.body.statut_evenement && req.body.statut_evenement !== ancienStatut) {
        await LogService.log(
            ACTION_TYPES.MODIFICATION_STATUT_EVENEMENT,
            req.user.id_utilisateur,
            { 
                id_evenement: parseInt(req.params.id),
                nom_evenement: evenement.nom_evenement,
                ancien_statut: ancienStatut,
                nouveau_statut: req.body.statut_evenement
            },
            req.clientIp
        );
    }
    
    res.json({ success: true, data: evenement });
});

/**
 * Supprime un événement
 */
const remove = asyncHandler(async (req, res) => {
    // Récupérer l'événement AVANT suppression pour le log
    const evenement = await EvenementService.getById(req.params.id);
    
    // Supprimer l'image si elle existe
    if (evenement.image_evenement) {
        const imagePath = path.join(__dirname, '../../public', evenement.image_evenement);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }
    
    await EvenementService.delete(req.params.id);
    
    // Log suppression événement
    await LogService.log(
        ACTION_TYPES.SUPPRESSION_EVENEMENT,
        req.user.id_utilisateur,
        { 
            id_evenement: parseInt(req.params.id),
            nom_evenement: evenement.nom_evenement,
            id_client: evenement.id_client
        },
        req.clientIp
    );
    
    res.json({ success: true, message: 'Événement supprimé' });
});

/**
 * Récupère les statistiques des événements
 */
const getStats = asyncHandler(async (req, res) => {
    const stats = await EvenementService.getStats();
    res.json({ success: true, data: stats });
});

/**
 * Upload d'image pour un événement
 */
const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: 'Aucune image fournie' 
        });
    }

    const id = req.params.id;
    const evenement = await EvenementService.getById(id);
    
    // Supprimer l'ancienne image si elle existe
    if (evenement.image_evenement) {
        const oldImagePath = path.join(__dirname, '../../public', evenement.image_evenement);
        if (fs.existsSync(oldImagePath)) {
            try {
                fs.unlinkSync(oldImagePath);
            } catch (err) {
                console.error('Erreur suppression ancienne image:', err);
            }
        }
    }

    // Chemin relatif pour la BDD
    const imagePath = `/uploads/evenements/${req.file.filename}`;
    
    // Mettre à jour l'événement
    const updated = await EvenementService.update(id, { image_evenement: imagePath });

    // Log upload image
    await LogService.log(
        ACTION_TYPES.UPLOAD_IMAGE_EVENEMENT || 'UPLOAD_IMAGE_EVENEMENT',
        req.user.id_utilisateur,
        { 
            id_evenement: parseInt(id),
            nom_evenement: updated.nom_evenement,
            image_path: imagePath
        },
        req.clientIp
    );

    res.json({ 
        success: true, 
        data: updated,
        image_url: imagePath,
        message: 'Image uploadée avec succès' 
    });
});

/**
 * Supprimer l'image d'un événement
 */
const deleteImage = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const evenement = await EvenementService.getById(id);
    
    if (evenement.image_evenement) {
        const imagePath = path.join(__dirname, '../../public', evenement.image_evenement);
        if (fs.existsSync(imagePath)) {
            try {
                fs.unlinkSync(imagePath);
            } catch (err) {
                console.error('Erreur suppression image:', err);
            }
        }
    }

    await EvenementService.update(id, { image_evenement: null });

    // Log suppression image
    await LogService.log(
        ACTION_TYPES.SUPPRESSION_IMAGE_EVENEMENT || 'SUPPRESSION_IMAGE_EVENEMENT',
        req.user.id_utilisateur,
        { 
            id_evenement: parseInt(id),
            nom_evenement: evenement.nom_evenement
        },
        req.clientIp
    );

    res.json({ success: true, message: 'Image supprimée' });
});

module.exports = { 
    getAll, 
    getById, 
    getPublic,
    getByClient,
    getMine,
    getProchains,
    create, 
    update, 
    remove,
    getStats,
    uploadImage,
    deleteImage
};