/**
 * Connector for Regulatory Bureau (RB) complaints system.
 * RB uses fields like: complaint_no, institute_title, campus_city, registration_dt, matter_summary, regulatory_category
 */
export const fetchRbCases = async (baseUrl = `http://localhost:${process.env.PORT || 3000}`) => {
  try {
    const res = await fetch(`${baseUrl}/mock/rb/cases`);
    if (!res.ok) throw new Error(`RB API responded with status ${res.status}`);
    const data = await res.json();
    return (data.cases || []).map((raw) => ({
      sourceSystem: 'RB',
      sourceCaseRef: raw.complaint_no || raw.ref_id,
      aictePermanentId: raw.aicte_id || raw.permanent_id,
      rawInstitutionName: raw.institute_title || raw.college_name,
      rawAddress: raw.address,
      rawCity: raw.campus_city || raw.city,
      rawState: raw.state,
      rawPincode: raw.pincode,
      category: raw.regulatory_category || raw.category || 'Regulatory Compliance',
      description: raw.matter_summary || raw.details || raw.description,
      complainantType: raw.filed_by || 'Public / Student',
      receivedDate: raw.registration_dt || raw.date,
      status: raw.complaint_status || 'pending',
      lastActionText: raw.recent_action || 'Registered in RB',
    }));
  } catch (error) {
    console.warn(`[RB Connector] Fallback to internal sample: ${error.message}`);
    return [];
  }
};
