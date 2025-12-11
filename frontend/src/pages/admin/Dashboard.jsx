import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  FileText, 
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data.data);
    } catch (err) {
      console.error('Erreur dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('fr-FR', { month: 'short' })
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-bleu-royal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const prochains = data?.prochainsEvenements || [];
  const notes = data?.notesRecentes || [];
  const devisAcceptes = data?.devisAcceptes || [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-bleu-royal to-blue-700 rounded-card p-6 text-white">
        <h1 className="text-2xl font-montserrat font-bold mb-2">
          Bonjour, {user?.prenom} 👋
        </h1>
        <p className="text-blue-100">
          Voici un aperçu de votre activité
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/clients" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Clients actifs</p>
              <p className="text-3xl font-montserrat font-bold text-bleu-royal">
                {kpis.clientsActifs || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-bleu-ciel rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-bleu-royal" />
            </div>
          </div>
        </Link>

        <Link to="/admin/devis" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Devis acceptés</p>
              <p className="text-3xl font-montserrat font-bold text-green-600">
                {devisAcceptes.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Link>

        <Link to="/admin/evenements" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Événements à venir</p>
              <p className="text-3xl font-montserrat font-bold text-or">
                {prochains.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-or" />
            </div>
          </div>
        </Link>

        <Link to="/admin/evenements" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Brouillons</p>
              <p className="text-3xl font-montserrat font-bold text-red-500">
                {kpis.evenementsBrouillon || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </Link>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Prochains événements */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-semibold text-gris-ardoise flex items-center gap-2">
              <Calendar className="w-5 h-5 text-or" />
              Prochains événements
            </h2>
            <Link to="/admin/evenements" className="text-bleu-royal text-sm hover:text-or">
              Voir tout
            </Link>
          </div>
          
          {prochains.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucun événement à venir</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prochains.slice(0, 5).map((event) => {
                const date = formatDate(event.date_debut);
                return (
                  <div key={event.id_evenement} className="flex items-center gap-3 p-3 bg-blanc-casse rounded-btn">
                    <div className="w-12 h-12 bg-bleu-ciel rounded-btn flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-bleu-royal">{date.day}</span>
                      <span className="text-xs text-bleu-royal">{date.month}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gris-ardoise text-sm truncate">
                        {event.nom_evenement}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {event.nom_entreprise_client}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notes récentes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-semibold text-gris-ardoise flex items-center gap-2">
              <FileText className="w-5 h-5 text-or" />
              Notes récentes
            </h2>
            <Link to="/admin/taches" className="text-bleu-royal text-sm hover:text-or">
              Voir tout
            </Link>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucune note récente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.slice(0, 5).map((note) => (
                <div key={note.id_note} className="p-3 bg-yellow-50 border-l-4 border-or rounded-r-btn">
                  <p className="text-sm text-gris-ardoise line-clamp-2">
                    {note.contenu_note}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {note.nom_evenement || 'Note globale'} • {note.auteur_prenom}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Devis acceptés */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-semibold text-gris-ardoise flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Devis acceptés
            </h2>
            <Link to="/admin/devis" className="text-bleu-royal text-sm hover:text-or">
              Voir tout
            </Link>
          </div>

          {devisAcceptes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucun devis accepté</p>
            </div>
          ) : (
            <div className="space-y-3">
              {devisAcceptes.slice(0, 5).map((devis) => (
                <div key={devis.id_devis} className="flex items-center justify-between p-3 bg-green-50 rounded-btn">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gris-ardoise text-sm truncate">
                      {devis.numero_devis}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {devis.nom_entreprise_client}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                    Accepté
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="card">
        <h2 className="font-montserrat font-semibold text-gris-ardoise mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-or" />
          Actions rapides
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/admin/prospects" 
            className="p-4 bg-bleu-ciel rounded-btn text-center hover:bg-bleu-royal hover:text-white transition-colors group"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-bleu-royal group-hover:text-white" />
            <p className="font-semibold text-sm">Prospects</p>
          </Link>

          <Link 
            to="/admin/clients" 
            className="p-4 bg-green-50 rounded-btn text-center hover:bg-green-600 hover:text-white transition-colors group"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-green-600 group-hover:text-white" />
            <p className="font-semibold text-sm">Nouveau client</p>
          </Link>

          <Link 
            to="/admin/evenements" 
            className="p-4 bg-yellow-50 rounded-btn text-center hover:bg-or hover:text-bleu-royal transition-colors group"
          >
            <Calendar className="w-8 h-8 mx-auto mb-2 text-or group-hover:text-bleu-royal" />
            <p className="font-semibold text-sm">Nouvel événement</p>
          </Link>

          <Link 
            to="/admin/devis" 
            className="p-4 bg-purple-50 rounded-btn text-center hover:bg-purple-600 hover:text-white transition-colors group"
          >
            <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600 group-hover:text-white" />
            <p className="font-semibold text-sm">Nouveau devis</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;