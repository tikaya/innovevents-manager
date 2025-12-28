import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Connexion = () => {
  const [formData, setFormData] = useState({ email: '', mot_de_passe: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.mot_de_passe) {
      newErrors.mot_de_passe = 'Le mot de passe est requis';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await login(formData.email, formData.mot_de_passe);
      toast.success('Connexion réussie !');
      
      if (result.doit_changer_mdp) {
        navigate('/changer-mot-de-passe');
      } else {
        const role = result.data?.user?.role;
        switch (role) {
          case 'admin': navigate('/admin'); break;
          case 'employe': navigate('/employe'); break;
          case 'client': navigate('/client'); break;
          default: navigate('/');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion');
      setErrors({ general: 'Email ou mot de passe incorrect' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bleu-royal to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Retour */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          aria-label="Retour à l'accueil"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          Retour à l'accueil
        </Link>

        {/* Card */}
        <div className="bg-white rounded-card shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4" aria-label="Innov'Events">
              <span className="text-or text-3xl" aria-hidden="true">✦</span>
              <span className="font-montserrat font-bold text-2xl text-bleu-royal">
                Innov'<span className="text-or">Events</span>
              </span>
            </Link>
            <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">
              Connexion
            </h1>
            <p className="text-gray-500 mt-2">
              Accédez à votre espace personnel
            </p>
          </div>

          {/* Erreur générale */}
          {errors.general && (
            <div 
              className="bg-red-50 text-red-600 p-4 rounded-btn mb-6 text-center"
              role="alert"
              aria-live="polite"
            >
              {errors.general}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="label">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="vous@exemple.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  aria-required="true"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="mb-6">
              <label htmlFor="mot_de_passe" className="label">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="mot_de_passe"
                  name="mot_de_passe"
                  autoComplete="current-password"
                  className={`input-field pl-10 pr-10 ${errors.mot_de_passe ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                  value={formData.mot_de_passe}
                  onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                  aria-required="true"
                  aria-invalid={errors.mot_de_passe ? 'true' : 'false'}
                  aria-describedby={errors.mot_de_passe ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.mot_de_passe && (
                <p id="password-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.mot_de_passe}
                </p>
              )}
            </div>

            {/* Mot de passe oublié */}
            <div className="text-right mb-6">
              <Link 
                to="/mot-de-passe-oublie" 
                className="text-sm text-bleu-royal hover:text-or transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-busy={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* Inscription */}
          <p className="text-center mt-6 text-gray-500">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="text-bleu-royal hover:text-or font-semibold transition-colors">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
