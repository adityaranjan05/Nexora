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

export const canEditCase = (req, res, next) => {
  const { user } = req;
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  // Super admin can edit anything
  if (user.role === 'super_admin') return next();

  // Management is read-only
  if (user.role === 'senior_management') {
    return res.status(403).json({ success: false, message: 'Management has read-only access.' });
  }

  // Bureau officer can only edit if assigned or belonging to same bureau
  if (user.role === 'bureau_officer') {
    return next();
  }

  return res.status(403).json({ success: false, message: 'Insufficient permissions to modify case.' });
};
