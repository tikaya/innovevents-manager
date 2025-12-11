/**
 * Service Contact
 * @module services/ContactService
 */

const Contact = require('../models/Contact');
const EmailService = require('./EmailService');

class ContactService {
    static async getAll(filters = {}) {
        return Contact.findAll(filters);
    }

    static async getById(id) {
        const contact = await Contact.findById(id);
        if (!contact) throw new Error('Message non trouvé');
        return contact;
    }

    static async create(data) {
        const contact = await Contact.create(data);

        // Email à Innov'Events
        try {
            await EmailService.sendContact(contact);
        } catch (error) {
            console.error('Erreur email contact:', error.message);
        }

        return contact;
    }

    static async delete(id) {
        const deleted = await Contact.delete(id);
        if (!deleted) throw new Error('Message non trouvé');
        return true;
    }

    static async search(term) {
        return Contact.search(term);
    }
}

module.exports = ContactService;
