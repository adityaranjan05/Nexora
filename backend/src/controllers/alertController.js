import { Alert } from '../models/Alert.js';
import { Notification } from '../models/Notification.js';

export const getAlerts = async (req, res, next) => {
  try {
    const userNotifications = await Notification.find({ user: req.user._id })
      .populate({
        path: 'alert',
        populate: [
          { path: 'case', select: 'caseId rawInstitutionName category status' },
          { path: 'institution', select: 'name city region aictePermanentId' },
          { path: 'overlapGroup' },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    const formatted = userNotifications.map((n) => ({
      notificationId: n._id,
      isRead: n.isRead,
      createdAt: n.createdAt,
      alert: n.alert,
    }));

    res.json({
      success: true,
      unreadCount,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const markAlertAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    // id can be notification ID or alert ID
    let notif = await Notification.findOne({
      user: req.user._id,
      $or: [{ _id: id }, { alert: id }],
    });

    if (notif) {
      notif.isRead = true;
      await notif.save();
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};
