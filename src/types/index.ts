export type Priority = 'red' | 'orange' | 'yellow';
export type Status = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type Discipline = 'General Surgery - Acute Care Surgery' | 'General Surgery - Trauma Surgery' | 'General Surgery - Vascular Surgery' | 'General Surgery - Other' | 'Neurosurgery' | 'Urology' | 'Cardiothoracic' | 'Plastics' | 'ENT' | 'Maxillofacial' | 'Obstetrics & Gynaecology' | 'Ophthalmology' | 'Paediatric Surgery';
export type AsaGrade = 'I' | 'II' | 'III' | 'IV' | 'V' | 'IE' | 'IIE' | 'IIIE' | 'IVE' | 'VE';

export interface TheatreDetails {
  arrivalTime?: string;
  procedureStartTime?: string;
  procedureEndTime?: string;
  anaesthetistName?: string;
  anaesthetistPhone?: string;
  surgeonName?: string;
  assistantSurgeonName?: string;
  reasonForDelay?: string;
  theatreNumber?: 1 | 2;
}

export interface PriorityChange {
  from: Priority;
  to: Priority;
  reason: string;
  changedAt: string;
  changedBy: string;
}

export interface SurgeryCase {
  id: string;
  patientName: string;
  patientSurname: string;
  age: number;
  ageUnit?: 'years' | 'months';
  weight?: number;
  ward: string;
  postOpWard?: string;
  pmi: string;
  procedure: string;
  indication: string;
  discipline: Discipline;
  surgeonName: string;
  surgeonContact: string;
  priority: Priority;
  priorityHistory?: PriorityChange[];
  status: Status;
  bookedAt: string;
  inProgressAt?: string;
  inProgressTheatre?: 1 | 2;
  completedAt?: string;
  theatreDetails?: TheatreDetails;
  bookedBy: string;
  notes?: string;
  asaGrade?: AsaGrade;
  allergies?: string;
  comorbidities?: string;
  npoStatus?: string;
  consentObtained?: boolean;
  consentType?: 'written' | 'verbal';
  bloodRequired?: boolean;
  bloodUnits?: number;
}

export interface CaseTemplate {
  name: string;
  discipline: Discipline;
  typicalPriority: Priority;
  estimatedMinutes: number;
}

export interface Anaesthetist {
  id: string;
  name: string;
  phone: string;
  consultant: string;
  theatre: 1 | 2;
  date: string;
  loggedAt: string;
}

export interface AuthUser {
  name: string;
  role: 'surgery' | 'anesthesia' | 'nursing' | 'other';
}

export interface AuditEntry {
  action: string;
  details: Record<string, unknown>;
  timestamp: string;
  user: string;
}

// NEW v3.2: Notification system
export type NotificationType = 'case_booked' | 'case_completed' | 'priority_changed' | 'in_theatre' | 'edit' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  caseId?: string;
  read: boolean;
  createdAt: string;
}

// NEW v3.2: Chat system
export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  room: 'general' | 'anaesthesia' | 'surgery';
}

export const DISCIPLINES: Discipline[] = [
  'General Surgery - Acute Care Surgery',
  'General Surgery - Trauma Surgery',
  'General Surgery - Vascular Surgery',
  'General Surgery - Other',
  'Neurosurgery',
  'Urology',
  'Cardiothoracic',
  'Plastics',
  'ENT',
  'Maxillofacial',
  'Obstetrics & Gynaecology',
  'Ophthalmology',
  'Paediatric Surgery',
];

export const WARDS: string[] = [
  'Ward 1','Ward 2','Ward 3','Ward 4','Ward 5','Ward 6','Ward 7','Ward 8','Ward 9','Ward 10',
  'Ward 11','Ward 12','Ward 13','Ward 14','Ward 15','Ward 16','Ward 17','Ward 18','Ward 19','Ward 20',
  'Ward 21','Ward 22','Ward 23','Ward 24','Ward 25','Ward 26','Ward 27','Ward 28','Ward 29','Ward 30',
  'Ward 31','Ward 32','Ward 33','Ward 34','Ward 35','Ward 36','Ward 37','Ward 38','Ward 39',
  'Casualty','Main ICU','Ward 6 ICU','Ward 6 High Care',
];

export const ASA_GRADES: { value: AsaGrade; label: string }[] = [
  { value: 'I', label: 'I - Normal healthy patient' },
  { value: 'II', label: 'II - Mild systemic disease' },
  { value: 'III', label: 'III - Severe systemic disease' },
  { value: 'IV', label: 'IV - Severe systemic disease, constant threat to life' },
  { value: 'V', label: 'V - Moribund, not expected to survive without operation' },
  { value: 'IE', label: 'IE - Emergency' },
  { value: 'IIE', label: 'IIE - Emergency' },
  { value: 'IIIE', label: 'IIIE - Emergency' },
  { value: 'IVE', label: 'IVE - Emergency' },
  { value: 'VE', label: 'VE - Emergency' },
];

export const CASE_TEMPLATES: CaseTemplate[] = [
  { name: 'Laparoscopic Appendectomy', discipline: 'General Surgery - Acute Care Surgery', typicalPriority: 'red', estimatedMinutes: 60 },
  { name: 'Exploratory Laparotomy', discipline: 'General Surgery - Trauma Surgery', typicalPriority: 'red', estimatedMinutes: 90 },
  { name: 'Open Appendectomy', discipline: 'General Surgery - Acute Care Surgery', typicalPriority: 'orange', estimatedMinutes: 45 },
  { name: 'Repair of Perforated Visus', discipline: 'General Surgery - Acute Care Surgery', typicalPriority: 'red', estimatedMinutes: 120 },
  { name: 'Emergency Cholecystectomy', discipline: 'General Surgery - Acute Care Surgery', typicalPriority: 'orange', estimatedMinutes: 75 },
  { name: 'Incision & Drainage of Abscess', discipline: 'General Surgery - Acute Care Surgery', typicalPriority: 'yellow', estimatedMinutes: 30 },
  { name: 'Trauma Laparotomy', discipline: 'General Surgery - Trauma Surgery', typicalPriority: 'red', estimatedMinutes: 120 },
  { name: 'Craniotomy for Evacuation', discipline: 'Neurosurgery', typicalPriority: 'red', estimatedMinutes: 180 },
  { name: 'Emergency Caesarean Section', discipline: 'Obstetrics & Gynaecology', typicalPriority: 'red', estimatedMinutes: 45 },
  { name: 'Open Fracture Fixation', discipline: 'General Surgery - Trauma Surgery', typicalPriority: 'orange', estimatedMinutes: 90 },
];

export const DELAY_REASONS = ['Patient deteriorated', 'Clinical error', 'New information', 'Bed/ICU availability', 'Other'] as const;
