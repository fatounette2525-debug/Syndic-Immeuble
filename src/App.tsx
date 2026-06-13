/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  Vote, 
  LayoutDashboard, 
  Settings, 
  Plus, 
  ShieldCheck,
  Building,
  Wrench,
  AlertCircle
} from 'lucide-react';

import { 
  Property, 
  Lot, 
  Owner, 
  Incident, 
  Transaction, 
  Meeting,
  IncidentStatus,
  MeetingStatus,
  TransactionType,
  TransactionCategory,
  ResolutionStatus
} from './types';

import { 
  INITIAL_PROPERTIES, 
  INITIAL_LOTS, 
  INITIAL_OWNERS, 
  INITIAL_INCIDENTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_MEETINGS 
} from './data/mockData';

// Modular views
import DashboardView from './components/DashboardView';
import PropertiesView from './components/PropertiesView';
import OwnersView from './components/OwnersView';
import IncidentsView from './components/IncidentsView';
import AccountingView from './components/AccountingView';
import MeetingsView from './components/MeetingsView';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Co-ownership states
  const [properties, setProperties] = useState<Property[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Local storage initialization & synchronization
  useEffect(() => {
    // Properties
    const cachedProperties = localStorage.getItem('syndic_properties');
    if (cachedProperties) {
      setProperties(JSON.parse(cachedProperties));
    } else {
      setProperties(INITIAL_PROPERTIES);
      localStorage.setItem('syndic_properties', JSON.stringify(INITIAL_PROPERTIES));
    }

    // Lots
    const cachedLots = localStorage.getItem('syndic_lots');
    if (cachedLots) {
      setLots(JSON.parse(cachedLots));
    } else {
      setLots(INITIAL_LOTS);
      localStorage.setItem('syndic_lots', JSON.stringify(INITIAL_LOTS));
    }

    // Owners
    const cachedOwners = localStorage.getItem('syndic_owners');
    if (cachedOwners) {
      setOwners(JSON.parse(cachedOwners));
    } else {
      setOwners(INITIAL_OWNERS);
      localStorage.setItem('syndic_owners', JSON.stringify(INITIAL_OWNERS));
    }

    // Incidents
    const cachedIncidents = localStorage.getItem('syndic_incidents');
    if (cachedIncidents) {
      setIncidents(JSON.parse(cachedIncidents));
    } else {
      setIncidents(INITIAL_INCIDENTS);
      localStorage.setItem('syndic_incidents', JSON.stringify(INITIAL_INCIDENTS));
    }

    // Transactions
    const cachedTransactions = localStorage.getItem('syndic_transactions');
    if (cachedTransactions) {
      setTransactions(JSON.parse(cachedTransactions));
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem('syndic_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    }

    // Meetings
    const cachedMeetings = localStorage.getItem('syndic_meetings');
    if (cachedMeetings) {
      setMeetings(JSON.parse(cachedMeetings));
    } else {
      setMeetings(INITIAL_MEETINGS);
      localStorage.setItem('syndic_meetings', JSON.stringify(INITIAL_MEETINGS));
    }
  }, []);

  // Update localStorage when lists change
  const saveAndSetProperties = (next: Property[]) => {
    setProperties(next);
    localStorage.setItem('syndic_properties', JSON.stringify(next));
  };

  const saveAndSetLots = (next: Lot[]) => {
    setLots(next);
    localStorage.setItem('syndic_lots', JSON.stringify(next));
  };

  const saveAndSetOwners = (next: Owner[]) => {
    setOwners(next);
    localStorage.setItem('syndic_owners', JSON.stringify(next));
  };

  const saveAndSetIncidents = (next: Incident[]) => {
    setIncidents(next);
    localStorage.setItem('syndic_incidents', JSON.stringify(next));
  };

  const saveAndSetTransactions = (next: Transaction[]) => {
    setTransactions(next);
    localStorage.setItem('syndic_transactions', JSON.stringify(next));
  };

  const saveAndSetMeetings = (next: Meeting[]) => {
    setMeetings(next);
    localStorage.setItem('syndic_meetings', JSON.stringify(next));
  };

  // State Mutation Handlers

  // 1. Properties mutations
  const handleAddProperty = (newProp: Omit<Property, 'id'>) => {
    const id = 'prop-' + Date.now();
    const created: Property = {
      ...newProp,
      id
    };
    saveAndSetProperties([...properties, created]);
  };

  const handleDeleteProperty = (id: string) => {
    saveAndSetProperties(properties.filter(p => p.id !== id));
    // Cascade delete lots & filter incidents/transactions to keep system neat
    saveAndSetLots(lots.filter(l => l.propertyId !== id));
    saveAndSetIncidents(incidents.filter(i => i.propertyId !== id));
    saveAndSetTransactions(transactions.filter(t => t.propertyId !== id));
    saveAndSetMeetings(meetings.filter(m => m.propertyId !== id));
  };

  // 2. Lots mutations (updates total property lots counter too)
  const handleAddLot = (newLot: Omit<Lot, 'id'>) => {
    const id = 'lot-' + Date.now();
    const created: Lot = {
      ...newLot,
      id
    };
    const nextLots = [...lots, created];
    saveAndSetLots(nextLots);

    // Update property counter
    saveAndSetProperties(properties.map(p => {
      if (p.id === newLot.propertyId) {
        return {
          ...p,
          totalLots: p.totalLots + 1
        };
      }
      return p;
    }));

    // Update owner counter
    saveAndSetOwners(owners.map(o => {
      if (o.id === newLot.ownerId) {
        return {
          ...o,
          lotsCount: o.lotsCount + 1
        };
      }
      return o;
    }));
  };

  // 3. Owners directory mutations
  const handleAddOwner = (newOwner: Omit<Owner, 'id'>) => {
    const id = 'owner-' + Date.now();
    const created: Owner = {
      ...newOwner,
      id
    };
    saveAndSetOwners([...owners, created]);
  };

  // Settlement of owner balance & post matched bookkeeping transactions
  const handleRecordPayment = (ownerId: string, amount: number) => {
    const targetOwner = owners.find(o => o.id === ownerId);
    if (!targetOwner) return;

    // Settle balance
    const nextOwners = owners.map(o => {
      if (o.id === ownerId) {
        return {
          ...o,
          outstandingBalance: o.outstandingBalance - amount
        };
      }
      return o;
    });
    saveAndSetOwners(nextOwners);

    // Link transaction property
    const sampleLot = lots.find(l => l.ownerId === ownerId);
    const linkedPropertyId = sampleLot ? sampleLot.propertyId : (properties[0]?.id || 'prop-1');

    // Post to ledger
    const transId = 'trans-' + Date.now();
    const postRecord: Transaction = {
      id: transId,
      propertyId: linkedPropertyId,
      type: TransactionType.REVENU,
      category: TransactionCategory.APPEL_DE_FONDS,
      amount,
      date: new Date().toISOString().split('T')[0],
      description: `Versement charges copro - ${targetOwner.lastName.toUpperCase()} ${targetOwner.firstName}`,
      isPaid: true
    };

    saveAndSetTransactions([postRecord, ...transactions]);
  };

  // Launch a global call of charges - disperse by tantiemes on all owners
  const handleTriggerChargesCall = (globalAmount: number, description: string) => {
    // Total sum of tantiemes currently privatized/associated to co-owners
    const totalAssignedTantiemes = lots.reduce((sum, l) => sum + l.tantiemes, 0) || 1000;

    // Disperse proportionally
    const nextOwners = owners.map(owner => {
      const ownerLots = lots.filter(l => l.ownerId === owner.id);
      const ownerTantiemesSum = ownerLots.reduce((sum, l) => sum + l.tantiemes, 0);

      if (ownerTantiemesSum > 0) {
        const ownerPortion = (ownerTantiemesSum / totalAssignedTantiemes) * globalAmount;
        return {
          ...owner,
          outstandingBalance: owner.outstandingBalance + Number(ownerPortion.toFixed(2))
        };
      }
      return owner;
    });

    saveAndSetOwners(nextOwners);

    // Record total expected billing income in general ledger
    const transId = 'trans-' + Date.now();
    const postRecord: Transaction = {
      id: transId,
      propertyId: properties[0]?.id || 'prop-1',
      type: TransactionType.REVENU,
      category: TransactionCategory.APPEL_DE_FONDS,
      amount: globalAmount,
      date: new Date().toISOString().split('T')[0],
      description: description,
      isPaid: true
    };
    saveAndSetTransactions([postRecord, ...transactions]);
  };

  // 4. Incidents and repair interventions
  const handleAddIncident = (newInc: Omit<Incident, 'id'>) => {
    const id = 'inc-' + Date.now();
    const created: Incident = {
      ...newInc,
      id
    };
    saveAndSetIncidents([...incidents, created]);
  };

  // Manage ticket transitions + auto record final cost as bookkeeping expenditure on completion
  const handleUpdateIncidentStatus = (
    id: string, 
    status: IncidentStatus, 
    finalCost?: number, 
    contractorName?: string
  ) => {
    const targetIncident = incidents.find(i => i.id === id);
    if (!targetIncident) return;

    const nextIncidents = incidents.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          status,
          finalCost: finalCost !== undefined ? finalCost : inc.finalCost,
          contractorName: contractorName !== undefined ? contractorName : inc.contractorName
        };
      }
      return inc;
    });
    saveAndSetIncidents(nextIncidents);

    // Cascade: If resolved and cost encoded -> create paid accounting debit expense
    if (status === IncidentStatus.RESOLU && finalCost && finalCost > 0) {
      const transId = 'trans-' + Date.now();
      const expenseItem: Transaction = {
        id: transId,
        propertyId: targetIncident.propertyId,
        type: TransactionType.DEPENSE,
        category: TransactionCategory.MAINTENANCE,
        amount: finalCost,
        date: new Date().toISOString().split('T')[0],
        description: `Règlement d'intervention : ${targetIncident.title} (${contractorName || 'Artisan'})`,
        isPaid: true
      };
      saveAndSetTransactions([expenseItem, ...transactions]);
    }
  };

  // 5. Accounting general ledger manual postings
  const handleAddTransaction = (newTrans: Omit<Transaction, 'id'>) => {
    const id = 'trans-' + Date.now();
    const created: Transaction = {
      ...newTrans,
      id
    };
    saveAndSetTransactions([created, ...transactions]);
  };

  const handleTogglePaid = (id: string) => {
    saveAndSetTransactions(transactions.map(t => {
      if (t.id === id) {
        return {
          ...t,
          isPaid: !t.isPaid
        };
      }
      return t;
    }));
  };

  // 6. Democrative Assemblies & Votes
  const handleAddMeeting = (newMeet: Omit<Meeting, 'id'>) => {
    const id = 'meet-' + Date.now();
    const created: Meeting = {
      ...newMeet,
      id
    };
    saveAndSetMeetings([...meetings, created]);
  };

  const handleCastVote = (
    meetingId: string, 
    resolutionId: string, 
    voteType: 'yes' | 'no' | 'abstain', 
    value: number
  ) => {
    const nextMeetings = meetings.map(meet => {
      if (meet.id === meetingId) {
        return {
          ...meet,
          resolutions: meet.resolutions.map(res => {
            if (res.id === resolutionId) {
              const nextYes = voteType === 'yes' ? res.voteYes + value : res.voteYes;
              const nextNo = voteType === 'no' ? res.voteNo + value : res.voteNo;
              const nextAbstain = voteType === 'abstain' ? res.voteAbstain + value : res.voteAbstain;

              const total = nextYes + nextNo + nextAbstain;
              const outcome = total > 0 && nextYes > nextNo ? ResolutionStatus.APPROUVEE : ResolutionStatus.REJETEE;

              return {
                ...res,
                voteYes: nextYes,
                voteNo: nextNo,
                voteAbstain: nextAbstain,
                status: outcome
              };
            }
            return res;
          })
        };
      }
      return meet;
    });

    saveAndSetMeetings(nextMeetings);
  };

  const handleUpdateMeetingStatus = (meetingId: string, status: MeetingStatus) => {
    saveAndSetMeetings(meetings.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          status,
          attendanceRate: status === MeetingStatus.REALISEE ? 85 : m.attendanceRate // auto-fill quorum simulation
        };
      }
      return m;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans" id="applet-viewport-root">
      
      {/* 1. SaaS Left-aligned Desktop Navigation Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none text-slate-700" id="saas-sidebar">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            SP
          </div>
          <div>
            <h2 className="font-display font-black text-slate-800 text-lg tracking-tight leading-tight">
              SYNDIC<span className="text-indigo-600">PRO</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Cabinet de Gestion SaaS</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-4 flex-1 space-y-1" id="nav-links-board">
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            Tableau de bord
          </button>

          <button
            id="nav-tab-properties"
            onClick={() => setActiveTab('properties')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'properties' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-4.5 w-4.5" />
            Immeubles & Lots
          </button>

          <button
            id="nav-tab-owners"
            onClick={() => setActiveTab('owners')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'owners' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            Copropriétaires
          </button>

          <button
            id="nav-tab-incidents"
            onClick={() => setActiveTab('incidents')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'incidents' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="h-4.5 w-4.5" />
            Incidents & Pannes
          </button>

          <button
            id="nav-tab-accounting"
            onClick={() => setActiveTab('accounting')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'accounting' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign className="h-4.5 w-4.5" />
            Comptabilité
          </button>

          <button
            id="nav-tab-meetings"
            onClick={() => setActiveTab('meetings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'meetings' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-4.5 w-4.5" />
            Assemblées (AG)
          </button>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-800">Cabinet DUPONT & CIE</p>
          <p className="font-mono text-[9px] text-slate-400">Utilisateur: fatounette2525@gmail.fr</p>
          <div className="flex items-center gap-1.5 pt-1.5 text-[10px] text-indigo-600 font-semibold">
            <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>Accès Administrateur</span>
          </div>
        </div>

      </aside>

      {/* 2. Main Content workspace wrapper */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" id="workspace-main">
        {activeTab === 'dashboard' && (
          <DashboardView
            properties={properties}
            owners={owners}
            incidents={incidents}
            transactions={transactions}
            meetings={meetings}
            onNavigate={(view) => setActiveTab(view)}
            onAddQuickIncident={() => {
              setActiveTab('incidents');
            }}
          />
        )}

        {activeTab === 'properties' && (
          <PropertiesView
            properties={properties}
            lots={lots}
            owners={owners}
            onAddProperty={handleAddProperty}
            onAddLot={handleAddLot}
            onDeleteProperty={handleDeleteProperty}
          />
        )}

        {activeTab === 'owners' && (
          <OwnersView
            owners={owners}
            lots={lots}
            onAddOwner={handleAddOwner}
            onRecordPayment={handleRecordPayment}
            onTriggerChargesCall={handleTriggerChargesCall}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentsView
            incidents={incidents}
            properties={properties}
            onAddIncident={handleAddIncident}
            onUpdateIncidentStatus={handleUpdateIncidentStatus}
          />
        )}

        {activeTab === 'accounting' && (
          <AccountingView
            transactions={transactions}
            properties={properties}
            onAddTransaction={handleAddTransaction}
            onTogglePaid={handleTogglePaid}
          />
        )}

        {activeTab === 'meetings' && (
          <MeetingsView
            meetings={meetings}
            properties={properties}
            onAddMeeting={handleAddMeeting}
            onCastVote={handleCastVote}
            onUpdateMeetingStatus={handleUpdateMeetingStatus}
          />
        )}
      </main>

    </div>
  );
}
