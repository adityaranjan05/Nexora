/**
 * Configuration for Student Intake workflow, categories, and bureau routing.
 */

export const INTAKE_CATEGORIES = [
  'Fee Issues',
  'Faculty Shortage',
  'Fake Documents',
  'Infrastructure',
  'Admission Irregularities',
];

/**
 * Auto-routing mapping from grievance category to AICTE Bureau / Cell.
 * Fee Issues -> Regulatory Bureau (RB)
 * Fake Documents -> Approval Bureau (APPROVAL)
 * Infrastructure -> Academic Bureau (ACADEMIC)
 * Faculty Shortage -> Public Grievance Redressal Cell (PGRC)
 * Admission Irregularities -> Northern Regional Office (RO_NORTH)
 */
export const CATEGORY_BUREAU_MAP = {
  'Fee Issues': {
    code: 'RB',
    name: 'Regulatory Bureau',
    type: 'bureau',
    slaDays: 30,
    description: 'Statutory compliance, fee caps, capitation inquiries',
  },
  'Fake Documents': {
    code: 'APPROVAL',
    name: 'Approval Bureau',
    type: 'bureau',
    slaDays: 21,
    description: 'Document verification, counterfeit certifications & institutional legitimacy',
  },
  'Infrastructure': {
    code: 'ACADEMIC',
    name: 'Academic Bureau',
    type: 'bureau',
    slaDays: 30,
    description: 'Laboratory amenities, workshop equipment, physical infrastructure deficiencies',
  },
  'Faculty Shortage': {
    code: 'PGRC',
    name: 'Public Grievance Redressal Cell',
    type: 'cell',
    slaDays: 15,
    description: 'Staffing, professor vacancy, student welfare & teaching compliance',
  },
  'Admission Irregularities': {
    code: 'RO_NORTH',
    name: 'Northern Regional Office',
    type: 'regional_office',
    slaDays: 20,
    description: 'Seat allotment, counseling disputes, caution deposit retention',
  },
};

export const getBureauForCategory = (category, availableBureaus = []) => {
  const config = CATEGORY_BUREAU_MAP[category] || CATEGORY_BUREAU_MAP['Fee Issues'];
  const matched = availableBureaus.find(
    (b) => b.code?.toUpperCase() === config.code || b.name?.toLowerCase() === config.name.toLowerCase()
  );
  return {
    ...config,
    _id: matched?._id,
  };
};

export const getExpectedDisposalDate = (category) => {
  const config = CATEGORY_BUREAU_MAP[category] || { slaDays: 30 };
  const d = new Date();
  d.setDate(d.getDate() + config.slaDays);
  return d;
};
