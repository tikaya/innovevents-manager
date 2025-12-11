/**
 * Controller Prospect
 * @module controllers/ProspectController
 */

const ProspectService = require('../services/ProspectService');
const { asyncHandler } = require('../middlewares/errorHandler');

const getAll = asyncHandler(async (req, res) => {
    const prospects = await ProspectService.getAll(req.query);
    res.json({ success: true, data: prospects });
});

const getById = asyncHandler(async (req, res) => {
    const prospect = await ProspectService.getById(req.params.id);
    res.json({ success: true, data: prospect });
});

const create = asyncHandler(async (req, res) => {
    const prospect = await ProspectService.create(req.body);
    res.status(201).json({ success: true, data: prospect, message: 'Merci pour votre demande. Chloé vous recontactera dans les plus brefs délais.' });
});

const update = asyncHandler(async (req, res) => {
    const prospect = await ProspectService.update(req.params.id, req.body);
    res.json({ success: true, data: prospect });
});

const reject = asyncHandler(async (req, res) => {
    const { message_echec } = req.body;
    const prospect = await ProspectService.reject(req.params.id, message_echec);
    res.json({ success: true, data: prospect });
});

const convert = asyncHandler(async (req, res) => {
    const { client, evenement } = req.body;
    const result = await ProspectService.convert(req.params.id, client, evenement);
    res.json({ success: true, data: result });
});

const remove = asyncHandler(async (req, res) => {
    await ProspectService.delete(req.params.id);
    res.json({ success: true, message: 'Prospect supprimé' });
});

const search = asyncHandler(async (req, res) => {
    const prospects = await ProspectService.search(req.query.q);
    res.json({ success: true, data: prospects });
});

module.exports = { getAll, getById, create, update, reject, convert, remove, search };
