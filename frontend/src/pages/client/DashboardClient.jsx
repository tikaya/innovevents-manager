import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DashboardClient = () => {
  const { user } = useAuth();
  const [evenements, setEvenements] = useState([]);
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [evtRes, devisRes] = await Promise.all([
        api.get('/evenements/mine'),
        api.get('/devis/mine')
      ]);
      setEvenements(evtRes.data.data || []);
      setDevis(devisRes.data.data || []);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatutBadge = (statut, type = 'event') => {
    const colors = {
      brouillon: 'bg-gray-100 text-gray-700',
      en_attente: 'bg-yellow-100 text-yellow-700',
      accepte: 'bg-green-100 text-green-700',
      en_cours: 'bg-blue-100 text-blue-700',
      termine: 'bg-green-100 text-green-700',
      annule: 'bg-red-100 text-red-700',
      envoye: 'bg-blue-100 text-blue-700',
      etude_client: 'bg-yellow-100 text-yellow-700',
      refuse: 'bg-red-100 text-red-700'
    };

    const labels = {
      brouillon: 'Brouillon',
      en_attente: 'En attente',
      accepte: 'Accepté',
      en_cours: 'En cours',
      termine: 'Terminé',
      annule: 'Annulé',
      envoye: 'Envoyé',
      etude_client: 'À étudier',
      refuse: 'Refusé'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[statut] || 'bg-gray-100'}`}>
        {labels[statut] || statut}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-or border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Stats
  const evtEnCours = evenements.filter(e => ['en_attente', 'accepte', 'en_cours'].includes(e.statut_evenement)).length;
  const evtTermines = evenements.filter(e => e.statut_evenement === 'termine').length;
  const devisEnAttente = devis.filter(d => ['envoye', 'etude_client'].includes(d.statut_devis)).length;
  const prochainEvt = evenements
    .filter(e => new Date(e.date_debut) >= new Date())
    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))[0];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-gris-ardoise to-gray-700 rounded-card p-6 text-white">
        <h1 className="text-2xl font-montserrat font-bold mb-2">
          Bienvenue, {user?.prenom} 👋
        </h1>
        <p className="text-gray-300">
          Gérez vos événements et suivez vos devis
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Événements en cours</p>
              <p className="text-3xl font-montserrat font-bold text-or">{evtEnCours}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-or" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Événements terminés</p>
              <p className="text-3xl font-montserrat font-bold text-green-600">{evtTermines}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Devis à traiter</p>
              <p className="text-3xl font-montserrat font-bold text-bleu-royal">{devisEnAttente}</p>
            </div>
            <div className="w-12 h-12 bg-bleu-ciel rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-bleu-royal" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total événements</p>
              <p className="text-3xl font-montserrat font-bold text-gris-ardoise">{evenements.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gris-ardoise" />
            </div>
          </div>
        </div>
      </div>

      {/* Prochain événement */}
      {prochainEvt && (
        <div className="card border-l-4 border-l-or">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-or" />
            <h2 className="font-montserrat font-semibold text-gris-ardoise">Prochain événement</h2>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xl font-semibold text-gris-ardoise">{prochainEvt.nom_evenement}</p>
              <p className="text-gray-500">{formatDate(prochainEvt.date_debut)} • {prochainEvt.lieu_evenement}</p>
            </div>
            {getStatutBadge(prochainEvt.statut_evenement)}
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mes événements */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-semibold text-gris-ardoise flex items-center gap-2">
              <Calendar className="w-5 h-5 text-or" />
              Mes événements
            </h2>
            <Link to="/client/evenements" className="text-or text-sm hover:text-gris-ardoise">
              Voir tout
            </Link>
          </div>

          {evenements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucun événement</p>
            </div>
          ) : (
            <div className="space-y-3">
              {evenements.slice(0, 4).map((evt) => (
                <div key={evt.id_evenement} className="flex items-center justify-between p-3 bg-blanc-casse rounded-btn">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gris-ardoise text-sm truncate">{evt.nom_evenement}</p>
                    <p className="text-xs text-gray-500">{formatDate(evt.date_debut)}</p>
                  </div>
                  {getStatutBadge(evt.statut_evenement)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mes devis */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-semibold text-gris-ardoise flex items-center gap-2">
              <FileText className="w-5 h-5 text-or" />
              Mes devis
            </h2>
            <Link to="/client/devis" className="text-or text-sm hover:text-gris-ardoise">
              Voir tout
            </Link>
          </div>

          {devis.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucun devis</p>
            </div>
          ) : (
            <div className="space-y-3">
              {devis.slice(0, 4).map((d) => (
                <div key={d.id_devis} className="flex items-center justify-between p-3 bg-blanc-casse rounded-btn">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gris-ardoise text-sm">{d.numero_devis}</p>
                    <p className="text-xs text-gray-500 truncate">{d.nom_evenement}</p>
                  </div>
                  {getStatutBadge(d.statut_devis)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="card">
        <h2 className="font-montserrat font-semibold text-gris-ardoise mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-or" />
          Actions rapides
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/client/evenements" 
            className="p-4 bg-yellow-50 rounded-btn text-center hover:bg-or hover:text-gris-ardoise transition-colors group"
          >
            <Calendar className="w-8 h-8 mx-auto mb-2 text-or group-hover:text-gris-ardoise" />
            <p className="font-semibold text-sm">Mes événements</p>
          </Link>

          <Link 
            to="/client/devis" 
            className="p-4 bg-bleu-ciel rounded-btn text-center hover:bg-bleu-royal hover:text-white transition-colors group"
          >
            <FileText className="w-8 h-8 mx-auto mb-2 text-bleu-royal group-hover:text-white" />
            <p className="font-semibold text-sm">Mes devis</p>
          </Link>

          <Link 
            to="/client/avis" 
            className="p-4 bg-green-50 rounded-btn text-center hover:bg-green-600 hover:text-white transition-colors group"
          >
            <Star className="w-8 h-8 mx-auto mb-2 text-green-600 group-hover:text-white" />
            <p className="font-semibold text-sm">Donner un avis</p>
          </Link>

          <Link 
            to="/demande-devis" 
            className="p-4 bg-purple-50 rounded-btn text-center hover:bg-purple-600 hover:text-white transition-colors group"
          >
            <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600 group-hover:text-white" />
            <p className="font-semibold text-sm">Nouveau projet</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
