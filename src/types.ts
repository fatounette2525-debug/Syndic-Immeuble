/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PropertyType {
  RESIDENTIAL = 'Résidentiel',
  COMMERCIAL = 'Commercial',
  MIXTE = 'Usage Mixte'
}

export enum LotType {
  APPARTEMENT = 'Appartement',
  PARKING = 'Parking',
  CAVE = 'Cave',
  COMMERCE = 'Commerce'
}

export enum IncidentCategory {
  ALL = 'Tous',
  ASCENSEUR = 'Ascenseur / Escalier',
  PLOMBERIE = 'Plomberie',
  ELECTRICITE = 'Électricité',
  CHAUFFAGE = 'Chauffage & VMC',
  NETTOYAGE = 'Nettoyage & Communs',
  DIVERTISSEMENTS = 'Toiture & Façade',
  AUTRE = 'Autre'
}

export enum IncidentStatus {
  NOUVEAU = 'Nouveau',
  EN_COURS = 'En cours',
  RESOLU = 'Résolu'
}

export enum IncidentPriority {
  BASSE = 'Basse',
  MOYENNE = 'Moyenne',
  HAUTE = 'Haute'
}

export enum TransactionType {
  REVENU = 'Revenu',
  DEPENSE = 'Dépense'
}

export enum TransactionCategory {
  APPEL_DE_FONDS = 'Appel de fonds',
  MAINTENANCE = 'Maintenance',
  ENERGIE = 'Énergie (Gaz / Élec)',
  ASSURANCE = 'Assurance copro',
  ADMINISTRATION = 'Frais de syndic',
  TRAVAUX = 'Travaux extraordinaires',
  AUTRE = 'Autre'
}

export enum MeetingStatus {
  PLANIFIEE = 'Planifiée',
  EN_COURS = 'En cours',
  REALISEE = 'Réalisée',
  ANNULEE = 'Annulée'
}

export enum ResolutionStatus {
  EN_ATTENTE = 'En attente',
  APPROUVEE = 'Approuvée',
  REJETEE = 'Rejetée'
}

export interface Property {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  totalLots: number;
  buildYear: number;
  totalTantiemes: number;
  image: string;
}

export interface Lot {
  id: string;
  propertyId: string;
  number: string;
  type: LotType;
  floor: number;
  tantiemes: number;
  ownerId: string;
}

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  joinedDate: string;
  isCouncilMember: boolean; // Conseil Syndical
  lotsCount: number;
  outstandingBalance: number; // Solde dû (positif si impayé, négatif si excédent)
}

export interface Incident {
  id: string;
  propertyId: string;
  propertyName?: string;
  title: string;
  description: string;
  category: IncidentCategory;
  status: IncidentStatus;
  priority: IncidentPriority;
  dateCreated: string;
  contractorName?: string;
  estimatedCost?: number;
  finalCost?: number;
}

export interface Transaction {
  id: string;
  propertyId: string;
  propertyName?: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  date: string;
  description: string;
  invoiceRef?: string;
  isPaid: boolean;
}

export interface Resolution {
  id: string;
  title: string;
  description: string;
  voteYes: number; // En tantièmes ou voix
  voteNo: number;
  voteAbstain: number;
  status: ResolutionStatus;
}

export interface Meeting {
  id: string;
  propertyId: string;
  propertyName?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: MeetingStatus;
  attendanceRate?: number; // Pourcentage
  resolutions: Resolution[];
}
