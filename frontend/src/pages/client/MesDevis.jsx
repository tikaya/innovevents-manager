import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FileText, 
  Eye, 
  Download,
  Check,
  X,
  MessageSquare,
  Clock
} from 'lucide-react';
import api from '../../services/api';

const MesDevis = () => {
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [motifModification, setMotifModification] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDevis();
  }, []);

  const fetchDevis = async () => {
    try {
      const response = await api.get('/devis/mine');
      setDevis(response.data.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  const fetchDevisDetail = async (id) => {
    try {
      const response = await api.get(`/devis/${id}`);
      setSelectedDevis(response.data.data);
      setShowModal(true);
    } catch (err) {
      toast.error('Erreur lors du chargement du devis');
    }
  };

  const handleAccept = async (id) => {
    if (!confirm('Accepter ce devis ?')) return;
    setProcessing(true);
    
    try {
      await api.post(`/devis/${id}/accept`);
      toast.success('Devis accepté avec succès !');
      setShowModal(false);
      fetchDevis();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setProcessing(false);
    }
  };

  const handleRefuse = async (id) => {
    if (!confirm('Refuser ce devis ?')) return;
    setProcessing(true);
    
    try {
      await api.post(`/devis/${id}/refuse`);
      toast.success('Devis refusé');
      setShowModal(false);
      fetchDevis();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestModify = async () => {
    if (!motifModification.trim()) {
      toast.error('Veuillez indiquer le motif de modification');
      return;
    }
    setProcessing(true);

    try {
      await api.post(`/devis/${selectedDevis.id_devis}/modify`, { motif: motifModification });
      toast.success('Demande de modification envoyée');
      setShowModifyModal(false);
      setShowModal(false);
      setMotifModification('');
      fetchDevis();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const response = await api.get(`/devis/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `devis-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF téléchargé');
    } catch (err) {
      toast.error('Erreur lors du téléchargement');
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

  const getStatutBadge = (statut) => {
    const config = {
      brouillon: { color: 'bg-gray-100 text-gray-700', label: 'Brouillon' },
      envoye: { color: 'bg-blue-100 text-blue-700', label: 'Envoyé' },
      etude_client: { color: 'bg-yellow-100 text-yellow-700', label: 'À étudier' },
      accepte: { color: 'bg-green-100 text-green-700', label: 'Accepté' },
      refuse: { color: 'bg-red-100 text-red-700', label: 'Refusé' },
      modification: { color: 'bg-purple-100 text-purple-700', label: 'En cours de modification' }
    };

    const { color, label } = config[statut] || { color: 'bg-gray-100', label: statut };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{label}</span>;
  };

  const canRespond = (statut) => ['envoye', 'etude_client'].includes(statut);

  // Indicateur visuel pour les devis nécessitant une action
  const needsAction = (statut) => ['envoye', 'etude_client'].includes(statut);
  
  // Indicateur pour modification en cours
  const isModificationPending = (statut) => statut === 'modification';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Mes devis</h1>
        <p className="text-gray-500">Consultez et répondez à vos devis</p>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-or border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : devis.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Vous n'avez pas encore de devis</p>
        </div>
      ) : (
        <div className="space-y-4">
          {devis.map((d) => (
            <div 
              key={d.id_devis} 
              className={`card hover:shadow-lg transition-shadow ${
                needsAction(d.statut_devis) ? 'border-l-4 border-l-or' : ''
              } ${
                isModificationPending(d.statut_devis) ? 'border-l-4 border-l-purple-500' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-bleu-royal">{d.numero_devis}</h3>
                    {getStatutBadge(d.statut_devis)}
                  </div>
                  <p className="text-gray-600">{d.nom_evenement}</p>
                  <p className="text-sm text-gray-500">Reçu le {formatDate(d.date_creation_devis)}</p>
                  
                  {/* Message modification en cours dans la liste */}
                  {isModificationPending(d.statut_devis) && (
                    <div className="flex items-center gap-2 mt-2 text-purple-600 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Modification en cours de traitement</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchDevisDetail(d.id_devis)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Voir
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(d.id_devis)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-btn"
                    title="Télécharger PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Détails */}
      {showModal && selectedDevis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                  {selectedDevis.numero_devis}
                </h2>
                <p className="text-gray-500 text-sm">{selectedDevis.nom_evenement}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                {getStatutBadge(selectedDevis.statut_devis)}
                <p className="text-sm text-gray-500">Créé le {formatDate(selectedDevis.date_creation_devis)}</p>
              </div>

              {/* Message si modification en cours */}
              {selectedDevis.statut_devis === 'modification' && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-btn">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <p className="font-semibold text-purple-700">Modification en cours</p>
                  </div>
                  <p className="text-purple-600 text-sm mb-3">
                    Votre demande a été transmise. L'équipe Innov'Events travaille sur les modifications. 
                    Vous recevrez un email dès que le nouveau devis sera disponible.
                  </p>
                  {selectedDevis.motif_modification && (
                    <div className="pt-3 border-t border-purple-200">
                      <p className="text-xs text-purple-500 mb-1">Votre demande :</p>
                      <p className="text-purple-700 text-sm bg-purple-100 p-3 rounded-btn italic">
                        "{selectedDevis.motif_modification}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Message si accepté */}
              {selectedDevis.statut_devis === 'accepte' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-btn">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <p className="font-semibold text-green-700">Devis accepté</p>
                  </div>
                  <p className="text-green-600 text-sm mt-1">
                    Merci pour votre confiance ! Notre équipe va prendre contact avec vous pour la suite.
                  </p>
                </div>
              )}

              {/* Message si refusé */}
              {selectedDevis.statut_devis === 'refuse' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-btn">
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-red-600" />
                    <p className="font-semibold text-red-700">Devis refusé</p>
                  </div>
                  <p className="text-red-600 text-sm mt-1">
                    Ce devis a été refusé. N'hésitez pas à nous contacter pour un nouveau projet.
                  </p>
                </div>
              )}

              {/* Prestations */}
              <div className="border rounded-btn overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Prestation</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold">Montant HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedDevis.prestations?.map((p, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-sm">{p.libelle_prestation}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">
                          {parseFloat(p.montant_ht_prestation).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totaux */}
              <div className="bg-gray-50 rounded-btn p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span>Total HT</span>
                  <span className="font-semibold">{parseFloat(selectedDevis.total_ht || 0).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>TVA ({selectedDevis.taux_tva}%)</span>
                  <span className="font-semibold">{parseFloat(selectedDevis.montant_tva || 0).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold text-lg">Total TTC</span>
                  <span className="font-bold text-lg text-or">{parseFloat(selectedDevis.total_ttc || 0).toFixed(2)} €</span>
                </div>
              </div>

              {/* Actions si le client peut répondre */}
              {canRespond(selectedDevis.statut_devis) && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleAccept(selectedDevis.id_devis)}
                    disabled={processing}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Accepter
                  </button>
                  <button
                    onClick={() => setShowModifyModal(true)}
                    disabled={processing}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Demander modification
                  </button>
                  <button
                    onClick={() => handleRefuse(selectedDevis.id_devis)}
                    disabled={processing}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-5 h-5" />
                    Refuser
                  </button>
                </div>
              )}

              {/* Actions si pas de réponse possible */}
              {!canRespond(selectedDevis.statut_devis) && (
                <button
                  onClick={() => handleDownloadPDF(selectedDevis.id_devis)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Télécharger le PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Demande de modification */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                Demander une modification
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Décrivez les modifications souhaitées, notre équipe vous enverra un nouveau devis.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Motif de la modification *</label>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Ex: Je souhaiterais ajouter une prestation traiteur pour 50 personnes..."
                  value={motifModification}
                  onChange={(e) => setMotifModification(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowModifyModal(false); setMotifModification(''); }}
                  className="btn-secondary flex-1"
                  disabled={processing}
                >
                  Annuler
                </button>
                <button
                  onClick={handleRequestModify}
                  disabled={processing || !motifModification.trim()}
                  className={`btn-primary flex-1 ${(!motifModification.trim() || processing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {processing ? 'Envoi...' : 'Envoyer la demande'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MesDevis;