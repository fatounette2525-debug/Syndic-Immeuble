/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  Plus, 
  Search, 
  X, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  ShieldAlert, 
  TrendingUp, 
  Send,
  Calendar,
  Layers
} from 'lucide-react';
import { Owner, Lot } from '../types';

interface OwnersViewProps {
  owners: Owner[];
  lots: Lot[];
  onAddOwner: (owner: Omit<Owner, 'id'>) => void;
  onRecordPayment: (ownerId: string, amount: number) => void;
  onTriggerChargesCall: (globalAmount: number, description: string) => void;
}

export default function OwnersView({
  owners,
  lots,
  onAddOwner,
  onRecordPayment,
  onTriggerChargesCall
}: OwnersViewProps) {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'Excéda' | 'Impayé' | 'Solde-Nul'>('Tous');

  // Form overlay states
  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);
  const [newOwner, setNewOwner] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    joinedDate: new Date().toISOString().split('T')[0],
    isCouncilMember: false,
    outstandingBalance: 0
  });

  const [selectedOwnerForPayment, setSelectedOwnerForPayment] = useState<Owner | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(100);

  const [showChargesCallModal, setShowChargesCallModal] = useState(false);
  const [chargesCallAmount, setChargesCallAmount] = useState<number>(5000);
  const [chargesDescription, setChargesDescription] = useState('Appel de charges - Entretien Courant 3ème Trimestre 2026');

  // Filter Owners
  const filteredOwners = useMemo(() => {
    return owners.filter(owner => {
      const fullName = `${owner.firstName} ${owner.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                            owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            owner.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (statusFilter === 'Tous') return matchesSearch;
      if (statusFilter === 'Impayé') return matchesSearch && owner.outstandingBalance > 0;
      if (statusFilter === 'Excéda') return matchesSearch && owner.outstandingBalance < 0;
      if (statusFilter === 'Solde-Nul') return matchesSearch && owner.outstandingBalance === 0;
      return matchesSearch;
    });
  }, [owners, searchTerm, statusFilter]);

  // Aggregate metrics
  const aggregateMetrics = useMemo(() => {
    let totalDue = 0;
    let totalNegative = 0;
    owners.forEach(o => {
      if (o.outstandingBalance > 0) totalDue += o.outstandingBalance;
      else if (o.outstandingBalance < 0) totalNegative += Math.abs(o.outstandingBalance);
    });
    return {
      totalDue,
      totalNegative,
      activeDebtorsCount: owners.filter(o => o.outstandingBalance > 0).length
    };
  }, [owners]);

  // Form submissions
  const handleCreateOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwner.firstName || !newOwner.lastName || !newOwner.email) return;

    onAddOwner({
      ...newOwner,
      lotsCount: 0 // Will auto calculate through relation with lots
    });

    setNewOwner({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      joinedDate: new Date().toISOString().split('T')[0],
      isCouncilMember: false,
      outstandingBalance: 0
    });
    setShowAddOwnerModal(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOwnerForPayment || paymentAmount <= 0) return;

    onRecordPayment(selectedOwnerForPayment.id, paymentAmount);
    setSelectedOwnerForPayment(null);
    setPaymentAmount(100);
  };

  const handleTriggerChargesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chargesCallAmount <= 0 || !chargesDescription) return;

    onTriggerChargesCall(chargesCallAmount, chargesDescription);
    setShowChargesCallModal(false);
    alert(`L'appel de charges global de ${chargesCallAmount.toLocaleString('fr-FR')} € a bien été émis ! Les comptes des copropriétaires ont été débités proportionnellement à leurs tantièmes.`);
  };

  return (
    <div className="space-y-6" id="owners-view-wrapper">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Copropriétaires & Comptes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gérez l'annuaire des résidents, suivez les balances financières individuelles et lancez les appels de charges.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          {/* Global charges call action */}
          <button
            id="trigger-funds-btn"
            onClick={() => setShowChargesCallModal(true)}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition px-4 py-2 text-sm font-semibold cursor-pointer"
          >
            <TrendingUp className="mr-2 h-4 w-4 text-indigo-600" />
            Lancer un Appel de Charges
          </button>
          
          <button
            id="add-owner-btn"
            onClick={() => setShowAddOwnerModal(true)}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition px-4 py-2 text-sm font-semibold shadow-sm cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Copropriétaire
          </button>
        </div>
      </div>

      {/* Global Financial Alert strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="owners-summary-widgets">
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Impayés totaux</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {aggregateMetrics.totalDue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
          <div className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Excédents / Avances client</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {aggregateMetrics.totalNegative.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Débiteurs actifs</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {aggregateMetrics.activeDebtorsCount} copro{aggregateMetrics.activeDebtorsCount > 1 ? 's' : ''}
            </p>
          </div>
          <div className="p-2 bg-slate-50 text-slate-500 rounded-lg shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Roster Area, Table, Search and Status filters */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Navigation & Search bar inside card */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="owner-search-input"
              type="text"
              placeholder="Chercher copropriétaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-1.5 self-stretch sm:self-auto overflow-x-auto select-none" id="status-filters">
            <button
              onClick={() => setStatusFilter('Tous')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition shrink-0 ${
                statusFilter === 'Tous' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setStatusFilter('Impayé')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition shrink-0 ${
                statusFilter === 'Impayé' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              En Impayé
            </button>
            <button
              onClick={() => setStatusFilter('Excéda')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition shrink-0 ${
                statusFilter === 'Excéda' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Créditeurs / Excédents
            </button>
          </div>
        </div>

        {/* Co-owners table */}
        {filteredOwners.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm" id="owners-table-element">
              <thead className="bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3">Copropriétaire</th>
                  <th scope="col" className="px-6 py-3">Coordonnées</th>
                  <th scope="col" className="px-6 py-3">Lots Détenus</th>
                  <th scope="col" className="px-6 py-3">Statut Conseil</th>
                  <th scope="col" className="px-6 py-3 text-right">Balance Financière</th>
                  <th scope="col" className="px-6 py-3 text-right">Outils</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredOwners.map(owner => {
                  // Find all lots owned by this person
                  const ownerLots = lots.filter(l => l.ownerId === owner.id);
                  const isDebtor = owner.outstandingBalance > 0;
                  const isCreditor = owner.outstandingBalance < 0;

                  return (
                    <tr key={owner.id} className="hover:bg-slate-50 transition duration-150">
                      {/* Identity & Registered date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                            isDebtor ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {owner.firstName[0]}{owner.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">
                              {owner.lastName.toUpperCase()} {owner.firstName}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Enregistré le {new Date(owner.joinedDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact details */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        <p className="flex items-center gap-1.5 font-medium">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {owner.email}
                        </p>
                        <p className="flex items-center gap-1.5 font-mono text-slate-400 mt-1">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {owner.phone}
                        </p>
                      </td>

                      {/* Lots breakdown */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">
                            {ownerLots.length} lot{ownerLots.length > 1 ? 's' : ''} privatif{ownerLots.length > 1 ? 's' : ''}
                          </span>
                          {ownerLots.length > 0 ? (
                            <span className="text-[10px] text-slate-400 max-w-[120px] truncate mt-0.5">
                              Lots: {ownerLots.map(l => l.number).join(', ')}
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-500 font-medium">Aucun lot raccordé</span>
                          )}
                        </div>
                      </td>

                      {/* Council Member status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {owner.isCouncilMember ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            <ShieldAlert className="h-3 w-3" />
                            Conseil Syndical
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Copropriétaire seul</span>
                        )}
                      </td>

                      {/* Financial status balance */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-mono text-xs font-bold">
                          {isDebtor ? (
                            <span className="text-red-600 bg-red-50 py-1 px-2.5 rounded-lg border border-red-100">
                              Dû : {owner.outstandingBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </span>
                          ) : isCreditor ? (
                            <span className="text-emerald-600 bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-100">
                              Crédit : {Math.abs(owner.outstandingBalance).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </span>
                          ) : (
                            <span className="text-slate-500 bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-100">
                              À jour (0,00 €)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Context actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <button
                          onClick={() => setSelectedOwnerForPayment(owner)}
                          className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1.5 px-3 rounded-lg transition"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          Encaisser
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-2 stroke-1" />
            <p className="font-bold">Aucun copropriétaire trouvé.</p>
            <p className="text-xs text-slate-400 mt-0.5">Essayez d'ajuster le terme de votre recherche.</p>
          </div>
        )}
      </div>

      {/* MODAL 1: REGISTER COPROPRIETAIRE */}
      {showAddOwnerModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowAddOwnerModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-indigo-600" />
              Nouveau Copropriétaire
            </h3>

            <form onSubmit={handleCreateOwner} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Prénom *</label>
                  <input
                    type="text"
                    placeholder="Ex. Marc"
                    value={newOwner.firstName}
                    onChange={(e) => setNewOwner({ ...newOwner, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Nom *</label>
                  <input
                    type="text"
                    placeholder="Ex. Duval"
                    value={newOwner.lastName}
                    onChange={(e) => setNewOwner({ ...newOwner, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Adresse Email *</label>
                <input
                  type="email"
                  placeholder="Ex. m.duval@email.fr"
                  value={newOwner.email}
                  onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Numéro de Téléphone</label>
                <input
                  type="text"
                  placeholder="Ex. 06 12 34 56 78"
                  value={newOwner.phone}
                  onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Adresse Principale</label>
                <input
                  type="text"
                  placeholder="Ex. Appt 101, 42 rue de la République, Paris"
                  value={newOwner.address}
                  onChange={(e) => setNewOwner({ ...newOwner, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 py-1 select-none">
                <input
                  type="checkbox"
                  id="choice-member"
                  checked={newOwner.isCouncilMember}
                  onChange={(e) => setNewOwner({ ...newOwner, isCouncilMember: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="choice-member" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Membre élu du Conseil Syndical
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddOwnerModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition rounded-lg"
                >
                  Créer la Fiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT PAYOUT */}
      {selectedOwnerForPayment && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-sm p-6 relative">
            <button
              onClick={() => setSelectedOwnerForPayment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-indigo-600 animate-pulse" />
              Enregistrer un Virement / Chèque
            </h3>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 text-xs">
              <p className="text-slate-500 font-semibold uppercase">Copropriétaire :</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {selectedOwnerForPayment.lastName.toUpperCase()} {selectedOwnerForPayment.firstName}
              </p>
              <p className="text-slate-500 mt-2">
                Solde actuel : <strong className={`${selectedOwnerForPayment.outstandingBalance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {selectedOwnerForPayment.outstandingBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </strong>
              </p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Montant Encaissé (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-center font-mono font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOwnerForPayment(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition rounded-lg"
                >
                  Valider l'Encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DISPATCH GLOBAL FEE CALL RESOLUTION (Appel de charges) */}
      {showChargesCallModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowChargesCallModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Lancer un Appel de Fonds Trimestriel
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Ce système génère les échéances et répartit le montant total sur les copropriétaires inscrits, au prorata exact des tantièmes cumulés déclarés de leurs lots privatisés.
            </p>

            <form onSubmit={handleTriggerChargesSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Budget Total Demandé (€) *</label>
                <input
                  type="number"
                  value={chargesCallAmount}
                  onChange={(e) => setChargesCallAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Ex: Le budget de charges d'exploitation trimestrielles voté en assemblée.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Libellé / Description *</label>
                <textarea
                  value={chargesDescription}
                  onChange={(e) => setChargesDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
                  required
                />
              </div>

              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-xs text-amber-800 flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Aperçu de la ventilation :</p>
                  <p className="mt-1">
                    Le budget de {chargesCallAmount.toLocaleString()} € sera divisé by the exact total tantièmes to post the debits.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowChargesCallModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  Ventiler et Émettre l'Appel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
