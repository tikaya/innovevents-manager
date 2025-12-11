import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Star, Send, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const DeposerAvis = () => {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [note, setNote] = useState(0);
  const [hoverNote, setHoverNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchEvenements();
  }, []);

  const fetchEvenements = async () => {
    try {
      const response = await api.get('/evenements/mine');
      // Filtrer les événements terminés
      const termines = (response.data.data || []).filter(e => e.statut_evenement === 'termine');
      setEvenements(termines);
    } catch (err) {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEvent) {
      toast.error('Veuillez sélectionner un événement');
      return;
    }
    if (note === 0) {
      toast.error('Veuillez donner une note');
      return;
    }
    if (!commentaire.trim()) {
      toast.error('Veuillez écrire un commentaire');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/avis', {
        id_evenement: parseInt(selectedEvent),
        note_avis: note,
        commentaire_avis: commentaire
      });
      
      setSuccess(true);
      toast.success('Merci pour votre avis !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedEvent('');
    setNote(0);
    setCommentaire('');
    setSuccess(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-or border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-montserrat font-bold text-gris-ardoise mb-2">
            Merci pour votre avis !
          </h2>
          <p className="text-gray-500 mb-6">
            Votre avis a été soumis et sera publié après validation.
          </p>
          <button onClick={resetForm} className="btn-primary">
            Donner un autre avis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Déposer un avis</h1>
        <p className="text-gray-500">Partagez votre expérience sur un événement terminé</p>
      </div>

      {evenements.length === 0 ? (
        <div className="card text-center py-12">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            Vous n'avez pas encore d'événement terminé pour lequel déposer un avis.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Sélection événement */}
          <div>
            <label className="label">Événement *</label>
            <select
              className="input-field"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              required
            >
              <option value="">Sélectionner un événement</option>
              {evenements.map(evt => (
                <option key={evt.id_evenement} value={evt.id_evenement}>
                  {evt.nom_evenement}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="label">Votre note *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNote(star)}
                  onMouseEnter={() => setHoverNote(star)}
                  onMouseLeave={() => setHoverNote(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoverNote || note)
                        ? 'text-or fill-or'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-lg font-semibold text-gris-ardoise">
                {note > 0 ? `${note}/5` : ''}
              </span>
            </div>
          </div>

          {/* Commentaire */}
          <div>
            <label className="label">Votre commentaire *</label>
            <textarea
              className="input-field"
              rows="5"
              placeholder="Décrivez votre expérience..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Minimum 10 caractères
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || commentaire.length < 10}
            className={`btn-cta w-full flex items-center justify-center gap-2 ${
              (submitting || commentaire.length < 10) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Send className="w-5 h-5" />
            {submitting ? 'Envoi en cours...' : 'Envoyer mon avis'}
          </button>
        </form>
      )}
    </div>
  );
};

export default DeposerAvis;
