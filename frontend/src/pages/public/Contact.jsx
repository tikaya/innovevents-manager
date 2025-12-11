import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      await api.post('/contacts', {
        nom_utilisateur_contact: data.nom || null,
        email_contact: data.email,
        titre_contact: data.titre,
        description_contact: data.description
      });
      setIsSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bleu-ciel to-white flex items-center justify-center px-4">
        <div className="card max-w-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-montserrat font-bold text-bleu-royal mb-4">
            Message envoyé !
          </h2>
          <p className="text-gray-600 mb-6">
            Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.
          </p>
          <a href="/" className="btn-primary inline-block">
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blanc-casse">
      {/* Hero */}
      <section className="bg-gradient-to-r from-bleu-royal to-blue-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-montserrat font-bold text-white mb-4">
            Contactez-nous
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Une question ? Un projet ? N'hésitez pas à nous contacter.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Infos de contact */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-montserrat font-bold text-gris-ardoise mb-6">
              Nos coordonnées
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-bleu-ciel rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-bleu-royal" />
                </div>
                <div>
                  <h3 className="font-semibold text-gris-ardoise">Email</h3>
                  <p className="text-gray-600">contact@innovevents.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-bleu-ciel rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-bleu-royal" />
                </div>
                <div>
                  <h3 className="font-semibold text-gris-ardoise">Téléphone</h3>
                  <p className="text-gray-600">01 23 45 67 89</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-bleu-ciel rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-bleu-royal" />
                </div>
                <div>
                  <h3 className="font-semibold text-gris-ardoise">Adresse</h3>
                  <p className="text-gray-600">
                    123 Avenue des Événements<br />
                    75001 Paris, France
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-bleu-ciel rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-bleu-royal" />
                </div>
                <div>
                  <h3 className="font-semibold text-gris-ardoise">Horaires</h3>
                  <p className="text-gray-600">
                    Lun - Ven : 9h00 - 18h00<br />
                    Sam : Sur rendez-vous
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-2xl font-montserrat font-bold text-gris-ardoise mb-6">
                Envoyez-nous un message
              </h2>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-btn mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Nom (facultatif)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Votre nom"
                      {...register('nom')}
                    />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="exemple@email.com"
                      {...register('email', {
                        required: 'Ce champ est requis',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email invalide'
                        }
                      })}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">Sujet *</label>
                  <input
                    type="text"
                    className={`input-field ${errors.titre ? 'border-red-500' : ''}`}
                    placeholder="Objet de votre message"
                    {...register('titre', { required: 'Ce champ est requis' })}
                  />
                  {errors.titre && (
                    <p className="text-red-500 text-sm mt-1">{errors.titre.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Message *</label>
                  <textarea
                    rows={5}
                    className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Votre message..."
                    {...register('description', { required: 'Ce champ est requis' })}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`btn-primary flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    'Envoi en cours...'
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
