/**
 * Escapes special regex characters from user input to prevent regex injection (ReDoS / syntax errors).
 * @param {string} str
 * @returns {string}
 */
export const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default escapeRegex;
