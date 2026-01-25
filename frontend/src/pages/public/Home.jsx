import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Users, PartyPopper, ArrowRight, Star, Calendar, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const Home = () => {
  const [prochainEvenement, setProchainEvenement] = useState(null);
  const [averageNote, setAverageNote] = useState(null);

  useEffect(() => {
    fetchProchainEvenement();
    fetchAverageNote();
  }, []);

  const fetchProchainEvenement = async () => {
    try {
      const response = await api.get('/evenements/public');
      const evenements = response.data.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futurs = evenements
        .filter(e => new Date(e.date_debut) >= today)
        .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));
      if (futurs.length > 0) {
        setProchainEvenement(futurs[0]);
      }
    } catch (err) {
      console.error('Erreur événements:', err);
    }
  };

  const fetchAverageNote = async () => {
    try {
      const response = await api.get('/avis/average');
      setAverageNote(response.data.data?.moyenne || 0);
    } catch (err) {
      console.error('Erreur moyenne:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const services = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: 'Séminaires',
      description: 'Organisation complète de vos séminaires d\'entreprise, de la conception à la réalisation.',
      features: ['Lieu sur mesure', 'Restauration', 'Équipements techniques'],
      image: '/images/seminaire.jpg'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Conférences',
      description: 'Mise en place d\'événements professionnels impactants pour valoriser votre expertise.',
      features: ['Gestion des intervenants', 'Streaming live', 'Networking'],
      image: '/images/conference.jpg'
    },
    {
      icon: <PartyPopper className="w-8 h-8" />,
      title: 'Soirées',
      description: 'Création de soirées d\'entreprise mémorables pour célébrer vos succès en grand.',
      features: ['Animation', 'Décoration thématique', 'Traiteur gastronomique'],
      image: '/images/soiree.jpg'
    },
  ];

  const stats = [
    { number: '150+', label: 'Événements réalisés' },
    { number: '98%', label: 'Clients satisfaits' },
    { number: '50+', label: 'Partenaires de confiance' },
    { number: '5 ans', label: 'D\'expérience' },
  ];

const testimonials = [
  {
    name: 'Marie Dupont',
    company: 'Tech Solutions',
    text: 'Une équipe exceptionnelle qui a su comprendre nos besoins et créer un événement mémorable.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Pierre Martin',
    company: 'Finance Corp',
    text: 'Professionnalisme et créativité au rendez-vous. Je recommande vivement !',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Sophie Bernard',
    company: 'StartUp Nation',
    text: 'Notre conférence annuelle a été un vrai succès grâce à Innov\'Events. Merci !',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Thomas Leroy',
    company: 'Corporate Group',
    text: 'Le gala des 20 ans de notre entreprise restera gravé dans les mémoires.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face'
  },
];
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-bleu-royal via-blue-800 to-bleu-royal overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-or rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-bleu-ciel rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <span className="inline-block bg-or/20 text-or px-4 py-2 rounded-full text-sm font-semibold mb-6">
                ✦ Agence événementielle premium
              </span>
              <h1 className="text-4xl md:text-6xl font-montserrat font-bold mb-6 leading-tight">
                Créateurs d'événements{' '}
                <span className="text-or">exceptionnels</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Séminaires, conférences et soirées d'entreprise sur-mesure. 
                Transformez vos idées en moments inoubliables.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/demande-devis" className="btn-cta text-center text-lg py-4 px-8">
                  Demander un Devis Gratuit
                </Link>
                <Link to="/evenements" className="bg-white/10 backdrop-blur text-white border border-white/30 font-montserrat font-semibold py-4 px-8 rounded-btn hover:bg-white/20 transition-all text-center">
                  Découvrir nos réalisations
                </Link>
              </div>

              {/* Trust badges */}
             {/* Trust badges */}
<div className="flex items-center gap-6 mt-10 pt-10 border-t border-white/20">
  <div className="flex -space-x-2">
    {[
      { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face', name: 'Marie' },
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', name: 'Pierre' },
      { url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face', name: 'Sophie' },
      { url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face', name: 'Thomas' }
    ].map((client, i) => (
      <img 
        key={i} 
        src={client.url}
        alt={`${client.name} - Client satisfait`}
        className="w-10 h-10 rounded-full border-2 border-white object-cover"
        loading="lazy"
      />
    ))}
  </div>
  <div className="text-blue-100">
    <span className="text-white font-semibold">+200 clients</span> nous font confiance
  </div>
</div>
            </div>

            {/* Hero Image */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="bg-white rounded-card shadow-2xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img 
                    src="/images/hero-event.jpg" 
                    alt="Événement corporate organisé par Innov'Events - Conférence professionnelle" 
                    className="rounded-lg w-full h-64 object-cover"
                  />
                  {prochainEvenement ? (
                    <div className="mt-4">
                      <h3 className="font-montserrat font-bold text-gris-ardoise">Prochain événement</h3>
                      <p className="text-gray-500 text-sm">
                        {prochainEvenement.nom_evenement} - {formatDate(prochainEvenement.date_debut)}
                      </p>
                      <p className="text-xs text-bleu-royal mt-1">
                        {prochainEvenement.type_evenement}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <h3 className="font-montserrat font-bold text-gris-ardoise">Votre événement</h3>
                      <p className="text-gray-500 text-sm">Contactez-nous pour organiser le vôtre !</p>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-4 -left-4 bg-or text-bleu-royal rounded-card p-4 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-bold">{averageNote ? averageNote.toFixed(1) : '5.0'}/5</span>
                  </div>
                  <p className="text-xs">Note moyenne</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 -mt-8 relative z-20">
        <div className="container mx-auto px-4">
          <div className="bg-blanc-casse rounded-card shadow-card p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-montserrat font-bold text-bleu-royal mb-1">
                    {stat.number}
                  </div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Qui sommes-nous */}
      <section className="py-20 bg-blanc-casse">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="relative">
                <img 
                  src="/images/team.jpg" 
                  alt="L'équipe Innov'Events en réunion de travail" 
                  className="rounded-card w-full h-80 object-cover shadow-lg"
                />
                <div className="absolute -bottom-6 -right-6 bg-bleu-royal rounded-card p-6 text-white">
                  <p className="font-montserrat font-bold text-2xl">5+</p>
                  <p className="text-blue-200 text-sm">Années d'expertise</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="text-or font-semibold text-sm uppercase tracking-wider">À propos de nous</span>
              <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-gris-ardoise mt-2 mb-6">
                Une équipe passionnée à votre service
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Innov'Events est une agence événementielle haut de gamme, spécialisée dans l'organisation de séminaires, conférences et soirées d'entreprise. Notre équipe passionnée met son expertise à votre service pour créer des moments uniques.
              </p>
              <ul className="space-y-3 mb-8">
                {['Accompagnement personnalisé', 'Créativité sans limite', 'Respect des délais', 'Budget maîtrisé'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-or" />
                    <span className="text-gris-ardoise">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="btn-primary inline-flex items-center">
                En savoir plus
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Services */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-or font-semibold text-sm uppercase tracking-wider">Ce que nous proposons</span>
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-gris-ardoise mt-2 mb-4">
              Nos Services
            </h2>
            <div className="w-24 h-1 bg-or mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="group bg-blanc-casse rounded-card overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={`Service ${service.title} - Innov'Events`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 bg-or w-12 h-12 rounded-full flex items-center justify-center text-bleu-royal">
                    {service.icon}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-montserrat font-bold text-xl text-gris-ardoise mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-or" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link 
                    to="/demande-devis" 
                    className="inline-flex items-center text-bleu-royal font-semibold hover:text-or transition-colors"
                  >
                    Demander un devis
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

  {/* Témoignages */}
<section className="py-20 bg-bleu-ciel">
  <div className="container mx-auto px-4">
    <div className="text-center mb-16">
      <span className="text-or font-semibold text-sm uppercase tracking-wider">Témoignages</span>
      <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-gris-ardoise mt-2 mb-4">
        Ce que disent nos clients
      </h2>
    </div>

    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="bg-white rounded-card p-8 shadow-card">
          <div className="flex gap-1 mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-or fill-current" />
            ))}
          </div>
          <p className="text-gray-600 italic mb-6">"{testimonial.text}"</p>
          <div className="flex items-center gap-4">
            <img 
              src={testimonial.image}
              alt={`${testimonial.name} - ${testimonial.company}`}
              className="w-12 h-12 rounded-full object-cover"
              loading="lazy"
            />
            <div>
              <p className="font-semibold text-gris-ardoise">{testimonial.name}</p>
              <p className="text-sm text-gray-500">{testimonial.company}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="text-center mt-10">
      <Link to="/avis" className="btn-secondary inline-flex items-center">
        Voir tous les avis
        <ArrowRight className="ml-2 w-4 h-4" />
      </Link>
    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="relative bg-gris-ardoise py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-or rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-white mb-4">
            Prêt à créer votre événement ?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Contactez-nous dès maintenant pour discuter de votre projet. 
            Notre équipe vous répondra sous 24h.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/demande-devis" className="btn-cta inline-flex items-center justify-center text-lg py-4 px-8">
              Demander un Devis Gratuit
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/contact" className="bg-white/10 text-white border border-white/30 font-montserrat font-semibold py-4 px-8 rounded-btn hover:bg-white/20 transition-all">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
