export type Priority = 'routine' | 'urgent' | 'emergency' | 'life-threatening';
export type ASA = 'I' | 'II' | 'III' | 'IV' | 'V';
export type Status = 'booked' | 'in_theatre' | 'completed' | 'cancelled';

export interface SurgeryCase {
  id: string;
  patientName: string;
  patientAge: number;
  hospitalNumber: string;
  priority: Priority;
  asa: ASA;
  procedure: string;
  surgeon: string;
  anaesthetist: string;
  ward: string;
  bookedAt: string;
  status: Status;
  completedAt?: string;
  notes?: string;
  allergies?: string;
  comorbidities?: string;
}

export interface Anaesthetist {
  id: string;
  name: string;
  contact: string;
  onDuty: boolean;
}

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

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  room: 'general' | 'anaesthesia' | 'surgery';
}

export interface AuthUser {
  name: string;
  role: 'surgery' | 'anesthesia' | 'nursing' | 'other';
}

export type OnCallStatus = 'oncall' | 'available' | 'offduty';

export interface AuditLog {
  id: string;
  action: string;
  userName: string;
  userRole: string;
  timestamp: string;
  details?: string;
  caseId?: string;
}
