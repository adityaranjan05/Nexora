/**
 * Persistent store and seed data for Student Intake workflow.
 * Seeds 5 realistic portal submissions, 2 drafts, and 2 needs-info/rejected items.
 */

const STORAGE_KEYS = {
  SUBMISSIONS: 'nexora_intake_submissions',
  DRAFTS: 'nexora_intake_drafts',
  NEEDS_INFO_REJECTED: 'nexora_intake_needs_info_rejected',
  NEXT_GEN_COUNTER: 'nexora_gen_case_counter',
};

const INITIAL_SUBMISSIONS = [
  {
    id: 'sub-001',
    trackingId: 'STU-2026-08491',
    studentName: 'Aarav Sharma',
    enrollmentNo: '2201CS041',
    email: 'aarav.sharma22@gmail.com',
    phone: '9876543210',
    institutionId: '6adc2819dcc376cea2374b52',
    institutionName: 'Apex Institute of Technology & Management',
    aictePermanentId: '1-10000000',
    region: 'Southern',
    category: 'Fee Issues',
    subject: 'Unauthorized examination surcharge levied above statutory AICTE ceiling',
    description: 'The college accounts bureau has issued a mandatory supplementary developmental fee invoice of ₹45,000 as a prerequisite before releasing final semester exam hall tickets, directly breaching AICTE approved fee structures.',
    submittedOn: '2026-10-23T14:30:00.000Z',
    status: 'pending_review',
    evidenceFiles: [
      { name: 'admit_card_demand_receipt.pdf', size: '2.4 MB', type: 'application/pdf' },
      { name: 'fee_circular_nov2026.pdf', size: '1.1 MB', type: 'application/pdf' },
    ],
  },
  {
    id: 'sub-002',
    trackingId: 'STU-2026-08492',
    studentName: 'Pooja Verma',
    enrollmentNo: 'ME-2023-019',
    email: 'pverma.eng@outlook.com',
    phone: '9812345678',
    institutionId: '6adc2819dcc376cea2374b53',
    institutionName: 'Global Engineering College of Pune',
    aictePermanentId: '1-10001000',
    region: 'Western',
    category: 'Faculty Shortage',
    subject: 'Severe shortfall of core teaching professors in Mechanical & Mechatronics department',
    description: 'Over 4 essential statutory laboratory subjects have had zero designated associate professors for the past six months. Classes are intermittently covered by temporary guest trainees without requisite qualifications.',
    submittedOn: '2026-10-22T10:15:00.000Z',
    status: 'pending_review',
    evidenceFiles: [
      { name: 'faculty_timetable_depletion.pdf', size: '3.8 MB', type: 'application/pdf' },
    ],
  },
  {
    id: 'sub-003',
    trackingId: 'STU-2026-08493',
    studentName: 'Rohan Kulkarni',
    enrollmentNo: '21ECE088',
    email: 'rohan.ece21@gmail.com',
    phone: '9765432109',
    institutionId: '6adc2819dcc376cea2374b56',
    institutionName: 'Delhi Institute of Advanced Management',
    aictePermanentId: '1-10003000',
    region: 'Northern',
    category: 'Fake Documents',
    subject: 'Fabricated NAAC A++ accreditation certificate published on promotional portal',
    description: 'The administration has uploaded fabricated accreditation endorsement seals on its public brochure and prospectus to solicit higher capitation fees from incoming engineering aspirants.',
    submittedOn: '2026-10-21T18:45:00.000Z',
    status: 'pending_review',
    evidenceFiles: [
      { name: 'brochure_counterfeit_scan.png', size: '4.2 MB', type: 'image/png' },
      { name: 'naac_portal_discrepancy.pdf', size: '1.7 MB', type: 'application/pdf' },
    ],
  },
  {
    id: 'sub-004',
    trackingId: 'STU-2026-08494',
    studentName: 'Sneha Nair',
    enrollmentNo: 'BT-2024-512',
    email: 'sneha.nair.biotech@gmail.com',
    phone: '9845012345',
    institutionId: '6adc2819dcc376cea2374b61',
    institutionName: 'Kochi College of Pharmaceutical Sciences',
    aictePermanentId: '1-10010992',
    region: 'Southern',
    category: 'Infrastructure',
    subject: 'Non-functional pharmaceutical chemistry wet labs and hazardous waste hazards',
    description: 'Statutory chemistry laboratory spaces lack fume hoods, eye-wash deluge stations, and spectrophotometers required under AICTE Appendix 6 mandatory standards, risking student safety during practicals.',
    submittedOn: '2026-10-20T09:00:00.000Z',
    status: 'pending_review',
    evidenceFiles: [
      { name: 'lab_condition_photo_1.jpg', size: '3.1 MB', type: 'image/jpeg' },
      { name: 'lab_condition_photo_2.jpg', size: '2.9 MB', type: 'image/jpeg' },
    ],
  },
  {
    id: 'sub-005',
    trackingId: 'STU-2026-08495',
    studentName: 'Vikramjit Singh',
    enrollmentNo: 'CSE-2025-301',
    email: 'vikram.singh@yahoo.in',
    phone: '9915501234',
    institutionId: '6adc2819dcc376cea2374b60',
    institutionName: 'Chandigarh Polytechnic Institute',
    aictePermanentId: '1-10009841',
    region: 'Northern',
    category: 'Admission Irregularities',
    subject: 'Illegal forfeiture of security deposit and withholding of original marks certificates',
    description: 'Following a seat surrender executed strictly within the state counseling refund window, college authorities refuse to reimburse the ₹35,000 security deposit and continue to unlawfully hold original grade sheets.',
    submittedOn: '2026-10-19T16:20:00.000Z',
    status: 'pending_review',
    evidenceFiles: [
      { name: 'seat_cancellation_slip.pdf', size: '1.5 MB', type: 'application/pdf' },
    ],
  },
];

const INITIAL_DRAFTS = [
  {
    id: 'draft-001',
    draftId: 'DRAFT-2026-001',
    studentName: 'Ananya Iyer',
    enrollmentNo: '23EEE045',
    email: 'ananya.iyer@gmail.com',
    phone: '9820011223',
    institutionId: '6adc2819dcc376cea2374b52',
    institutionName: 'Apex Institute of Technology & Management',
    aictePermanentId: '1-10000000',
    region: 'Southern',
    category: 'Fee Issues',
    subject: 'Delayed disbursement of state post-matric scholarship fee refunds',
    description: 'The college bursar office has received the welfare directorate scholarship grant for the 2025-26 academic cycle but has withheld credit adjustments against hostel and laboratory dues.',
    lastSaved: '2026-10-23T11:20:00.000Z',
    evidenceFiles: [
      { name: 'scholarship_acknowledgement.pdf', size: '1.2 MB', type: 'application/pdf' },
    ],
    consent: true,
  },
  {
    id: 'draft-002',
    draftId: 'DRAFT-2026-002',
    studentName: 'Harsh Vardhan',
    enrollmentNo: 'CIVIL-22-108',
    email: 'harsh.vardhan22@gmail.com',
    phone: '9711002233',
    institutionId: '6adc2819dcc376cea2374b58',
    institutionName: 'Bhopal Technical Campus and Research Institute',
    aictePermanentId: '1-10004434',
    region: 'Central',
    category: 'Infrastructure',
    subject: 'Substandard residential hostel accommodation and potable water contamination',
    description: 'Residential campus block C exhibits rusted overhead reserve water cisterns causing recurring microbial contamination and gastrointestinal illness among third-year civil engineering scholars.',
    lastSaved: '2026-10-21T15:40:00.000Z',
    evidenceFiles: [
      { name: 'water_pathology_report.pdf', size: '2.8 MB', type: 'application/pdf' },
      { name: 'hostel_warden_memo.pdf', size: '890 KB', type: 'application/pdf' },
    ],
    consent: false,
  },
];

const INITIAL_NEEDS_INFO_REJECTED = [
  {
    id: 'nir-001',
    trackingId: 'STU-2026-08310',
    studentName: 'Mohit Reddy',
    enrollmentNo: '20CS104',
    email: 'mreddy@gmail.com',
    phone: '9944112233',
    institutionName: 'Institute of Modern Technology & Science',
    aictePermanentId: '1-10001004',
    region: 'Southern',
    category: 'Faculty Shortage',
    decision: 'Needs Info',
    subject: 'Faculty absence in elective Artificial Intelligence & Data Mining tracks',
    reason: 'Please attach the official semester timetable copy and evidence of prior written complaint lodged with the Institutional Grievance Redressal Committee (GRC) before apex bureau escalation.',
    actionDate: '2026-10-22T14:10:00.000Z',
    actionBy: 'Bureau Officer (PGRC)',
  },
  {
    id: 'nir-002',
    trackingId: 'STU-2026-08204',
    studentName: 'Deepak Choudhury',
    enrollmentNo: '22ME002',
    email: 'deepak.c@gmail.com',
    phone: '9833004455',
    institutionName: 'Mumbai Institute of Industrial Management',
    aictePermanentId: '1-10006721',
    region: 'Western',
    category: 'Fee Issues',
    decision: 'Rejected',
    subject: 'Dispute over outsourced dining cafeteria monthly advance deposit billing',
    reason: 'Grievance pertains strictly to private outsourced dining hall vendor contracts rather than AICTE statutory academic fees, capitation regulations, or institutional tuition tariffs. Deemed outside statutory jurisdiction.',
    actionDate: '2026-10-18T16:45:00.000Z',
    actionBy: 'Regulatory Bureau Officer',
  },
];

// Helper to notify listeners across components
const emitUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('student-intake-update'));
  }
};

export const studentIntakeStore = {
  getSubmissions: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
        return INITIAL_SUBMISSIONS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  },

  getUnreviewedCount: () => {
    const list = studentIntakeStore.getSubmissions();
    return list.filter((item) => item.status === 'pending_review').length;
  },

  getDrafts: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DRAFTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(INITIAL_DRAFTS));
        return INITIAL_DRAFTS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_DRAFTS;
    }
  },

  getNeedsInfoRejected: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NEEDS_INFO_REJECTED);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.NEEDS_INFO_REJECTED, JSON.stringify(INITIAL_NEEDS_INFO_REJECTED));
        return INITIAL_NEEDS_INFO_REJECTED;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_NEEDS_INFO_REJECTED;
    }
  },

  saveDraft: (draftData) => {
    const drafts = studentIntakeStore.getDrafts();
    const existingIndex = drafts.findIndex((d) => d.id === draftData.id || d.draftId === draftData.draftId);
    
    const draftId = draftData.draftId || `DRAFT-2026-${String(drafts.length + 1).padStart(3, '0')}`;
    const entry = {
      ...draftData,
      id: draftData.id || `draft-${Date.now()}`,
      draftId,
      lastSaved: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      drafts[existingIndex] = entry;
    } else {
      drafts.unshift(entry);
    }

    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
    emitUpdate();
    return entry;
  },

  deleteDraft: (draftId) => {
    const drafts = studentIntakeStore.getDrafts().filter((d) => d.id !== draftId && d.draftId !== draftId);
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
    emitUpdate();
  },

  acceptSubmission: (submissionId) => {
    const submissions = studentIntakeStore.getSubmissions().filter((s) => s.id !== submissionId && s.trackingId !== submissionId);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    emitUpdate();
  },

  requestInfo: (submissionId, reason, actionBy = 'Intake Officer') => {
    const submissions = studentIntakeStore.getSubmissions();
    const item = submissions.find((s) => s.id === submissionId || s.trackingId === submissionId);
    if (!item) return;

    const remaining = submissions.filter((s) => s.id !== submissionId && s.trackingId !== submissionId);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(remaining));

    const nirList = studentIntakeStore.getNeedsInfoRejected();
    nirList.unshift({
      id: `nir-${Date.now()}`,
      trackingId: item.trackingId,
      studentName: item.studentName,
      enrollmentNo: item.enrollmentNo,
      email: item.email,
      phone: item.phone,
      institutionName: item.institutionName,
      aictePermanentId: item.aictePermanentId,
      region: item.region,
      category: item.category,
      subject: item.subject,
      decision: 'Needs Info',
      reason,
      actionDate: new Date().toISOString(),
      actionBy,
    });
    localStorage.setItem(STORAGE_KEYS.NEEDS_INFO_REJECTED, JSON.stringify(nirList));
    emitUpdate();
  },

  rejectSubmission: (submissionId, reason, actionBy = 'Intake Officer') => {
    const submissions = studentIntakeStore.getSubmissions();
    const item = submissions.find((s) => s.id === submissionId || s.trackingId === submissionId);
    if (!item) return;

    const remaining = submissions.filter((s) => s.id !== submissionId && s.trackingId !== submissionId);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(remaining));

    const nirList = studentIntakeStore.getNeedsInfoRejected();
    nirList.unshift({
      id: `nir-${Date.now()}`,
      trackingId: item.trackingId,
      studentName: item.studentName,
      enrollmentNo: item.enrollmentNo,
      email: item.email,
      phone: item.phone,
      institutionName: item.institutionName,
      aictePermanentId: item.aictePermanentId,
      region: item.region,
      category: item.category,
      subject: item.subject,
      decision: 'Rejected',
      reason,
      actionDate: new Date().toISOString(),
      actionBy,
    });
    localStorage.setItem(STORAGE_KEYS.NEEDS_INFO_REJECTED, JSON.stringify(nirList));
    emitUpdate();
  },

  getNextCaseId: () => {
    const current = parseInt(localStorage.getItem(STORAGE_KEYS.NEXT_GEN_COUNTER) || '1420', 10);
    const next = current + 1;
    localStorage.setItem(STORAGE_KEYS.NEXT_GEN_COUNTER, String(next));
    const year = new Date().getFullYear();
    return `AICTE-GEN-${year}-${String(next).padStart(5, '0')}`;
  },
};
