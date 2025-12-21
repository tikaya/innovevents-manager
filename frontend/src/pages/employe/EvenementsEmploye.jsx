import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Calendar, Search, Eye, X, MapPin, Clock, Users } from 'lucide-react';
import api from '../../services/api';

const EvenementsEmploye = () => {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvenements();
  }, []);

  const fetchEvenements = async () => {
    try {
      const response = await api.get('/evenements');
      setEvenements(response.data.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatutBadge = (statut) => {
    const config = {
      brouillon: { color: 'bg-gray-100 text-gray-700', label: 'Brouillon' },
      en_attente: { color: 'bg-yellow-100 text-yellow-700', label: 'En attente' },
      accepte: { color: 'bg-blue-100 text-blue-700', label: 'Accepté' },
      en_cours: { color: 'bg-purple-100 text-purple-700', label: 'En cours' },
      termine: { color: 'bg-green-100 text-green-700', label: 'Terminé' },
      annule: { color: 'bg-red-100 text-red-700', label: 'Annulé' }
    };
    const { color, label } = config[statut] || { color: 'bg-gray-100', label: statut };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{label}</span>;
  };

  const filteredEvenements = evenements.filter(e =>
    e.nom_evenement?.toLowerCase().includes(search.toLowerCase()) ||
    e.nom_entreprise_client?.toLowerCase().includes(search.toLowerCase()) ||
    e.lieu_evenement?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Événements</h1>
        <p className="text-gray-500">Consultation des événements (lecture seule)</p>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un événement..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-4">
        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredEvenements.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun événement trouvé</p>
          </div>
        ) : (
          filteredEvenements.map((event) => (
            <div key={event.id_evenement} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-btn flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-green-700">
                    {new Date(event.date_debut).getDate()}
                  </span>
                  <span className="text-xs text-green-600">
                    {new Date(event.date_debut).toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gris-ardoise">{event.nom_evenement}</h3>
                    {getStatutBadge(event.statut_evenement)}
                  </div>
                  <p className="text-sm text-gray-500">{event.nom_entreprise_client}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.lieu_evenement || 'Lieu à définir'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {event.type_evenement}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleViewDetail(event)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Détails
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Detail */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                {selectedEvent.nom_evenement}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                {getStatutBadge(selectedEvent.statut_evenement)}
                <span className="text-sm text-gray-500">{selectedEvent.type_evenement}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gris-ardoise">Client</p>
                    <p className="text-gray-600">{selectedEvent.nom_entreprise_client}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gris-ardoise">Date</p>
                    <p className="text-gray-600">{formatDate(selectedEvent.date_debut)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gris-ardoise">Horaires</p>
                    <p className="text-gray-600">{selectedEvent.heure_debut} - {selectedEvent.heure_fin}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gris-ardoise">Lieu</p>
                    <p className="text-gray-600">{selectedEvent.lieu_evenement || 'À définir'}</p>
                  </div>
                </div>
              </div>

              {selectedEvent.theme_evenement && (
                <div className="pt-4 border-t">
                  <p className="font-semibold text-gris-ardoise">Thème</p>
                  <p className="text-gray-600">{selectedEvent.theme_evenement}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvenementsEmploye;
