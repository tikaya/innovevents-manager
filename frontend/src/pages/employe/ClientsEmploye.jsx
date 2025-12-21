import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Users, Search, Eye, X, Mail, Phone, MapPin, Building } from 'lucide-react';
import api from '../../services/api';

const ClientsEmploye = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  const filteredClients = clients.filter(c =>
    c.nom_entreprise_client?.toLowerCase().includes(search.toLowerCase()) ||
    c.email_client?.toLowerCase().includes(search.toLowerCase()) ||
    c.nom_contact?.toLowerCase().includes(search.toLowerCase()) ||
    c.prenom_contact?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Clients</h1>
        <p className="text-gray-500">Consultation des clients (lecture seule)</p>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun client trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Entreprise</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Téléphone</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-green-800">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredClients.map((client) => (
                  <tr key={client.id_client} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gris-ardoise">
                      {client.nom_entreprise_client}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {client.prenom_contact} {client.nom_contact}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{client.email_client}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{client.telephone_client}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewDetail(client)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-btn"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {showModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                Détails client
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-gris-ardoise">
                    {selectedClient.nom_entreprise_client}
                  </p>
                  <p className="text-gray-500">
                    {selectedClient.prenom_contact} {selectedClient.nom_contact}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">{selectedClient.email_client}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">{selectedClient.telephone_client || '-'}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">
                    {selectedClient.adresse_client && (
                      <>
                        {selectedClient.adresse_client}<br />
                        {selectedClient.code_postal_client} {selectedClient.ville_client}
                      </>
                    )}
                    {!selectedClient.adresse_client && '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsEmploye;
