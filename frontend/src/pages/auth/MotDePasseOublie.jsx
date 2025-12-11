import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const MotDePasseOublie = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bleu-royal to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-card shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise mb-2">
            Email envoyé !
          </h1>
          <p className="text-gray-600 mb-6">
            Si un compte existe avec cet email, un nouveau mot de passe temporaire a été envoyé.
            Vérifiez votre boîte de réception (et vos spams).
          </p>
          <Link to="/connexion" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bleu-royal to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-card shadow-xl max-w-md w-full p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <span className="text-or text-3xl">✦</span>
            <span className="font-montserrat font-bold text-2xl text-bleu-royal">
              Innov'<span className="text-or">Events</span>
            </span>
          </Link>
        </div>

        <h1 className="text-2xl font-montserrat font-bold text-center text-gris-ardoise mb-2">
          Mot de passe oublié ?
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Entrez votre email pour recevoir un nouveau mot de passe
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-btn mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                className="input-field pl-10"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn-cta w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/connexion" className="text-bleu-royal hover:text-or flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MotDePasseOublie;
