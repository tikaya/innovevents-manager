import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Quote } from 'lucide-react';
import api from '../../services/api';

const Avis = () => {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [average, setAverage] = useState(null);

  useEffect(() => {
    fetchAvis();
    fetchAverage();
  }, []);

  const fetchAvis = async () => {
    try {
      const response = await api.get('/avis/public');
      setAvis(response.data.data || []);
    } catch (err) {
      console.error('Erreur avis:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverage = async () => {
    try {
      const response = await api.get('/avis/average');
      setAverage(response.data.data);
    } catch (err) {
      console.error('Erreur moyenne:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderStars = (note) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-5 h-5 ${i < note ? 'text-or fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-blanc-casse">
      {/* Hero */}
      <section className="bg-gradient-to-r from-bleu-royal to-blue-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-montserrat font-bold text-white mb-4">
            Avis Clients
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Découvrez ce que nos clients pensent de nos services.
          </p>
          
          {average && (
            <div className="mt-8 inline-flex items-center gap-4 bg-white/10 backdrop-blur rounded-card px-6 py-4">
              <div className="text-center">
                <div className="text-4xl font-montserrat font-bold text-or">
                  {average.moyenne?.toFixed(1) || '0'}
                </div>
                <div className="text-blue-200 text-sm">sur 5</div>
              </div>
              <div className="border-l border-white/20 pl-4">
                <div className="flex gap-1 mb-1">
                  {renderStars(Math.round(average.moyenne || 0))}
                </div>
                <div className="text-blue-200 text-sm">
                  {avis.length} avis
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-bleu-royal border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des avis...</p>
          </div>
        ) : avis.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-bleu-ciel rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-10 h-10 text-bleu-royal" />
            </div>
            <h3 className="text-xl font-montserrat font-semibold text-gris-ardoise mb-2">
              Aucun avis pour le moment
            </h3>
            <p className="text-gray-500">
              Soyez le premier à partager votre expérience !
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {avis.map((item) => (
              <div key={item.id_avis} className="bg-white rounded-card shadow-card p-6 relative">
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-or rounded-full flex items-center justify-center">
                  <Quote className="w-5 h-5 text-bleu-royal" />
                </div>
                <div className="flex gap-1 mb-4 pt-2">
                  {renderStars(item.note_avis)}
                </div>
                <p className="text-gray-600 italic mb-6 leading-relaxed">
                  "{item.commentaire_avis}"
                </p>
                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="w-12 h-12 rounded-full bg-bleu-ciel flex items-center justify-center">
                    <span className="text-bleu-royal font-semibold">
                      {item.prenom_contact?.charAt(0)}{item.nom_entreprise_client?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gris-ardoise">
                      {item.nom_entreprise_client}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.nom_evenement}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  {formatDate(item.date_creation_avis)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-gris-ardoise to-gray-800 rounded-card p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold text-white mb-4">
            Rejoignez nos clients satisfaits
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Faites confiance à Innov'Events pour votre prochain événement.
          </p>
          <Link to="/demande-devis" className="btn-cta inline-block">
            Demander un Devis
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Avis;
