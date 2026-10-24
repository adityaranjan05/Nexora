import { Alert } from '../models/Alert.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

/**
 * Creates an alert if an open one of the same type does not already exist for this case/overlap.
 */
export const createOrUpdateAlert = async ({
  alertType,
  caseId,
  institutionId,
  overlapGroupId,
  message,
  severity = 'medium',
  targetRoles = [],
  bureauId = null,
  assignedOfficerId = null,
}) => {
  // Check if open alert exists for this case/group & type
  const filter = {
    alertType,
    resolvedAt: { $exists: false },
  };

  if (caseId) filter.case = caseId;
  if (overlapGroupId) filter.overlapGroup = overlapGroupId;

  let alert = await Alert.findOne(filter);

  if (!alert) {
    alert = await Alert.create({
      alertType,
      case: caseId || undefined,
      institution: institutionId || undefined,
      overlapGroup: overlapGroupId || undefined,
      message,
      severity,
    });
  } else {
    alert.message = message;
    alert.severity = severity;
    await alert.save();
  }

  // Find users who should receive this notification
  const userConditions = [{ role: 'super_admin' }];

  if (targetRoles.includes('senior_management')) {
    userConditions.push({ role: 'senior_management' });
  }

  if (assignedOfficerId) {
    userConditions.push({ _id: assignedOfficerId });
  }

  if (bureauId && targetRoles.includes('bureau_officer')) {
    userConditions.push({ role: 'bureau_officer', bureau: bureauId });
  }

  const recipients = await User.find({
    isActive: true,
    $or: userConditions,
  });

  // Create notifications avoiding duplicates
  for (const user of recipients) {
    const existingNotif = await Notification.findOne({
      user: user._id,
      alert: alert._id,
    });

    if (!existingNotif) {
      await Notification.create({
        user: user._id,
        alert: alert._id,
        isRead: false,
      });
    }
  }

  return alert;
};
