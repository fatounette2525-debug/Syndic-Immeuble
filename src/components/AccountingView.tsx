/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Building2,
  FileText
} from 'lucide-react';
import { Transaction, Property, TransactionType, TransactionCategory } from '../types';

interface AccountingViewProps {
  transactions: Transaction[];
  properties: Property[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onTogglePaid: (id: string) => void;
}

export default function AccountingView({
  transactions,
  properties,
  onAddTransaction,
  onTogglePaid
}: AccountingViewProps) {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Tous' | 'Revenu' | 'Dépense'>('Tous');
  const [propertyFilter, setPropertyFilter] = useState<string>('Tous');

  // Modal form trigger
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    propertyId: properties[0]?.id || '',
    type: TransactionType.DEPENSE,
    category: TransactionCategory.MAINTENANCE,
    amount: 100,
    date: new Date().toISOString().split('T')[0],
    description: '',
    invoiceRef: '',
    isPaid: true
  });

  // Filtered lists
  const filteredTransactions = useMemo(() => {
    return transactions.map(trans => ({
      ...trans,
      propertyName: properties.find(p => p.id === trans.propertyId)?.name || 'Immeuble inconnu'
    })).filter(trans => {
      const matchesSearch = trans.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (trans.invoiceRef && trans.invoiceRef.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === 'Tous' || trans.type === typeFilter;
      const matchesProperty = propertyFilter === 'Tous' || trans.propertyId === propertyFilter;

      return matchesSearch && matchesType && matchesProperty;
    }).sort((a, b) => b.date.localeCompare(a.date)); // Sorting newest first
  }, [transactions, properties, searchTerm, typeFilter, propertyFilter]);

  // General statistics
  const currentStatCalculations = useMemo(() => {
    let income = 0;
    let expense = 0;
    let unpaidExpenses = 0;

    // Filtered or globally computed? Let's use the current filtered set to stay context-rich, or global based on current selected property
    const contextTransactions = transactions.filter(t => propertyFilter === 'Tous' || t.propertyId === propertyFilter);

    contextTransactions.forEach(t => {
      if (t.type === TransactionType.REVENU) {
        income += t.amount;
      } else {
        if (t.isPaid) {
          expense += t.amount;
        } else {
          unpaidExpenses += t.amount;
        }
      }
    });

    return {
      income,
      expense,
      balance: income - expense,
      unpaidExpenses
    };
  }, [transactions, propertyFilter]);

  // Available categories depending on type
  const categoriesList = useMemo(() => {
    if (newTransaction.type === TransactionType.REVENU) {
      return [TransactionCategory.APPEL_DE_FONDS, TransactionCategory.AUTRE];
    } else {
      return [
        TransactionCategory.MAINTENANCE,
        TransactionCategory.ENERGIE,
        TransactionCategory.ASSURANCE,
        TransactionCategory.ADMINISTRATION,
        TransactionCategory.TRAVAUX,
        TransactionCategory.AUTRE
      ];
    }
  }, [newTransaction.type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.description || newTransaction.amount <= 0) return;

    onAddTransaction({
      propertyId: newTransaction.propertyId,
      type: newTransaction.type,
      category: newTransaction.category,
      amount: newTransaction.amount,
      date: newTransaction.date,
      description: newTransaction.description,
      invoiceRef: newTransaction.invoiceRef || undefined,
      isPaid: newTransaction.isPaid
    });

    // Reset
    setNewTransaction({
      propertyId: properties[0]?.id || '',
      type: TransactionType.DEPENSE,
      category: TransactionCategory.MAINTENANCE,
      amount: 100,
      date: new Date().toISOString().split('T')[0],
      description: '',
      invoiceRef: '',
      isPaid: true
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6" id="accounting-view-wrapper">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Comptabilité & Budgets
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Reconstitution du grand livre comptable. Saisissez les factures acquittées, suivez les fonds de roulement et ventilez par résidence.
          </p>
        </div>
        <button
          id="add-invoice-btn"
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition px-4 py-2 text-sm font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Saisir une Écriture
        </button>
      </div>

      {/* Grid of micro calculations */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4" id="accounting-mini-widgets">
        {/* Total inputs */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Recettes</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-800">
              {currentStatCalculations.income.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> Enquêté
            </span>
          </div>
        </div>

        {/* Total expenses paid */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Charges Payées</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-800">
              {currentStatCalculations.expense.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
            <span className="text-xs text-slate-500 font-bold bg-slate-50 px-1.5 py-0.5 rounded flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-0.5" /> Débiteur
            </span>
          </div>
        </div>

        {/* Net Cash Flow balance */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trésorerie Net</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold ${currentStatCalculations.balance >= 0 ? "text-teal-600" : "text-amber-600"}`}>
              {currentStatCalculations.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
            <span className={`text-[10px] font-bold uppercase ${currentStatCalculations.balance >= 0 ? "text-teal-700 bg-teal-50" : "text-amber-700 bg-amber-50"} px-1.5 py-0.5 rounded`}>
              {currentStatCalculations.balance >= 0 ? "Excédentaire" : "Déficitaire"}
            </span>
          </div>
        </div>

        {/* Unpaid Bills */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Factures en Attente</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold ${currentStatCalculations.unpaidExpenses > 0 ? "text-red-500" : "text-slate-400"}`}>
              {currentStatCalculations.unpaidExpenses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
            {currentStatCalculations.unpaidExpenses > 0 && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <AlertCircle className="h-3 w-3" /> À régler
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Ledger Display card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        
        {/* Inner Search / Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="accounting-search-input"
              type="text"
              placeholder="Ref facture, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto text-xs font-semibold select-none">
            {/* Quick Property switcher */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Immeuble :</span>
              <select
                id="ledger-property-filter"
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="border border-slate-200 rounded-lg p-1.5 bg-white text-xs text-slate-700 font-semibold"
              >
                <option value="Tous">Tous</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-1 border-l border-slate-200 pl-3">
              <button
                onClick={() => setTypeFilter('Tous')}
                className={`px-2.5 py-1.5 rounded-lg transition shrink-0 ${
                  typeFilter === 'Tous' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setTypeFilter('Revenu')}
                className={`px-2.5 py-1.5 rounded-lg transition shrink-0 ${
                  typeFilter === 'Revenu' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Recettes
              </button>
              <button
                onClick={() => setTypeFilter('Dépense')}
                className={`px-2.5 py-1.5 rounded-lg transition shrink-0 ${
                  typeFilter === 'Dépense' ? 'bg-amber-50 text-amber-700 border border-amber-250' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Dépenses
              </button>
            </div>
          </div>
        </div>

        {/* Double Entry List */}
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm" id="ledger-table-element">
              <thead className="bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Résidence</th>
                  <th scope="col" className="px-6 py-3">Intitulé de l'Écriture</th>
                  <th scope="col" className="px-6 py-3">Catégorie</th>
                  <th scope="col" className="px-6 py-3 text-right">Montant</th>
                  <th scope="col" className="px-6 py-3 text-center">Règlement / Preuve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredTransactions.map(trans => {
                  const isIncome = trans.type === TransactionType.REVENU;
                  
                  return (
                    <tr key={trans.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(trans.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>

                      {/* Property */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                        {trans.propertyName}
                      </td>

                      {/* Description & invoice relation */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm leading-tight">{trans.description}</span>
                          {trans.invoiceRef && (
                            <span className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                              <FileText className="h-3 w-3 text-slate-300" />
                              Ref: {trans.invoiceRef}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-600">
                          {trans.category}
                        </span>
                      </td>

                      {/* Amount with green / red indicators */}
                      <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-sm">
                        <span className={isIncome ? "text-emerald-600" : "text-amber-600"}>
                          {isIncome ? "+" : "-"} {trans.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </span>
                      </td>

                      {/* Settlement checker */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {isIncome ? (
                          <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            Perçu
                          </span>
                        ) : (
                          <button
                            id={`toggle-paid-${trans.id}`}
                            onClick={() => onTogglePaid(trans.id)}
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition ${
                              trans.isPaid
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-red-50 text-red-700 border border-red-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                            }`}
                            title={trans.isPaid ? "Facture payée. Cliquez pour marquer non-payé" : "En attente. Cliquez pour solder"}
                          >
                            {trans.isPaid ? 'Acquitté' : 'À Régler'}
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <DollarSign className="h-10 w-10 text-slate-300 mx-auto mb-2 stroke-1" />
            <p className="font-bold">Aucune transaction enregistrée.</p>
            <p className="text-xs text-slate-400 mt-0.5">Veuillez ajuster vos critères de filtrage ou insérer une nouvelle facture.</p>
          </div>
        )}

      </div>

      {/* MODAL: ADD MANUAL LEDGER ENTRY */}
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
              <DollarSign className="h-5 w-5 text-indigo-600" />
              Saisir une Écriture / Facture
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Type Switcher: Income / Expense */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Nature de l'Écriture</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg select-none">
                  <button
                    type="button"
                    onClick={() => setNewTransaction({ 
                      ...newTransaction, 
                      type: TransactionType.DEPENSE,
                      category: TransactionCategory.MAINTENANCE 
                    })}
                    className={`py-1.5 rounded-md text-xs font-bold transition flex justify-center items-center gap-1 ${
                      newTransaction.type === TransactionType.DEPENSE ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5 text-amber-500" /> Charge / Dépense
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTransaction({ 
                      ...newTransaction, 
                      type: TransactionType.REVENU,
                      category: TransactionCategory.APPEL_DE_FONDS
                    })}
                    className={`py-1.5 rounded-md text-xs font-bold transition flex justify-center items-center gap-1 ${
                      newTransaction.type === TransactionType.REVENU ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> Entrée / Recette
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Copropriété Bénéficiaire</label>
                <select
                  value={newTransaction.propertyId}
                  onChange={(e) => setNewTransaction({ ...newTransaction, propertyId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Catégorie Budgétaire</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value as TransactionCategory })}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Montant (€ TTC) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Date d'Émission</label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">N° de Facture / Pièce</label>
                  <input
                    type="text"
                    placeholder="Ex. FAC-2026-10"
                    value={newTransaction.invoiceRef}
                    onChange={(e) => setNewTransaction({ ...newTransaction, invoiceRef: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Libellé Comptable *</label>
                <input
                  type="text"
                  placeholder="Ex. Nettoyage des gouttières ou Provisions charges T1"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {newTransaction.type === TransactionType.DEPENSE && (
                <div className="flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    id="is-paid-ledger"
                    checked={newTransaction.isPaid}
                    onChange={(e) => setNewTransaction({ ...newTransaction, isPaid: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="is-paid-ledger" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Marquer la facture comme immédiatement réglée
                  </label>
                </div>
              )}

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
                  className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition rounded-lg"
                >
                  Comptabiliser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
