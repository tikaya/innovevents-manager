import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Search, 
  Eye, 
  UserCheck,
  X,
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';
import api from '../../services/api';

const Prospects = () => {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [converting, setConverting] = useState(false);

  const [convertData, setConvertData] = useState({
    nom_entreprise_client: '',
    prenom_contact: '',
    nom_contact: '',
    email_client: '',
    telephone_client: '',
    ville_client: '',
    nom_evenement: '',
    date_debut: '',
    lieu_evenement: '',
    type_evenement: ''
  });

  const statuts = [
    { value: 'a_contacter', label: 'À contacter', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'converti', label: 'Converti', color: 'bg-green-100 text-green-700' },
    { value: 'echoue', label: 'Échoué', color: 'bg-red-100 text-red-700' }
  ];

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      const response = await api.get('/prospects');
      setProspects(response.data.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des prospects');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (prospect) => {
    setSelectedProspect(prospect);
    setShowDetailModal(true);
  };

  const handleOpenConvert = (prospect) => {
    setSelectedProspect(prospect);
    setConvertData({
      nom_entreprise_client: prospect.nom_entreprise || '',
      prenom_contact: prospect.prenom_prospect || '',
      nom_contact: prospect.nom_prospect || '',
      email_client: prospect.email_prospect || '',
      telephone_client: prospect.telephone_prospect || '',
      ville_client: prospect.lieu_souhaite || '',
      nom_evenement: `${prospect.type_evenement_souhaite} - ${prospect.nom_entreprise}`,
      date_debut: prospect.date_souhaitee ? prospect.date_souhaitee.split('T')[0] : '',
      lieu_evenement: prospect.lieu_souhaite || '',
      type_evenement: prospect.type_evenement_souhaite || ''
    });
    setShowConvertModal(true);
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    setConverting(true);

    try {
      await api.post(`/prospects/${selectedProspect.id_prospect}/convert`, convertData);
      toast.success('Prospect converti en client avec succès !');
      setShowConvertModal(false);
      fetchProspects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la conversion');
    } finally {
      setConverting(false);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Voulez-vous vraiment marquer ce prospect comme échoué ?')) return;

    try {
      await api.patch(`/prospects/${id}/reject`, { message_echec: 'Refusé par l\'administrateur' });
      toast.success('Prospect marqué comme échoué');
      fetchProspects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du rejet');
    }
  };

  const filteredProspects = prospects.filter(p => {
    const matchSearch = 
      p.nom_entreprise?.toLowerCase().includes(search.toLowerCase()) ||
      p.nom_prospect?.toLowerCase().includes(search.toLowerCase()) ||
      p.email_prospect?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = !filterStatut || p.statut_prospect === filterStatut;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Prospects</h1>
        <p className="text-gray-500">Gérez les demandes de devis ({prospects.length})</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, entreprise, email..."
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
        ) : filteredProspects.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun prospect trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bleu-ciel">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Entreprise</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Date souhaitée</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProspects.map((prospect) => (
                  <tr key={prospect.id_prospect} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gris-ardoise">{prospect.nom_entreprise}</p>
                      <p className="text-sm text-gray-500">{prospect.email_prospect}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {prospect.prenom_prospect} {prospect.nom_prospect}
                    </td>
                    <td className="px-4 py-3 text-sm">{prospect.type_evenement_souhaite}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(prospect.date_souhaitee)}</td>
                    <td className="px-4 py-3">{getStatutBadge(prospect.statut_prospect)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(prospect)}
                          className="p-2 text-bleu-royal hover:bg-bleu-ciel rounded-btn"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {prospect.statut_prospect === 'a_contacter' && (
                          <>
                            <button
                              onClick={() => handleOpenConvert(prospect)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-btn"
                              title="Convertir en client"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(prospect.id_prospect)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-btn"
                              title="Refuser"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
      {showDetailModal && selectedProspect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                {selectedProspect.nom_entreprise}
              </h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                {getStatutBadge(selectedProspect.statut_prospect)}
                <span className="text-sm text-gray-500">{formatDate(selectedProspect.date_creation_prospect)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{selectedProspect.email_prospect}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedProspect.telephone_prospect}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selectedProspect.lieu_souhaite}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{selectedProspect.nb_participants} participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(selectedProspect.date_souhaitee)}</span>
                </div>
              </div>

              <div>
                <label className="label">Description du besoin</label>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-btn text-sm">
                  {selectedProspect.description_besoin || 'Aucune description'}
                </p>
              </div>

              {selectedProspect.statut_prospect === 'a_contacter' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => { setShowDetailModal(false); handleOpenConvert(selectedProspect); }}
                    className="btn-primary flex-1"
                  >
                    Convertir en client
                  </button>
                  <button
                    onClick={() => { setShowDetailModal(false); handleReject(selectedProspect.id_prospect); }}
                    className="btn-secondary flex-1"
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Conversion */}
      {showConvertModal && selectedProspect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                Convertir en client
              </h2>
              <button onClick={() => setShowConvertModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleConvert} className="p-6 space-y-6">
              {/* Infos client */}
              <div>
                <h3 className="font-semibold text-gris-ardoise mb-4">Informations client</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Entreprise *</label>
                    <input
                      type="text"
                      className="input-field"
                      value={convertData.nom_entreprise_client}
                      onChange={(e) => setConvertData({...convertData, nom_entreprise_client: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Prénom *</label>
                    <input
                      type="text"
                      className="input-field"
                      value={convertData.prenom_contact}
                      onChange={(e) => setConvertData({...convertData, prenom_contact: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Nom *</label>
                    <input
                      type="text"
                      className="input-field"
                      value={convertData.nom_contact}
                      onChange={(e) => setConvertData({...convertData, nom_contact: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      className="input-field"
                      value={convertData.email_client}
                      onChange={(e) => setConvertData({...convertData, email_client: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Téléphone</label>
                    <input
                      type="tel"
                      className="input-field"
                      value={convertData.telephone_client}
                      onChange={(e) => setConvertData({...convertData, telephone_client: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Infos événement */}
              <div>
                <h3 className="font-semibold text-gris-ardoise mb-4">Premier événement</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Nom de l'événement *</label>
                    <input
                      type="text"
                      className="input-field"
                      value={convertData.nom_evenement}
                      onChange={(e) => setConvertData({...convertData, nom_evenement: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Date *</label>
                    <input
                      type="date"
                      className="input-field"
                      value={convertData.date_debut}
                      onChange={(e) => setConvertData({...convertData, date_debut: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Lieu</label>
                    <input
                      type="text"
                      className="input-field"
                      value={convertData.lieu_evenement}
                      onChange={(e) => setConvertData({...convertData, lieu_evenement: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="label">Type</label>
                    <select
                      className="input-field"
                      value={convertData.type_evenement}
                      onChange={(e) => setConvertData({...convertData, type_evenement: e.target.value})}
                    >
                      <option value="">Sélectionner</option>
                      <option value="Seminaire">Séminaire</option>
                      <option value="Conference">Conférence</option>
                      <option value="Soiree">Soirée d'entreprise</option>
                      <option value="Team building">Team building</option>
                      <option value="Lancement">Lancement de produit</option>
                      <option value="Gala">Gala</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowConvertModal(false)} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" disabled={converting} className={`btn-primary flex-1 ${converting ? 'opacity-50' : ''}`}>
                  {converting ? 'Conversion...' : 'Convertir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prospects;