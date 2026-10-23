/**
 * Connector for Public Grievance Redressal Cell (PGRC) complaints system.
 * PGRC uses fields like: grievance_id, institute_name, place, grievance_type, narrative, submission_date, progress_state
 */
export const fetchPgrcCases = async (baseUrl = 'http://localhost:5000') => {
  try {
    const res = await fetch(`${baseUrl}/mock/pgrc/cases`);
    if (!res.ok) throw new Error(`PGRC API responded with status ${res.status}`);
    const data = await res.json();
    return (data.grievances || []).map((raw) => ({
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
    }));
  } catch (error) {
    console.warn(`[PGRC Connector] Fallback to internal sample: ${error.message}`);
    return [];
  }
};
