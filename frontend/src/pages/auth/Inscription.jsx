import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Inscription = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const password = watch('mot_de_passe', '');

  const passwordRules = [
    { regex: /.{8,}/, label: '8 caractères minimum' },
    { regex: /[A-Z]/, label: 'Une majuscule' },
    { regex: /[a-z]/, label: 'Une minuscule' },
    { regex: /[0-9]/, label: 'Un chiffre' },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, label: 'Un caractère spécial' },
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      await registerUser({
        email: data.email,
        mot_de_passe: data.mot_de_passe,
        nom: data.nom,
        prenom: data.prenom,
        nom_utilisateur: data.nom_utilisateur
      });
      navigate('/espace-client');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bleu-royal via-blue-800 to-bleu-royal flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-or rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-bleu-ciel rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <span className="text-or text-3xl">✦</span>
            <span className="font-montserrat font-bold text-2xl text-white">
              Innov'<span className="text-or">Events</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-card shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise mb-2">
              Créer un compte
            </h1>
            <p className="text-gray-500">
              Rejoignez Innov'Events
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-btn mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Prénom *</label>
                <input
                  type="text"
                  className={`input-field ${errors.prenom ? 'border-red-500' : ''}`}
                  placeholder="Jean"
                  {...register('prenom', { required: 'Requis' })}
                />
                {errors.prenom && (
                  <p className="text-red-500 text-sm mt-1">{errors.prenom.message}</p>
                )}
              </div>
              <div>
                <label className="label">Nom *</label>
                <input
                  type="text"
                  className={`input-field ${errors.nom ? 'border-red-500' : ''}`}
                  placeholder="Dupont"
                  {...register('nom', { required: 'Requis' })}
                />
                {errors.nom && (
                  <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>
                )}
              </div>
            </div>

            {/* Nom utilisateur */}
            <div>
              <label className="label">Nom d'utilisateur *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  className={`input-field pl-10 ${errors.nom_utilisateur ? 'border-red-500' : ''}`}
                  placeholder="jean_dupont"
                  {...register('nom_utilisateur', { 
                    required: 'Ce champ est requis',
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Lettres, chiffres et underscore uniquement'
                    }
                  })}
                />
              </div>
              {errors.nom_utilisateur && (
                <p className="text-red-500 text-sm mt-1">{errors.nom_utilisateur.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="label">Adresse email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="exemple@email.com"
                  {...register('email', {
                    required: 'Ce champ est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label">Mot de passe *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pl-10 pr-10 ${errors.mot_de_passe ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                  {...register('mot_de_passe', { 
                    required: 'Ce champ est requis',
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
                      message: 'Le mot de passe ne respecte pas les règles'
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password rules */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {passwordRules.map((rule, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-1 text-xs ${
                      rule.regex.test(password) ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <CheckCircle className={`w-3 h-3 ${rule.regex.test(password) ? 'text-green-500' : ''}`} />
                    {rule.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Créer mon compte
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              En créant un compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          </form>

          {/* Login link */}
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-gray-500">
              Déjà un compte ?{' '}
              <Link to="/connexion" className="text-bleu-royal font-semibold hover:text-or transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-blue-200 hover:text-white transition-colors text-sm">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
