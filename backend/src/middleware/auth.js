import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { portalForRole } from '../utils/portal.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.id).populate('bureau');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid token or inactive user.' });
    }

    req.user = user;
    req.portal = decoded.portal || portalForRole(user.role);
    req.tokenPayload = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * Middleware enforcing that the authenticated token and user role belong to the required portal.
 * Rejects tokens used on the wrong API prefix with a 403.
 * @param {'officer' | 'bureau' | 'student'} requiredPortal
 */
export const requirePortal = (requiredPortal) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userPortal = portalForRole(req.user.role);
    const tokenPortal = req.tokenPayload?.portal || req.portal;

    if (userPortal !== requiredPortal || (tokenPortal && tokenPortal !== requiredPortal)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This endpoint is restricted to the ${requiredPortal} portal.`,
      });
    }

    next();
  };
};

export default authenticate;
