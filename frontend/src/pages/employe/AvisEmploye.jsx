import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Star, Search, CheckCircle, XCircle, Eye, X, Calendar } from 'lucide-react';
import api from '../../services/api';

const AvisEmploye = () => {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('en_attente');
  const [showModal, setShowModal] = useState(false);
  const [selectedAvis, setSelectedAvis] = useState(null);

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

 const handleValider = async (id) => {
  try {
    await api.patch(`/avis/${id}/validate`);
    toast.success('Avis validé');
    fetchAvis();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur');
  }
};

const handleRefuser = async (id) => {
  if (!confirm('Refuser cet avis ?')) return;
  
  try {
    await api.patch(`/avis/${id}/reject`);
    toast.success('Avis refusé');
    fetchAvis();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur');
  }
};
  const handleViewDetail = (avisItem) => {
    setSelectedAvis(avisItem);
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

  const renderStars = (note) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= note ? 'text-or fill-or' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const getStatutBadge = (statut) => {
    const config = {
      en_attente: { color: 'bg-yellow-100 text-yellow-700', label: 'En attente' },
      valide: { color: 'bg-green-100 text-green-700', label: 'Validé' },
      refuse: { color: 'bg-red-100 text-red-700', label: 'Refusé' }
    };
    const { color, label } = config[statut] || config.en_attente;
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{label}</span>;
  };

  const filteredAvis = avis.filter(a => {
    const matchSearch = 
      a.nom_evenement?.toLowerCase().includes(search.toLowerCase()) ||
      a.commentaire_avis?.toLowerCase().includes(search.toLowerCase()) ||
      a.nom_entreprise_client?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = !filterStatut || a.statut_avis === filterStatut;
    return matchSearch && matchStatut;
  });

  const stats = {
    total: avis.length,
    en_attente: avis.filter(a => a.statut_avis === 'en_attente').length,
    valide: avis.filter(a => a.statut_avis === 'valide').length,
    refuse: avis.filter(a => a.statut_avis === 'refuse').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Modération des avis</h1>
        <p className="text-gray-500">Valider ou refuser les avis clients</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-gris-ardoise">{stats.total}</p>
        </div>
        <div className="card cursor-pointer hover:shadow-lg" onClick={() => setFilterStatut('en_attente')}>
          <p className="text-gray-500 text-sm">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.en_attente}</p>
        </div>
        <div className="card cursor-pointer hover:shadow-lg" onClick={() => setFilterStatut('valide')}>
          <p className="text-gray-500 text-sm">Validés</p>
          <p className="text-2xl font-bold text-green-600">{stats.valide}</p>
        </div>
        <div className="card cursor-pointer hover:shadow-lg" onClick={() => setFilterStatut('refuse')}>
          <p className="text-gray-500 text-sm">Refusés</p>
          <p className="text-2xl font-bold text-red-600">{stats.refuse}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un avis..."
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
          <option value="en_attente">En attente</option>
          <option value="valide">Validé</option>
          <option value="refuse">Refusé</option>
        </select>
      </div>

      {/* Avis */}
      <div className="space-y-4">
        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredAvis.length === 0 ? (
          <div className="card text-center py-12">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun avis trouvé</p>
          </div>
        ) : (
          filteredAvis.map((avisItem) => (
            <div key={avisItem.id_avis} className="card">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {renderStars(avisItem.note_avis)}
                    {getStatutBadge(avisItem.statut_avis)}
                  </div>
                  <p className="text-gris-ardoise line-clamp-2">{avisItem.commentaire_avis}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{avisItem.nom_entreprise_client}</span>
                    <span>•</span>
                    <span>{avisItem.nom_evenement}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(avisItem.date_avis)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewDetail(avisItem)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-btn"
                    title="Voir"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {avisItem.statut_avis === 'en_attente' && (
                    <>
                      <button
                        onClick={() => handleValider(avisItem.id_avis)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-btn"
                        title="Valider"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRefuser(avisItem.id_avis)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-btn"
                        title="Refuser"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Detail */}
      {showModal && selectedAvis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                Détail de l'avis
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                {renderStars(selectedAvis.note_avis)}
                {getStatutBadge(selectedAvis.statut_avis)}
              </div>

              <div>
                <p className="font-semibold text-gris-ardoise">Client</p>
                <p className="text-gray-600">{selectedAvis.nom_entreprise_client}</p>
              </div>

              <div>
                <p className="font-semibold text-gris-ardoise">Événement</p>
                <p className="text-gray-600">{selectedAvis.nom_evenement}</p>
              </div>

              <div>
                <p className="font-semibold text-gris-ardoise">Commentaire</p>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedAvis.commentaire_avis}</p>
              </div>

              <div className="text-sm text-gray-500">
                Déposé le {formatDate(selectedAvis.date_avis)}
              </div>

              {selectedAvis.statut_avis === 'en_attente' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => { handleRefuser(selectedAvis.id_avis); setShowModal(false); }}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Refuser
                  </button>
                  <button
                    onClick={() => { handleValider(selectedAvis.id_avis); setShowModal(false); }}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Valider
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvisEmploye;
