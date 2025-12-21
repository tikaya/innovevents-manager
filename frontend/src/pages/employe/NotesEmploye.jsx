import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FileText, Plus, Edit, Trash2, Search, X, Calendar, User } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const NotesEmploye = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [formData, setFormData] = useState({
    id_evenement: '',
    contenu_note: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notesRes, eventsRes] = await Promise.all([
        api.get('/notes'),
        api.get('/evenements')
      ]);
      setNotes(notesRes.data.data || []);
      setEvenements(eventsRes.data.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedNote) {
        await api.put(`/notes/${selectedNote.id_note}`, formData);
        toast.success('Note mise à jour');
      } else {
        await api.post('/notes', formData);
        toast.success('Note créée');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note) => {
    setSelectedNote(note);
    setFormData({
      id_evenement: note.id_evenement || '',
      contenu_note: note.contenu_note
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette note ?')) return;

    try {
      await api.delete(`/notes/${id}`);
      toast.success('Note supprimée');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const resetForm = () => {
    setFormData({ id_evenement: '', contenu_note: '' });
    setSelectedNote(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMyNote = (note) => {
    return note.id_utilisateur === user?.id_utilisateur;
  };

  const filteredNotes = notes.filter(n =>
    n.contenu_note?.toLowerCase().includes(search.toLowerCase()) ||
    n.nom_evenement?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: notes.length,
    mesNotes: notes.filter(n => isMyNote(n)).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Notes</h1>
          <p className="text-gray-500">Notes collaboratives sur les événements</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouvelle note
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <p className="text-gray-500 text-sm">Total des notes</p>
          <p className="text-2xl font-bold text-gris-ardoise">{stats.total}</p>
        </div>
        <div className="card bg-green-50 border-2 border-green-200">
          <p className="text-green-700 text-sm font-semibold">Mes notes</p>
          <p className="text-2xl font-bold text-green-600">{stats.mesNotes}</p>
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-gray-600">Ma note (modifiable)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-300"></div>
          <span className="text-gray-600">Note d'un collègue (lecture seule)</span>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une note..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune note trouvée</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isMine = isMyNote(note);
            
            return (
              <div 
                key={note.id_note} 
                className={`card ${isMine ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <FileText className="w-5 h-5 text-green-600" />
                      {note.nom_evenement ? (
                        <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          {note.nom_evenement}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Note globale</span>
                      )}
                      {isMine && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Ma note
                        </span>
                      )}
                    </div>
                    <p className="text-gris-ardoise whitespace-pre-wrap">{note.contenu_note}</p>
                    <div className="mt-3 text-xs text-gray-400 flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(note.date_creation)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className={isMine ? 'font-semibold text-green-600' : ''}>
                          {isMine ? 'Moi' : `${note.auteur_prenom} ${note.auteur_nom}`}
                        </span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions seulement pour ses propres notes */}
                  {isMine && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(note)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-btn"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id_note)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-btn"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                {selectedNote ? 'Modifier ma note' : 'Nouvelle note'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Événement (optionnel)</label>
                <select
                  className="input-field"
                  value={formData.id_evenement}
                  onChange={(e) => setFormData({...formData, id_evenement: e.target.value})}
                >
                  <option value="">Note globale</option>
                  {evenements.map((event) => (
                    <option key={event.id_evenement} value={event.id_evenement}>
                      {event.nom_evenement}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Contenu de la note *</label>
                <textarea
                  className="input-field"
                  rows={5}
                  value={formData.contenu_note}
                  onChange={(e) => setFormData({...formData, contenu_note: e.target.value})}
                  required
                  placeholder="Écrivez votre note ici..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`btn-primary flex-1 ${saving ? 'opacity-50' : ''}`}
                >
                  {saving ? 'Enregistrement...' : selectedNote ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesEmploye;
