/**
 * Export de tous les modèles
 * @module models
 */

const Utilisateur = require('./Utilisateur');
const Prospect = require('./Prospect');
const Client = require('./Client');
const Evenement = require('./Evenement');
const Devis = require('./Devis');
const Prestation = require('./Prestation');
const Note = require('./Note');
const Tache = require('./Tache');
const Avis = require('./Avis');
const Contact = require('./Contact');

module.exports = {
    Utilisateur,
    Prospect,
    Client,
    Evenement,
    Devis,
    Prestation,
    Note,
    Tache,
    Avis,
    Contact
};
