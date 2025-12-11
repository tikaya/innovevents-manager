/**
 * Controller Dashboard (Admin)
 * @module controllers/DashboardController
 */

const EvenementService = require('../services/EvenementService');
const ClientService = require('../services/ClientService');
const NoteService = require('../services/NoteService');
const DevisService = require('../services/DevisService');
const { asyncHandler } = require('../middlewares/errorHandler');

const getDashboard = asyncHandler(async (req, res) => {
    const [prochainsEvenements, notesRecentes, clientsActifs, brouillons, devisAcceptes] = await Promise.all([
        EvenementService.getProchains(),
        NoteService.getRecentes(5),
        ClientService.countActifs(),
        EvenementService.countBrouillons(),
        DevisService.getAcceptesRecents(5)
    ]);

    res.json({
        success: true,
        data: {
            prochainsEvenements,
            notesRecentes,
            kpis: {
                clientsActifs,
                evenementsBrouillon: brouillons
            },
            devisAcceptes
        }
    });
});

const getProchainsEvenements = asyncHandler(async (req, res) => {
    const evenements = await EvenementService.getProchains();
    res.json({ success: true, data: evenements });
});

const getNotesRecentes = asyncHandler(async (req, res) => {
    const notes = await NoteService.getRecentes(5);
    res.json({ success: true, data: notes });
});

const getKpis = asyncHandler(async (req, res) => {
    const [clientsActifs, brouillons] = await Promise.all([
        ClientService.countActifs(),
        EvenementService.countBrouillons()
    ]);

    res.json({
        success: true,
        data: {
            clientsActifs,
            evenementsBrouillon: brouillons
        }
    });
});

module.exports = { getDashboard, getProchainsEvenements, getNotesRecentes, getKpis };
