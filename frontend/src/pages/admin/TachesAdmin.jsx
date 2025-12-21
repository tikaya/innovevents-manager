import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Search, 
  Plus, 
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  X
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TachesAdmin = () => {
  const { user } = useAuth();
  const [taches, setTaches] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterAssigne, setFilterAssigne] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTache, setSelectedTache] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    titre_tache: '',
    description_tache: '',
    statut_tache: 'a_faire',
    date_echeance: '',
    id_evenement: '',
    id_utilisateur: ''
  });

  const statuts = [
    { value: 'a_faire', label: 'À faire', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    { value: 'en_cours', label: 'En cours', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    { value: 'termine', label: 'Terminé', color: 'bg-green-100 text-green-700', icon: CheckCircle }
  ];

  useEffect(() => {
    fetchTaches();
    fetchEvenements();
    fetchEmployes();
  }, []);

  const fetchTaches = async () => {
    try {
      const response = await api.get('/taches');
      setTaches(response.data.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvenements = async () => {
    try {
      const response = await api.get('/evenements');
      setEvenements(response.data.data || []);
    } catch (err) {
      console.error('Erreur événements:', err);
    }
  };

  const fetchEmployes = async () => {
    try {
      const response = await api.get('/employes');
      setEmployes(response.data.data || []);
    } catch (err) {
      console.error('Erreur employés:', err);
    }
  };

  const handleCreate = () => {
    setSelectedTache(null);
    setFormData({
      titre_tache: '',
      description_tache: '',
      statut_tache: 'a_faire',
      date_echeance: '',
      id_evenement: '',
      id_utilisateur: user.id_utilisateur // Par défaut assigné à l'admin
    });
    setShowFormModal(true);
  };

  const handleEdit = (tache) => {
    setSelectedTache(tache);
    setFormData({
      titre_tache: tache.titre_tache || '',
      description_tache: tache.description_tache || '',
      statut_tache: tache.statut_tache || 'a_faire',
      date_echeance: tache.date_echeance ? tache.date_echeance.split('T')[0] : '',
      id_evenement: tache.id_evenement || '',
      id_utilisateur: tache.id_utilisateur || user.id_utilisateur
    });
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cette tâche ?')) return;
    
    try {
      await api.delete(`/taches/${id}`);
      toast.success('Tâche supprimée avec succès');
      fetchTaches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleStatut = async (tache) => {
    const nextStatut = {
      'a_faire': 'en_cours',
      'en_cours': 'termine',
      'termine': 'a_faire'
    };

    try {
      await api.put(`/taches/${tache.id_tache}`, {
        ...tache,
        statut_tache: nextStatut[tache.statut_tache]
      });
      toast.success('Statut mis à jour');
      fetchTaches();
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        titre_tache: formData.titre_tache,
        description_tache: formData.description_tache,
        statut_tache: formData.statut_tache,
        date_echeance: formData.date_echeance || null,
        id_evenement: formData.id_evenement ? parseInt(formData.id_evenement) : null,
        id_utilisateur: formData.id_utilisateur ? parseInt(formData.id_utilisateur) : user.id_utilisateur
      };

      if (selectedTache) {
        await api.put(`/taches/${selectedTache.id_tache}`, payload);
        toast.success('Tâche modifiée avec succès');
      } else {
        await api.post('/taches', payload);
        toast.success('Tâche créée avec succès');
      }
      setShowFormModal(false);
      fetchTaches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  // Liste des assignés (admin + employés)
  const assignesList = [
    { id: user.id_utilisateur, label: `${user.prenom} ${user.nom} (Moi)` },
    ...employes.map(e => ({
      id: e.id_utilisateur,
      label: `${e.prenom} ${e.nom}`
    }))
  ];

  const filteredTaches = taches.filter(t => {
    const matchSearch = 
      t.titre_tache?.toLowerCase().includes(search.toLowerCase()) ||
      t.nom_evenement?.toLowerCase().includes(search.toLowerCase()) ||
      t.assignee_prenom?.toLowerCase().includes(search.toLowerCase()) ||
      t.assignee_nom?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = !filterStatut || t.statut_tache === filterStatut;
    const matchAssigne = !filterAssigne || t.id_utilisateur === parseInt(filterAssigne);
    return matchSearch && matchStatut && matchAssigne;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date() && dateString;
  };

  const getStatutBadge = (statut) => {
    const s = statuts.find(st => st.value === statut);
    const Icon = s?.icon || AlertCircle;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${s?.color || 'bg-gray-100'}`}>
        <Icon className="w-3 h-3" />
        {s?.label || statut}
      </span>
    );
  };

  // Stats
  const stats = {
    total: taches.length,
    aFaire: taches.filter(t => t.statut_tache === 'a_faire').length,
    enCours: taches.filter(t => t.statut_tache === 'en_cours').length,
    termine: taches.filter(t => t.statut_tache === 'termine').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Tâches</h1>
          <p className="text-gray-500">Gérez et assignez les tâches de vos événements</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouvelle tâche
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-bleu-ciel rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-bleu-royal" />
          </div>
          <div>
            <p className="text-2xl font-bold text-bleu-royal">{stats.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.aFaire}</p>
            <p className="text-sm text-gray-500">À faire</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{stats.enCours}</p>
            <p className="text-sm text-gray-500">En cours</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.termine}</p>
            <p className="text-sm text-gray-500">Terminées</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, événement, assigné..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-field md:w-48"
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            {statuts.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            className="input-field md:w-48"
            value={filterAssigne}
            onChange={(e) => setFilterAssigne(e.target.value)}
          >
            <option value="">Tous les assignés</option>
            {assignesList.map(a => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-bleu-royal border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredTaches.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune tâche trouvée</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTaches.map((tache) => (
              <div 
                key={tache.id_tache} 
                className={`p-4 hover:bg-gray-50 flex items-center gap-4 ${
                  isOverdue(tache.date_echeance) && tache.statut_tache !== 'termine' 
                    ? 'bg-red-50' 
                    : ''
                }`}
              >
                {/* Checkbox statut */}
                <button
                  onClick={() => handleToggleStatut(tache)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    tache.statut_tache === 'termine'
                      ? 'bg-green-500 border-green-500 text-white'
                      : tache.statut_tache === 'en_cours'
                      ? 'bg-yellow-500 border-yellow-500 text-white'
                      : 'border-gray-300 hover:border-bleu-royal'
                  }`}
                >
                  {tache.statut_tache === 'termine' && <CheckCircle className="w-4 h-4" />}
                  {tache.statut_tache === 'en_cours' && <Clock className="w-4 h-4" />}
                </button>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-semibold ${tache.statut_tache === 'termine' ? 'line-through text-gray-400' : 'text-gris-ardoise'}`}>
                      {tache.titre_tache}
                    </p>
                    {getStatutBadge(tache.statut_tache)}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{tache.description_tache}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    {tache.nom_evenement && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {tache.nom_evenement}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="font-semibold text-bleu-royal">
                        {tache.assignee_prenom} {tache.assignee_nom}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Date échéance */}
                <div className={`text-right flex-shrink-0 ${
                  isOverdue(tache.date_echeance) && tache.statut_tache !== 'termine'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}>
                  <p className="text-sm font-semibold">{formatDate(tache.date_echeance)}</p>
                  {isOverdue(tache.date_echeance) && tache.statut_tache !== 'termine' && (
                    <p className="text-xs">En retard</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(tache)}
                    className="p-2 text-or hover:bg-yellow-50 rounded-btn"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tache.id_tache)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-btn"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                {selectedTache ? 'Modifier la tâche' : 'Nouvelle tâche'}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Titre *</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.titre_tache}
                  onChange={(e) => setFormData({...formData, titre_tache: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={formData.description_tache}
                  onChange={(e) => setFormData({...formData, description_tache: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Statut</label>
                  <select
                    className="input-field"
                    value={formData.statut_tache}
                    onChange={(e) => setFormData({...formData, statut_tache: e.target.value})}
                  >
                    {statuts.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Date d'échéance</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.date_echeance}
                    onChange={(e) => setFormData({...formData, date_echeance: e.target.value})}
                  />
                </div>
              </div>

              {/* Assigné */}
              <div>
                <label className="label flex items-center gap-2">
                  <User className="w-4 h-4 text-bleu-royal" />
                  Assigner à *
                </label>
                <select
                  className="input-field"
                  value={formData.id_utilisateur}
                  onChange={(e) => setFormData({...formData, id_utilisateur: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un assigné</option>
                  <option value={user.id_utilisateur}>Moi ({user.prenom} {user.nom})</option>
                  {employes.map(e => (
                    <option key={e.id_utilisateur} value={e.id_utilisateur}>
                      {e.prenom} {e.nom} (Employé)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  L'assigné pourra modifier le statut de cette tâche depuis son espace
                </p>
              </div>

              <div>
                <label className="label">Événement lié</label>
                <select
                  className="input-field"
                  value={formData.id_evenement}
                  onChange={(e) => setFormData({...formData, id_evenement: e.target.value})}
                >
                  <option value="">Aucun (tâche globale)</option>
                  {evenements.map(e => (
                    <option key={e.id_evenement} value={e.id_evenement}>
                      {e.nom_evenement}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowFormModal(false)} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className={`btn-primary flex-1 ${saving ? 'opacity-50' : ''}`}>
                  {saving ? 'Enregistrement...' : selectedTache ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TachesAdmin;
