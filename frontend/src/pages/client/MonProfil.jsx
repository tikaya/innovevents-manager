import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, Mail, Phone, MapPin, Building, Save, Lock, Trash2, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MonProfil = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  
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

  const [passwordData, setPasswordData] = useState({
    ancien_mot_de_passe: '',
    nouveau_mot_de_passe: '',
    confirm: ''
  });

  useEffect(() => {
    fetchProfil();
  }, []);

  const fetchProfil = async () => {
    try {
      const response = await api.get('/clients/me');
      const data = response.data.data;
      setFormData({
        nom_entreprise_client: data.nom_entreprise_client || '',
        nom_contact: data.nom_contact || '',
        prenom_contact: data.prenom_contact || '',
        email_client: data.email_client || '',
        telephone_client: data.telephone_client || '',
        adresse_client: data.adresse_client || '',
        code_postal_client: data.code_postal_client || '',
        ville_client: data.ville_client || ''
      });
    } catch (err) {
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/clients/me', formData);
      toast.success('Profil mis à jour avec succès');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.nouveau_mot_de_passe !== passwordData.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.nouveau_mot_de_passe.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', {
        ancien_mot_de_passe: passwordData.ancien_mot_de_passe,
        nouveau_mot_de_passe: passwordData.nouveau_mot_de_passe
      });
      toast.success('Mot de passe modifié avec succès');
      setPasswordData({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'SUPPRIMER') {
      toast.error('Veuillez taper SUPPRIMER pour confirmer');
      return;
    }

    setDeleting(true);
    try {
      await api.delete('/clients/me');
      toast.success('Votre compte a été supprimé');
      logout();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-or border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Mon profil</h1>
        <p className="text-gray-500">Gérez vos informations personnelles</p>
      </div>

      {/* Avatar Card */}
      <div className="card flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-or flex items-center justify-center">
          <span className="text-3xl font-bold text-gris-ardoise">
            {formData.prenom_contact?.charAt(0)}{formData.nom_contact?.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-xl font-semibold text-gris-ardoise">
            {formData.prenom_contact} {formData.nom_contact}
          </p>
          <p className="text-gray-500">{formData.nom_entreprise_client}</p>
          <p className="text-sm text-or">{user?.email}</p>
        </div>
      </div>

      {/* Form Profil */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        <h2 className="font-montserrat font-semibold text-gris-ardoise flex items-center gap-2">
          <Building className="w-5 h-5 text-or" />
          Informations entreprise
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Nom de l'entreprise</label>
            <input
              type="text"
              className="input-field"
              value={formData.nom_entreprise_client}
              onChange={(e) => setFormData({...formData, nom_entreprise_client: e.target.value})}
            />
          </div>

          <div>
            <label className="label">Prénom du contact</label>
            <input
              type="text"
              className="input-field"
              value={formData.prenom_contact}
              onChange={(e) => setFormData({...formData, prenom_contact: e.target.value})}
            />
          </div>

          <div>
            <label className="label">Nom du contact</label>
            <input
              type="text"
              className="input-field"
              value={formData.nom_contact}
              onChange={(e) => setFormData({...formData, nom_contact: e.target.value})}
            />
          </div>
        </div>

        <h2 className="font-montserrat font-semibold text-gris-ardoise flex items-center gap-2 pt-4 border-t">
          <Mail className="w-5 h-5 text-or" />
          Coordonnées
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input-field bg-gray-100"
              value={formData.email_client}
              disabled
            />
            <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié</p>
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
        </div>

        <h2 className="font-montserrat font-semibold text-gris-ardoise flex items-center gap-2 pt-4 border-t">
          <MapPin className="w-5 h-5 text-or" />
          Adresse
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
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

        <button
          type="submit"
          disabled={saving}
          className={`btn-cta w-full flex items-center justify-center gap-2 ${saving ? 'opacity-50' : ''}`}
        >
          <Save className="w-5 h-5" />
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>

      {/* Form Mot de passe */}
      <form onSubmit={handleChangePassword} className="card space-y-4">
        <h2 className="font-montserrat font-semibold text-gris-ardoise flex items-center gap-2">
          <Lock className="w-5 h-5 text-or" />
          Changer mon mot de passe
        </h2>

        <div>
          <label className="label">Mot de passe actuel *</label>
          <input
            type="password"
            className="input-field"
            value={passwordData.ancien_mot_de_passe}
            onChange={(e) => setPasswordData({...passwordData, ancien_mot_de_passe: e.target.value})}
            required
          />
        </div>

        <div>
         <label className="label">Nouveau mot de passe *</label>
<p className="text-xs text-gray-500 mb-1">Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial (!@#$%)</p>
          <input
            type="password"
            className="input-field"
            value={passwordData.nouveau_mot_de_passe}
            onChange={(e) => setPasswordData({...passwordData, nouveau_mot_de_passe: e.target.value})}
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="label">Confirmer le nouveau mot de passe *</label>
          <input
            type="password"
            className="input-field"
            value={passwordData.confirm}
            onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
            required
          />
        </div>

        <button
          type="submit"
          disabled={savingPassword}
          className={`btn-secondary w-full ${savingPassword ? 'opacity-50' : ''}`}
        >
          {savingPassword ? 'Modification...' : 'Changer le mot de passe'}
        </button>
      </form>

      {/* Suppression compte RGPD */}
      <div className="card border-red-200 bg-red-50">
        <h2 className="font-montserrat font-semibold text-red-700 flex items-center gap-2 mb-4">
          <Trash2 className="w-5 h-5" />
          Supprimer mon compte
        </h2>
        <p className="text-red-600 text-sm mb-4">
          Conformément au RGPD, vous pouvez demander la suppression de votre compte et de vos données personnelles. 
          Cette action est irréversible.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-btn transition-colors"
        >
          Supprimer mon compte
        </button>
      </div>

      {/* Modal Confirmation Suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gris-ardoise">Supprimer votre compte ?</h3>
                <p className="text-sm text-gray-500">Cette action est irréversible</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-btn p-4 mb-4">
              <p className="text-sm text-red-700">
                Toutes vos données seront supprimées définitivement :
              </p>
              <ul className="text-sm text-red-600 mt-2 list-disc list-inside">
                <li>Votre profil et informations</li>
                <li>Vos événements</li>
                <li>Vos devis</li>
                <li>Vos avis</li>
              </ul>
            </div>

            <div className="mb-4">
              <label className="label">Tapez SUPPRIMER pour confirmer</label>
              <input
                type="text"
                className="input-field"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="SUPPRIMER"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                className="btn-secondary flex-1"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm !== 'SUPPRIMER'}
                className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-btn flex-1 ${
                  (deleting || deleteConfirm !== 'SUPPRIMER') ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {deleting ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonProfil;