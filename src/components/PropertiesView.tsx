/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Hash, 
  Layers, 
  Plus, 
  Search, 
  X, 
  ChevronRight, 
  User, 
  Filter, 
  PieChart as PieIcon,
  Trash2
} from 'lucide-react';
import { Property, Lot, Owner, PropertyType, LotType } from '../types';

interface PropertiesViewProps {
  properties: Property[];
  lots: Lot[];
  owners: Owner[];
  onAddProperty: (property: Omit<Property, 'id'>) => void;
  onAddLot: (lot: Omit<Lot, 'id'>) => void;
  onDeleteProperty: (id: string) => void;
}

export default function PropertiesView({
  properties,
  lots,
  owners,
  onAddProperty,
  onAddLot,
  onDeleteProperty
}: PropertiesViewProps) {
  // Local states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('Tous');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  
  // Forms states
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    type: PropertyType.RESIDENTIAL,
    buildYear: new Date().getFullYear() - 10,
    totalTantiemes: 1000,
    image: ''
  });

  const [showAddLotModal, setShowAddLotModal] = useState(false);
  const [newLot, setNewLot] = useState({
    number: '',
    type: LotType.APPARTEMENT,
    floor: 0,
    tantiemes: 50,
    ownerId: owners[0]?.id || ''
  });

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      const matchesSearch = prop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            prop.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'Tous' || prop.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [properties, searchTerm, typeFilter]);

  // Selected property details
  const selectedProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  // Selected property lots
  const selectedPropertyLots = useMemo(() => {
    if (!selectedPropertyId) return [];
    return lots.filter(l => l.propertyId === selectedPropertyId);
  }, [lots, selectedPropertyId]);

  // Total tantiemes used so far in selected property
  const currentPropertyTantiemesSum = useMemo(() => {
    return selectedPropertyLots.reduce((sum, lot) => sum + lot.tantiemes, 0);
  }, [selectedPropertyLots]);

  // Handlers
  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProperty.name || !newProperty.address) return;

    // Use default Unsplash image if blank
    const imagesList = [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ];
    const imageToUse = newProperty.image || imagesList[Math.floor(Math.random() * imagesList.length)];

    onAddProperty({
      ...newProperty,
      totalLots: 0, // dynamic
      image: imageToUse
    });

    // Reset
    setNewProperty({
      name: '',
      address: '',
      type: PropertyType.RESIDENTIAL,
      buildYear: 2015,
      totalTantiemes: 1000,
      image: ''
    });
    setShowAddPropertyModal(false);
  };

  const handleCreateLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId || !newLot.number) return;

    onAddLot({
      ...newLot,
      propertyId: selectedPropertyId
    });

    // Reset
    setNewLot({
      number: '',
      type: LotType.APPARTEMENT,
      floor: 0,
      tantiemes: 50,
      ownerId: owners[0]?.id || ''
    });
    setShowAddLotModal(false);
  };

  return (
    <div className="space-y-6" id="properties-view-wrapper">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Immeubles & Copropriétés
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Déclarez et pilotez vos résidences, immeubles et la structure des tantièmes de copropriété.
          </p>
        </div>
        <button
          id="add-property-btn"
          onClick={() => setShowAddPropertyModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition px-4 py-2 text-sm font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un Immeuble
        </button>
      </div>

      {/* Main workspace (Grid listing OR Side-by-Side if property selected) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1-or-2 Column: List of properties */}
        <div className={`lg:col-span-2 space-y-4`}>
          {/* Filters shelf */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="property-search-input"
                type="text"
                placeholder="Rechercher par nom ou adresse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                id="property-type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Tous">Tous les types</option>
                <option value={PropertyType.RESIDENTIAL}>{PropertyType.RESIDENTIAL}</option>
                <option value={PropertyType.COMMERCIAL}>{PropertyType.COMMERCIAL}</option>
                <option value={PropertyType.MIXTE}>{PropertyType.MIXTE}</option>
              </select>
            </div>
          </div>

          {/* Properties list display */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProperties.map(prop => {
                const isSelected = selectedPropertyId === prop.id;
                const propLotsCount = lots.filter(l => l.propertyId === prop.id).length;
                
                return (
                  <div
                    key={prop.id}
                    className={`bg-white rounded-xl border ${
                      isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200'
                    } overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col`}
                  >
                    {/* Cover image */}
                    <div className="h-40 w-full relative">
                      <img
                        src={prop.image}
                        alt={prop.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 bg-white/90 backdrop-blur-xs text-slate-800 rounded-full shadow-xs">
                        {prop.type}
                      </span>
                    </div>

                    {/* Meta Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition truncate">
                          {prop.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{prop.address}</span>
                        </p>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                        <div>
                          <p className="text-slate-400 font-medium">Lots total</p>
                          <p className="font-bold text-slate-700 mt-0.5">{propLotsCount}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">Construit</p>
                          <p className="font-bold text-slate-700 mt-0.5">{prop.buildYear}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">Tantièmes</p>
                          <p className="font-bold text-slate-700 mt-0.5 text-indigo-600">{prop.totalTantiemes}</p>
                        </div>
                      </div>

                      {/* CTA & Operations footer */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => {
                            if (window.confirm(`Voulez-vous vraiment supprimer cet immeuble (${prop.name}) ? Cela supprimera l'historique associé.`)) {
                              onDeleteProperty(prop.id);
                              if (selectedPropertyId === prop.id) setSelectedPropertyId(null);
                            }
                          }}
                          className="p-1 px-2 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition text-xs flex items-center gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer
                        </button>
                        
                        <button
                          onClick={() => setSelectedPropertyId(prop.id)}
                          className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-1.5 transition"
                        >
                          Structure & Lots
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
              <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-3 stroke-1" />
              <p className="font-semibold">Aucun immeuble ne correspond à votre recherche.</p>
              <p className="text-sm text-slate-400 mt-1">Essayez d'ajuster vos filtres de nom ou de catégorie.</p>
            </div>
          )}
        </div>

        {/* Right 1 Column: Selected Property Details (Lots & Tantièmes breakdown) */}
        <div className="lg:col-span-1 space-y-4">
          {selectedProperty ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative">
              
              {/* Close Button to shrink back */}
              <button
                onClick={() => setSelectedPropertyId(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded uppercase">
                    Fiche Technique
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1.5 font-sans leading-tight">
                    {selectedProperty.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{selectedProperty.address}</span>
                  </p>
                </div>

                {/* Tantiemes tracker gauge badge */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <PieIcon className="w-3.5 h-3.5 text-indigo-600" /> Tantièmes affectés :
                    </span>
                    <span>
                      {currentPropertyTantiemesSum} / {selectedProperty.totalTantiemes} (
                      {Math.round((currentPropertyTantiemesSum / selectedProperty.totalTantiemes) * 100)}%)
                    </span>
                  </div>
                  {/* Visual Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        currentPropertyTantiemesSum > selectedProperty.totalTantiemes ? 'bg-red-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min((currentPropertyTantiemesSum / selectedProperty.totalTantiemes) * 100, 100)}%` }}
                    ></div>
                  </div>
                  {currentPropertyTantiemesSum > selectedProperty.totalTantiemes && (
                    <p className="text-[10px] text-red-600 font-medium">
                      ⚠️ Attention: Le total des tantièmes déclarés dépasse {selectedProperty.totalTantiemes} !
                    </p>
                  )}
                </div>

                {/* Sub-header with plus button for adding lots */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    Structure des Lots ({selectedPropertyLots.length})
                  </h4>
                  
                  <button
                    onClick={() => setShowAddLotModal(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition px-2 py-1 rounded flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Ajouter Lot
                  </button>
                </div>

                {/* Lots roster list */}
                {selectedPropertyLots.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {selectedPropertyLots.map(lot => {
                      const lotOwner = owners.find(o => o.id === lot.ownerId);
                      return (
                        <div key={lot.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-700">
                              <span>Lot {lot.number}</span>
                              <span className="text-[10px] font-normal text-slate-400 bg-white border border-slate-100 px-1.5 py-0.2 rounded">
                                {lot.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                              <User className="h-3 w-3 text-slate-400" />
                              <span className="truncate max-w-[124px]">
                                {lotOwner ? `${lotOwner.firstName} ${lotOwner.lastName}` : 'Inconnu'}
                              </span>
                              <span>• Étage {lot.floor}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="font-bold text-slate-800">{lot.tantiemes}</span>
                            <span className="text-[10px] text-slate-400 block font-medium">tantièmes</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Aucun lot privatif encore associé à cet immeuble.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400 text-sm flex flex-col items-center justify-center h-full">
              <Layers className="h-10 w-10 text-slate-300 stroke-1 mb-2" />
              <span>Cliquez sur "Structure & Lots" pour visualiser le détail des appartements, parkings et raccordements associés.</span>
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: ADD PROPERTY OVERLAY */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-md p-6 relative animate-in fade-in duration-200">
            <button
              onClick={() => setShowAddPropertyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-teal-600" />
              Déclarer une Nouvelle Copropriété
            </h3>

            <form onSubmit={handleCreateProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Nom de la Résidence *</label>
                <input
                  type="text"
                  placeholder="Ex. Résidence Les Pins"
                  value={newProperty.name}
                  onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Adresse Complète *</label>
                <input
                  type="text"
                  placeholder="Ex. 12 rue de la Paix, Paris"
                  value={newProperty.address}
                  onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Type d'Immeuble</label>
                  <select
                    value={newProperty.type}
                    onChange={(e) => setNewProperty({ ...newProperty, type: e.target.value as PropertyType })}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={PropertyType.RESIDENTIAL}>{PropertyType.RESIDENTIAL}</option>
                    <option value={PropertyType.COMMERCIAL}>{PropertyType.COMMERCIAL}</option>
                    <option value={PropertyType.MIXTE}>{PropertyType.MIXTE}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Année Construction</label>
                  <input
                    type="number"
                    value={newProperty.buildYear}
                    onChange={(e) => setNewProperty({ ...newProperty, buildYear: parseInt(e.target.value) || 2015 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Total Tantièmes du Syndicat</label>
                <input
                  type="number"
                  value={newProperty.totalTantiemes}
                  onChange={(e) => setNewProperty({ ...newProperty, totalTantiemes: parseInt(e.target.value) || 1000 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Habituellement 1000"
                />
                <p className="text-[10px] text-slate-400 mt-1">Le barème officiel de répartition des charges pour cet immeuble.</p>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPropertyModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition rounded-lg"
                >
                  Déclarer l'Immeuble
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD LOT OVERLAY */}
      {showAddLotModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowAddLotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2 mb-4">
              <Layers className="h-5 w-5 text-teal-600" />
              Associer un Lot
            </h3>

            <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded border border-slate-100">
              Immeuble ciblé : <strong className="text-slate-800">{selectedProperty?.name}</strong>
            </p>

            <form onSubmit={handleCreateLot} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Numéro du Lot *</label>
                  <input
                    type="text"
                    placeholder="Ex. 102, P23, Cave 4"
                    value={newLot.number}
                    onChange={(e) => setNewLot({ ...newLot, number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Type de Lot</label>
                  <select
                    value={newLot.type}
                    onChange={(e) => setNewLot({ ...newLot, type: e.target.value as LotType })}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={LotType.APPARTEMENT}>{LotType.APPARTEMENT}</option>
                    <option value={LotType.PARKING}>{LotType.PARKING}</option>
                    <option value={LotType.CAVE}>{LotType.CAVE}</option>
                    <option value={LotType.COMMERCE}>{LotType.COMMERCE}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Étage</label>
                  <input
                    type="number"
                    value={newLot.floor}
                    onChange={(e) => setNewLot({ ...newLot, floor: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Tantièmes (Barème) *</label>
                  <input
                    type="number"
                    value={newLot.tantiemes}
                    onChange={(e) => setNewLot({ ...newLot, tantiemes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Copropriétaire Responsable</label>
                <select
                  value={newLot.ownerId}
                  onChange={(e) => setNewLot({ ...newLot, ownerId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {owners.map(owner => (
                    <option key={owner.id} value={owner.id}>
                      {owner.firstName} {owner.lastName} ({owner.email})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Sert pour calculer automatiquement les appels de charges de ce lot.</p>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLotModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition rounded-lg"
                >
                  Enregistrer Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
