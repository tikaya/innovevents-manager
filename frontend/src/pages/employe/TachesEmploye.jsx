import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ClipboardList, Search, CheckCircle, Clock, AlertCircle, Calendar, User } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TachesEmploye = () => {
  const { user } = useAuth();
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  useEffect(() => {
    fetchTaches();
  }, []);

  const fetchTaches = async () => {
    try {
      const response = await api.get('/taches');
      setTaches(response.data.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatut = async (id, newStatut) => {
    try {
      await api.patch(`/taches/${id}/statut`, { statut: newStatut });
      toast.success('Statut mis à jour');
      fetchTaches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatutConfig = (statut) => {
    const configs = {
      a_faire: { 
        icon: AlertCircle, 
        color: 'bg-gray-100 text-gray-700 border-gray-300', 
        label: 'À faire',
        iconColor: 'text-gray-500'
      },
      en_cours: { 
        icon: Clock, 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300', 
        label: 'En cours',
        iconColor: 'text-yellow-500'
      },
      termine: { 
        icon: CheckCircle, 
        color: 'bg-green-100 text-green-700 border-green-300', 
        label: 'Terminé',
        iconColor: 'text-green-500'
      }
    };
    return configs[statut] || configs.a_faire;
  };

  const isMyTask = (tache) => {
    return tache.id_utilisateur === user?.id_utilisateur;
  };

  const filteredTaches = taches.filter(t => {
    const matchSearch = 
      t.titre_tache?.toLowerCase().includes(search.toLowerCase()) ||
      t.nom_evenement?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = !filterStatut || t.statut_tache === filterStatut;
    return matchSearch && matchStatut;
  });

  const stats = {
    total: taches.length,
    mesTaches: taches.filter(t => isMyTask(t)).length,
    a_faire: taches.filter(t => t.statut_tache === 'a_faire').length,
    en_cours: taches.filter(t => t.statut_tache === 'en_cours').length,
    termine: taches.filter(t => t.statut_tache === 'termine').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Tâches</h1>
        <p className="text-gray-500">Gérer le statut de vos tâches</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-gris-ardoise">{stats.total}</p>
        </div>
        <div className="card bg-green-50 border-2 border-green-200">
          <p className="text-green-700 text-sm font-semibold">Mes tâches</p>
          <p className="text-2xl font-bold text-green-600">{stats.mesTaches}</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">À faire</p>
          <p className="text-2xl font-bold text-gray-600">{stats.a_faire}</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">En cours</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.en_cours}</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Terminées</p>
          <p className="text-2xl font-bold text-green-600">{stats.termine}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field md:w-48"
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="a_faire">À faire</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
        </select>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-gray-600">Ma tâche (modifiable)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-300"></div>
          <span className="text-gray-600">Tâche d'un collègue (lecture seule)</span>
        </div>
      </div>

      {/* Tâches */}
      <div className="space-y-4">
        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredTaches.length === 0 ? (
          <div className="card text-center py-12">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune tâche trouvée</p>
          </div>
        ) : (
          filteredTaches.map((tache) => {
            const config = getStatutConfig(tache.statut_tache);
            const Icon = config.icon;
            const isMine = isMyTask(tache);
            
            return (
              <div 
                key={tache.id_tache} 
                className={`card ${isMine ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300 opacity-75'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gris-ardoise">{tache.titre_tache}</h3>
                      {isMine && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Ma tâche
                        </span>
                      )}
                    </div>
                    {tache.nom_evenement && (
                      <p className="text-sm text-green-600">{tache.nom_evenement}</p>
                    )}
                    {tache.description_tache && (
                      <p className="text-sm text-gray-500 mt-1">{tache.description_tache}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                      {/* Assigné */}
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className={isMine ? 'font-semibold text-green-600' : ''}>
                          {isMine ? 'Moi' : `${tache.assignee_prenom} ${tache.assignee_nom}`}
                        </span>
                      </span>
                      {tache.date_echeance && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Échéance : {formatDate(tache.date_echeance)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isMine ? (
                      <select
                        className={`px-3 py-2 rounded-btn border text-sm font-semibold cursor-pointer ${config.color}`}
                        value={tache.statut_tache}
                        onChange={(e) => handleChangeStatut(tache.id_tache, e.target.value)}
                      >
                        <option value="a_faire">À faire</option>
                        <option value="en_cours">En cours</option>
                        <option value="termine">Terminé</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-2 rounded-btn border text-sm font-semibold ${config.color}`}>
                        {config.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TachesEmploye;
