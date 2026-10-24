export const PORTAL_ROLES = {
  officer: ['super_admin', 'senior_management', 'regional_officer'],
  bureau: ['bureau_officer', 'data_operator'],
  student: ['student'],
};

export const ALL_ROLES = [
  ...PORTAL_ROLES.officer,
  ...PORTAL_ROLES.bureau,
  ...PORTAL_ROLES.student,
];

/**
 * Returns the portal name ('officer' | 'bureau' | 'student') associated with a given role.
 * @param {string} role
 * @returns {'officer' | 'bureau' | 'student' | null}
 */
export const portalForRole = (role) => {
  if (PORTAL_ROLES.officer.includes(role)) return 'officer';
  if (PORTAL_ROLES.bureau.includes(role)) return 'bureau';
  if (PORTAL_ROLES.student.includes(role)) return 'student';
  return null;
};

export default portalForRole;
