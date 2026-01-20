import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit,
  Trash2,
  FileText,
  Send,
  Download,
  X,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

const DevisAdmin = () => {
  const [devis, setDevis] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id_evenement: '',
    taux_tva: 20,
    prestations: [{ libelle_prestation: '', montant_ht_prestation: 0 }]
  });

  // ✅ Ajout du statut "modification"
  const statuts = [
    { value: 'brouillon', label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
    { value: 'envoye', label: 'Envoyé', color: 'bg-blue-100 text-blue-700' },
    { value: 'etude_client', label: 'En étude', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'modification', label: 'Modification demandée', color: 'bg-purple-100 text-purple-700' },
    { value: 'accepte', label: 'Accepté', color: 'bg-green-100 text-green-700' },
    { value: 'refuse', label: 'Refusé', color: 'bg-red-100 text-red-700' }
  ];

  useEffect(() => {
    fetchDevis();
    fetchEvenements();
  }, []);

  const fetchDevis = async () => {
    try {
      const response = await api.get('/devis');
      setDevis(response.data.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvenements = async () => {
    try {
      const response = await api.get('/evenements');
      setEvenements(response.data.data || []);
    } catch (err) {
      console.error('Erreur événements:', err);
    }
  };

  const fetchDevisDetail = async (id) => {
    try {
      const response = await api.get(`/devis/${id}`);
      setSelectedDevis(response.data.data);
      setShowDetailModal(true);
    } catch (err) {
      toast.error('Erreur lors du chargement du devis');
    }
  };

  const handleCreate = () => {
    setSelectedDevis(null);
    setFormData({
      id_evenement: '',
      taux_tva: 20,
      prestations: [{ libelle_prestation: '', montant_ht_prestation: 0 }]
    });
    setShowFormModal(true);
  };

  const handleEdit = async (devisItem) => {
    try {
      const response = await api.get(`/devis/${devisItem.id_devis}`);
      const detail = response.data.data;
      setSelectedDevis(detail);
      setFormData({
        id_evenement: detail.id_evenement || '',
        taux_tva: parseFloat(detail.taux_tva) || 20,
        prestations: detail.prestations?.length > 0 
          ? detail.prestations.map(p => ({
              libelle_prestation: p.libelle_prestation,
              montant_ht_prestation: parseFloat(p.montant_ht_prestation) || 0
            }))
          : [{ libelle_prestation: '', montant_ht_prestation: 0 }]
      });
      setShowFormModal(true);
    } catch (err) {
      toast.error('Erreur lors du chargement du devis');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce devis ?')) return;
    
    try {
      await api.delete(`/devis/${id}`);
      toast.success('Devis supprimé avec succès');
      fetchDevis();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleSend = async (id) => {
    if (!confirm('Envoyer ce devis au client par email ?')) return;
    
    try {
      await api.post(`/devis/${id}/send`);
      toast.success('Devis envoyé avec succès !');
      fetchDevis();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi');
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
      toast.error('Erreur lors du téléchargement du PDF');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        id_evenement: parseInt(formData.id_evenement),
        taux_tva: parseFloat(formData.taux_tva),
        prestations: formData.prestations
          .filter(p => p.libelle_prestation.trim() !== '')
          .map(p => ({
            libelle_prestation: p.libelle_prestation,
            montant_ht_prestation: parseFloat(p.montant_ht_prestation)
          }))
      };

      if (selectedDevis) {
        await api.put(`/devis/${selectedDevis.id_devis}`, payload);
        toast.success('Devis modifié avec succès');
      } else {
        await api.post('/devis', payload);
        toast.success('Devis créé avec succès');
      }
      setShowFormModal(false);
      fetchDevis();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const addPrestation = () => {
    setFormData({
      ...formData,
      prestations: [...formData.prestations, { libelle_prestation: '', montant_ht_prestation: 0 }]
    });
  };

  const removePrestation = (index) => {
    if (formData.prestations.length > 1) {
      setFormData({
        ...formData,
        prestations: formData.prestations.filter((_, i) => i !== index)
      });
    }
  };

  const updatePrestation = (index, field, value) => {
    const newPrestations = [...formData.prestations];
    newPrestations[index][field] = value;
    setFormData({ ...formData, prestations: newPrestations });
  };

  const calculateTotal = () => {
    const totalHT = formData.prestations.reduce((sum, p) => sum + (parseFloat(p.montant_ht_prestation) || 0), 0);
    const tva = totalHT * (formData.taux_tva / 100);
    return { totalHT, tva, totalTTC: totalHT + tva };
  };

  const filteredDevis = devis.filter(d => {
    const matchSearch = 
      d.numero_devis?.toLowerCase().includes(search.toLowerCase()) ||
      d.nom_entreprise_client?.toLowerCase().includes(search.toLowerCase()) ||
      d.nom_evenement?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = !filterStatut || d.statut_devis === filterStatut;
    return matchSearch && matchStatut;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatutBadge = (statut) => {
    const s = statuts.find(st => st.value === statut);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s?.color || 'bg-gray-100'}`}>
        {s?.label || statut}
      </span>
    );
  };

  // ✅ Vérifie si on peut modifier/envoyer un devis
  const canEdit = (statut) => ['brouillon', 'modification'].includes(statut);
  const canSend = (statut) => ['brouillon', 'modification'].includes(statut);
  const canDelete = (statut) => statut !== 'accepte';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-gris-ardoise">Devis</h1>
          <p className="text-gray-500">Gérez vos devis ({devis.length})</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouveau devis
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
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
            {statuts.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-bleu-royal border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredDevis.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun devis trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bleu-ciel">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">N° Devis</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Événement</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-bleu-royal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDevis.map((d) => (
                  <tr key={d.id_devis} className={`hover:bg-gray-50 ${d.statut_devis === 'modification' ? 'bg-purple-50' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-bleu-royal">{d.numero_devis}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{d.nom_entreprise_client}</td>
                    <td className="px-4 py-3 text-sm">{d.nom_evenement}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(d.date_creation_devis)}</td>
                    <td className="px-4 py-3">{getStatutBadge(d.statut_devis)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => fetchDevisDetail(d.id_devis)} className="p-2 text-bleu-royal hover:bg-bleu-ciel rounded-btn" title="Voir">
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* ✅ Bouton Modifier - visible si brouillon ou modification */}
                        {canEdit(d.statut_devis) && (
                          <button onClick={() => handleEdit(d)} className="p-2 text-or hover:bg-yellow-50 rounded-btn" title="Modifier">
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button onClick={() => handleDownloadPDF(d.id_devis)} className="p-2 text-green-600 hover:bg-green-50 rounded-btn" title="PDF">
                          <Download className="w-4 h-4" />
                        </button>
                        
                        {/* ✅ Bouton Envoyer - visible si brouillon OU modification */}
                        {canSend(d.statut_devis) && (
                          <button onClick={() => handleSend(d.id_devis)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-btn" title={d.statut_devis === 'modification' ? 'Renvoyer au client' : 'Envoyer au client'}>
                            {d.statut_devis === 'modification' ? <RefreshCw className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                          </button>
                        )}
                        
                        {/* ✅ Bouton Supprimer - pas si accepté */}
                        {canDelete(d.statut_devis) && (
                          <button onClick={() => handleDelete(d.id_devis)} className="p-2 text-red-600 hover:bg-red-50 rounded-btn" title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {showDetailModal && selectedDevis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">{selectedDevis.numero_devis}</h2>
                <p className="text-gray-500 text-sm">{selectedDevis.nom_entreprise_client}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                {getStatutBadge(selectedDevis.statut_devis)}
                <p className="text-sm text-gray-500">Créé le {formatDate(selectedDevis.date_creation_devis)}</p>
              </div>

              {/* ✅ Affichage du motif de modification */}
              {selectedDevis.statut_devis === 'modification' && selectedDevis.motif_modification && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-btn">
                  <p className="text-sm font-semibold text-purple-700 mb-1">📝 Demande de modification du client :</p>
                  <p className="text-purple-600 whitespace-pre-wrap">{selectedDevis.motif_modification}</p>
                </div>
              )}

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
                        <td className="px-4 py-3 text-sm text-right font-semibold">{parseFloat(p.montant_ht_prestation).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 rounded-btn p-4">
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
                  <span className="font-bold text-lg text-bleu-royal">{parseFloat(selectedDevis.total_ttc || 0).toFixed(2)} €</span>
                </div>
              </div>

              {/* ✅ Actions dans le modal */}
              <div className="flex gap-3 mt-6">
                <button onClick={() => handleDownloadPDF(selectedDevis.id_devis)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Télécharger PDF
                </button>
                
                {canEdit(selectedDevis.statut_devis) && (
                  <>
                    <button onClick={() => { setShowDetailModal(false); handleEdit(selectedDevis); }} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                      <Edit className="w-5 h-5" />
                      Modifier
                    </button>
                    <button onClick={() => { setShowDetailModal(false); handleSend(selectedDevis.id_devis); }} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      {selectedDevis.statut_devis === 'modification' ? <RefreshCw className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                      {selectedDevis.statut_devis === 'modification' ? 'Renvoyer' : 'Envoyer'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Formulaire - inchangé */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-montserrat font-bold text-gris-ardoise">
                {selectedDevis ? 'Modifier le devis' : 'Nouveau devis'}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Événement *</label>
                  <select
                    className="input-field"
                    value={formData.id_evenement}
                    onChange={(e) => setFormData({...formData, id_evenement: e.target.value})}
                    required
                    disabled={selectedDevis} // Ne pas changer l'événement en modification
                  >
                    <option value="">Sélectionner</option>
                    {evenements.map(e => (
                      <option key={e.id_evenement} value={e.id_evenement}>
                        {e.nom_evenement} - {e.nom_entreprise_client}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">TVA (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    value={formData.taux_tva}
                    onChange={(e) => setFormData({...formData, taux_tva: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="label mb-0">Prestations</label>
                  <button type="button" onClick={addPrestation} className="text-bleu-royal hover:text-or text-sm font-semibold">
                    + Ajouter
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.prestations.map((p, index) => (
                    <div key={index} className="flex gap-3 items-center p-3 bg-gray-50 rounded-btn">
                      <input
                        type="text"
                        placeholder="Libellé"
                        className="input-field flex-1"
                        value={p.libelle_prestation}
                        onChange={(e) => updatePrestation(index, 'libelle_prestation', e.target.value)}
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Montant HT"
                        className="input-field w-32 text-right"
                        value={p.montant_ht_prestation}
                        onChange={(e) => updatePrestation(index, 'montant_ht_prestation', parseFloat(e.target.value) || 0)}
                      />
                      <span className="text-gray-500">€</span>
                      <button type="button" onClick={() => removePrestation(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-btn">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-bleu-ciel rounded-btn p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-bleu-royal">Total HT</span>
                  <span className="font-semibold text-bleu-royal">{calculateTotal().totalHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-bleu-royal">TVA ({formData.taux_tva}%)</span>
                  <span className="font-semibold text-bleu-royal">{calculateTotal().tva.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-bleu-royal/20">
                  <span className="font-bold text-lg text-bleu-royal">Total TTC</span>
                  <span className="font-bold text-lg text-bleu-royal">{calculateTotal().totalTTC.toFixed(2)} €</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowFormModal(false)} className="btn-secondary flex-1">Annuler</button>
                <button type="submit" disabled={saving} className={`btn-primary flex-1 ${saving ? 'opacity-50' : ''}`}>
                  {saving ? 'Enregistrement...' : selectedDevis ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevisAdmin;