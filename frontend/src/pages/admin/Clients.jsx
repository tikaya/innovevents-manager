import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit,
  Trash2,
  Building,
  Mail,
  Phone,
  X,
  RefreshCw,
  UserCheck,
  UserX
} from 'lucide-react';
import api from '../../services/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    nom_entreprise_client: '',
    nom_contact: '',
    prenom_contact: '',
    email_client: '',
    telephone_client: '',
    adresse_client: '',
    code_postal_client: '',
    ville_client: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedClient(null);
    setFormData({
      nom_entreprise_client: '',
      nom_contact: '',
      prenom_contact: '',
      email_client: '',
      telephone_client: '',
      adresse_client: '',
      code_postal_client: '',
      ville_client: ''
    });
    setShowFormModal(true);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setFormData({
      nom_entreprise_client: client.nom_entreprise_client || '',
      nom_contact: client.nom_contact || '',
      prenom_contact: client.prenom_contact || '',
      email_client: client.email_client || '',
      telephone_client: client.telephone_client || '',
      adresse_client: client.adresse_client || '',
      code_postal_client: client.code_postal_client || '',
      ville_client: client.ville_client || ''
    });
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce client ? Son compte utilisateur sera également supprimé.')) return;
    
    try {
      await api.delete(`/clients/${id}`);
      toast.success('Client supprimé avec succès');
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleResetPassword = async (client) => {
    if (!client.id_utilisateur) {
      toast.error('Ce client n\'a pas de compte utilisateur');
      return;
    }
    
    if (!confirm(`Réinitialiser le mot de passe de ${client.prenom_contact} ${client.nom_contact} ? Un email sera envoyé.`)) return;

    try {
      await api.post(`/clients/${client.id_client}/reset-password`);
      toast.success('Nouveau mot de passe envoyé par email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedClient) {
        await api.put(`/clients/${selectedClient.id_client}`, formData);
        toast.success('Client modifié avec succès');
      } else {
        await api.post('/clients', formData);
        toast.success('Client créé ! Un email avec les identifiants a été envoyé.');
      }
      setShowFormModal(false);
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const filteredClients = clients.filter(c => {
    return c.nom_entreprise_client?.toLowerCase().includes(search.toLowerCase()) ||
           c.email_client?.toLowerCase().includes(search.toLowerCase()) ||
           c.nom_contact?.toLowerCase().includes(search.toLowerCase());
  });

  // Stats
  const stats = {
    total: clients.length,
    avecCompte: clients.filter(c => c.id_utilisateur).length,
    sansCompte: clients.filter(c => !c.id_utilisateur).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">
            Clients
          </h1>
          <p className="text-gray-500">Gérez votre portefeuille clients ({clients.length})</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouveau client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-gray-500 text-sm">Total clients</p>
          <p className="text-2xl font-bold text-bleu-royal">{stats.total}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            <p className="text-gray-500 text-sm">Avec compte</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.avecCompte}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-500" />
            <p className="text-gray-500 text-sm">Sans compte</p>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.sansCompte}</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, entreprise..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-bleu-royal border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun client trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bleu-ciel">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Entreprise</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Téléphone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Compte</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map((client) => (
                  <tr key={client.id_client} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gris-ardoise">{client.nom_entreprise_client}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {client.prenom_contact} {client.nom_contact}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{client.email_client}</td>
                    <td className="px-4 py-3 text-sm">{client.telephone_client || '-'}</td>
                    <td className="px-4 py-3">
                      {client.id_utilisateur ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <UserCheck className="w-3 h-3" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
                          <UserX className="w-3 h-3" />
                          Aucun
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setSelectedClient(client); setShowModal(true); }}
                          className="p-2 text-bleu-royal hover:bg-bleu-ciel rounded-btn"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-or hover:bg-yellow-50 rounded-btn"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {client.id_utilisateur && (
                          <button
                            onClick={() => handleResetPassword(client)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-btn"
                            title="Réinitialiser mot de passe"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(client.id_client)}
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
      {showModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-lg w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                {selectedClient.nom_entreprise_client}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Statut compte */}
              <div className="flex items-center justify-between p-3 rounded-btn bg-blanc-casse">
                <span className="text-sm text-gray-600">Statut du compte</span>
                {selectedClient.id_utilisateur ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    <UserCheck className="w-4 h-4" />
                    Compte actif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                    <UserX className="w-4 h-4" />
                    Pas de compte
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{selectedClient.email_client}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedClient.telephone_client || '-'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Contact :</p>
                <p className="text-gray-600">{selectedClient.prenom_contact} {selectedClient.nom_contact}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Adresse :</p>
                <p className="text-gray-600">
                  {selectedClient.adresse_client || '-'}<br />
                  {selectedClient.code_postal_client} {selectedClient.ville_client}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <button
                  onClick={() => { setShowModal(false); handleEdit(selectedClient); }}
                  className="btn-primary flex-1"
                >
                  Modifier
                </button>
                {selectedClient.id_utilisateur && (
                  <button
                    onClick={() => { handleResetPassword(selectedClient); }}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset MDP
                  </button>
                )}
                <Link
                  to={`/admin/evenements?client=${selectedClient.id_client}`}
                  className="btn-secondary flex-1 text-center"
                >
                  Voir événements
                </Link>
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
                {selectedClient ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Note pour création */}
              {!selectedClient && (
                <div className="bg-blue-50 border border-blue-200 rounded-btn p-4">
                  <p className="text-sm text-blue-700">
                    <strong>📧 Note :</strong> Un compte utilisateur sera automatiquement créé pour ce client. 
                    Un email avec les identifiants de connexion lui sera envoyé.
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Nom de l'entreprise *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.nom_entreprise_client}
                    onChange={(e) => setFormData({...formData, nom_entreprise_client: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">Prénom du contact *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.prenom_contact}
                    onChange={(e) => setFormData({...formData, prenom_contact: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">Nom du contact *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.nom_contact}
                    onChange={(e) => setFormData({...formData, nom_contact: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email_client}
                    onChange={(e) => setFormData({...formData, email_client: e.target.value})}
                    required
                  />
                  {!selectedClient && (
                    <p className="text-xs text-gray-500 mt-1">Cet email sera utilisé pour la connexion</p>
                  )}
                </div>
                <div>
                  <label className="label">Téléphone</label>
                  <input
                    type="tel"
                    className="input-field"
                    value={formData.telephone_client}
                    onChange={(e) => setFormData({...formData, telephone_client: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Adresse</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.adresse_client}
                    onChange={(e) => setFormData({...formData, adresse_client: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Code postal</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.code_postal_client}
                    onChange={(e) => setFormData({...formData, code_postal_client: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Ville</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.ville_client}
                    onChange={(e) => setFormData({...formData, ville_client: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowFormModal(false)} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className={`btn-primary flex-1 ${saving ? 'opacity-50' : ''}`}>
                  {saving ? 'Enregistrement...' : selectedClient ? 'Modifier' : 'Créer le client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
