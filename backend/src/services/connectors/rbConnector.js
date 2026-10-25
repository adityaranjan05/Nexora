import { mockRbCases } from '../../routes/mockRoutes.js';

const mapRbCase = (raw) => ({
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
});

export const fetchRbCases = async (baseUrl = `http://localhost:${process.env.PORT || 5000}`) => {
  try {
    const res = await fetch(`${baseUrl}/mock/rb/cases`);
    if (!res.ok) throw new Error(`RB API responded with status ${res.status}`);
    const data = await res.json();
    return (data.cases || []).map(mapRbCase);
  } catch (error) {
    return mockRbCases.map(mapRbCase);
  }
};
