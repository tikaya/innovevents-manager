import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle, Building, User, Mail, Phone, MapPin, Calendar, Users, FileText } from 'lucide-react';
import api from '../../services/api';

const DemandeDevis = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const typesEvenements = [
    'Séminaire',
    'Conférence',
    'Soirée d\'entreprise',
    'Team building',
    'Lancement de produit',
    'Gala',
    'Autre'
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const prospectData = {
        nom_entreprise: data.nom_entreprise,
        nom_prospect: data.nom,
        prenom_prospect: data.prenom,
        email_prospect: data.email,
        telephone_prospect: data.telephone,
        lieu_souhaite: data.lieu,
        type_evenement_souhaite: data.type_evenement,
        date_souhaitee: data.date_souhaitee,
        nb_participants: parseInt(data.nb_participants),
        description_besoin: data.description
      };

      await api.post('/prospects', prospectData);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
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
            Merci pour votre demande !
          </h2>
          <p className="text-gray-600 mb-6">
            Votre demande a bien été enregistrée. Chloé vous recontactera dans les plus brefs délais pour discuter de votre projet.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Un email de confirmation vous a été envoyé.
          </p>
          <a href="/" className="btn-primary inline-block">
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bleu-ciel to-white py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-or font-semibold text-sm uppercase tracking-wider">Devis gratuit</span>
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-bleu-royal mt-2 mb-4">
            Demande de Devis
          </h1>
          <div className="w-24 h-1 bg-or mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-xl mx-auto">
            Remplissez ce formulaire et nous vous recontacterons sous 24h pour discuter de votre projet.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="card shadow-xl">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-8 text-sm">
              <span className="flex items-center gap-1 text-bleu-royal font-medium">
                <span className="w-6 h-6 rounded-full bg-bleu-royal text-white flex items-center justify-center text-xs">1</span>
                Vos informations
              </span>
              <span className="w-8 h-px bg-gray-300"></span>
              <span className="flex items-center gap-1 text-gray-400">
                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs">2</span>
                Confirmation
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-btn mb-6">
                <p className="font-medium">Erreur</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Section Entreprise */}
              <div>
                <h3 className="font-montserrat font-semibold text-gris-ardoise mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-or" />
                  Informations entreprise
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="label">Nom de l'entreprise *</label>
                    <input
                      type="text"
                      className={`input-field ${errors.nom_entreprise ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Votre entreprise"
                      {...register('nom_entreprise', { required: 'Ce champ est requis' })}
                    />
                    {errors.nom_entreprise && (
                      <p className="text-red-500 text-sm mt-1">{errors.nom_entreprise.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Contact */}
              <div>
                <h3 className="font-montserrat font-semibold text-gris-ardoise mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-or" />
                  Vos coordonnées
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Prénom *</label>
                    <input
                      type="text"
                      className={`input-field ${errors.prenom ? 'border-red-500' : ''}`}
                      placeholder="Votre prénom"
                      {...register('prenom', { required: 'Ce champ est requis' })}
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
                      placeholder="Votre nom"
                      {...register('nom', { required: 'Ce champ est requis' })}
                    />
                    {errors.nom && (
                      <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      Adresse email *
                    </label>
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
                  <div>
                    <label className="label flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      className={`input-field ${errors.telephone ? 'border-red-500' : ''}`}
                      placeholder="06 12 34 56 78"
                      {...register('telephone', { required: 'Ce champ est requis' })}
                    />
                    {errors.telephone && (
                      <p className="text-red-500 text-sm mt-1">{errors.telephone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Événement */}
              <div>
                <h3 className="font-montserrat font-semibold text-gris-ardoise mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-or" />
                  Votre événement
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Type d'événement *</label>
                    <select
                      className={`input-field ${errors.type_evenement ? 'border-red-500' : ''}`}
                      {...register('type_evenement', { required: 'Ce champ est requis' })}
                    >
                      <option value="">Sélectionnez un type</option>
                      {typesEvenements.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.type_evenement && (
                      <p className="text-red-500 text-sm mt-1">{errors.type_evenement.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      Lieu souhaité *
                    </label>
                    <input
                      type="text"
                      className={`input-field ${errors.lieu ? 'border-red-500' : ''}`}
                      placeholder="Ville ou adresse"
                      {...register('lieu', { required: 'Ce champ est requis' })}
                    />
                    {errors.lieu && (
                      <p className="text-red-500 text-sm mt-1">{errors.lieu.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Date souhaitée *</label>
                    <input
                      type="date"
                      className={`input-field ${errors.date_souhaitee ? 'border-red-500' : ''}`}
                      min={new Date().toISOString().split('T')[0]}
                      {...register('date_souhaitee', { required: 'Ce champ est requis' })}
                    />
                    {errors.date_souhaitee && (
                      <p className="text-red-500 text-sm mt-1">{errors.date_souhaitee.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      Nombre de participants *
                    </label>
                    <input
                      type="number"
                      className={`input-field ${errors.nb_participants ? 'border-red-500' : ''}`}
                      placeholder="Ex: 50"
                      {...register('nb_participants', {
                        required: 'Ce champ est requis',
                        min: { value: 1, message: 'Minimum 1 participant' }
                      })}
                    />
                    {errors.nb_participants && (
                      <p className="text-red-500 text-sm mt-1">{errors.nb_participants.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="label flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      Décrivez votre projet *
                    </label>
                    <textarea
                      rows={4}
                      className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
                      placeholder="Parlez-nous de votre événement : objectifs, ambiance souhaitée, besoins particuliers..."
                      {...register('description', { required: 'Ce champ est requis' })}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="border-t pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn-cta w-full md:w-auto inline-flex items-center justify-center text-lg py-4 px-8 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Envoyer ma demande
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  En soumettant ce formulaire, vous acceptez d'être recontacté par notre équipe.
                  Vos données sont traitées conformément au RGPD.
                </p>
              </div>
            </form>
          </div>

          {/* Garanties */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '⚡', title: 'Réponse rapide', desc: 'Sous 24h' },
              { icon: '🎯', title: 'Devis personnalisé', desc: 'Adapté à vos besoins' },
              { icon: '💰', title: 'Sans engagement', desc: '100% gratuit' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/50 backdrop-blur rounded-btn p-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-gris-ardoise">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandeDevis;