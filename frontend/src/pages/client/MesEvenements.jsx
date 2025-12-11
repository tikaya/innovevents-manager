import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  MapPin, 
  Clock,
  Eye,
  X
} from 'lucide-react';
import api from '../../services/api';

const MesEvenements = () => {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvenements();
  }, []);

  const fetchEvenements = async () => {
    try {
      const response = await api.get('/evenements/mine');
      setEvenements(response.data.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
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
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Mes événements</h1>
        <p className="text-gray-500">Suivez l'avancement de vos événements</p>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-or border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : evenements.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Vous n'avez pas encore d'événement</p>
          <a href="/demande-devis" className="btn-cta">Demander un devis</a>
        </div>
      ) : (
        <div className="space-y-4">
          {evenements.map((evt) => (
            <div key={evt.id_evenement} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Date */}
                <div className="w-20 h-20 bg-or rounded-btn flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-gris-ardoise">
                    {new Date(evt.date_debut).getDate()}
                  </span>
                  <span className="text-sm text-gris-ardoise">
                    {new Date(evt.date_debut).toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gris-ardoise">{evt.nom_evenement}</h3>
                    {getStatutBadge(evt.statut_evenement)}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {evt.lieu_evenement || 'Lieu à définir'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {evt.heure_debut || '00:00'} - {evt.heure_fin || '00:00'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {evt.type_evenement}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => { setSelectedEvent(evt); setShowModal(true); }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Détails
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Détails */}
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
                  <Calendar className="w-5 h-5 text-or flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gris-ardoise">Date</p>
                    <p className="text-gray-600">{formatDate(selectedEvent.date_debut)}</p>
                    {selectedEvent.date_fin !== selectedEvent.date_debut && (
                      <p className="text-gray-500 text-sm">au {formatDate(selectedEvent.date_fin)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-or flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gris-ardoise">Horaires</p>
                    <p className="text-gray-600">{selectedEvent.heure_debut} - {selectedEvent.heure_fin}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-or flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gris-ardoise">Lieu</p>
                    <p className="text-gray-600">{selectedEvent.lieu_evenement || 'À définir'}</p>
                  </div>
                </div>

                {selectedEvent.theme_evenement && (
                  <div>
                    <p className="font-semibold text-gris-ardoise">Thème</p>
                    <p className="text-gray-600">{selectedEvent.theme_evenement}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MesEvenements;
