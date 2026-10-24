import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Upload, 
  FileText, 
  Trash2, 
  AlertCircle, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Hash, 
  ChevronDown, 
  Search,
  ExternalLink,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useApp } from '../../../context/AppContext';
import { casesApi } from '../../../api/client';
import { StatusBadge } from '../../common/StatusBadge';
import { BureauBadge } from '../../common/BureauBadge';
import { OverlapBadge } from '../../common/OverlapBadge';
import { 
  INTAKE_CATEGORIES, 
  CATEGORY_BUREAU_MAP, 
  getBureauForCategory, 
  getExpectedDisposalDate 
} from './config';
import { studentIntakeStore } from './studentIntakeStore';

export const NewComplaintForm = ({ 
  initialData = null, 
  onViewAllCases,
  onClearInitialData 
}) => {
  const { institutions, bureaus, cases, setCases, addToast, setAlerts } = useApp();
  const queryClient = useQueryClient();

  // Form State
  const [studentName, setStudentName] = useState(initialData?.studentName || '');
  const [enrollmentNo, setEnrollmentNo] = useState(initialData?.enrollmentNo || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [category, setCategory] = useState(initialData?.category || INTAKE_CATEGORIES[0]);
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [files, setFiles] = useState(initialData?.evidenceFiles || []);
  const [consent, setConsent] = useState(initialData?.consent || false);
  const [activeDraftId, setActiveDraftId] = useState(initialData?.draftId || null);

  // Touched state for inline validation
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Success state
  const [successResult, setSuccessResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Initialize institution if initialData was passed
  useEffect(() => {
    if (initialData?.institutionId && institutions?.length) {
      const match = institutions.find((i) => i._id === initialData.institutionId || i.name === initialData.institutionName);
      if (match) {
        setSelectedInstitution(match);
        setInstitutionSearch(match.name);
      } else if (initialData.institutionName) {
        setSelectedInstitution({
          _id: initialData.institutionId || 'custom_inst',
          name: initialData.institutionName,
          aictePermanentId: initialData.aictePermanentId || '1-10000000',
          region: initialData.region || 'Central',
        });
        setInstitutionSearch(initialData.institutionName);
      }
    } else if (initialData?.institutionName) {
      setSelectedInstitution({
        _id: initialData.institutionId || 'custom_inst',
        name: initialData.institutionName,
        aictePermanentId: initialData.aictePermanentId || '1-10000000',
        region: initialData.region || 'Central',
      });
      setInstitutionSearch(initialData.institutionName);
    }
  }, [initialData, institutions]);

  // Filter institutions for searchable dropdown
  const filteredInstitutions = useMemo(() => {
    if (!institutionSearch.trim()) return (institutions || []).slice(0, 15);
    const q = institutionSearch.toLowerCase();
    return (institutions || [])
      .filter((inst) => 
        inst.name?.toLowerCase().includes(q) || 
        inst.aictePermanentId?.toLowerCase().includes(q) ||
        inst.city?.toLowerCase().includes(q) ||
        inst.region?.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [institutions, institutionSearch]);

  // Validation rules
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneClean = phone.replace(/[^0-9]/g, '');
  const isPhoneValid = phoneClean.length === 10;
  const isEmailValid = emailRegex.test(email.trim());
  const isSubjectValid = subject.trim().length > 0 && subject.trim().length <= 120;
  const isDescriptionValid = description.trim().length >= 50;
  const isStudentNameValid = studentName.trim().length >= 2;
  const isEnrollmentValid = enrollmentNo.trim().length >= 2;
  const isInstitutionValid = !!selectedInstitution;

  const isFormValid = 
    isStudentNameValid && 
    isEnrollmentValid && 
    isEmailValid && 
    isPhoneValid && 
    isInstitutionValid && 
    isSubjectValid && 
    isDescriptionValid && 
    consent;

  // Auto-routed Bureau info
  const targetBureau = useMemo(() => {
    return getBureauForCategory(category, bureaus);
  }, [category, bureaus]);

  // Handle File Uploads (max 5 files, 10MB each, PDF/JPG/PNG)
  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    if (files.length + selectedFiles.length > 5) {
      addToast('Upload Limit', 'You can upload a maximum of 5 evidence files.', 'warning');
      return;
    }

    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const newValidFiles = [];

    for (const f of selectedFiles) {
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (!validExtensions.includes(ext)) {
        addToast('Invalid Format', `${f.name} is not a supported file (PDF, JPG, PNG only).`, 'danger');
        continue;
      }
      if (f.size > 10 * 1024 * 1024) {
        addToast('File Too Large', `${f.name} exceeds the 10 MB limit.`, 'danger');
        continue;
      }
      newValidFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type: f.type || ext,
      });
    }

    setFiles((prev) => [...prev, ...newValidFiles]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Draft action
  const handleSaveDraft = () => {
    const draftPayload = {
      id: activeDraftId,
      studentName,
      enrollmentNo,
      email,
      phone,
      institutionId: selectedInstitution?._id,
      institutionName: selectedInstitution?.name,
      aictePermanentId: selectedInstitution?.aictePermanentId,
      region: selectedInstitution?.region,
      category,
      subject,
      description,
      evidenceFiles: files,
      consent,
    };

    const saved = studentIntakeStore.saveDraft(draftPayload);
    setActiveDraftId(saved.draftId);
    addToast('Draft Saved', `Saved intake docket (${saved.draftId}) successfully.`, 'success');
  };

  // Form Submit Action
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setTouched({
      studentName: true,
      enrollmentNo: true,
      email: true,
      phone: true,
      institution: true,
      subject: true,
      description: true,
      consent: true,
    });

    if (!isFormValid) {
      addToast('Validation Error', 'Please complete all required fields and verify consent.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const generatedCaseId = studentIntakeStore.getNextCaseId();
      const expectedDisposal = getExpectedDisposalDate(category);

      // Check overlap for the institution
      const instCases = (cases || []).filter(
        (c) => 
          (c.institution?._id === selectedInstitution._id || c.institution === selectedInstitution._id) &&
          c.status !== 'disposed'
      );
      const existingBureaus = new Set(instCases.map((c) => c.currentBureau?.name || c.currentBureau?.code || c.currentBureau));
      const triggersOverlap = instCases.length >= 1 && (existingBureaus.size >= 1 || existingBureaus.has(targetBureau.name));

      const payload = {
        studentName,
        enrollmentNo,
        email,
        phone,
        institutionId: selectedInstitution._id,
        rawInstitutionName: selectedInstitution.name,
        rawState: selectedInstitution.region || selectedInstitution.state || 'Central',
        category,
        subject,
        description,
        sourceSystem: 'GEN',
        evidenceFiles: files.map((f) => f.name),
      };

      let createdDocket = null;
      try {
        const response = await casesApi.createCase(payload);
        if (response?.data) {
          createdDocket = response.data;
        }
      } catch (apiErr) {
        console.warn('Backend API endpoint fallback to client-side reactive store:', apiErr?.message);
      }

      // If backend was not reached or returned fallback, construct canonical client object
      if (!createdDocket) {
        createdDocket = {
          _id: 'case_' + Date.now(),
          caseId: generatedCaseId,
          institution: selectedInstitution,
          rawInstitutionName: selectedInstitution.name,
          category,
          status: 'pending',
          currentBureau: {
            _id: targetBureau._id || 'bureau_' + targetBureau.code,
            code: targetBureau.code,
            name: targetBureau.name,
          },
          filingDate: new Date().toISOString(),
          receivedDate: new Date().toISOString(),
          expectedDisposalDate: expectedDisposal.toISOString(),
          hasOverlap: triggersOverlap,
          overlapSeverity: triggersOverlap ? 'high' : null,
          isOverdue: false,
          isDueSoon: false,
          description: `[${subject}] ${description}`,
          complainantType: 'Student',
        };
      }

      // If draft was resumed, remove it
      if (activeDraftId) {
        studentIntakeStore.deleteDraft(activeDraftId);
      }

      // Update AppContext cases state immediately
      setCases((prev) => [createdDocket, ...prev]);

      // Invalidate react-query cache so cases table refreshes immediately
      queryClient.invalidateQueries({ queryKey: ['cases-list'] });
      queryClient.setQueriesData({ queryKey: ['cases-list'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: [createdDocket, ...(old.data || [])],
          pagination: {
            ...old.pagination,
            total: (old.pagination?.total || 0) + 1,
          },
        };
      });

      // Push Alert entry
      setAlerts((prev) => [
        {
          id: `alert-intake-${Date.now()}`,
          alertId: `alert-intake-${Date.now()}`,
          isRead: false,
          timestamp: new Date().toLocaleString(),
          severity: triggersOverlap ? 'high' : 'medium',
          title: triggersOverlap 
            ? `Multi-Bureau Overlap Alert: ${createdDocket.caseId}` 
            : `Student Grievance Registered: ${createdDocket.caseId}`,
          description: `Docket registered against ${selectedInstitution.name} and auto-routed to ${targetBureau.name}.`,
          relatedCaseId: createdDocket.caseId,
          institutionName: selectedInstitution.name,
        },
        ...prev,
      ]);

      // Success Toast
      addToast(
        'Case Registered',
        `Docket ${createdDocket.caseId} assigned to ${targetBureau.name} with SLA deadline ${expectedDisposal.toLocaleDateString()}.`,
        'success'
      );

      // Set success screen
      setSuccessResult({
        caseId: createdDocket.caseId,
        institutionName: selectedInstitution.name,
        aictePermanentId: selectedInstitution.aictePermanentId,
        bureauName: targetBureau.name,
        bureauCode: targetBureau.code,
        category,
        expectedDisposalDate: expectedDisposal.toLocaleDateString(),
        hasOverlap: createdDocket.hasOverlap || triggersOverlap,
      });

    } catch (err) {
      console.error('Failed to submit complaint:', err);
      addToast('Registration Error', err?.message || 'Failed to submit grievance docket.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (successResult?.caseId) {
      navigator.clipboard.writeText(successResult.caseId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast('Copied', 'Case ID copied to clipboard.', 'info');
    }
  };

  const handleFileAnother = () => {
    setSuccessResult(null);
    setStudentName('');
    setEnrollmentNo('');
    setEmail('');
    setPhone('');
    setSelectedInstitution(null);
    setInstitutionSearch('');
    setCategory(INTAKE_CATEGORIES[0]);
    setSubject('');
    setDescription('');
    setFiles([]);
    setConsent(false);
    setActiveDraftId(null);
    setTouched({});
    if (onClearInitialData) onClearInitialData();
  };

  // SUCCESS STATE VIEW
  if (successResult) {
    return (
      <div className="bg-[#151618] rounded-xl border border-[#232427] p-8 max-w-2xl mx-auto text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center mx-auto text-[#00E676]">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Statutory Dossier Created
          </span>
          <h2 className="text-2xl font-bold text-[#F4F4F5]">Case Registered Successfully</h2>
          <p className="text-xs text-[#71717A] mt-1 max-w-md mx-auto">
            The grievance has been ingested into central monitoring with SLA tracking activated.
          </p>
        </div>

        {/* Case ID Box */}
        <div className="bg-[#0F1011] border border-[#232427] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block">
              Central Tracking Docket ID
            </span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-[#F4F4F5]">
              {successResult.caseId}
            </span>
          </div>

          <button
            onClick={handleCopyId}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#00E676] bg-[#00E676]/10 hover:bg-[#00E676]/20 border border-[#00E676]/30 rounded-lg transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy ID'}</span>
          </button>
        </div>

        {/* Summary Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs bg-[#0F1011] p-4 rounded-xl border border-[#232427]">
          <div>
            <span className="text-[#71717A] block text-[11px]">Institution</span>
            <span className="font-semibold text-[#F4F4F5] line-clamp-1">{successResult.institutionName}</span>
            <span className="text-[10px] text-[#71717A] font-mono">PID: {successResult.aictePermanentId}</span>
          </div>

          <div>
            <span className="text-[#71717A] block text-[11px]">Assigned Bureau</span>
            <div className="mt-0.5">
              <BureauBadge bureau={successResult.bureauName} />
            </div>
          </div>

          <div>
            <span className="text-[#71717A] block text-[11px]">Category</span>
            <span className="font-semibold text-[#F4F4F5]">{successResult.category}</span>
          </div>

          <div>
            <span className="text-[#71717A] block text-[11px]">SLA Expected Disposal</span>
            <span className="font-mono text-[#00E676] font-semibold">{successResult.expectedDisposalDate}</span>
          </div>

          {successResult.hasOverlap && (
            <div className="sm:col-span-2 pt-2 border-t border-[#232427] flex items-center gap-2">
              <OverlapBadge severity="high" compact />
              <span className="text-xs text-[#FF4D79]">
                Multi-bureau overlap alert flagged for simultaneous complaints at this institution.
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleFileAnother}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#F4F4F5] bg-[#1A1B1E] hover:bg-[#232427] border border-[#2D2E32] rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4 text-[#71717A]" />
            <span>File Another Complaint</span>
          </button>

          <button
            onClick={onViewAllCases}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-black bg-[#00E676] hover:bg-[#00c864] rounded-lg shadow-lg shadow-[#00E676]/10 transition font-sans"
          >
            <span>View in All Cases</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // FORM VIEW
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Active Draft notice if resumed */}
      {activeDraftId && (
        <div className="bg-[#6C7BFF]/10 border border-[#6C7BFF]/30 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs text-[#6C7BFF]">
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Resumed draft: <strong>{activeDraftId}</strong></span>
          </span>
          <button
            type="button"
            onClick={handleFileAnother}
            className="text-[11px] underline hover:text-[#F4F4F5]"
          >
            Discard & Start Blank
          </button>
        </div>
      )}

      {/* Grid: Student Info & Institution Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Complainant Details */}
        <div className="bg-[#151618] border border-[#232427] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#232427]">
            <User className="w-4 h-4 text-[#00E676]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F4F4F5]">
              Student Information
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Student Full Name */}
            <div>
              <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
                Student Full Name <span className="text-[#FF4D79]">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onBlur={() => setTouched((p) => ({ ...p, studentName: true }))}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className={`w-full px-3 py-2 bg-[#0F1011] border rounded-lg text-[#F4F4F5] placeholder:text-[#71717A] focus:outline-none focus:border-[#00E676] transition ${
                  touched.studentName && !isStudentNameValid ? 'border-[#FF4D79]' : 'border-[#232427]'
                }`}
              />
              {touched.studentName && !isStudentNameValid && (
                <p className="text-[10px] text-[#FF4D79] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Full name is required (min 2 characters).
                </p>
              )}
            </div>

            {/* Roll / Enrollment Number */}
            <div>
              <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
                Enrollment / Roll Number <span className="text-[#FF4D79]">*</span>
              </label>
              <input
                type="text"
                value={enrollmentNo}
                onBlur={() => setTouched((p) => ({ ...p, enrollmentNo: true }))}
                onChange={(e) => setEnrollmentNo(e.target.value)}
                placeholder="e.g. 2201CS041 / ENR-2024-918"
                className={`w-full px-3 py-2 bg-[#0F1011] border rounded-lg text-[#F4F4F5] font-mono placeholder:text-[#71717A] focus:outline-none focus:border-[#00E676] transition ${
                  touched.enrollmentNo && !isEnrollmentValid ? 'border-[#FF4D79]' : 'border-[#232427]'
                }`}
              />
              {touched.enrollmentNo && !isEnrollmentValid && (
                <p className="text-[10px] text-[#FF4D79] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Enrollment number is required.
                </p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
                  Email Address <span className="text-[#FF4D79]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className={`w-full px-3 py-2 bg-[#0F1011] border rounded-lg text-[#F4F4F5] placeholder:text-[#71717A] focus:outline-none focus:border-[#00E676] transition ${
                    touched.email && !isEmailValid ? 'border-[#FF4D79]' : 'border-[#232427]'
                  }`}
                />
                {touched.email && !isEmailValid && (
                  <p className="text-[10px] text-[#FF4D79] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Enter a valid email address.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
                  Mobile Number (10 digits) <span className="text-[#FF4D79]">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="9876543210"
                  className={`w-full px-3 py-2 bg-[#0F1011] border rounded-lg text-[#F4F4F5] font-mono placeholder:text-[#71717A] focus:outline-none focus:border-[#00E676] transition ${
                    touched.phone && !isPhoneValid ? 'border-[#FF4D79]' : 'border-[#232427]'
                  }`}
                />
                {touched.phone && !isPhoneValid && (
                  <p className="text-[10px] text-[#FF4D79] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Enter a valid 10-digit mobile number.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Institution & Routing Details */}
        <div className="bg-[#151618] border border-[#232427] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#232427]">
            <Building2 className="w-4 h-4 text-[#00E676]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F4F4F5]">
              Institution & Routing
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Searchable Institution Dropdown */}
            <div className="relative">
              <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
                Institution Name <span className="text-[#FF4D79]">*</span>
              </label>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={institutionSearch}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setInstitutionSearch(e.target.value);
                    setIsDropdownOpen(true);
                    if (selectedInstitution && selectedInstitution.name !== e.target.value) {
                      setSelectedInstitution(null);
                    }
                  }}
                  placeholder="Search college name, PID, or city..."
                  className={`w-full pl-9 pr-8 py-2 bg-[#0F1011] border rounded-lg text-[#F4F4F5] placeholder:text-[#71717A] focus:outline-none focus:border-[#00E676] transition ${
                    touched.institution && !isInstitutionValid ? 'border-[#FF4D79]' : 'border-[#232427]'
                  }`}
                />
                <ChevronDown 
                  className="w-4 h-4 text-[#71717A] absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />
              </div>

              {/* Dropdown Options */}
              {isDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-[#0F1011] border border-[#232427] rounded-lg shadow-2xl divide-y divide-[#1F2023]">
                  {filteredInstitutions.length === 0 ? (
                    <div className="p-3 text-xs text-[#71717A] text-center">
                      No registered institution matched "{institutionSearch}"
                    </div>
                  ) : (
                    filteredInstitutions.map((inst) => (
                      <div
                        key={inst._id}
                        onClick={() => {
                          setSelectedInstitution(inst);
                          setInstitutionSearch(inst.name);
                          setIsDropdownOpen(false);
                          setTouched((p) => ({ ...p, institution: true }));
                        }}
                        className="px-3 py-2.5 hover:bg-[#1A1B1E] cursor-pointer transition flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-[#F4F4F5] line-clamp-1">{inst.name}</p>
                          <p className="text-[10px] text-[#71717A] font-mono">
                            PID: {inst.aictePermanentId} • {inst.city || inst.district}, {inst.state}
                          </p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1F2023] text-[#A1A1AA] border border-[#2D2E32]">
                          {inst.region || 'Central'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {touched.institution && !isInstitutionValid && (
                <p className="text-[10px] text-[#FF4D79] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Please select an accredited institution from the registry.
                </p>
              )}
            </div>

            {/* Read-Only Auto-filled PID and Region */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#71717A] mb-1">
                  AICTE Permanent ID (PID)
                </label>
                <div className="px-3 py-2 bg-[#0A0A0B] border border-[#232427] rounded-lg text-[#F4F4F5] font-mono text-xs">
                  {selectedInstitution?.aictePermanentId || (
                    <span className="text-[#71717A] italic">Select institution</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#71717A] mb-1">
                  Statutory Region
                </label>
                <div className="px-3 py-2 bg-[#0A0A0B] border border-[#232427] rounded-lg text-[#F4F4F5] text-xs">
                  {selectedInstitution?.region || (
                    <span className="text-[#71717A] italic">Auto-resolved</span>
                  )}
                </div>
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
                Grievance Category <span className="text-[#FF4D79]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F1011] border border-[#232427] rounded-lg text-[#F4F4F5] focus:outline-none focus:border-[#00E676] transition"
              >
                {INTAKE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#151618] text-[#F4F4F5]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Routing indicator callout */}
            <div className="bg-[#0A0A0B] border border-[#232427] rounded-lg p-2.5 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-[#71717A] block">Auto-routed Target Bureau:</span>
                <span className="font-semibold text-[#00E676]">{targetBureau.name} ({targetBureau.code})</span>
              </div>
              <div className="text-right">
                <span className="text-[#71717A] block">SLA Mandate:</span>
                <span className="font-mono text-[#F4F4F5] font-semibold">{targetBureau.slaDays} Days Target</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Grievance Content & Evidence */}
      <div className="bg-[#151618] border border-[#232427] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#232427]">
          <FileText className="w-4 h-4 text-[#00E676]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F4F4F5]">
            Complaint Subject & Evidence
          </h3>
        </div>

        {/* Subject */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-[#A1A1AA]">
              Subject / Brief Heading <span className="text-[#FF4D79]">*</span>
            </label>
            <span className={`text-[10px] font-mono ${subject.length > 120 ? 'text-[#FF4D79]' : 'text-[#71717A]'}`}>
              {subject.length} / 120 chars
            </span>
          </div>
          <input
            type="text"
            maxLength={120}
            value={subject}
            onBlur={() => setTouched((p) => ({ ...p, subject: true }))}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Unauthorized fee hike and caution deposit retention"
            className={`w-full px-3 py-2 text-xs bg-[#0F1011] border rounded-lg text-[#F4F4F5] placeholder:text-[#71717A] focus:outline-none focus:border-[#00E676] transition ${
              touched.subject && !isSubjectValid ? 'border-[#FF4D79]' : 'border-[#232427]'
            }`}
          />
          {touched.subject && !isSubjectValid && (
            <p className="text-[10px] text-[#FF4D79] mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Subject is required (max 120 characters).
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-[#A1A1AA]">
              Detailed Complaint Narrative <span className="text-[#FF4D79]">*</span>
            </label>
            <span className={`text-[10px] font-mono ${description.length < 50 ? 'text-[#FF4D79]' : 'text-[#00E676]'}`}>
              {description.length} / min 50 characters
            </span>
          </div>
          <textarea
            rows={4}
            value={description}
            onBlur={() => setTouched((p) => ({ ...p, description: true }))}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide comprehensive chronology, dates, department officials contacted, and specific violation details..."
            className={`w-full px-3 py-2 text-xs bg-[#0F1011] border rounded-lg text-[#F4F4F5] placeholder:text-[#71717A] focus:outline-none focus:border-[#00E676] transition ${
              touched.description && !isDescriptionValid ? 'border-[#FF4D79]' : 'border-[#232427]'
            }`}
          />
          {touched.description && !isDescriptionValid && (
            <p className="text-[10px] text-[#FF4D79] mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Narrative must be at least 50 characters ({50 - description.length} more needed).
            </p>
          )}
        </div>

        {/* Evidence Upload */}
        <div>
          <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
            Evidence Documentation (PDF, JPG, PNG — max 5 files, 10 MB each)
          </label>

          <div className="border border-dashed border-[#232427] hover:border-[#00E676]/40 bg-[#0F1011] rounded-xl p-4 text-center transition">
            <Upload className="w-6 h-6 text-[#71717A] mx-auto mb-2" />
            <p className="text-xs text-[#F4F4F5] font-semibold">
              Drop files here or click to attach evidence
            </p>
            <p className="text-[10px] text-[#71717A] mt-0.5">
              Receipts, notices, marksheets, laboratory photos, or official circulars
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              id="evidence-file-input"
            />
            <label
              htmlFor="evidence-file-input"
              className="inline-block mt-3 px-3 py-1.5 bg-[#151618] hover:bg-[#1A1B1E] border border-[#232427] rounded-lg text-xs font-semibold text-[#00E676] cursor-pointer transition"
            >
              Select Evidence Files ({files.length}/5)
            </label>
          </div>

          {/* Attached Files List */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-[#0F1011] border border-[#232427] rounded-lg text-xs text-[#F4F4F5]"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText className="w-4 h-4 text-[#00E676] shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-[10px] text-[#71717A] font-mono shrink-0">({file.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-1 text-[#71717A] hover:text-[#FF4D79] transition rounded"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consent Checkbox */}
        <div className="pt-2 border-t border-[#232427]">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                setTouched((p) => ({ ...p, consent: true }));
              }}
              className="mt-0.5 rounded border-[#232427] text-[#00E676] focus:ring-[#00E676] bg-[#0F1011]"
            />
            <span className="text-xs text-[#A1A1AA]">
              I hereby certify under statutory declaration that all statements, facts, and attached evidence submitted on behalf of the student are authentic, verifiable, and accurate under AICTE complaint regulations. <span className="text-[#FF4D79]">*</span>
            </span>
          </label>
          {touched.consent && !consent && (
            <p className="text-[10px] text-[#FF4D79] mt-1 ml-6 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> You must confirm statutory consent before submitting.
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleSaveDraft}
          className="px-4 py-2 text-xs font-semibold text-[#F4F4F5] bg-[#151618] hover:bg-[#1A1B1E] border border-[#232427] rounded-lg transition"
        >
          Save Draft
        </button>

        <button
          type="submit"
          disabled={!isFormValid || submitting}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-black bg-[#00E676] hover:bg-[#00c864] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-md shadow-[#00E676]/10 transition font-sans"
        >
          {submitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Registering Case...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Submit Complaint</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default NewComplaintForm;
