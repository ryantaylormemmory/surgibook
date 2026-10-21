import { saveCase } from './storage';

export async function seedMockData(): Promise<void> {
  const now = new Date().toISOString();
  const cases = [
    {
      id: 'case-001',
      patientName: 'John Mokoena',
      patientAge: 34,
      hospitalNumber: 'HN-2026-001',
      priority: 'urgent',
      asa: 'II',
      procedure: 'Appendicectomy',
      surgeon: 'Dr. Naidoo',
      anaesthetist: 'Dr. van der Merwe',
      ward: 'Surgical Ward A',
      bookedAt: now,
      status: 'booked',
      notes: 'Acute appendicitis, CT confirmed',
      allergies: 'Penicillin',
      comorbidities: 'None',
    },
    {
      id: 'case-002',
      patientName: 'Sarah Dlamini',
      patientAge: 67,
      hospitalNumber: 'HN-2026-002',
      priority: 'emergency',
      asa: 'III',
      procedure: 'Laparotomy for bowel obstruction',
      surgeon: 'Dr. Patel',
      anaesthetist: 'Dr. Botha',
      ward: 'ICU',
      bookedAt: now,
      status: 'in_theatre',
      notes: 'Small bowel obstruction, NGT in situ',
      allergies: 'None known',
      comorbidities: 'Hypertension, Type 2 DM',
    },
    {
      id: 'case-003',
      patientName: 'Thabo Ndlovu',
      patientAge: 45,
      hospitalNumber: 'HN-2026-003',
      priority: 'routine',
      asa: 'I',
      procedure: 'Hernia repair',
      surgeon: 'Dr. Naidoo',
      anaesthetist: 'Dr. van der Merwe',
      ward: 'Surgical Ward B',
      bookedAt: now,
      status: 'booked',
      notes: 'Elective inguinal hernia',
      allergies: 'None known',
      comorbidities: 'None',
    },
  ];

  for (const c of cases) {
    await saveCase(c as any);
  }
}
