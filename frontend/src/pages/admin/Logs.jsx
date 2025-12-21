import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FileText, 
  Search, 
  Filter, 
  RefreshCw, 
  User, 
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionTypes, setActionTypes] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  
  const [filters, setFilters] = useState({
    type_action: '',
    date_debut: '',
    date_fin: '',
    search: ''
  });

  useEffect(() => {
    fetchActionTypes();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchActionTypes = async () => {
    try {
      const response = await api.get('/logs/types');
      setActionTypes(response.data.data || {});
    } catch (err) {
      console.error('Erreur types:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/logs/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error('Erreur stats:', err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.type_action && { type_action: filters.type_action }),
        ...(filters.date_debut && { date_debut: filters.date_debut }),
        ...(filters.date_fin && { date_fin: filters.date_fin }),
        ...(filters.search && { search: filters.search })
      });
      
      const response = await api.get(`/logs?${params}`);
      setLogs(response.data.data.logs || []);
      setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
    } catch (err) {
      toast.error('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({ type_action: '', date_debut: '', date_fin: '', search: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionIcon = (type) => {
    if (type.includes('CONNEXION_REUSSIE') || type === 'LOGIN') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (type.includes('CONNEXION_ECHOUEE') || type === 'LOGIN_FAILED') return <XCircle className="w-4 h-4 text-red-500" />;
    if (type.includes('CREATION')) return <CheckCircle className="w-4 h-4 text-blue-500" />;
    if (type.includes('MODIFICATION')) return <RefreshCw className="w-4 h-4 text-orange-500" />;
    if (type.includes('SUPPRESSION')) return <XCircle className="w-4 h-4 text-red-500" />;
    if (type.includes('MOT_DE_PASSE')) return <Shield className="w-4 h-4 text-purple-500" />;
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const getActionColor = (type) => {
    if (type.includes('CONNEXION_REUSSIE') || type === 'LOGIN') return 'bg-green-100 text-green-700';
    if (type.includes('CONNEXION_ECHOUEE') || type === 'LOGIN_FAILED') return 'bg-red-100 text-red-700';
    if (type.includes('CREATION')) return 'bg-blue-100 text-blue-700';
    if (type.includes('MODIFICATION')) return 'bg-orange-100 text-orange-700';
    if (type.includes('SUPPRESSION')) return 'bg-red-100 text-red-700';
    if (type.includes('MOT_DE_PASSE')) return 'bg-purple-100 text-purple-700';
    if (type.includes('DEVIS')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  const formatActionType = (type) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  };

  // Grouper les types d'actions par catégorie
  const groupedTypes = Object.entries(actionTypes).reduce((acc, [key, value]) => {
    let category = 'Autre';
    if (key.includes('CONNEXION') || key.includes('MOT_DE_PASSE')) category = 'Authentification';
    else if (key.includes('CLIENT')) category = 'Clients';
    else if (key.includes('EVENEMENT')) category = 'Événements';
    else if (key.includes('DEVIS')) category = 'Devis';
    else if (key.includes('EMPLOYE')) category = 'Employés';
    else if (key.includes('PROSPECT')) category = 'Prospects';
    else if (key.includes('AVIS')) category = 'Avis';
    else if (key.includes('NOTE')) category = 'Notes';
    else if (key.includes('TACHE')) category = 'Tâches';
    
    if (!acc[category]) acc[category] = [];
    acc[category].push({ key, value });
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">
            Journalisation
          </h1>
          <p className="text-gray-500">Historique des actions système</p>
        </div>
        <button onClick={() => { fetchLogs(); fetchStats(); }} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-btn">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gris-ardoise">{stats.totalLogs}</p>
                <p className="text-sm text-gray-500">Total logs</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-btn">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gris-ardoise">{stats.logsToday}</p>
                <p className="text-sm text-gray-500">Aujourd'hui</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-btn">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.connexionsReussies}</p>
                <p className="text-sm text-gray-500">Connexions OK</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-btn">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.connexionsEchouees}</p>
                <p className="text-sm text-gray-500">Échecs connexion</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gris-ardoise">Filtres</h3>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="label">Type d'action</label>
            <select
              className="input-field"
              value={filters.type_action}
              onChange={(e) => handleFilterChange('type_action', e.target.value)}
            >
              <option value="">Tous les types</option>
              {Object.entries(groupedTypes).map(([category, types]) => (
                <optgroup key={category} label={category}>
                  {types.map(({ key, value }) => (
                    <option key={key} value={value}>{formatActionType(value)}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date début</label>
            <input
              type="date"
              className="input-field"
              value={filters.date_debut}
              onChange={(e) => handleFilterChange('date_debut', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Date fin</label>
            <input
              type="date"
              className="input-field"
              value={filters.date_fin}
              onChange={(e) => handleFilterChange('date_fin', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Nom, email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
        </div>
        {(filters.type_action || filters.date_debut || filters.date_fin || filters.search) && (
          <button onClick={resetFilters} className="mt-4 text-sm text-bleu-royal hover:underline">
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Table des logs */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-bleu-royal border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun log trouvé</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bleu-ciel">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Date/Heure</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Action</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Utilisateur</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Détails</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log, index) => (
                    <tr key={log._id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(log.horodatage || log.date_action)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.type_action)}
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(log.type_action)}`}>
                            {formatActionType(log.type_action)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.id_utilisateur ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>ID: {log.id_utilisateur}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="max-w-xs truncate">
                          {log.details?.email && <span className="text-gray-600">{log.details.email}</span>}
                          {log.details?.nom && <span className="text-gray-600">{log.details.nom}</span>}
                          {log.details?.nom_evenement && <span className="text-gray-600">{log.details.nom_evenement}</span>}
                          {log.details?.numero_devis && <span className="text-gray-600">Devis: {log.details.numero_devis}</span>}
                          {log.details?.ancien_statut && (
                            <span className="text-gray-600">
                              {log.details.ancien_statut} → {log.details.nouveau_statut}
                            </span>
                          )}
                          {log.details && typeof log.details === 'string' && (
                            <span className="text-gray-600">{log.details}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {log.details?.ip_address || log.adresse_ip || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-gray-500">
                Page {pagination.page} sur {pagination.totalPages} ({pagination.total} logs)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-btn hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-btn hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Logs;
