/**
 * Controller Contact
 * @module controllers/ContactController
 */

const ContactService = require('../services/ContactService');
const { asyncHandler } = require('../middlewares/errorHandler');

const getAll = asyncHandler(async (req, res) => {
    const contacts = await ContactService.getAll(req.query);
    res.json({ success: true, data: contacts });
});

const getById = asyncHandler(async (req, res) => {
    const contact = await ContactService.getById(req.params.id);
    res.json({ success: true, data: contact });
});

const create = asyncHandler(async (req, res) => {
    const contact = await ContactService.create(req.body);
    res.status(201).json({ success: true, data: contact, message: 'Message envoyé avec succès' });
});

const remove = asyncHandler(async (req, res) => {
    await ContactService.delete(req.params.id);
    res.json({ success: true, message: 'Message supprimé' });
});

const search = asyncHandler(async (req, res) => {
    const contacts = await ContactService.search(req.query.q);
    res.json({ success: true, data: contacts });
});

module.exports = { getAll, getById, create, remove, search };
