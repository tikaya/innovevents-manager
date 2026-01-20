/**
 * Controller Evenement
 * @module controllers/EvenementController
 */

const EvenementService = require('../services/EvenementService');
const Client = require('../models/Client'); // ✅ AJOUT
const { LogService, ACTION_TYPES } = require('../services/LogService');
const { asyncHandler } = require('../middlewares/errorHandler');

const getAll = asyncHandler(async (req, res) => {
    const evenements = await EvenementService.getAll(req.query);
    res.json({ success: true, data: evenements });
});

const getPublic = asyncHandler(async (req, res) => {
    const evenements = await EvenementService.getPublic(req.query);
    res.json({ success: true, data: evenements });
});

const getById = asyncHandler(async (req, res) => {
    const evenement = await EvenementService.getById(req.params.id);
    
    // ✅ Vérifier que le client ne voit que SES événements
    if (req.user.role === 'client') {
        const client = await Client.findByUserId(req.user.id_utilisateur);
        if (!client || client.id_client !== evenement.id_client) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé à cet événement' });
        }
    }
    
    res.json({ success: true, data: evenement });
});

const getMine = asyncHandler(async (req, res) => {
    const evenements = await EvenementService.getByUserId(req.user.id_utilisateur);
    res.json({ success: true, data: evenements });
});

const getProchains = asyncHandler(async (req, res) => {
    const evenements = await EvenementService.getProchains();
    res.json({ success: true, data: evenements });
});

const create = asyncHandler(async (req, res) => {
    const evenement = await EvenementService.create(req.body);
    
    // Log création événement
    await LogService.log(
        ACTION_TYPES.CREATION_EVENEMENT,
        req.user.id_utilisateur,
        { 
            id_evenement: evenement.id_evenement,
            nom_evenement: evenement.nom_evenement,
            type_evenement: evenement.type_evenement
        },
        req.clientIp
    );
    
    res.status(201).json({ success: true, data: evenement });
});

const update = asyncHandler(async (req, res) => {
    const evenement = await EvenementService.update(req.params.id, req.body);
    
    // Log modification événement
    await LogService.log(
        ACTION_TYPES.MODIFICATION_EVENEMENT,
        req.user.id_utilisateur,
        { 
            id_evenement: parseInt(req.params.id),
            nom_evenement: evenement.nom_evenement
        },
        req.clientIp
    );
    
    res.json({ success: true, data: evenement });
});

const updateStatut = asyncHandler(async (req, res) => {
    const { statut } = req.body;
    
    // ✅ Validation des statuts autorisés
    const statutsValides = ['brouillon', 'confirme', 'planifie', 'en_cours', 'termine', 'annule'];
    if (!statutsValides.includes(statut)) {
        return res.status(400).json({ 
            success: false, 
            message: `Statut invalide. Valeurs autorisées: ${statutsValides.join(', ')}` 
        });
    }
    
    // Récupérer l'ancien statut avant modification
    const ancienEvenement = await EvenementService.getById(req.params.id);
    const ancienStatut = ancienEvenement.statut_evenement;
    
    // ✅ Validation des transitions de statut
    const transitionsInterdites = {
        'termine': ['brouillon'], // Un événement terminé ne peut pas redevenir brouillon
        'annule': ['confirme', 'planifie', 'en_cours', 'termine'] // Un événement annulé ne peut pas reprendre
    };
    
    if (transitionsInterdites[ancienStatut]?.includes(statut)) {
        return res.status(400).json({ 
            success: false, 
            message: `Transition de statut non autorisée: ${ancienStatut} → ${statut}` 
        });
    }
    
    const evenement = await EvenementService.updateStatut(req.params.id, statut);
    
    // Log modification statut
    await LogService.log(
        ACTION_TYPES.MODIFICATION_STATUT_EVENEMENT,
        req.user.id_utilisateur,
        { 
            id_evenement: parseInt(req.params.id),
            nom_evenement: evenement.nom_evenement,
            ancien_statut: ancienStatut,
            nouveau_statut: statut
        },
        req.clientIp
    );
    
    res.json({ success: true, data: evenement });
});

const remove = asyncHandler(async (req, res) => {
    const evenement = await EvenementService.getById(req.params.id);
    
    // ✅ Interdire la suppression d'un événement confirmé ou en cours
    if (['confirme', 'planifie', 'en_cours'].includes(evenement.statut_evenement)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Impossible de supprimer un événement confirmé ou en cours. Annulez-le d\'abord.' 
        });
    }
    
    await EvenementService.delete(req.params.id);
    
    // Log suppression événement
    await LogService.log(
        ACTION_TYPES.SUPPRESSION_EVENEMENT,
        req.user.id_utilisateur,
        { 
            id_evenement: parseInt(req.params.id),
            nom_evenement: evenement.nom_evenement
        },
        req.clientIp
    );
    
    res.json({ success: true, message: 'Événement supprimé' });
});

const getTypes = asyncHandler(async (req, res) => {
    const types = await EvenementService.getTypes();
    res.json({ success: true, data: types });
});

const getThemes = asyncHandler(async (req, res) => {
    const themes = await EvenementService.getThemes();
    res.json({ success: true, data: themes });
});

module.exports = { getAll, getPublic, getById, getMine, getProchains, create, update, updateStatut, remove, getTypes, getThemes };