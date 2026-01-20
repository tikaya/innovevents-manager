import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Search, 
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  MessageSquare,
  Clock,
  Eye,
  X
} from 'lucide-react';
import api from '../../services/api';

const AvisAdmin = () => {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAvis, setSelectedAvis] = useState(null);

  const statuts = [
    { value: 'en_attente', label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'valide', label: 'Validé', color: 'bg-green-100 text-green-700' },
    { value: 'refuse', label: 'Refusé', color: 'bg-red-100 text-red-700' }
  ];

  useEffect(() => {
    fetchAvis();
  }, []);

  const fetchAvis = async () => {
    try {
      const response = await api.get('/avis');
      setAvis(response.data.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/avis/${id}/validate`);
      toast.success('Avis validé');
      fetchAvis();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Voulez-vous vraiment refuser cet avis ?')) return;
    
    try {
      await api.post(`/avis/${id}/reject`);
      toast.success('Avis refusé');
      fetchAvis();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du refus');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cet avis ?')) return;
    
    try {
      await api.delete(`/avis/${id}`);
      toast.success('Avis supprimé');
      fetchAvis();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const filteredAvis = avis.filter(a => {
    const matchSearch = 
      a.commentaire_avis?.toLowerCase().includes(search.toLowerCase()) ||
      a.nom_evenement?.toLowerCase().includes(search.toLowerCase()) ||
      a.nom_entreprise_client?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = !filterStatut || a.statut_avis === filterStatut;
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

  const renderStars = (note) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= note
                ? 'text-or fill-or'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-semibold text-gris-ardoise">{note}/5</span>
      </div>
    );
  };

  // Stats
  const stats = {
    enAttente: avis.filter(a => a.statut_avis === 'en_attente').length,
    valide: avis.filter(a => a.statut_avis === 'valide').length,
    refuse: avis.filter(a => a.statut_avis === 'refuse').length,
    moyenne: avis.filter(a => a.statut_avis === 'valide').length > 0 
      ? (avis.filter(a => a.statut_avis === 'valide').reduce((sum, a) => sum + a.note_avis, 0) / 
         avis.filter(a => a.statut_avis === 'valide').length).toFixed(1)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Avis clients</h1>
        <p className="text-gray-500">Modérez les avis de vos clients</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
            <p className="text-sm text-gray-500">En attente</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.valide}</p>
            <p className="text-sm text-gray-500">Validés</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.refuse}</p>
            <p className="text-sm text-gray-500">Refusés</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-or/20 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 text-or fill-or" />
          </div>
          <div>
            <p className="text-2xl font-bold text-or">{stats.moyenne}</p>
            <p className="text-sm text-gray-500">Note moyenne</p>
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
              placeholder="Rechercher par commentaire, événement, client..."
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

      {/* Liste */}
      <div className="space-y-4">
        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-bleu-royal border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredAvis.length === 0 ? (
          <div className="card text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun avis trouvé</p>
          </div>
        ) : (
          filteredAvis.map((item) => (
            <div 
              key={item.id_avis} 
              className={`card ${
                item.statut_avis === 'en_attente' ? 'border-l-4 border-l-yellow-500' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Contenu principal */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    {renderStars(item.note_avis)}
                    {getStatutBadge(item.statut_avis)}
                  </div>
                  
                  <p className="text-gris-ardoise mb-3">
                    "{item.commentaire_avis}"
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="font-semibold text-bleu-royal">
                      {item.prenom_contact} {item.nom_contact}
                    </span>
                    <span>•</span>
                    <span>{item.nom_entreprise_client}</span>
                    <span>•</span>
                    <span>{item.nom_evenement}</span>
                    <span>•</span>
                    <span>{formatDate(item.date_creation_avis)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setSelectedAvis(item); setShowDetailModal(true); }}
                    className="p-2 text-bleu-royal hover:bg-bleu-ciel rounded-btn"
                    title="Voir détails"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  {item.statut_avis === 'en_attente' && (
                    <>
                      <button
                        onClick={() => handleApprove(item.id_avis)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-btn"
                        title="Valider"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(item.id_avis)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-btn"
                        title="Refuser"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  
                  {item.statut_avis === 'refuse' && (
                    <button
                      onClick={() => handleApprove(item.id_avis)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-btn"
                      title="Valider"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  
                  {item.statut_avis === 'valide' && (
                    <button
                      onClick={() => handleReject(item.id_avis)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-btn"
                      title="Refuser"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(item.id_avis)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-btn"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Détails */}
      {showDetailModal && selectedAvis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-lg w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                Détails de l'avis
              </h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Note */}
              <div className="text-center py-4 bg-blanc-casse rounded-btn">
                {renderStars(selectedAvis.note_avis)}
              </div>

              {/* Commentaire */}
              <div>
                <label className="label">Commentaire</label>
                <p className="text-gris-ardoise bg-gray-50 p-4 rounded-btn">
                  "{selectedAvis.commentaire_avis}"
                </p>
              </div>

              {/* Infos */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="label">Client</label>
                  <p className="text-gris-ardoise">
                    {selectedAvis.prenom_contact} {selectedAvis.nom_contact}
                  </p>
                  <p className="text-gray-500">{selectedAvis.nom_entreprise_client}</p>
                </div>
                <div>
                  <label className="label">Événement</label>
                  <p className="text-gris-ardoise">{selectedAvis.nom_evenement}</p>
                  <p className="text-gray-500">{selectedAvis.type_evenement}</p>
                </div>
                <div>
                  <label className="label">Date de création</label>
                  <p className="text-gris-ardoise">{formatDate(selectedAvis.date_creation_avis)}</p>
                </div>
                <div>
                  <label className="label">Statut</label>
                  {getStatutBadge(selectedAvis.statut_avis)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedAvis.statut_avis !== 'valide' && (
                  <button
                    onClick={() => { handleApprove(selectedAvis.id_avis); setShowDetailModal(false); }}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Valider
                  </button>
                )}
                {selectedAvis.statut_avis !== 'refuse' && (
                  <button
                    onClick={() => { handleReject(selectedAvis.id_avis); setShowDetailModal(false); }}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="w-5 h-5" />
                    Refuser
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvisAdmin;
