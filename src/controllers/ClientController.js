/**
 * Controller Client
 * @module controllers/ClientController
 */

const ClientService = require('../services/ClientService');
const { LogService, ACTION_TYPES } = require('../services/LogService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Récupère tous les clients (admin/employé)
 */
const getAll = asyncHandler(async (req, res) => {
    const clients = await ClientService.getAll(req.query);
    res.json({ success: true, data: clients });
});

/**
 * Récupère un client par ID (admin/employé)
 */
const getById = asyncHandler(async (req, res) => {
    const client = await ClientService.getById(req.params.id);
    res.json({ success: true, data: client });
});

/**
 * Récupère le profil du client connecté
 */
const getMe = asyncHandler(async (req, res) => {
    const client = await ClientService.getByUserId(req.user.id_utilisateur);
    res.json({ success: true, data: client });
});

/**
 * Crée un nouveau client (admin/employé)
 */
const create = asyncHandler(async (req, res) => {
    const { client, tempPassword } = await ClientService.create(req.body);
    
    // ✅ Log création client
    await LogService.log(
        ACTION_TYPES.CREATION_CLIENT,
        req.user.id_utilisateur,
        { 
            id_client: client.id_client,
            nom_entreprise: client.nom_entreprise_client,
            email: client.email_client,
            nom_contact: client.nom_contact,
            prenom_contact: client.prenom_contact
        },
        req.clientIp
    );
    
    res.status(201).json({ 
        success: true, 
        data: client,
        message: 'Client créé. Un email avec les identifiants a été envoyé.'
    });
});

/**
 * Met à jour un client (admin/employé)
 */
const update = asyncHandler(async (req, res) => {
    // Récupérer l'ancien état pour le log
    const ancienClient = await ClientService.getById(req.params.id);
    
    const client = await ClientService.update(req.params.id, req.body);
    
    // ✅ Log modification client
    await LogService.log(
        ACTION_TYPES.MODIFICATION_CLIENT,
        req.user.id_utilisateur,
        { 
            id_client: parseInt(req.params.id),
            nom_entreprise: client.nom_entreprise_client,
            champs_modifies: Object.keys(req.body).filter(k => req.body[k] !== ancienClient[k])
        },
        req.clientIp
    );
    
    res.json({ success: true, data: client });
});

/**
 * Met à jour le profil du client connecté
 * Note: Limité aux champs autorisés pour éviter les modifications non souhaitées
 */
const updateMe = asyncHandler(async (req, res) => {
    const currentClient = await ClientService.getByUserId(req.user.id_utilisateur);
    
    // ✅ Limiter les champs modifiables par le client lui-même
    const champsAutorises = [
        'telephone_client',
        'adresse_client',
        'code_postal_client',
        'ville_client'
    ];
    
    const dataFiltered = {};
    for (const champ of champsAutorises) {
        if (req.body[champ] !== undefined) {
            dataFiltered[champ] = req.body[champ];
        }
    }
    
    // Vérifier qu'il y a des données à modifier
    if (Object.keys(dataFiltered).length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Aucun champ modifiable fourni' 
        });
    }
    
    const client = await ClientService.update(currentClient.id_client, dataFiltered);
    
    // ✅ Log modification profil
    await LogService.log(
        ACTION_TYPES.MODIFICATION_CLIENT,
        req.user.id_utilisateur,
        { 
            id_client: currentClient.id_client,
            action: 'MODIFICATION_PROFIL',
            champs_modifies: Object.keys(dataFiltered)
        },
        req.clientIp
    );
    
    res.json({ success: true, data: client });
});

/**
 * Supprime un client (admin uniquement)
 */
const remove = asyncHandler(async (req, res) => {
    // Récupérer les infos avant suppression pour le log
    const client = await ClientService.getById(req.params.id);
    
    // Vérifier s'il y a des événements en cours
    const evenements = await ClientService.getEvenements(req.params.id);
    const evenementsActifs = evenements?.filter(e => 
    ['en_attente', 'accepte', 'en_cours'].includes(e.statut_evenement)
);
    
    if (evenementsActifs && evenementsActifs.length > 0) {
        return res.status(400).json({ 
            success: false, 
            message: `Impossible de supprimer ce client : ${evenementsActifs.length} événement(s) en cours` 
        });
    }
    
    await ClientService.delete(req.params.id);
    
    // ✅ Log suppression client
    await LogService.log(
        ACTION_TYPES.SUPPRESSION_CLIENT,
        req.user.id_utilisateur,
        { 
            id_client: parseInt(req.params.id),
            nom_entreprise: client.nom_entreprise_client,
            email: client.email_client
        },
        req.clientIp
    );
    
    res.json({ success: true, message: 'Client supprimé' });
});

/**
 * Suppression du compte par le client lui-même (RGPD)
 */
const deleteMe = asyncHandler(async (req, res) => {
    const client = await ClientService.getByUserId(req.user.id_utilisateur);
    
    // Vérifier s'il y a des événements en cours
    const evenements = await ClientService.getEvenements(client.id_client);
    const evenementsActifs = evenements?.filter(e => 
    ['en_attente', 'accepte', 'en_cours'].includes(e.statut_evenement)
);
    
    if (evenementsActifs && evenementsActifs.length > 0) {
        return res.status(400).json({ 
            success: false, 
            message: `Impossible de supprimer votre compte : ${evenementsActifs.length} événement(s) en cours. Veuillez nous contacter.` 
        });
    }
    
    // ✅ Log RGPD avant suppression (car l'utilisateur sera supprimé)
    await LogService.log(
        ACTION_TYPES.SUPPRESSION_COMPTE_RGPD,
        req.user.id_utilisateur,
        { 
            id_client: client.id_client,
            demande_par: 'CLIENT',
            motif: 'Demande RGPD - Droit à l\'effacement'
        },
        req.clientIp
    );
    
    await ClientService.delete(client.id_client);
    
    res.json({ success: true, message: 'Compte supprimé conformément au RGPD' });
});

/**
 * Récupère les événements d'un client
 */
const getEvenements = asyncHandler(async (req, res) => {
    const evenements = await ClientService.getEvenements(req.params.id);
    res.json({ success: true, data: evenements });
});

/**
 * Recherche de clients
 */
const search = asyncHandler(async (req, res) => {
    const clients = await ClientService.search(req.query.q);
    res.json({ success: true, data: clients });
});

/**
 * Réinitialise le mot de passe d'un client (admin/employé)
 */
const resetPassword = asyncHandler(async (req, res) => {
    const client = await ClientService.getById(req.params.id);
    await ClientService.resetPassword(req.params.id);
    
    // ✅ Log reset password
    await LogService.log(
        ACTION_TYPES.RESET_PASSWORD_CLIENT,
        req.user.id_utilisateur,
        { 
            id_client: parseInt(req.params.id),
            email: client.email_client,
            demande_par: req.user.role
        },
        req.clientIp
    );
    
    res.json({ success: true, message: 'Nouveau mot de passe envoyé par email' });
});

module.exports = { 
    getAll, 
    getById, 
    getMe, 
    create, 
    update, 
    updateMe, 
    remove, 
    deleteMe, 
    getEvenements, 
    search, 
    resetPassword 
};