import { Case } from '../models/Case.js';
import { SlaRule } from '../models/SlaRule.js';
import { createOrUpdateAlert } from './alerts.js';

export const runSlaChecks = async () => {
  const now = new Date();
  const openCases = await Case.find({
    status: { $in: ['pending', 'under_process', 'needs_info', 'transferred', 'escalated'] },
  }).populate('currentBureau');

  // Load default SLA rules
  const rules = await SlaRule.find();
  const rulesByCategory = new Map(rules.map((r) => [r.category, r]));

  let stats = {
    checked: openCases.length,
    reminders: 0,
    dueSoon: 0,
    breaches: 0,
    escalations: 0,
  };

  for (const c of openCases) {
    const rule = rulesByCategory.get(c.category) || {
      daysToDispose: 30,
      reminderAfterDays: 7,
      dueSoonDays: 3,
      escalateAfterDaysOverdue: 7,
    };

    const daysSinceLastAction = Math.floor(
      (now.getTime() - new Date(c.lastActionDate || c.receivedDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    const msUntilExpected = new Date(c.expectedDisposalDate).getTime() - now.getTime();
    const daysUntilExpected = Math.ceil(msUntilExpected / (1000 * 60 * 60 * 24));

    // 1. Pending reminder: no action for X days
    if (daysSinceLastAction >= rule.reminderAfterDays) {
      await createOrUpdateAlert({
        alertType: 'pending_reminder',
        caseId: c._id,
        institutionId: c.institution,
        message: `Pending Reminder: Case ${c.caseId} has had no action for ${daysSinceLastAction} days.`,
        severity: 'low',
        targetRoles: ['bureau_officer'],
        assignedOfficerId: c.assignedOfficer,
        bureauId: c.currentBureau?._id,
      });
      stats.reminders++;
    }

    // 2. Due soon: 3 days or fewer before expected disposal date
    if (daysUntilExpected >= 0 && daysUntilExpected <= rule.dueSoonDays) {
      await createOrUpdateAlert({
        alertType: 'due_soon',
        caseId: c._id,
        institutionId: c.institution,
        message: `Due Soon: Case ${c.caseId} disposal due in ${daysUntilExpected} day(s).`,
        severity: 'medium',
        targetRoles: ['bureau_officer'],
        assignedOfficerId: c.assignedOfficer,
        bureauId: c.currentBureau?._id,
      });
      stats.dueSoon++;
    }

    // 3. Breach & Escalation: expected date passed
    if (daysUntilExpected < 0) {
      const daysOverdue = Math.abs(daysUntilExpected);

      if (daysOverdue > rule.escalateAfterDaysOverdue || c.status === 'escalated') {
        // Escalation: overdue > 7 days
        await createOrUpdateAlert({
          alertType: 'escalation',
          caseId: c._id,
          institutionId: c.institution,
          message: `ESCALATION: Case ${c.caseId} is critically overdue by ${daysOverdue} days. Senior management intervention requested.`,
          severity: 'high',
          targetRoles: ['senior_management', 'super_admin'],
          assignedOfficerId: c.assignedOfficer,
          bureauId: c.currentBureau?._id,
        });
        stats.escalations++;
      } else {
        // Breach: overdue <= 7 days
        await createOrUpdateAlert({
          alertType: 'breach',
          caseId: c._id,
          institutionId: c.institution,
          message: `SLA Breach: Case ${c.caseId} has passed its expected disposal date by ${daysOverdue} day(s).`,
          severity: 'high',
          targetRoles: ['bureau_officer', 'super_admin'],
          assignedOfficerId: c.assignedOfficer,
          bureauId: c.currentBureau?._id,
        });
        stats.breaches++;
      }
    }
  }

  return stats;
};
