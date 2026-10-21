import type { SurgeryCase, Anaesthetist } from '@/types';

export function generateMockCases(): SurgeryCase[] {
  const now = Date.now();
  const cases: SurgeryCase[] = [
    {
      id: 'mock-1', patientName: 'Thabo', patientSurname: 'Mokoena', age: 34, ward: 'Casualty', pmi: 'H123456',
      procedure: 'Laparoscopic Appendectomy', indication: 'Acute appendicitis', discipline: 'General Surgery - Acute Care Surgery',
      surgeonName: 'Dr. Smith', surgeonContact: '082 345 6789', priority: 'red', status: 'pending',
      bookedAt: new Date(now - 45 * 60000).toISOString(), bookedBy: 'System',
      notes: 'Nil per os from midnight', asaGrade: 'II', allergies: 'Penicillin', npoStatus: '8 hours',
      consentObtained: true, consentType: 'written', bloodRequired: false,
    },
    {
      id: 'mock-2', patientName: 'Sarah', patientSurname: 'van der Merwe', age: 67, ward: 'Ward 12', pmi: 'H234567',
      procedure: 'Exploratory Laparotomy', indication: 'Haemoperitoneum post-trauma', discipline: 'General Surgery - Trauma Surgery',
      surgeonName: 'Dr. Naidoo', surgeonContact: '083 456 7890', priority: 'red', status: 'in-progress',
      bookedAt: new Date(now - 120 * 60000).toISOString(), inProgressAt: new Date(now - 20 * 60000).toISOString(),
      inProgressTheatre: 1, bookedBy: 'System',
      asaGrade: 'IIIE', comorbidities: 'Hypertension, Type 2 DM', bloodRequired: true, bloodUnits: 2,
    },
    {
      id: 'mock-3', patientName: 'Lerato', patientSurname: 'Dlamini', age: 28, ward: 'Ward 8', pmi: 'H345678',
      procedure: 'Emergency Caesarean Section', indication: 'Fetal distress', discipline: 'Obstetrics & Gynaecology',
      surgeonName: 'Dr. Patel', surgeonContact: '084 567 8901', priority: 'orange', status: 'pending',
      bookedAt: new Date(now - 180 * 60000).toISOString(), bookedBy: 'System',
      asaGrade: 'II', npoStatus: '6 hours', consentObtained: true, consentType: 'verbal',
    },
    {
      id: 'mock-4', patientName: 'Johannes', patientSurname: 'Botha', age: 52, ward: 'Main ICU', pmi: 'H456789',
      procedure: 'Craniotomy for Evacuation', indication: 'Acute SDH', discipline: 'Neurosurgery',
      surgeonName: 'Dr. Kumar', surgeonContact: '085 678 9012', priority: 'red', status: 'completed',
      bookedAt: new Date(now - 400 * 60000).toISOString(), inProgressAt: new Date(now - 360 * 60000).toISOString(),
      inProgressTheatre: 2, completedAt: new Date(now - 200 * 60000).toISOString(), bookedBy: 'System',
      asaGrade: 'IVE', comorbidities: 'COPD, previous CVA', bloodRequired: true, bloodUnits: 4,
      theatreDetails: {
        arrivalTime: new Date(now - 370 * 60000).toISOString(),
        procedureStartTime: new Date(now - 360 * 60000).toISOString(),
        procedureEndTime: new Date(now - 220 * 60000).toISOString(),
        anaesthetistName: 'Dr. Williams', anaesthetistPhone: '082 111 2222',
        surgeonName: 'Dr. Kumar', assistantSurgeonName: 'Dr. Jacobs',
        reasonForDelay: 'Bed/ICU availability',
        theatreNumber: 2,
      },
      postOpWard: 'Main ICU',
    },
    {
      id: 'mock-5', patientName: 'Grace', patientSurname: 'Nkosi', age: 19, ward: 'Ward 3', pmi: 'H567890',
      procedure: 'Incision & Drainage of Abscess', indication: 'Gluteal abscess', discipline: 'General Surgery - Acute Care Surgery',
      surgeonName: 'Dr. Smith', surgeonContact: '082 345 6789', priority: 'yellow', status: 'pending',
      bookedAt: new Date(now - 500 * 60000).toISOString(), bookedBy: 'System',
      asaGrade: 'I', allergies: 'Latex',
    },
  ];
  return cases;
}

export function generateMockAnaesthetists(): Anaesthetist[] {
  const today = new Date().toISOString().slice(0, 10);
  return [
    { id: 'a1', name: 'Dr. Williams', phone: '082 111 2222', consultant: 'Prof. Brown', theatre: 1, date: today, loggedAt: new Date().toISOString() },
    { id: 'a2', name: 'Dr. Peters', phone: '083 222 3333', consultant: 'Prof. Brown', theatre: 2, date: today, loggedAt: new Date().toISOString() },
  ];
}

export async function seedMockData(): Promise<void> {
  const { getCases, saveCases, saveAnaesthetist } = await import('./storage');
  const existing = await getCases();
  if (existing.length === 0) {
    await saveCases(generateMockCases());
    for (const a of generateMockAnaesthetists()) {
      await saveAnaesthetist(a);
    }
  }
}
