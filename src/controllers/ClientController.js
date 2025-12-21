/**
 * Controller Client
 * @module controllers/ClientController
 */

const ClientService = require('../services/ClientService');
const { asyncHandler } = require('../middlewares/errorHandler');

const getAll = asyncHandler(async (req, res) => {
    const clients = await ClientService.getAll(req.query);
    res.json({ success: true, data: clients });
});

const getById = asyncHandler(async (req, res) => {
    const client = await ClientService.getById(req.params.id);
    res.json({ success: true, data: client });
});

const getMe = asyncHandler(async (req, res) => {
    const client = await ClientService.getByUserId(req.user.id_utilisateur);
    res.json({ success: true, data: client });
});

const create = asyncHandler(async (req, res) => {
    const { client, tempPassword } = await ClientService.create(req.body);
    res.status(201).json({ 
        success: true, 
        data: client,
        message: 'Client créé. Un email avec les identifiants a été envoyé.'
    });
});

const update = asyncHandler(async (req, res) => {
    const client = await ClientService.update(req.params.id, req.body);
    res.json({ success: true, data: client });
});

const updateMe = asyncHandler(async (req, res) => {
    const currentClient = await ClientService.getByUserId(req.user.id_utilisateur);
    const client = await ClientService.update(currentClient.id_client, req.body);
    res.json({ success: true, data: client });
});

const remove = asyncHandler(async (req, res) => {
    await ClientService.delete(req.params.id);
    res.json({ success: true, message: 'Client supprimé' });
});

const deleteMe = asyncHandler(async (req, res) => {
    const client = await ClientService.getByUserId(req.user.id_utilisateur);
    await ClientService.delete(client.id_client);
    res.json({ success: true, message: 'Compte supprimé (RGPD)' });
});

const getEvenements = asyncHandler(async (req, res) => {
    const evenements = await ClientService.getEvenements(req.params.id);
    res.json({ success: true, data: evenements });
});

const search = asyncHandler(async (req, res) => {
    const clients = await ClientService.search(req.query.q);
    res.json({ success: true, data: clients });
});

const resetPassword = asyncHandler(async (req, res) => {
    await ClientService.resetPassword(req.params.id);
    res.json({ success: true, message: 'Nouveau mot de passe envoyé par email' });
});

module.exports = { getAll, getById, getMe, create, update, updateMe, remove, deleteMe, getEvenements, search, resetPassword };
