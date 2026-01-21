import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Search, 
  Plus, 
  Eye, 
  EyeOff,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  X,
  Globe,
  Lock
} from 'lucide-react';
import api from '../../services/api';

const EvenementsAdmin = () => {
  const [evenements, setEvenements] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nom_evenement: '',
    date_debut: '',
    heure_debut: '',
    date_fin: '',
    heure_fin: '',
    lieu_evenement: '',
    type_evenement: '',
    theme_evenement: '',
    statut_evenement: 'brouillon',
    id_client: '',
    visible_public: false,
    accord_client_affichage: false
  });

  const statuts = [
    { value: 'brouillon', label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
    { value: 'en_attente', label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'accepte', label: 'Accepté', color: 'bg-blue-100 text-blue-700' },
    { value: 'en_cours', label: 'En cours', color: 'bg-purple-100 text-purple-700' },
    { value: 'termine', label: 'Terminé', color: 'bg-green-100 text-green-700' },
    { value: 'annule', label: 'Annulé', color: 'bg-red-100 text-red-700' }
  ];

  const types = ['Seminaire', 'Conference', 'Soiree', 'Team building', 'Lancement', 'Gala', 'Autre'];

  useEffect(() => {
    fetchEvenements();
    fetchClients();
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

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.data || []);
    } catch (err) {
      console.error('Erreur clients:', err);
    }
  };

  const handleCreate = () => {
    setSelectedEvent(null);
    setFormData({
      nom_evenement: '',
      date_debut: '',
      heure_debut: '09:00',
      date_fin: '',
      heure_fin: '18:00',
      lieu_evenement: '',
      type_evenement: '',
      theme_evenement: '',
      statut_evenement: 'brouillon',
      id_client: '',
      visible_public: false,
      accord_client_affichage: false
    });
    setShowFormModal(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setFormData({
      nom_evenement: event.nom_evenement || '',
      date_debut: event.date_debut ? event.date_debut.split('T')[0] : '',
      heure_debut: event.heure_debut || '09:00',
      date_fin: event.date_fin ? event.date_fin.split('T')[0] : '',
      heure_fin: event.heure_fin || '18:00',
      lieu_evenement: event.lieu_evenement || '',
      type_evenement: event.type_evenement || '',
      theme_evenement: event.theme_evenement || '',
      statut_evenement: event.statut_evenement || 'brouillon',
      id_client: event.id_client || '',
      visible_public: event.visible_public || false,
      accord_client_affichage: event.accord_client_affichage || false
    });
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return;
    
    try {
      await api.delete(`/evenements/${id}`);
      toast.success('Événement supprimé avec succès');
      fetchEvenements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        id_client: formData.id_client ? parseInt(formData.id_client) : null,
        visible_public: formData.accord_client_affichage ? formData.visible_public : false
      };

      if (selectedEvent) {
        await api.put(`/evenements/${selectedEvent.id_evenement}`, payload);
        toast.success('Événement modifié avec succès');
      } else {
        await api.post('/evenements', payload);
        toast.success('Événement créé avec succès');
      }
      setShowFormModal(false);
      fetchEvenements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const filteredEvents = evenements.filter(e => {
    const matchSearch = 
      e.nom_evenement?.toLowerCase().includes(search.toLowerCase()) ||
      e.nom_entreprise_client?.toLowerCase().includes(search.toLowerCase()) ||
      e.lieu_evenement?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = !filterStatut || e.statut_evenement === filterStatut;
    return matchSearch && matchStatut;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatutBadge = (statut) => {
    const s = statuts.find(st => st.value === statut);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s?.color || 'bg-gray-100'}`}>
        {s?.label || statut}
      </span>
    );
  };

  const getVisibilityBadge = (event) => {
    if (event.visible_public && event.accord_client_affichage) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
          <Globe className="w-3 h-3" />
          Public
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 flex items-center gap-1">
        <Lock className="w-3 h-3" />
        Privé
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Événements</h1>
          <p className="text-gray-500">Gérez vos événements ({evenements.length})</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouvel événement
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, client, lieu..."
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
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-bleu-royal border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun événement trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bleu-ciel">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Événement</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Lieu</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Visibilité</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.map((event) => (
                  <tr key={event.id_evenement} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gris-ardoise">{event.nom_evenement}</p>
                      <p className="text-sm text-gray-500">{event.type_evenement}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{event.nom_entreprise_client || '-'}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(event.date_debut)}</td>
                    <td className="px-4 py-3 text-sm">{event.lieu_evenement || '-'}</td>
                    <td className="px-4 py-3">{getStatutBadge(event.statut_evenement)}</td>
                    <td className="px-4 py-3">{getVisibilityBadge(event)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedEvent(event); setShowModal(true); }}
                          className="p-2 text-bleu-royal hover:bg-bleu-ciel rounded-btn"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-2 text-or hover:bg-yellow-50 rounded-btn"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id_evenement)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-btn"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-lg w-full">
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
                <div className="flex items-center gap-2">
                  {getStatutBadge(selectedEvent.statut_evenement)}
                  {getVisibilityBadge(selectedEvent)}
                </div>
                <span className="text-sm text-gray-500">{selectedEvent.type_evenement}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(selectedEvent.date_debut)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selectedEvent.lieu_evenement || '-'}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Client :</p>
                <p className="text-gray-600">{selectedEvent.nom_entreprise_client || '-'}</p>
              </div>

              {selectedEvent.theme_evenement && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Thème :</p>
                  <p className="text-gray-600">{selectedEvent.theme_evenement}</p>
                </div>
              )}

              {/* Infos visibilité */}
              <div className="p-3 bg-gray-50 rounded-btn">
                <p className="text-sm font-semibold text-gray-700 mb-2">Visibilité :</p>
                <div className="flex items-center gap-2 text-sm">
                  {selectedEvent.accord_client_affichage ? (
                    <span className="text-green-600">✓ Accord client obtenu</span>
                  ) : (
                    <span className="text-gray-500">✗ Accord client non obtenu</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  {selectedEvent.visible_public ? (
                    <span className="text-green-600">✓ Visible sur la page événements</span>
                  ) : (
                    <span className="text-gray-500">✗ Non visible publiquement</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => { setShowModal(false); handleEdit(selectedEvent); }}
                  className="btn-primary flex-1"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Formulaire */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                {selectedEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Nom de l'événement *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.nom_evenement}
                    onChange={(e) => setFormData({...formData, nom_evenement: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="label">Client</label>
                  <select
                    className="input-field"
                    value={formData.id_client}
                    onChange={(e) => setFormData({...formData, id_client: e.target.value})}
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map(c => (
                      <option key={c.id_client} value={c.id_client}>
                        {c.nom_entreprise_client}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Type d'événement</label>
                  <select
                    className="input-field"
                    value={formData.type_evenement}
                    onChange={(e) => setFormData({...formData, type_evenement: e.target.value})}
                  >
                    <option value="">Sélectionner</option>
                    {types.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Date de début *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.date_debut}
                    onChange={(e) => setFormData({...formData, date_debut: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="label">Heure de début</label>
                  <input
                    type="time"
                    className="input-field"
                    value={formData.heure_debut}
                    onChange={(e) => setFormData({...formData, heure_debut: e.target.value})}
                  />
                </div>

                <div>
                  <label className="label">Date de fin</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.date_fin}
                    onChange={(e) => setFormData({...formData, date_fin: e.target.value})}
                  />
                </div>

                <div>
                  <label className="label">Heure de fin</label>
                  <input
                    type="time"
                    className="input-field"
                    value={formData.heure_fin}
                    onChange={(e) => setFormData({...formData, heure_fin: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Lieu</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.lieu_evenement}
                    onChange={(e) => setFormData({...formData, lieu_evenement: e.target.value})}
                  />
                </div>

                <div>
                  <label className="label">Thème</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.theme_evenement}
                    onChange={(e) => setFormData({...formData, theme_evenement: e.target.value})}
                  />
                </div>

                <div>
                  <label className="label">Statut</label>
                  <select
                    className="input-field"
                    value={formData.statut_evenement}
                    onChange={(e) => setFormData({...formData, statut_evenement: e.target.value})}
                  >
                    {statuts.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* ✅ Section Visibilité publique */}
                <div className="md:col-span-2 space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-bleu-royal" />
                    <p className="text-sm font-semibold text-bleu-royal">Visibilité sur la page Événements</p>
                  </div>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-bleu-royal focus:ring-bleu-royal"
                      checked={formData.accord_client_affichage}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData, 
                          accord_client_affichage: checked,
                          visible_public: checked ? formData.visible_public : false
                        });
                      }}
                    />
                    <span className="text-sm text-gray-700">
                      Le client a donné son accord pour l'affichage public
                    </span>
                  </label>
                  
                  <label className={`flex items-center gap-3 ${!formData.accord_client_affichage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-bleu-royal focus:ring-bleu-royal"
                      checked={formData.visible_public}
                      onChange={(e) => setFormData({...formData, visible_public: e.target.checked})}
                      disabled={!formData.accord_client_affichage}
                    />
                    <span className={`text-sm ${!formData.accord_client_affichage ? 'text-gray-400' : 'text-gray-700'}`}>
                      Rendre visible sur la page Événements publique
                    </span>
                  </label>
                  
                  {!formData.accord_client_affichage && (
                    <p className="text-xs text-blue-600 italic flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      L'accord du client est requis pour rendre l'événement visible publiquement
                    </p>
                  )}

                  {formData.visible_public && formData.accord_client_affichage && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Cet événement sera visible sur la page publique (si le statut n'est pas "Brouillon")
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowFormModal(false)} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className={`btn-primary flex-1 ${saving ? 'opacity-50' : ''}`}>
                  {saving ? 'Enregistrement...' : selectedEvent ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvenementsAdmin;