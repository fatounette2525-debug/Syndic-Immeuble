/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  X, 
  AlertTriangle, 
  Wrench, 
  CheckCircle, 
  Clock, 
  Eye, 
  ArrowRight,
  TrendingUp, 
  Building2,
  Calendar,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { Incident, Property, IncidentCategory, IncidentStatus, IncidentPriority } from '../types';

interface IncidentsViewProps {
  incidents: Incident[];
  properties: Property[];
  onAddIncident: (incident: Omit<Incident, 'id'>) => void;
  onUpdateIncidentStatus: (id: string, status: IncidentStatus, finalCost?: number, contractorName?: string) => void;
}

export default function IncidentsView({
  incidents,
  properties,
  onAddIncident,
  onUpdateIncidentStatus
}: IncidentsViewProps) {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tous');
  const [propertyFilter, setPropertyFilter] = useState<string>('Tous');

  // Modal / Selection states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Form registration states
  const [newIncident, setNewIncident] = useState({
    propertyId: properties[0]?.id || '',
    title: '',
    description: '',
    category: IncidentCategory.ASCENSEUR,
    status: IncidentStatus.NOUVEAU,
    priority: IncidentPriority.MOYENNE,
    contractorName: '',
    estimatedCost: 150
  });

  // Resolve sub-form
  const [resolveForm, setResolveForm] = useState({
    contractorName: '',
    finalCost: 150,
    status: IncidentStatus.EN_COURS
  });

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.map(inc => ({
      ...inc,
      propertyName: properties.find(p => p.id === inc.propertyId)?.name || 'Immeuble inconnu'
    })).filter(inc => {
      const matchesSearch = inc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            inc.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'Tous' || inc.status === statusFilter;
      const matchesProperty = propertyFilter === 'Tous' || inc.propertyId === propertyFilter;

      return matchesSearch && matchesStatus && matchesProperty;
    });
  }, [incidents, properties, searchTerm, statusFilter, propertyFilter]);

  const selectedIncident = useMemo(() => {
    const inc = incidents.find(i => i.id === selectedIncidentId);
    if (!inc) return null;
    return {
      ...inc,
      propertyName: properties.find(p => p.id === inc.propertyId)?.name || 'Immeuble inconnu'
    };
  }, [incidents, selectedIncidentId, properties]);

  // Handle addition
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.title || !newIncident.description) return;

    onAddIncident({
      propertyId: newIncident.propertyId,
      title: newIncident.title,
      description: newIncident.description,
      category: newIncident.category,
      status: newIncident.status,
      priority: newIncident.priority,
      contractorName: newIncident.contractorName || undefined,
      estimatedCost: newIncident.estimatedCost || undefined,
      dateCreated: new Date().toISOString().split('T')[0]
    });

    setNewIncident({
      propertyId: properties[0]?.id || '',
      title: '',
      description: '',
      category: IncidentCategory.ASCENSEUR,
      status: IncidentStatus.NOUVEAU,
      priority: IncidentPriority.MOYENNE,
      contractorName: '',
      estimatedCost: 150
    });
    setShowAddModal(false);
  };

  // Handle updating status / resolution
  const handleUpdateStatus = (id: string, nextStatus: IncidentStatus) => {
    if (nextStatus === IncidentStatus.RESOLU) {
      onUpdateIncidentStatus(
        id, 
        IncidentStatus.RESOLU, 
        resolveForm.finalCost || undefined, 
        resolveForm.contractorName || selectedIncident?.contractorName
      );
    } else {
      onUpdateIncidentStatus(
        id, 
        nextStatus, 
        undefined, 
        resolveForm.contractorName || selectedIncident?.contractorName
      );
    }
    // Update local visual states
    setSelectedIncidentId(null);
  };

  return (
    <div className="space-y-6" id="incidents-view-wrapper">
      {/* Header Grid */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Incidents & Interventions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Enregistrez les anomalies techniques et pilotez les ordres de service auprès des artisans prestataires.
          </p>
        </div>
        <button
          id="report-ticket-btn"
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 transition px-4 py-2 text-sm font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Enregistrer un Incident
        </button>
      </div>

      {/* Main Grid: Filters + List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (List of Tickets) */}
        <div className="lg:col-span-2 space-y-4">
                     {/* Incident Filter board */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="incident-search-input"
                type="text"
                placeholder="Chercher mot-clé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 bg-slate-50/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <select
                id="status-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Tous">Tous les statuts</option>
                <option value={IncidentStatus.NOUVEAU}>{IncidentStatus.NOUVEAU}</option>
                <option value={IncidentStatus.EN_COURS}>{IncidentStatus.EN_COURS}</option>
                <option value={IncidentStatus.RESOLU}>{IncidentStatus.RESOLU}</option>
              </select>
            </div>

            <div>
              <select
                id="property-filter-select"
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Tous">Toutes les résidences</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List display */}
          {filteredIncidents.length > 0 ? (
            <div className="space-y-3">
              {filteredIncidents.map(inc => {
                const priorityStyles = {
                  'Basse': 'bg-slate-50 text-slate-600 border-slate-100',
                  'Moyenne': 'bg-amber-50 text-amber-700 border-amber-100',
                  'Haute': 'bg-rose-50 text-rose-700 border-rose-100'
                }[inc.priority];

                const statusStyles = {
                  'Nouveau': 'bg-red-50 text-red-700 border-red-200',
                  'En cours': 'bg-blue-50 text-blue-700 border-blue-200',
                  'Résolu': 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }[inc.status];

                const isSelected = selectedIncidentId === inc.id;

                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncidentId(inc.id);
                      setResolveForm({
                        contractorName: inc.contractorName || '',
                        finalCost: inc.finalCost || inc.estimatedCost || 150,
                        status: inc.status
                      });
                    }}
                    className={`bg-white rounded-xl border p-4 shadow-xs transition duration-150 cursor-pointer ${
                      isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 font-mono">#{inc.id}</span>
                        <span className="text-xs font-semibold text-slate-500">{inc.propertyName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono">
                        <span className={`px-2 py-0.5 rounded border font-semibold ${priorityStyles}`}>{inc.priority}</span>
                        <span className={`px-2 py-0.5 rounded border font-bold ${statusStyles}`}>{inc.status}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-800 text-sm mt-2">{inc.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{inc.description}</p>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-3 text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span>Prestation : <strong className="text-slate-600 font-semibold">{inc.category}</strong></span>
                        {inc.contractorName && (
                          <span>Artisan : <strong className="text-slate-600 font-medium">{inc.contractorName}</strong></span>
                        )}
                      </div>
                      <span className="flex items-center gap-0.5"><Clock className="h-3 w-3 text-slate-400" /> {new Date(inc.dateCreated).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
              <Wrench className="h-12 w-12 text-slate-300 mx-auto stroke-1 mb-2" />
              <p className="font-bold text-slate-500">Aucun ticket d'incident enregistré.</p>
              <p className="text-xs text-slate-400 mt-0.5">Modifier les filtres ou cliquez sur "Enregistrer un Incident".</p>
            </div>
          )}

        </div>

        {/* Right Column: Ticket details or Actions pane */}
        <div className="lg:col-span-1">
          {selectedIncident ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 relative animate-in fade-in duration-200">
              
              <button
                onClick={() => setSelectedIncidentId(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-50 transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div>
                <span className="text-[10px] bg-red-50 text-red-700 font-mono font-bold px-2 py-0.5 rounded uppercase">
                  Détail Ticket #{selectedIncident.id}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2 leading-tight">
                  {selectedIncident.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-300" />
                  {selectedIncident.propertyName}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-600 leading-relaxed break-words whitespace-pre-wrap">
                  {selectedIncident.description}
                </p>
              </div>

              {/* Status & Priority indicators */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold py-1">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Priorité actuelle</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      selectedIncident.priority === IncidentPriority.HAUTE ? 'bg-rose-500' : selectedIncident.priority === IncidentPriority.MOYENNE ? 'bg-amber-500' : 'bg-slate-400'
                    }`}></span>
                    {selectedIncident.priority}
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">État du dossier</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      selectedIncident.status === IncidentStatus.RESOLU ? 'bg-emerald-500' : selectedIncident.status === IncidentStatus.EN_COURS ? 'bg-blue-500' : 'bg-red-500'
                    }`}></span>
                    {selectedIncident.status}
                  </p>
                </div>
              </div>

              {/* Cost Tracker Info */}
              <div className="border-t border-slate-100 pt-3 space-y-1 text-xs">
                {selectedIncident.estimatedCost && (
                  <div className="flex justify-between text-slate-500">
                    <span>Devis estimatif :</span>
                    <span className="font-mono font-semibold">{selectedIncident.estimatedCost.toLocaleString()} €</span>
                  </div>
                )}
                {selectedIncident.finalCost && (
                  <div className="flex justify-between text-slate-700 font-bold">
                    <span>Facture finale réglée :</span>
                    <span className="font-mono text-indigo-600">{selectedIncident.finalCost.toLocaleString()} €</span>
                  </div>
                )}
              </div>

              {/* ACTION: WORKFLOW MANAGER */}
              {selectedIncident.status !== IncidentStatus.RESOLU && (
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    Faire Évoluer la Résolution
                  </h4>

                  {selectedIncident.status === IncidentStatus.NOUVEAU ? (
                    <div>
                      {/* Form inputs for contractor assignment */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Désigner l'Artisan / Prestataire</label>
                          <input
                            type="text"
                            placeholder="Ex. Electricité Durand SA"
                            value={resolveForm.contractorName}
                            onChange={(e) => setResolveForm({ ...resolveForm, contractorName: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <button
                          onClick={() => handleUpdateStatus(selectedIncident.id, IncidentStatus.EN_COURS)}
                          className="w-full text-center text-xs py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          Mandater l'artisan & Lancer le Dossier
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-2.5 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
                        Incident en cours d'intervention par <strong className="text-blue-950">{selectedIncident.contractorName || 'l\'artisan mandaté'}</strong>.
                      </div>

                      {/* Close incident - enter total cost */}
                      <div className="space-y-2 border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Saisie de Clôture</p>
                        
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Montant Facturé Définitif (€) :</label>
                          <input
                            type="number"
                            value={resolveForm.finalCost}
                            onChange={(e) => setResolveForm({ ...resolveForm, finalCost: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1 border border-slate-200 rounded-lg font-mono text-xs text-right font-bold"
                          />
                        </div>

                        <button
                          onClick={() => handleUpdateStatus(selectedIncident.id, IncidentStatus.RESOLU)}
                          className="w-full text-center text-xs py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Clôturer et Archiver (Dépense)
                        </button>
                        <p className="text-[9px] text-center text-slate-400">La clôture enregistre automatiquement la facture dans la comptabilité de l'immeuble.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full">
              <Eye className="h-10 w-10 text-slate-300 stroke-1 mb-2" />
              <span>Cliquez sur une fiche d'incident pour examiner les relevés, mandater un artisan ou encoder les dépenses de régularisation.</span>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: ADD INCIDENT FORM */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600 animate-bounce" />
              Signaler un Incident Copropriété
            </h3>

            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Résidence Concernée *</label>
                <select
                  value={newIncident.propertyId}
                  onChange={(e) => setNewIncident({ ...newIncident, propertyId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Titre de l'Anomalie *</label>
                <input
                  type="text"
                  placeholder="Ex. Fuite canalisation cave entrée B"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Description Détaillée *</label>
                <textarea
                  placeholder="Expliquez la situation constatée, l'emplacement précis (étage, communs ou privés) et les risques."
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Catégorie</label>
                  <select
                    value={newIncident.category}
                    onChange={(e) => setNewIncident({ ...newIncident, category: e.target.value as IncidentCategory })}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={IncidentCategory.ASCENSEUR}>{IncidentCategory.ASCENSEUR}</option>
                    <option value={IncidentCategory.PLOMBERIE}>{IncidentCategory.PLOMBERIE}</option>
                    <option value={IncidentCategory.ELECTRICITE}>{IncidentCategory.ELECTRICITE}</option>
                    <option value={IncidentCategory.CHAUFFAGE}>{IncidentCategory.CHAUFFAGE}</option>
                    <option value={IncidentCategory.NETTOYAGE}>{IncidentCategory.NETTOYAGE}</option>
                    <option value={IncidentCategory.DIVERTISSEMENTS}>{IncidentCategory.DIVERTISSEMENTS}</option>
                    <option value={IncidentCategory.AUTRE}>{IncidentCategory.AUTRE}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Urgence / Niveau</label>
                  <select
                    value={newIncident.priority}
                    onChange={(e) => setNewIncident({ ...newIncident, priority: e.target.value as IncidentPriority })}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={IncidentPriority.BASSE}>{IncidentPriority.BASSE}</option>
                    <option value={IncidentPriority.MOYENNE}>{IncidentPriority.MOYENNE}</option>
                    <option value={IncidentPriority.HAUTE}>{IncidentPriority.HAUTE}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Devis prév. (€ estimé)</label>
                  <input
                    type="number"
                    value={newIncident.estimatedCost}
                    onChange={(e) => setNewIncident({ ...newIncident, estimatedCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Artisan suggéré</label>
                  <input
                    type="text"
                    placeholder="Optionnel"
                    value={newIncident.contractorName}
                    onChange={(e) => setNewIncident({ ...newIncident, contractorName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition rounded-lg"
                >
                  Déclarer l'Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
