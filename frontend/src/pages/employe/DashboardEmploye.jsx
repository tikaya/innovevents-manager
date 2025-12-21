import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  ClipboardList, 
  Star,
  FileText,
  Clock
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DashboardEmploye = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    clients: 0,
    evenements: 0,
    taches: 0,
    avisEnAttente: 0
  });
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsRes, eventsRes, tachesRes, avisRes] = await Promise.all([
        api.get('/clients'),
        api.get('/evenements'),
        api.get('/taches'),
        api.get('/avis')
      ]);

      const mesTaches = (tachesRes.data.data || []).filter(
        t => t.id_utilisateur === user?.id_utilisateur || t.statut_tache !== 'termine'
      );

      setStats({
        clients: clientsRes.data.data?.length || 0,
        evenements: eventsRes.data.data?.length || 0,
        taches: mesTaches.filter(t => t.statut_tache !== 'termine').length,
        avisEnAttente: (avisRes.data.data || []).filter(a => a.statut_avis === 'valide').length
      });

      setTaches(mesTaches.slice(0, 5));
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-card p-6 text-white">
        <h1 className="text-2xl font-montserrat font-bold mb-2">
          Bonjour, {user?.prenom} 👋
        </h1>
        <p className="text-green-100">
          Bienvenue dans votre espace employé
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/employe/clients" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Clients</p>
              <p className="text-3xl font-montserrat font-bold text-green-600">
                {stats.clients}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Link>

        <Link to="/employe/evenements" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Événements</p>
              <p className="text-3xl font-montserrat font-bold text-bleu-royal">
                {stats.evenements}
              </p>
            </div>
            <div className="w-12 h-12 bg-bleu-ciel rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-bleu-royal" />
            </div>
          </div>
        </Link>

        <Link to="/employe/taches" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tâches en cours</p>
              <p className="text-3xl font-montserrat font-bold text-or">
                {stats.taches}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-or" />
            </div>
          </div>
        </Link>

        <Link to="/employe/avis" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avis à modérer</p>
              <p className="text-3xl font-montserrat font-bold text-purple-600">
                {stats.avisEnAttente}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Link>
      </div>

      {/* Mes tâches */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-montserrat font-semibold text-gris-ardoise flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-or" />
            Mes tâches
          </h2>
          <Link to="/employe/taches" className="text-green-600 text-sm hover:text-green-700">
            Voir tout
          </Link>
        </div>

        {taches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Aucune tâche en cours</p>
          </div>
        ) : (
          <div className="space-y-3">
            {taches.map((tache) => (
              <div key={tache.id_tache} className="flex items-center justify-between p-3 bg-blanc-casse rounded-btn">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    tache.statut_tache === 'termine' ? 'bg-green-500' :
                    tache.statut_tache === 'en_cours' ? 'bg-or' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <p className="font-semibold text-gris-ardoise text-sm">{tache.titre_tache}</p>
                    <p className="text-xs text-gray-500">{tache.nom_evenement}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  tache.statut_tache === 'termine' ? 'bg-green-100 text-green-700' :
                  tache.statut_tache === 'en_cours' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {tache.statut_tache === 'termine' ? 'Terminé' :
                   tache.statut_tache === 'en_cours' ? 'En cours' : 'À faire'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="card">
        <h2 className="font-montserrat font-semibold text-gris-ardoise mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-or" />
          Actions rapides
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/employe/clients" 
            className="p-4 bg-green-50 rounded-btn text-center hover:bg-green-600 hover:text-white transition-colors group"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-green-600 group-hover:text-white" />
            <p className="font-semibold text-sm">Clients</p>
          </Link>

          <Link 
            to="/employe/evenements" 
            className="p-4 bg-bleu-ciel rounded-btn text-center hover:bg-bleu-royal hover:text-white transition-colors group"
          >
            <Calendar className="w-8 h-8 mx-auto mb-2 text-bleu-royal group-hover:text-white" />
            <p className="font-semibold text-sm">Événements</p>
          </Link>

          <Link 
            to="/employe/notes" 
            className="p-4 bg-yellow-50 rounded-btn text-center hover:bg-or hover:text-gris-ardoise transition-colors group"
          >
            <FileText className="w-8 h-8 mx-auto mb-2 text-or group-hover:text-gris-ardoise" />
            <p className="font-semibold text-sm">Notes</p>
          </Link>

          <Link 
            to="/employe/avis" 
            className="p-4 bg-purple-50 rounded-btn text-center hover:bg-purple-600 hover:text-white transition-colors group"
          >
            <Star className="w-8 h-8 mx-auto mb-2 text-purple-600 group-hover:text-white" />
            <p className="font-semibold text-sm">Modérer avis</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmploye;
