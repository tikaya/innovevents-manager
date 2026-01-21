import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Filter, Search, X } from 'lucide-react';
import api from '../../services/api';

const Evenements = () => {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtres
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    theme: '',
    dateDebut: '',
    dateFin: ''
  });

  const [types, setTypes] = useState([]);
  const [themes, setThemes] = useState([]);

  // URL de base pour les images
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) return imagePath;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${imagePath}`;
  };

  useEffect(() => {
    fetchEvenements();
    fetchTypes();
    fetchThemes();
  }, []);

  const fetchEvenements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/evenements/public');
      setEvenements(response.data.data || []);
    } catch (err) {
      setError('Impossible de charger les événements');
    } finally {
      setLoading(false);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await api.get('/evenements/types');
      setTypes(response.data.data || []);
    } catch (err) {
      console.error('Erreur types:', err);
    }
  };

  const fetchThemes = async () => {
    try {
      const response = await api.get('/evenements/themes');
      setThemes(response.data.data || []);
    } catch (err) {
      console.error('Erreur themes:', err);
    }
  };

  const filteredEvenements = evenements.filter(event => {
    if (filters.type && event.type_evenement !== filters.type) return false;
    if (filters.theme && event.theme_evenement !== filters.theme) return false;
    if (filters.dateDebut && new Date(event.date_debut) < new Date(filters.dateDebut)) return false;
    if (filters.dateFin && new Date(event.date_debut) > new Date(filters.dateFin)) return false;
    return true;
  });

  const clearFilters = () => {
    setFilters({ type: '', theme: '', dateDebut: '', dateFin: '' });
  };

  const hasActiveFilters = filters.type || filters.theme || filters.dateDebut || filters.dateFin;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-blanc-casse">
      {/* Hero */}
      <section className="bg-gradient-to-r from-bleu-royal to-blue-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-montserrat font-bold text-white mb-4">
            Nos Événements
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Découvrez les événements que nous avons eu le plaisir d'organiser pour nos clients.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Filtres */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-bleu-ciel' : ''}`}
              >
                <Filter className="w-4 h-4" />
                Filtres
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Effacer les filtres
                </button>
              )}
            </div>
            <p className="text-gray-500">
              {filteredEvenements.length} événement{filteredEvenements.length > 1 ? 's' : ''} trouvé{filteredEvenements.length > 1 ? 's' : ''}
            </p>
          </div>

          {showFilters && (
            <div className="bg-white rounded-card shadow-card p-6 mb-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="label">Type d'événement</label>
                  <select
                    className="input-field"
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                  >
                    <option value="">Tous les types</option>
                    {types.map((type, i) => (
                      <option key={i} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Thème</label>
                  <select
                    className="input-field"
                    value={filters.theme}
                    onChange={(e) => setFilters({...filters, theme: e.target.value})}
                  >
                    <option value="">Tous les thèmes</option>
                    {themes.map((theme, i) => (
                      <option key={i} value={theme}>{theme}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Date début</label>
                  <input
                    type="date"
                    className="input-field"
                    value={filters.dateDebut}
                    onChange={(e) => setFilters({...filters, dateDebut: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Date fin</label>
                  <input
                    type="date"
                    className="input-field"
                    value={filters.dateFin}
                    onChange={(e) => setFilters({...filters, dateFin: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liste des événements */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-bleu-royal border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des événements...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredEvenements.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-bleu-ciel rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-bleu-royal" />
            </div>
            <h3 className="text-xl font-montserrat font-semibold text-gris-ardoise mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-500 mb-6">
              {hasActiveFilters 
                ? 'Essayez de modifier vos critères de recherche.' 
                : 'Aucun événement n\'est disponible pour le moment.'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-primary">
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvenements.map((event) => (
              <div key={event.id_evenement} className="bg-white rounded-card shadow-card overflow-hidden hover:shadow-xl transition-shadow group">
                {/* ✅ Image corrigée */}
                <div className="h-48 bg-gradient-to-br from-bleu-ciel to-blue-200 relative overflow-hidden">
                  {event.image_evenement ? (
                    <img 
                      src={getImageUrl(event.image_evenement)}
                      alt={event.nom_evenement}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-bleu-royal/30" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-or text-bleu-royal text-xs font-semibold px-3 py-1 rounded-full">
                      {event.type_evenement}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-montserrat font-bold text-lg text-gris-ardoise mb-3 group-hover:text-bleu-royal transition-colors">
                    {event.nom_evenement}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-or" />
                      {formatDate(event.date_debut)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-or" />
                      {event.lieu_evenement || 'Lieu à définir'}
                    </div>
                    {event.theme_evenement && (
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 text-or">🎨</span>
                        {event.theme_evenement}
                      </div>
                    )}
                  </div>

                  <Link 
                    to="/demande-devis" 
                    className="text-bleu-royal font-semibold hover:text-or transition-colors inline-flex items-center"
                  >
                    Demander un devis similaire →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-bleu-royal rounded-card p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold text-white mb-4">
            Vous avez un projet d'événement ?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Contactez-nous pour discuter de votre projet. Nous créerons ensemble un événement sur-mesure.
          </p>
          <Link to="/demande-devis" className="btn-cta inline-block">
            Demander un Devis Gratuit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Evenements;