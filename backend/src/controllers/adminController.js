import { SlaRule } from '../models/SlaRule.js';
import { User } from '../models/User.js';
import { Bureau } from '../models/Bureau.js';
import bcrypt from 'bcryptjs';

export const getSlaRules = async (req, res, next) => {
  try {
    const rules = await SlaRule.find().populate('bureau');
    res.json({ success: true, data: rules });
  } catch (error) {
    next(error);
  }
};

export const updateSlaRule = async (req, res, next) => {
  try {
    const { category, daysToDispose, reminderAfterDays, dueSoonDays, escalateAfterDaysOverdue } = req.body;
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const rule = await SlaRule.findOneAndUpdate(
      { category },
      {
        daysToDispose: Number(daysToDispose),
        reminderAfterDays: Number(reminderAfterDays),
        dueSoonDays: Number(dueSoonDays),
        escalateAfterDaysOverdue: Number(escalateAfterDaysOverdue),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: `SLA rule for '${category}' updated`, data: rule });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').populate('bureau');
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getBureaus = async (req, res, next) => {
  try {
    const bureaus = await Bureau.find().sort({ name: 1 });
    res.json({ success: true, data: bureaus });
  } catch (error) {
    next(error);
  }
};
