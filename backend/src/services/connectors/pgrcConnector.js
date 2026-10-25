import { mockPgrcCases } from '../../routes/mockRoutes.js';

const mapPgrcCase = (raw) => ({
  sourceSystem: 'PGRC',
  sourceCaseRef: raw.grievance_id || raw.ticket_id,
  aictePermanentId: raw.institute_code || raw.aicte_pid,
  rawInstitutionName: raw.institute_name || raw.college,
  rawAddress: raw.address_line,
  rawCity: raw.place || raw.city,
  rawState: raw.state_name || raw.state,
  rawPincode: raw.pin,
  category: raw.grievance_type || raw.category || 'Student Grievance',
  description: raw.narrative || raw.issue_description || raw.complaint,
  complainantType: raw.complainant_category || 'Student',
  receivedDate: raw.submission_date || raw.created_on,
  status: raw.progress_state || 'pending',
  lastActionText: raw.status_note || 'Logged in PGRC portal',
});

export const fetchPgrcCases = async (baseUrl = `http://localhost:${process.env.PORT || 5000}`) => {
  try {
    const res = await fetch(`${baseUrl}/mock/pgrc/cases`);
    if (!res.ok) throw new Error(`PGRC API responded with status ${res.status}`);
    const data = await res.json();
    return (data.grievances || []).map(mapPgrcCase);
  } catch (error) {
    return mockPgrcCases.map(mapPgrcCase);
  }
};
