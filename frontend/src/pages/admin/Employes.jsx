import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  UserCog, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  X,
  Eye,
  RefreshCw,
  Mail,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../../services/api';

const Employes = () => {
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    nom_utilisateur: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployes();
  }, []);

  const fetchEmployes = async () => {
    try {
      const response = await api.get('/employes');
      setEmployes(response.data.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedEmploye) {
        await api.put(`/employes/${selectedEmploye.id_utilisateur}`, formData);
        toast.success('Employé mis à jour');
      } else {
        await api.post('/employes', formData);
        toast.success('Employé créé. Un email avec le mot de passe a été envoyé.');
      }
      setShowModal(false);
      resetForm();
      fetchEmployes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employe) => {
    setSelectedEmploye(employe);
    setFormData({
      email: employe.email,
      nom: employe.nom,
      prenom: employe.prenom,
      nom_utilisateur: employe.nom_utilisateur,
      statut_utilisateur: employe.statut_utilisateur
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet employé ?')) return;

    try {
      await api.delete(`/employes/${id}`);
      toast.success('Employé supprimé');
      fetchEmployes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleResetPassword = async (id) => {
    if (!confirm('Réinitialiser le mot de passe ? Un email sera envoyé.')) return;

    try {
      await api.post(`/employes/${id}/reset-password`);
      toast.success('Nouveau mot de passe envoyé par email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleViewDetail = (employe) => {
    setSelectedEmploye(employe);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({ email: '', nom: '', prenom: '', nom_utilisateur: '' });
    setSelectedEmploye(null);
  };

  const openCreateModal = () => {
    resetForm();
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

  const filteredEmployes = employes.filter(e => 
    e.nom?.toLowerCase().includes(search.toLowerCase()) ||
    e.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.nom_utilisateur?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Employés</h1>
          <p className="text-gray-500">Gérer les comptes employés</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouvel employé
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total</p>
              <p className="text-2xl font-bold text-bleu-royal">{employes.length}</p>
            </div>
            <UserCog className="w-8 h-8 text-bleu-royal" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Actifs</p>
              <p className="text-2xl font-bold text-green-600">
                {employes.filter(e => e.statut_utilisateur === 'actif').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Inactifs</p>
              <p className="text-2xl font-bold text-red-500">
                {employes.filter(e => e.statut_utilisateur === 'inactif').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">MDP à changer</p>
              <p className="text-2xl font-bold text-or">
                {employes.filter(e => e.doit_changer_mdp).length}
              </p>
            </div>
            <RefreshCw className="w-8 h-8 text-or" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un employé..."
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
        ) : filteredEmployes.length === 0 ? (
          <div className="text-center py-12">
            <UserCog className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun employé trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bleu-ciel">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Employé</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Username</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Créé le</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-bleu-royal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEmployes.map((employe) => (
                  <tr key={employe.id_utilisateur} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-bleu-royal flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {employe.prenom?.charAt(0)}{employe.nom?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gris-ardoise">
                            {employe.prenom} {employe.nom}
                          </p>
                          {employe.doit_changer_mdp && (
                            <span className="text-xs text-or">MDP à changer</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{employe.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">@{employe.nom_utilisateur}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        employe.statut_utilisateur === 'actif' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {employe.statut_utilisateur === 'actif' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(employe.date_creation)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(employe)}
                          className="p-2 text-bleu-royal hover:bg-bleu-ciel rounded-btn"
                          title="Détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(employe)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-btn"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(employe.id_utilisateur)}
                          className="p-2 text-or hover:bg-yellow-50 rounded-btn"
                          title="Réinitialiser MDP"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employe.id_utilisateur)}
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

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                {selectedEmploye ? 'Modifier l\'employé' : 'Nouvel employé'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Prénom *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">Nom *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="label">Nom d'utilisateur</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Généré automatiquement si vide"
                  value={formData.nom_utilisateur}
                  onChange={(e) => setFormData({...formData, nom_utilisateur: e.target.value})}
                />
              </div>

              {selectedEmploye && (
                <div>
                  <label className="label">Statut</label>
                  <select
                    className="input-field"
                    value={formData.statut_utilisateur}
                    onChange={(e) => setFormData({...formData, statut_utilisateur: e.target.value})}
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="suspendu">Suspendu</option>
                  </select>
                </div>
              )}

              {!selectedEmploye && (
                <div className="bg-blue-50 border border-blue-200 rounded-btn p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Note :</strong> Un mot de passe temporaire sera généré et envoyé par email à l'employé.
                  </p>
                </div>
              )}

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
                  {saving ? 'Enregistrement...' : selectedEmploye ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showDetailModal && selectedEmploye && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                Détails employé
              </h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-bleu-royal flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {selectedEmploye.prenom?.charAt(0)}{selectedEmploye.nom?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-xl font-semibold text-gris-ardoise">
                    {selectedEmploye.prenom} {selectedEmploye.nom}
                  </p>
                  <p className="text-gray-500">@{selectedEmploye.nom_utilisateur}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">{selectedEmploye.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Rôle : Employé</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedEmploye.statut_utilisateur === 'actif' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedEmploye.statut_utilisateur === 'actif' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t text-sm text-gray-500">
                <p>Créé le : {formatDate(selectedEmploye.date_creation)}</p>
                {selectedEmploye.date_modification && (
                  <p>Modifié le : {formatDate(selectedEmploye.date_modification)}</p>
                )}
                {selectedEmploye.doit_changer_mdp && (
                  <p className="text-or mt-2">⚠️ Doit changer son mot de passe</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowDetailModal(false); handleEdit(selectedEmploye); }}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => { setShowDetailModal(false); handleResetPassword(selectedEmploye.id_utilisateur); }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset MDP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employes;
