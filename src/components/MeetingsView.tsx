/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Users, 
  Check, 
  X, 
  Vote, 
  CheckCircle2, 
  XCircle, 
  Play, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Meeting, Resolution, Property, MeetingStatus, ResolutionStatus } from '../types';

interface MeetingsViewProps {
  meetings: Meeting[];
  properties: Property[];
  onAddMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  onCastVote: (meetingId: string, resolutionId: string, voteType: 'yes' | 'no' | 'abstain', value: number) => void;
  onUpdateMeetingStatus: (meetingId: string, status: MeetingStatus) => void;
}

export default function MeetingsView({
  meetings,
  properties,
  onAddMeeting,
  onCastVote,
  onUpdateMeetingStatus
}: MeetingsViewProps) {
  // Navigation filters
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for creating a meeting
  const [newMeeting, setNewMeeting] = useState({
    propertyId: properties[0]?.id || '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '18:30',
    location: '',
    resolutionsText: [
      "Quitus au syndic de sa gestion pour l'exercice précédent",
      "Approbation des comptes annuels et du budget prévisionnel de l'immeuble",
      "Rénovation thermique des parties communes et ravalement de façade"
    ]
  });

  const selectedMeeting = useMemo(() => {
    const meet = meetings.find(m => m.id === selectedMeetingId);
    if (!meet) return null;
    return {
      ...meet,
      propertyName: properties.find(p => p.id === meet.propertyId)?.name || 'Résidence inconnue'
    };
  }, [meetings, selectedMeetingId, properties]);

  // Form submit for meeting scheduling
  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title || !newMeeting.location) return;

    // Build resolutions
    const resolutions: Resolution[] = newMeeting.resolutionsText
      .filter(text => text.trim().length > 0)
      .map((text, idx) => ({
        id: `res-${Date.now()}-${idx}`,
        title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        description: text,
        voteYes: 0,
        voteNo: 0,
        voteAbstain: 0,
        status: ResolutionStatus.EN_ATTENTE
      }));

    onAddMeeting({
      propertyId: newMeeting.propertyId,
      title: newMeeting.title,
      date: newMeeting.date,
      time: newMeeting.time,
      location: newMeeting.location,
      status: MeetingStatus.PLANIFIEE,
      resolutions
    });

    // Reset
    setNewMeeting({
      propertyId: properties[0]?.id || '',
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '18:30',
      location: '',
      resolutionsText: [
        "Quitus au syndic de sa gestion",
        "Approbation des comptes annuels et budget prévisionnel",
        "Remplacement de l'interphone d'entrée"
      ]
    });
    setShowAddModal(false);
  };

  const currentMonthFormatted = useMemo(() => {
    return new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }, []);

  return (
    <div className="space-y-6" id="meetings-view-wrapper">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Assemblées Générales & Votes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Convoquez les réunions de copropriété, organisez les tours de scrutin en direct et dressez les procès-verbaux de séance.
          </p>
        </div>
        <button
          id="convoc-ag-btn"
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition px-4 py-2 text-sm font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Convoquer une AG
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: List of General Assemblies */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
            Agenda des Réunions ({meetings.length})
          </h3>

          <div className="space-y-3" id="assemblies-list-container">
            {meetings.map(meet => {
              const propertyName = properties.find(p => p.id === meet.propertyId)?.name || 'Immeuble inconnu';
              const isSelected = selectedMeetingId === meet.id;
              
              // Status Styling
              const statusBadgeStyles = {
                'Planifiée': 'bg-indigo-50 text-indigo-700 border-indigo-100',
                'En cours': 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
                'Réalisée': 'bg-slate-100 text-slate-700 border-slate-200',
                'Annulée': 'bg-red-50 text-red-700 border-red-200'
              }[meet.status];

              return (
                <div
                  key={meet.id}
                  onClick={() => setSelectedMeetingId(meet.id)}
                  className={`bg-white rounded-xl border p-4.5 shadow-xs transition duration-150 cursor-pointer flex flex-col justify-between ${
                    isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                      {propertyName}
                    </span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${statusBadgeStyles}`}>
                      {meet.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">
                    {meet.title}
                  </h4>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 border-t border-slate-50 pt-2.5">
                    <p className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {new Date(meet.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {meet.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Selected Assembly interactive voting board */}
        <div className="lg:col-span-2">
          {selectedMeeting ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
              
              {/* Target info panel */}
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    SÉANCE ACTIVE
                  </span>
                  <h2 className="text-xl font-bold text-slate-800 font-sans">
                    {selectedMeeting.title}
                  </h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-300" />
                    Bâtiment : <strong className="text-slate-600 font-medium">{selectedMeeting.propertyName}</strong> • {selectedMeeting.location}
                  </p>
                </div>

                {/* State switcher inside details */}
                <div className="flex items-center gap-2 select-none">
                  {selectedMeeting.status === MeetingStatus.PLANIFIEE && (
                    <button
                      onClick={() => onUpdateMeetingStatus(selectedMeeting.id, MeetingStatus.EN_COURS)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition px-3.5 py-1.5 rounded-lg shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Ouvrir la Séance d'AG
                    </button>
                  )}
                  {selectedMeeting.status === MeetingStatus.EN_COURS && (
                    <button
                      onClick={() => onUpdateMeetingStatus(selectedMeeting.id, MeetingStatus.REALISEE)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-950 transition px-3.5 py-1.5 rounded-lg shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Clore & Rédiger PV
                    </button>
                  )}
                  {selectedMeeting.status === MeetingStatus.REALISEE && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> Quorum {selectedMeeting.attendanceRate}% • Clôturée
                    </span>
                  )}
                </div>
              </div>

              {/* Attendance checklist simulations for realization */}
              {selectedMeeting.status === MeetingStatus.EN_COURS && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3.5 text-xs text-blue-800 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">Scrutin électoral ouvert !</h5>
                    <p className="mt-0.5 leading-relaxed">
                      L'assemblée générale est en cours. Vous pouvez modifier les voix de chaque résolution pour simuler les votes des copropriétaires présents ou représentés.
                    </p>
                  </div>
                </div>
              )}

              {/* Resolutions vote grid list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                  Résolutions à l'ordre du jour
                </h4>

                {selectedMeeting.resolutions.map((res, index) => {
                  const totalVotes = res.voteYes + res.voteNo + res.voteAbstain;
                  const pctYes = totalVotes > 0 ? Math.round((res.voteYes / totalVotes) * 100) : 0;
                  const pctNo = totalVotes > 0 ? Math.round((res.voteNo / totalVotes) * 100) : 0;
                  const pctAbstain = totalVotes > 0 ? Math.round((res.voteAbstain / totalVotes) * 100) : 0;

                  // Resolution outcome calculation rules
                  const isApproved = totalVotes > 0 && res.voteYes > res.voteNo;
                  const isRejected = totalVotes > 0 && res.voteYes <= res.voteNo;

                  return (
                    <div key={res.id} className="p-4 bg-slate-50/50 border border-slate-150 rounded-lg space-y-3">
                      <div>
                        <h5 className="text-sm font-bold text-slate-800 flex items-start gap-2">
                          <span className="bg-slate-100 text-slate-600 rounded font-mono text-[10px] w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span>{res.title}</span>
                        </h5>
                        <p className="text-xs text-slate-500 mt-1 lines-clamp-2 leading-relaxed pl-7">
                          {res.description}
                        </p>
                      </div>

                      {/* Vote simulation interactive block */}
                      {selectedMeeting.status === MeetingStatus.EN_COURS ? (
                        <div className="bg-white border border-slate-100 p-3 rounded-lg flex items-center justify-between text-xs pl-7 flex-wrap gap-2">
                          <span className="font-semibold text-slate-500">Simuler un scrutin copro :</span>
                          <div className="flex items-center gap-2 select-none">
                            <button
                              onClick={() => onCastVote(selectedMeeting.id, res.id, 'yes', 50)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded font-bold border border-emerald-100 hover:bg-emerald-100 transition"
                            >
                              +50 POUT (Oui)
                            </button>
                            <button
                              onClick={() => onCastVote(selectedMeeting.id, res.id, 'no', 50)}
                              className="px-2.5 py-1 bg-red-50 text-red-700 rounded font-bold border border-red-100 hover:bg-red-105 transition"
                            >
                              +50 CONTRE
                            </button>
                            <button
                              onClick={() => onCastVote(selectedMeeting.id, res.id, 'abstain', 25)}
                              className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded font-bold hover:bg-slate-200 transition"
                            >
                              +25 ABSTENTION
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* Resulting percentage graph bars if voices exist */}
                      {totalVotes > 0 ? (
                        <div className="pl-7 space-y-2 select-none">
                          <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-500">
                            <span className="text-emerald-600">Oui: {res.voteYes}T ({pctYes}%)</span>
                            <span className="text-red-600">Non: {res.voteNo}T ({pctNo}%)</span>
                            <span className="text-slate-400">Abs: {res.voteAbstain}T ({pctAbstain}%)</span>
                          </div>

                          {/* Progress stacked bar */}
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                            <div className="bg-emerald-500 h-full" style={{ width: `${pctYes}%` }}></div>
                            <div className="bg-red-500 h-full" style={{ width: `${pctNo}%` }}></div>
                            <div className="bg-slate-300 h-full" style={{ width: `${pctAbstain}%` }}></div>
                          </div>

                          {/* Approval badge */}
                          <div className="flex items-center gap-1.5 pt-0.5 text-xs">
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                                <Check className="w-3.5 h-3.5" /> Approuvée à l'unanimité/majorité
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-100">
                                <X className="w-3.5 h-3.5" /> Rejetée (Majorité contre ou égalité)
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="pl-7 text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                          Aucun vote comptabilisé pour l'instant (Ouvrez la séance pour voter)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center h-full">
              <Vote className="h-12 w-12 text-slate-300 stroke-1 mb-2.5" />
              <p className="font-bold">Aperçu du Scrutin de Copropriété</p>
              <p className="max-w-md mx-auto text-xs text-slate-400 mt-1">
                Choisissez une Assemblée Générale dans la liste de gauche pour lancer les sessions de vote en direct, modifier les résolutions d'entretien de copropriété ou consulter les comptes approuvés.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: SCHEDULE AN ASSEMBLY */}
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
              <Calendar className="h-5 w-5 text-indigo-600" />
              Convoquer une Assemblée Générales
            </h3>

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Résidence / Immeuble concerné *</label>
                <select
                  value={newMeeting.propertyId}
                  onChange={(e) => setNewMeeting({ ...newMeeting, propertyId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Ordre du Jour Global / Titre *</label>
                <input
                  type="text"
                  placeholder="Ex. Assemblée Générale Ordinaire Annuelle 2026"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Date *</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Heure de début *</label>
                  <input
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Lieu / Adresse *</label>
                <input
                  type="text"
                  placeholder="Ex. Salon des Congrès, ou Salle Municipale de la Mairie"
                  value={newMeeting.location}
                  onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-500">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">Résolutions Types Inscrites :</p>
                <ol className="list-decimal pl-4.5 space-y-1">
                  {newMeeting.resolutionsText.map((text, idx) => (
                    <li key={idx} className="leading-tight">{text}</li>
                  ))}
                </ol>
                <p className="text-[9px] text-slate-400 mt-2">Ce lot de résolutions sera automatiquement inséré au vote du syndicat lors de la réunion.</p>
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
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition rounded-lg"
                >
                  Publier la Convocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
