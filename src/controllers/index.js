/**
 * Export de tous les controllers
 * @module controllers
 */

const AuthController = require('./AuthController');
const ProspectController = require('./ProspectController');
const ClientController = require('./ClientController');
const EvenementController = require('./EvenementController');
const DevisController = require('./DevisController');
const NoteController = require('./NoteController');
const TacheController = require('./TacheController');
const AvisController = require('./AvisController');
const ContactController = require('./ContactController');
const DashboardController = require('./DashboardController');

module.exports = {
    AuthController,
    ProspectController,
    ClientController,
    EvenementController,
    DevisController,
    NoteController,
    TacheController,
    AvisController,
    ContactController,
    DashboardController
};
