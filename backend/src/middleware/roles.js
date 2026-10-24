import { Case } from '../models/Case.js';

export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user.role === 'super_admin') {
      return next();
    }

    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' does not have permission for this action.`,
      });
    }

    next();
  };
};

/**
 * Ensures bureau users can modify a case ONLY if case.currentBureau equals user.bureau
 */
export const canEditCase = async (req, res, next) => {
  const { user } = req;
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  // Super admin can edit anything
  if (user.role === 'super_admin') return next();

  // Senior Management has read-only access (no status updates)
  if (user.role === 'senior_management') {
    return res.status(403).json({ success: false, message: 'Management has read-only access.' });
  }

  // Bureau officer or data operator can only edit if case belongs to user's bureau
  if (user.role === 'bureau_officer' || user.role === 'data_operator') {
    const caseId = req.params.id || req.body.caseId;
    if (caseId) {
      const c = await Case.findById(caseId);
      if (!c) {
        return res.status(404).json({ success: false, message: 'Case not found' });
      }
      const userBureauId = user.bureau?._id ? user.bureau._id.toString() : user.bureau?.toString();
      const caseBureauId = c.currentBureau?.toString();
      if (!userBureauId || !caseBureauId || caseBureauId !== userBureauId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only modify cases assigned to your bureau.',
        });
      }
    }
    return next();
  }

  return res.status(403).json({ success: false, message: 'Insufficient permissions to modify case.' });
};

export default { authorize, canEditCase };
