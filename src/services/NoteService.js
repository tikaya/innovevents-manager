/**
 * Service Note
 * @module services/NoteService
 */

const Note = require('../models/Note');
const Evenement = require('../models/Evenement');

class NoteService {
    static async getAll(filters = {}) {
        return Note.findAll(filters);
    }

    static async getById(id) {
        const note = await Note.findById(id);
        if (!note) throw new Error('Note non trouvée');
        return note;
    }

    static async getByEvenement(idEvenement) {
        return Note.findByEvenement(idEvenement);
    }

    static async getGlobales() {
        return Note.findGlobales();
    }

    static async getRecentes(limit = 5) {
        return Note.findRecentes(limit);
    }

    static async create(data, idUtilisateur) {
        if (data.id_evenement && !data.est_globale) {
            const evt = await Evenement.findById(data.id_evenement);
            if (!evt) throw new Error('Événement non trouvé');
        }

        return Note.create({
            contenu_note: data.contenu_note,
            est_globale: data.est_globale || false,
            id_utilisateur: idUtilisateur,
            id_evenement: data.est_globale ? null : data.id_evenement
        });
    }

    static async update(id, data, idUtilisateur) {
        const note = await Note.findById(id);
        if (!note) throw new Error('Note non trouvée');
        if (note.id_utilisateur !== idUtilisateur) {
            throw new Error('Non autorisé');
        }
        return Note.update(id, data);
    }

    static async delete(id, idUtilisateur, role) {
        const note = await Note.findById(id);
        if (!note) throw new Error('Note non trouvée');
        if (note.id_utilisateur !== idUtilisateur && role !== 'admin') {
            throw new Error('Non autorisé');
        }
        return Note.delete(id);
    }
}

module.exports = NoteService;
