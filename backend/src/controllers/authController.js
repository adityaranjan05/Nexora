import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { portalForRole } from '../utils/portal.js';

export const login = async (req, res, next) => {
  try {
    const { email, password, portal } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate('bureau');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account' });
    }

    // Portal validation: if account's role does not belong to requested portal, return 403
    // Do NOT reveal whether password was right when portal is wrong
    if (portal) {
      const userPortal = portalForRole(user.role);
      if (userPortal !== portal) {
        const portalDisplayName = portal.charAt(0).toUpperCase() + portal.slice(1);
        return res.status(403).json({
          success: false,
          message: `This account is not registered for the ${portalDisplayName} portal`,
        });
      }
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const assignedPortal = portalForRole(user.role);

    // JWT payload includes id, role, portal; 8h expiry
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        portal: assignedPortal,
      },
      env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      token,
      portal: assignedPortal,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        portal: assignedPortal,
        bureau: user.bureau,
        region: user.region,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  const userPortal = portalForRole(req.user.role);
  return res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      portal: userPortal,
      bureau: req.user.bureau,
      region: req.user.region,
    },
  });
};

export default { login, getMe };
