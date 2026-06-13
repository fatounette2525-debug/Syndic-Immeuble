/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Property,
  Lot,
  Owner,
  Incident,
  Transaction,
  Meeting,
  PropertyType,
  LotType,
  IncidentCategory,
  IncidentStatus,
  IncidentPriority,
  TransactionType,
  TransactionCategory,
  MeetingStatus,
  ResolutionStatus
} from '../types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Résidence Le Belvédère',
    address: '42 Avenue de la République, 75011 Paris',
    type: PropertyType.RESIDENTIAL,
    totalLots: 24,
    buildYear: 2012,
    totalTantiemes: 1000,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prop-2',
    name: 'Les Terrasses du Parc',
    address: '15 Boulevard des Belges, 69006 Lyon',
    type: PropertyType.MIXTE,
    totalLots: 18,
    buildYear: 1998,
    totalTantiemes: 1000,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prop-3',
    name: 'Le Patio Fleuri',
    address: '88 Rue du Jardin Public, 33000 Bordeaux',
    type: PropertyType.RESIDENTIAL,
    totalLots: 12,
    buildYear: 2021,
    totalTantiemes: 1000,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  }
];

export const INITIAL_OWNERS: Owner[] = [
  {
    id: 'owner-1',
    firstName: 'Marc',
    lastName: 'Duval',
    email: 'marc.duval@email.fr',
    phone: '06 12 34 56 78',
    address: '42 Avenue de la République, Appt 101, 75011 Paris',
    joinedDate: '2015-04-12',
    isCouncilMember: true,
    lotsCount: 2,
    outstandingBalance: 120.50
  },
  {
    id: 'owner-2',
    firstName: 'Sophie',
    lastName: 'Lebrun',
    email: 'sophie.lebrun@email.fr',
    phone: '06 23 45 67 89',
    address: '42 Avenue de la République, Appt 202, 75011 Paris',
    joinedDate: '2018-09-01',
    isCouncilMember: false,
    lotsCount: 1,
    outstandingBalance: 0
  },
  {
    id: 'owner-3',
    firstName: 'Jean-Pierre',
    lastName: 'Girard',
    email: 'jp.girard@email.fr',
    phone: '06 34 56 78 90',
    address: '12 Rue des Lilas, 69003 Lyon',
    joinedDate: '2012-01-20',
    isCouncilMember: true,
    lotsCount: 3,
    outstandingBalance: 450.00
  },
  {
    id: 'owner-4',
    firstName: 'Chantal',
    lastName: 'Moreau',
    email: 'chantal.moreau@email.fr',
    phone: '06 45 67 89 01',
    address: '15 Boulevard des Belges, Appt 12, 69006 Lyon',
    joinedDate: '2020-03-15',
    isCouncilMember: false,
    lotsCount: 1,
    outstandingBalance: -85.00 // Créditeur (payé en avance)
  },
  {
    id: 'owner-5',
    firstName: 'Thomas',
    lastName: 'Lefebvre',
    email: 'thomas.lefebvre@email.fr',
    phone: '06 56 78 90 12',
    address: '88 Rue du Jardin Public, Appt A4, 33000 Bordeaux',
    joinedDate: '2021-11-10',
    isCouncilMember: true,
    lotsCount: 2,
    outstandingBalance: 0
  },
  {
    id: 'owner-6',
    firstName: 'Amina',
    lastName: 'Ndiaye',
    email: 'a.ndiaye@email.fr',
    phone: '06 67 89 01 23',
    address: '88 Rue du Jardin Public, Appt B2, 33000 Bordeaux',
    joinedDate: '2022-02-18',
    isCouncilMember: false,
    lotsCount: 1,
    outstandingBalance: 320.00
  }
];

export const INITIAL_LOTS: Lot[] = [
  // Residence Belvédère (prop-1)
  { id: 'lot-1', propertyId: 'prop-1', number: '101', type: LotType.APPARTEMENT, floor: 1, tantiemes: 65, ownerId: 'owner-1' },
  { id: 'lot-2', propertyId: 'prop-1', number: 'P01', type: LotType.PARKING, floor: -1, tantiemes: 10, ownerId: 'owner-1' },
  { id: 'lot-3', propertyId: 'prop-1', number: '202', type: LotType.APPARTEMENT, floor: 2, tantiemes: 55, ownerId: 'owner-2' },
  
  // Les Terrasses du Parc (prop-2)
  { id: 'lot-4', propertyId: 'prop-2', number: '10', type: LotType.APPARTEMENT, floor: 2, tantiemes: 70, ownerId: 'owner-3' },
  { id: 'lot-5', propertyId: 'prop-2', number: 'P10', type: LotType.PARKING, floor: -1, tantiemes: 15, ownerId: 'owner-3' },
  { id: 'lot-6', propertyId: 'prop-2', number: 'C10', type: LotType.CAVE, floor: 0, tantiemes: 5, ownerId: 'owner-3' },
  { id: 'lot-7', propertyId: 'prop-2', number: '12', type: LotType.APPARTEMENT, floor: 3, tantiemes: 80, ownerId: 'owner-4' },
  
  // Le Patio Fleuri (prop-3)
  { id: 'lot-8', propertyId: 'prop-3', number: 'A4', type: LotType.APPARTEMENT, floor: 1, tantiemes: 120, ownerId: 'owner-5' },
  { id: 'lot-9', propertyId: 'prop-3', number: 'PA4', type: LotType.PARKING, floor: 0, tantiemes: 20, ownerId: 'owner-5' },
  { id: 'lot-10', propertyId: 'prop-3', number: 'B2', type: LotType.APPARTEMENT, floor: 2, tantiemes: 95, ownerId: 'owner-6' }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    propertyId: 'prop-1',
    title: 'Panne d\'ascenseur principale',
    description: 'L\'ascenseur du bâtiment A est bloqué au 3ème étage. Un code d\'erreur E-34 s\'affiche sur l\'écran.',
    category: IncidentCategory.ASCENSEUR,
    status: IncidentStatus.EN_COURS,
    priority: IncidentPriority.HAUTE,
    dateCreated: '2026-06-10',
    contractorName: 'Otis Ascenseurs SA',
    estimatedCost: 650.00
  },
  {
    id: 'inc-2',
    propertyId: 'prop-1',
    title: 'Infiltration d\'eau dans les caves',
    description: 'Infiltration constatée au niveau du mur de la cave n°8 suite aux fortes pluies. Humidité importante.',
    category: IncidentCategory.DIVERTISSEMENTS,
    status: IncidentStatus.NOUVEAU,
    priority: IncidentPriority.MOYENNE,
    dateCreated: '2026-06-12'
  },
  {
    id: 'inc-3',
    propertyId: 'prop-2',
    title: 'Panne d\'interphone / digicode',
    description: 'Le pavé numérique situé à l\'entrée principale ne répond plus. Impossible de taper les codes ou d\'appeler les appartements.',
    category: IncidentCategory.ELECTRICITE,
    status: IncidentStatus.RESOLU,
    priority: IncidentPriority.HAUTE,
    dateCreated: '2026-05-20',
    contractorName: 'ElecPro Sécurité',
    estimatedCost: 350.00,
    finalCost: 345.50
  },
  {
    id: 'inc-4',
    propertyId: 'prop-3',
    title: 'Charnière de la porte d\'entrée cassée',
    description: 'La porte d\'entrée du hall se referme violemment. La charnière haute hydraulique fuit et a perdu sa résistance.',
    category: IncidentCategory.NETTOYAGE,
    status: IncidentStatus.EN_COURS,
    priority: IncidentPriority.MOYENNE,
    dateCreated: '2026-06-05',
    contractorName: 'Serrurerie Bordelaise',
    estimatedCost: 180.00
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Prop-1 Le Belvédère
  {
    id: 'trans-1',
    propertyId: 'prop-1',
    type: TransactionType.REVENU,
    category: TransactionCategory.APPEL_DE_FONDS,
    amount: 14500.00,
    date: '2026-06-01',
    description: 'Appel de charges - 2ème Trimestre 2026',
    isPaid: true
  },
  {
    id: 'trans-2',
    propertyId: 'prop-1',
    type: TransactionType.DEPENSE,
    category: TransactionCategory.ENERGIE,
    amount: 1240.80,
    date: '2026-05-15',
    description: 'Facture Engie Électricité - Communs',
    invoiceRef: 'FAC-2026-0043',
    isPaid: true
  },
  {
    id: 'trans-3',
    propertyId: 'prop-1',
    type: TransactionType.DEPENSE,
    category: TransactionCategory.MAINTENANCE,
    amount: 850.00,
    date: '2026-05-30',
    description: 'Contrat mensuel de ménage - Propreté Plus',
    invoiceRef: 'FAC-2026-0599',
    isPaid: true
  },
  {
    id: 'trans-4',
    propertyId: 'prop-1',
    type: TransactionType.DEPENSE,
    category: TransactionCategory.ADMINISTRATION,
    amount: 450.00,
    date: '2026-06-01',
    description: 'Honoraires trimestriels Syndic Pro',
    invoiceRef: 'SYN-2026-02',
    isPaid: true
  },
  {
    id: 'trans-5',
    propertyId: 'prop-1',
    type: TransactionType.DEPENSE,
    category: TransactionCategory.MAINTENANCE,
    amount: 650.00,
    date: '2026-06-11',
    description: 'Acompte dépannage ascenseur - Otis',
    invoiceRef: 'FAC-2026-113',
    isPaid: false
  },

  // Prop-2 Les Terrasses du Parc
  {
    id: 'trans-6',
    propertyId: 'prop-2',
    type: TransactionType.REVENU,
    category: TransactionCategory.APPEL_DE_FONDS,
    amount: 9800.00,
    date: '2026-06-01',
    description: 'Appel de charges - 2ème Trimestre 2026',
    isPaid: true
  },
  {
    id: 'trans-7',
    propertyId: 'prop-2',
    type: TransactionType.DEPENSE,
    category: TransactionCategory.TRAVAUX,
    amount: 4200.00,
    date: '2026-05-10',
    description: 'Remplacement de la pompe de relevage des eaux',
    invoiceRef: 'FAC-TRAV-4422',
    isPaid: true
  },
  {
    id: 'trans-8',
    propertyId: 'prop-2',
    type: TransactionType.DEPENSE,
    category: TransactionCategory.ASSURANCE,
    amount: 1980.00,
    date: '2026-04-18',
    description: 'Assurance Multirisque Immeuble - AXA',
    invoiceRef: 'AXA-90881',
    isPaid: true
  },

  // Prop-3 Le Patio Fleuri
  {
    id: 'trans-9',
    propertyId: 'prop-3',
    type: TransactionType.REVENU,
    category: TransactionCategory.APPEL_DE_FONDS,
    amount: 6200.00,
    date: '2026-06-02',
    description: 'Appel de charges - 2ème Trimestre 2026',
    isPaid: true
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-1',
    propertyId: 'prop-1',
    title: 'Assemblée Générale Annuelle Ordinaire 2026',
    date: '2026-06-25',
    time: '18:30',
    location: 'Salle Municipale Nord, 75011 Paris',
    status: MeetingStatus.PLANIFIEE,
    resolutions: [
      {
        id: 'res-1-1',
        title: 'Approbation des comptes de l\'exercice 2025',
        description: 'Approbation du budget réalisé 2025 présentant un solde de dépenses de 24 500 €.',
        voteYes: 0,
        voteNo: 0,
        voteAbstain: 0,
        status: ResolutionStatus.EN_ATTENTE
      },
      {
        id: 'res-1-2',
        title: 'Ravalement de façade et isolation thermique',
        description: 'Lancement d\'un appel d\'offres pour le ravalement thermique extérieur. Budget estimé de 45 000 €.',
        voteYes: 0,
        voteNo: 0,
        voteAbstain: 0,
        status: ResolutionStatus.EN_ATTENTE
      },
      {
        id: 'res-1-3',
        title: 'Désignation de la société Vert-Feuille pour le jardinier',
        description: 'Changement de prestataire d\'entretien des espaces verts pour un contrat de 1 200 € / an.',
        voteYes: 0,
        voteNo: 0,
        voteAbstain: 0,
        status: ResolutionStatus.EN_ATTENTE
      }
    ]
  },
  {
    id: 'meet-2',
    propertyId: 'prop-2',
    title: 'Assemblée Générale Annuelle 2025',
    date: '2025-06-15',
    time: '19:00',
    location: 'Hôtel Ibis Lyon Centre',
    status: MeetingStatus.REALISEE,
    attendanceRate: 84,
    resolutions: [
      {
        id: 'res-2-1',
        title: 'Budget prévisionnel 2026',
        description: 'Vote du budget global annuel de 18 500 € pour l\'entretien courant de l\'immeuble.',
        voteYes: 780,
        voteNo: 120,
        voteAbstain: 100,
        status: ResolutionStatus.APPROUVEE
      },
      {
        id: 'res-2-2',
        title: 'Installation de caméras dans le hall',
        description: 'Installation d\'un système de vidéosurveillance de 3 caméras pour sécuriser l\'entrée et le garage.',
        voteYes: 450,
        voteNo: 500,
        voteAbstain: 50,
        status: ResolutionStatus.REJETEE
      }
    ]
  }
];
