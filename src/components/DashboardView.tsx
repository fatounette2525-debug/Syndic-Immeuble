/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert,
  Wrench,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar 
} from 'recharts';
import { Property, Owner, Incident, Transaction, Meeting, TransactionType, IncidentStatus, IncidentPriority } from '../types';

interface DashboardViewProps {
  properties: Property[];
  owners: Owner[];
  incidents: Incident[];
  transactions: Transaction[];
  meetings: Meeting[];
  onNavigate: (view: string) => void;
  onAddQuickIncident: () => void;
}

export default function DashboardView({
  properties,
  owners,
  incidents,
  transactions,
  meetings,
  onNavigate,
  onAddQuickIncident
}: DashboardViewProps) {

  // Computed Stats
  const activeIncidents = useMemo(() => {
    return incidents.filter(i => i.status !== 'Résolu').length;
  }, [incidents]);

  const urgentIncidents = useMemo(() => {
    return incidents.filter(i => i.status !== 'Résolu' && i.priority === 'Haute').length;
  }, [incidents]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.isPaid || t.type === TransactionType.REVENU) {
        if (t.type === TransactionType.REVENU) income += t.amount;
        else expense += t.amount;
      }
    });
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const unpaidChargesRatioCount = useMemo(() => {
    const totalUnpaid = owners.reduce((sum, owner) => sum + (owner.outstandingBalance > 0 ? owner.outstandingBalance : 0), 0);
    return totalUnpaid;
  }, [owners]);

  // Chart 1: Financial Flow (simplified over recent months for visual aid)
  const financialData = [
    { name: 'Jan', Revenus: 12000, Dépenses: 3500 },
    { name: 'Fév', Revenus: 12500, Dépenses: 4200 },
    { name: 'Mar', Revenus: 15000, Dépenses: 8900 },
    { name: 'Avr', Revenus: 14000, Dépenses: 6200 },
    { name: 'Mai', Revenus: 18500, Dépenses: 11000 },
    { name: 'Juin', Revenus: 30500, Dépenses: 9400 } // T2 dues calls + expenses
  ];

  // Chart 2: Expenses by category breakdown
  const expensesBreakdown = useMemo(() => {
    const categories: Record<string, number> = {
      'Maintenance': 0,
      'Énergie': 0,
      'Assurance': 0,
      'Frais syndic': 0,
      'Travaux': 0,
      'Autre': 0
    };

    transactions
      .filter(t => t.type === TransactionType.DEPENSE)
      .forEach(t => {
        if (t.category.includes('Maintenance')) categories['Maintenance'] += t.amount;
        else if (t.category.includes('Énergie')) categories['Énergie'] += t.amount;
        else if (t.category.includes('Assurance')) categories['Assurance'] += t.amount;
        else if (t.category.includes('syndic')) categories['Frais syndic'] += t.amount;
        else if (t.category.includes('Travaux')) categories['Travaux'] += t.amount;
        else categories['Autre'] += t.amount;
      });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [transactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

  // Upcoming meetings
  const upcomingMeetingsList = useMemo(() => {
    return meetings
      .filter(m => m.status === 'Planifiée')
      .slice(0, 3);
  }, [meetings]);

  // Recent incidents
  const recentIncidentsList = useMemo(() => {
    return [...incidents]
      .sort((a, b) => b.dateCreated.localeCompare(a.dateCreated))
      .slice(0, 4);
  }, [incidents]);

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* SaaS Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5 pt-2">
        <div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-slate-900">
            Tableau de Bord Global
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Aperçu temps réel de vos immeubles en gestion et des indicateurs de copropriété.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            id="quick-incident-btn"
            onClick={onAddQuickIncident}
            className="inline-flex items-center justify-center rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition px-4 py-2 text-sm font-semibold border border-red-200"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Signaler un Incident
          </button>
          <button
            id="new-prop-dashboard-btn"
            onClick={() => onNavigate('properties')}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition px-4 py-2 text-sm font-semibold shadow-sm shadow-indigo-600/10"
          >
            <Building2 className="mr-2 h-4 w-4" />
            Gérer les Immeubles
          </button>
        </div>
      </div>

      {/* Grid of Key SaaS KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
        {/* KPI 1 : Immeubles */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition duration-200" id="kpi-immeubles">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Immeubles en Gestion</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{properties.length}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> Actifs
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Total de {properties.reduce((acc, p) => acc + p.totalLots, 0)} lots privatifs enregistrés.
          </p>
        </div>

        {/* KPI 2 : Finances Clés */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition duration-200" id="kpi-tresor">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Trésorerie Globale</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {totals.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              Excédent
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Cumul net : <span className="text-emerald-600">+{totals.income.toLocaleString('fr-FR')} €</span> de rentrées.
          </p>
        </div>

        {/* KPI 3 : Imparfaits / Solde Impayés */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition duration-200" id="kpi-impayes">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Solde Impayés</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600">
              {unpaidChargesRatioCount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
            {unpaidChargesRatioCount > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                À recouvrer
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Relances de paiement prêtes auprès de {owners.filter(o => o.outstandingBalance > 0).length} copropriétaires.
          </p>
        </div>

        {/* KPI 4 : Incidents Actifs */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition duration-200" id="kpi-incidents">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Pannes & Maintenance</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{activeIncidents}</span>
            {urgentIncidents > 0 ? (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <ShieldAlert className="h-3.5 w-3.5 mr-0.5" /> {urgentIncidents} Critique{urgentIncidents > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Sous contrôle
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {incidents.filter(i => i.status === 'Nouveau').length} nouveau{incidents.filter(i => i.status === 'Nouveau').length > 1 ? 'x' : ''} incident non-traité.
          </p>
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts">
        {/* Real Cash Flow Trend Area Chart (2/3 columns) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-950 font-sans">
                Évolution Budgétaire (Semestre Actuel)
              </h3>
              <p className="text-xs text-slate-500">Comparatif trimestriel des rentrées vs sorties globales</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> Revenus (Appels)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-teal-400 rounded-full"></span> Dépenses (Exploitation)</span>
            </div>
          </div>
          <div className="h-64" id="cashflow-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  labelClassName="text-slate-400 text-xs font-bold font-mono"
                />
                <Area type="monotone" dataKey="Revenus" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenus)" />
                <Area type="monotone" dataKey="Dépenses" stroke="#2dd4bf" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDepenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses categorized breakdown (1/3 column) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-950 font-sans">
              Répartition des Dépenses
            </h3>
            <p className="text-xs text-slate-500">Par grandes lignes de charges de copropriété</p>
          </div>

          {expensesBreakdown.length > 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center">
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {expensesBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => `${value} €`}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text indicating total budget */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dépenses tot.</span>
                  <span className="text-lg font-bold text-slate-800">
                    {expensesBreakdown.reduce((sum, item) => sum + item.value, 0).toLocaleString()} €
                  </span>
                </div>
              </div>
              
              {/* Legend with matching colors */}
              <div className="mt-2 select-none w-full grid grid-cols-2 gap-2 max-h-24 overflow-y-auto pr-1">
                {expensesBreakdown.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="truncate">{item.name} ({Math.round(item.value / expensesBreakdown.reduce((s, x) => s + x.value, 0) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-12 text-center py-6 text-slate-400 text-sm">
              <TrendingUp className="h-8 w-8 mx-auto text-slate-300 stroke-1 mb-2" />
              Aucune dépense enregistrée sur cette période
            </div>
          )}
        </div>
      </div>

      {/* Active Assemblies & Recent Incidents section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-secondary-grid">
        
        {/* Next General Assemblies Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between" id="dashboard-meetings">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950 font-sans flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  Prochaines Assemblées Générales (AG)
                </h3>
                <p className="text-xs text-slate-500">Planification des votes et résolutions démocratiques</p>
              </div>
              <button 
                onClick={() => onNavigate('meetings')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
              >
                Tout voir →
              </button>
            </div>

            {upcomingMeetingsList.length > 0 ? (
              <div className="space-y-3">
                {upcomingMeetingsList.map(meet => {
                  const propertyName = properties.find(p => p.id === meet.propertyId)?.name || 'Immeuble inconnu';
                  return (
                    <div 
                      key={meet.id} 
                      className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 hover:bg-slate-50 border border-slate-100 rounded-lg transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 uppercase">
                            AG Planifiée
                          </span>
                          <span className="text-xs font-semibold text-slate-500 font-mono">
                            {meet.time}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 break-words pr-2">
                          {meet.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {propertyName} • <span className="font-medium text-slate-700">{meet.location}</span>
                        </p>
                      </div>
                      <div className="mt-3 sm:mt-0 flex flex-col items-end">
                        <div className="text-xs font-bold text-slate-900 bg-slate-100 rounded px-2 py-1 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {new Date(meet.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">
                          {meet.resolutions.length} résolution{meet.resolutions.length > 1 ? 's' : ''} au vote
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                Aucune assemblée générale planifiée prochainement.
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button 
              onClick={() => onNavigate('meetings')}
              className="w-full text-center text-xs py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-medium hover:bg-slate-100 transition"
            >
              Organiser un vote ou planifier une AG
            </button>
          </div>
        </div>

        {/* Live Activity & Incident Tickets Tracker */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between" id="dashboard-tickets">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950 font-sans flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Tickets & Incidents Récents
                </h3>
                <p className="text-xs text-slate-500">Flux d'interventions techniques dans les parties communes</p>
              </div>
              <button 
                onClick={() => onNavigate('incidents')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
              >
                Gérer les tickets →
              </button>
            </div>

            <div className="space-y-3">
              {recentIncidentsList.map(incident => {
                const propertyName = properties.find(p => p.id === incident.propertyId)?.name || 'Immeuble inconnu';
                
                // badge styles
                const priorityStyles = {
                  'Basse': 'bg-slate-50 text-slate-600 border-slate-100',
                  'Moyenne': 'bg-amber-50 text-amber-700 border-amber-100',
                  'Haute': 'bg-rose-50 text-rose-700 border-rose-100'
                }[incident.priority];

                const statusStyles = {
                  'Nouveau': 'bg-red-50 text-red-700 border-red-200',
                  'En cours': 'bg-blue-50 text-blue-700 border-blue-200',
                  'Résolu': 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }[incident.status];

                return (
                  <div key={incident.id} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-3 transition">
                    <div className="mt-1 shrink-0">
                      <span className={`w-3 h-3 rounded-full block ${
                        incident.status === IncidentStatus.RESOLU ? 'bg-emerald-500' : incident.priority === IncidentPriority.HAUTE ? 'bg-rose-500' : 'bg-amber-500'
                      }`}></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-slate-600 truncate">{propertyName}</span>
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded border ${priorityStyles}`}>
                            {incident.priority}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded border ${statusStyles}`}>
                            {incident.status}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 truncate">{incident.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{incident.description}</p>
                      
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                        <span>Catégorie: <strong className="text-slate-500">{incident.category}</strong></span>
                        <span>Créé le {new Date(incident.dateCreated).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button 
              onClick={onAddQuickIncident}
              className="w-full text-center text-xs py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Enregistrer une nouvelle urgence copriété
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
