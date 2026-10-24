# AICTE Integrated Complaint Monitoring Dashboard - Specification

Complete build guide for Antigravity: Node.js, Express, TypeScript, MongoDB, React

## 1. What You Are Building
A single-window dashboard that pulls institution-related complaint cases from existing AICTE Bureaus/Cells (RB, PGRC, Approval Bureau, Academic Bureau, and regional offices), links them by institution, detects overlapping actions, tracks status and timelines, and reports on everything. It is a monitoring layer, not a new complaint intake portal.

### Assumptions to State in Submission
- RB and PGRC systems are integrated through APIs or scheduled sync (simulated with mock APIs and sample data).
- Cells with no system use CSV/Excel bulk upload.
- Overlap detection flags cases for officials to review. Officials decide the action.
- Institution master data (AICTE Permanent ID, name, address, region) is imported once.
- Access is only for authorized officials, with role-based views.

---

## 2. Tech Stack
- **Backend**: Node.js + Express with JavaScript (ES Modules)
- **Database**: MongoDB Atlas with Mongoose
- **Validation**: Zod
- **Auth**: jsonwebtoken + bcrypt, role-based middleware
- **Matching**: fuse.js plus custom normalisation rules
- **Scheduler**: node-cron (periodic sync and daily SLA checks)
- **Upload & Parsing**: multer, csv-parse, exceljs
- **Reports**: MongoDB aggregation, json2csv, pdfkit
- **Frontend**: React + Vite + JavaScript / JSX (port 5173)
- **UI**: Tailwind CSS, Lucide icons, premium modern UI styling
- **Data & Charts**: Recharts, tables, search, filters
- **Testing**: Node test runner / Supertest

---

## 3. Security and Setup Rules
- Keep `.env.example` with placeholder values.
- Never commit `.env` or hardcode secrets in source files.
- `.gitignore` in root containing `node_modules`, `.env`, `dist`, `build`.

---

## 4. End-to-End Workflow
1. Source systems hold cases (RB, PGRC, etc.).
2. Ingestion: Connectors fetch from source APIs or read CSV/Excel. Logged in SyncLog and ImportBatch.
3. Validation & standardisation: Dates, statuses, categories, and institution names converted to common format. Bad rows recorded in error report.
4. Institution matching: Exact AICTE Permanent ID (100) -> Exact normalised name + city (98) -> Fuzzy match via fuse.js with region check and pincode bonus (>=90 auto, 75-89 review, <75 unmatched).
5. Case upsert: Case created or updated. Any status/bureau/officer change writes a CaseAction audit log.
6. Overlap detection: Check if institution has open cases in 2+ Bureaus/Cells. Flag with "Potential Overlapping Cases - Coordination Required".
7. SLA check: Pending reminders, due soon, breach, escalation.
8. Notifications & alerts: In-app alerts to officers and supervisors.
9. Official actions: Search, view timeline, link cases, add remarks, transfer, escalate.
10. Reports & analytics: Bureau-wise, region-wise, institution-wise, ageing, disposal rate, overlaps, monthly/quarterly exportable as CSV/PDF.

---

## 5. Roles and Access
- `super_admin`: Everything, all regions, SLA rules, user management
- `senior_management`: Read all data, dashboards, reports, escalations
- `bureau_officer`: See cases & overlap alerts for their Bureau, update own cases, add remarks, link cases, request transfer
- `regional_officer`: See cases & institutions in their region only
- `data_operator`: Bulk upload, resolve match-review queue

---

## 6. MongoDB Collections (12 Mongoose Models)
- `Institution`: aictePermanentId (unique), name, normalizedName, address, city, district, state, pincode, region, institutionType
- `Bureau`: code, name, type (bureau, cell, regional_office)
- `User`: name, email, passwordHash, role, bureau (ref), region, isActive
- `Case`: caseId (unique), sourceSystem, sourceCaseRef, institution (ref), rawInstitutionName, matchStatus, matchScore, category, description, complainantType, receivedDate, status, currentBureau (ref), assignedOfficer (ref), lastActionText, lastActionDate, nextActionText, expectedDisposalDate, disposedDate
- `CaseAction`: case (ref), actionType, fromBureau, toBureau, performedBy, performedByBureau, remarks, attachmentUrl, timestamp
- `OverlapGroup`: institution (ref), cases [refs], status, severity, resolvedBy, resolutionRemarks, resolvedAt
- `CaseLink`: caseA, caseB, linkType, createdBy
- `SlaRule`: category, bureau, daysToDispose, reminderAfterDays, dueSoonDays, escalateAfterDaysOverdue
- `Alert`: alertType, case, institution, overlapGroup, message, severity, resolvedAt
- `Notification`: user, alert, isRead
- `ImportBatch`: sourceSystem, filename, totalRows, successRows, failedRows, errorReportPath, uploadedBy
- `SyncLog`: sourceSystem, startedAt, finishedAt, recordsFetched, recordsCreated, recordsUpdated, errors

---

## 7. API Endpoints
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/bureau-workload`
- `GET /api/dashboard/institution-status`
- `GET /api/cases`
- `GET /api/cases/:id`
- `GET /api/cases/:id/history`
- `PATCH /api/cases/:id`
- `POST /api/cases/:id/actions`
- `POST /api/cases/:id/transfer`
- `POST /api/cases/:id/escalate`
- `POST /api/cases/link`
- `GET /api/institutions`
- `GET /api/institutions/:id`
- `GET /api/overlaps`
- `GET /api/overlaps/:id`
- `POST /api/overlaps/:id/resolve`
- `GET /api/alerts`
- `POST /api/alerts/:id/read`
- `GET /api/match-review`
- `POST /api/match-review/:caseId/confirm`
- `POST /api/import/upload`
- `POST /api/sync/run`
- `GET /api/reports/:type` (format=csv|pdf)
- `GET /api/admin/sla-rules`
- `PUT /api/admin/sla-rules`
- `GET /mock/rb/cases`, `GET /mock/pgrc/cases`
