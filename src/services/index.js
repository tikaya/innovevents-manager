/**
 * Export de tous les services
 * @module services
 */

const AuthService = require('./AuthService');
const EmailService = require('./EmailService');
const PdfService = require('./PdfService');
const ProspectService = require('./ProspectService');
const ClientService = require('./ClientService');
const EvenementService = require('./EvenementService');
const DevisService = require('./DevisService');
const NoteService = require('./NoteService');
const TacheService = require('./TacheService');
const AvisService = require('./AvisService');
const ContactService = require('./ContactService');

module.exports = {
    AuthService,
    EmailService,
    PdfService,
    ProspectService,
    ClientService,
    EvenementService,
    DevisService,
    NoteService,
    TacheService,
    AvisService,
    ContactService
};
