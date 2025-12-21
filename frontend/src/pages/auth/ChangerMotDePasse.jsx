import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ChangerMotDePasse = () => {
  const navigate = useNavigate();
  const { user, clearDoitChangerMdp, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    ancien_mot_de_passe: '',
    nouveau_mot_de_passe: '',
    confirmer_mot_de_passe: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    ancien: false,
    nouveau: false,
    confirmer: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation du mot de passe
  const validatePassword = (password) => {
    const rules = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return rules;
  };

  const passwordRules = validatePassword(formData.nouveau_mot_de_passe);
  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validations
    if (!formData.ancien_mot_de_passe) {
      setErrors({ ancien: 'Entrez votre mot de passe actuel' });
      return;
    }

    if (!isPasswordValid) {
      setErrors({ nouveau: 'Le mot de passe ne respecte pas les critères' });
      return;
    }

    if (formData.nouveau_mot_de_passe !== formData.confirmer_mot_de_passe) {
      setErrors({ confirmer: 'Les mots de passe ne correspondent pas' });
      return;
    }

    if (formData.ancien_mot_de_passe === formData.nouveau_mot_de_passe) {
      setErrors({ nouveau: 'Le nouveau mot de passe doit être différent de l\'ancien' });
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/change-password', {
        ancien_mot_de_passe: formData.ancien_mot_de_passe,
        nouveau_mot_de_passe: formData.nouveau_mot_de_passe
      });

      toast.success('Mot de passe modifié avec succès !');
      clearDoitChangerMdp();

      // Rediriger selon le rôle
      if (user?.role === 'admin') {
        navigate('/admin');
      } else if (user?.role === 'employe') {
        navigate('/employe');
      } else if (user?.role === 'client') {
        navigate('/client');
      } else {
        navigate('/');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du changement';
      toast.error(message);
      if (message.includes('Ancien mot de passe')) {
        setErrors({ ancien: message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/connexion');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bleu-royal via-blue-800 to-bleu-royal flex items-center justify-center p-4">
      <div className="bg-white rounded-card shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-or to-yellow-500 p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-or" />
          </div>
          <h1 className="text-2xl font-montserrat font-bold text-bleu-royal">
            Changement de mot de passe requis
          </h1>
          <p className="text-bleu-royal/70 mt-2">
            Pour des raisons de sécurité, vous devez changer votre mot de passe temporaire.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Mot de passe actuel */}
          <div>
            <label className="label">Mot de passe actuel (temporaire)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPasswords.ancien ? 'text' : 'password'}
                className={`input-field pl-10 pr-10 ${errors.ancien ? 'border-red-500' : ''}`}
                value={formData.ancien_mot_de_passe}
                onChange={(e) => setFormData({...formData, ancien_mot_de_passe: e.target.value})}
                placeholder="Entrez le mot de passe reçu par email"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({...showPasswords, ancien: !showPasswords.ancien})}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.ancien ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.ancien && <p className="text-red-500 text-sm mt-1">{errors.ancien}</p>}
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="label">Nouveau mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPasswords.nouveau ? 'text' : 'password'}
                className={`input-field pl-10 pr-10 ${errors.nouveau ? 'border-red-500' : ''}`}
                value={formData.nouveau_mot_de_passe}
                onChange={(e) => setFormData({...formData, nouveau_mot_de_passe: e.target.value})}
                placeholder="Choisissez un nouveau mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({...showPasswords, nouveau: !showPasswords.nouveau})}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.nouveau ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.nouveau && <p className="text-red-500 text-sm mt-1">{errors.nouveau}</p>}

            {/* Règles du mot de passe */}
            {formData.nouveau_mot_de_passe && (
              <div className="mt-3 p-3 bg-blanc-casse rounded-btn space-y-1">
                <p className="text-xs font-semibold text-gray-600 mb-2">Critères de sécurité :</p>
                <PasswordRule valid={passwordRules.minLength} text="Au moins 8 caractères" />
                <PasswordRule valid={passwordRules.hasUppercase} text="Une majuscule" />
                <PasswordRule valid={passwordRules.hasLowercase} text="Une minuscule" />
                <PasswordRule valid={passwordRules.hasNumber} text="Un chiffre" />
                <PasswordRule valid={passwordRules.hasSpecial} text="Un caractère spécial (!@#$%...)" />
              </div>
            )}
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <label className="label">Confirmer le nouveau mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPasswords.confirmer ? 'text' : 'password'}
                className={`input-field pl-10 pr-10 ${errors.confirmer ? 'border-red-500' : ''}`}
                value={formData.confirmer_mot_de_passe}
                onChange={(e) => setFormData({...formData, confirmer_mot_de_passe: e.target.value})}
                placeholder="Confirmez votre nouveau mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({...showPasswords, confirmer: !showPasswords.confirmer})}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirmer ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmer && <p className="text-red-500 text-sm mt-1">{errors.confirmer}</p>}
            {formData.confirmer_mot_de_passe && formData.nouveau_mot_de_passe === formData.confirmer_mot_de_passe && (
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Les mots de passe correspondent
              </p>
            )}
          </div>

          {/* Boutons */}
          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className={`w-full btn-cta py-3 ${(loading || !isPasswordValid) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Modification en cours...' : 'Changer mon mot de passe'}
            </button>
            
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-gray-500 hover:text-gray-700 text-sm"
            >
              Se déconnecter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant pour afficher les règles
const PasswordRule = ({ valid, text }) => (
  <div className={`flex items-center gap-2 text-xs ${valid ? 'text-green-600' : 'text-gray-500'}`}>
    {valid ? (
      <CheckCircle className="w-3 h-3" />
    ) : (
      <div className="w-3 h-3 rounded-full border border-gray-400" />
    )}
    {text}
  </div>
);

export default ChangerMotDePasse;
