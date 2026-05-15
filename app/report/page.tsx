"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  AGE_RANGES, GENDER_OPTIONS, DISABILITY_OPTIONS, UGANDA_DISTRICTS,
  VIOLENCE_TYPES, DIGITAL_ABUSE_TYPES, PERPETRATOR_OPTIONS,
  CONTACT_METHODS, SUPPORT_SERVICES, REPORTED_TO_OPTIONS, PRIORITY_SUPPORT,
  SECTIONS, IDENTITY_FACTORS, ENVIRONMENTAL_FACTORS, CONTRIBUTING_FACTORS, PRIMARY_DRIVERS,
} from "@/lib/constants";
import { TextInput, TextareaInput, SelectInput, CheckboxGroup, RadioGroup } from "@/components/form/FormFields";

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // Controlled state
  const [selectedDistrict,    setSelectedDistrict]    = useState("");
  const [linkedToEnvironment, setLinkedToEnvironment] = useState("");
  const [linkedToSOGI,        setLinkedToSOGI]        = useState("");
  const [didReport,           setDidReport]           = useState("");
  const [consentForContact,   setConsentForContact]   = useState("");
  const [locationOfIncident,  setLocationOfIncident]  = useState("");
  const [incidentFrequency,   setIncidentFrequency]   = useState("");
  const [isSurvivorSafe,      setIsSurvivorSafe]      = useState("");
  const [perpetratorAccess,   setPerpetratorAccess]   = useState("");
  const [primaryDriver,       setPrimaryDriver]       = useState("");
  const [isHRD,               setIsHRD]               = useState("");
  const [communityImpact,     setCommunityImpact]     = useState<string[]>([]);
  const [saferCommunity,      setSaferCommunity]      = useState<string[]>([]);

  // Multi-select state
  const [genderIdentity,      setGenderIdentity]      = useState<string[]>([]);
  const [disabilityStatus,    setDisabilityStatus]    = useState<string[]>([]);
  const [violenceTypes,       setViolenceTypes]       = useState<string[]>([]);
  const [digitalAbuseTypes,   setDigitalAbuseTypes]   = useState<string[]>([]);
  const [perpetrator,         setPerpetrator]         = useState<string[]>([]);
  const [impactOfViolence,    setImpactOfViolence]    = useState<string[]>([]);
  const [urgentSupport,       setUrgentSupport]       = useState<string[]>([]);
  const [identityFactors,     setIdentityFactors]     = useState<string[]>([]);
  const [environmentFactors,  setEnvironmentFactors]  = useState<string[]>([]);
  const [contributingFactors, setContributingFactors] = useState<string[]>([]);
  const [reportedTo,          setReportedTo]          = useState<string[]>([]);
  const [servicesReceived,    setServicesReceived]    = useState<string[]>([]);
  const [prioritySupport,     setPrioritySupport]     = useState<string[]>([]);
  const [contactMethods,      setContactMethods]      = useState<string[]>([]);
  const [immediateRisk,       setImmediateRisk]       = useState<string[]>([]);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm();

  const subCounties = selectedDistrict ? (UGANDA_DISTRICTS[selectedDistrict] || []) : [];
  const showDigital         = violenceTypes.includes("Digital/Online Abuse");
  const showIdentityFactors = linkedToSOGI === "Yes" || linkedToSOGI === "Not sure";
  const showEnvFactors      = linkedToEnvironment === "Yes" || linkedToEnvironment === "Not sure";

  const contactPlaceholder = () => {
    if (contactMethods.includes("Email") && contactMethods.includes("Phone"))    return "Email address or phone number";
    if (contactMethods.includes("Email") && contactMethods.includes("WhatsApp")) return "Email address or WhatsApp number";
    if (contactMethods.includes("Phone") && contactMethods.includes("WhatsApp")) return "Phone or WhatsApp number";
    if (contactMethods.includes("Email"))    return "Email address e.g. name@example.com";
    if (contactMethods.includes("Phone"))    return "Phone number e.g. +256 700 000000";
    if (contactMethods.includes("WhatsApp")) return "WhatsApp number e.g. +256 700 000000";
    return "Email address or phone number";
  };

  // ── Step validation ────────────────────────────────────────────────────────
  function validateStep(s: number): Record<string, string> {
    const errs: Record<string, string> = {};
    const vals = getValues();

    if (s === 0) {
      if (!vals.survivor?.ageRange)        errs.ageRange    = "Age range is required";
      if (!genderIdentity.length)           errs.gender      = "Please select at least one gender option";
      if (!selectedDistrict)                errs.district    = "District is required";
      if (!vals.survivor?.region)           errs.region      = "Region is required";
      if (!vals.survivor?.village)          errs.village     = "Village / Parish / Exact Location is required";
      if (!vals.survivor?.occupation)       errs.occupation  = "Occupation is required";
    }

    if (s === 1) {
      if (!violenceTypes.length)            errs.violenceTypes    = "Please select at least one type of violence";
      if (!perpetrator.length)              errs.perpetrator      = "Please select at least one perpetrator";
      if (!vals.incident?.incidentDate)     errs.incidentDate     = "Date of incident is required";
      if (!locationOfIncident)              errs.location         = "Location of incident is required";
      if (!incidentFrequency)               errs.frequency        = "Please indicate if this was one-time or repeated";
      if (!impactOfViolence.length)         errs.impact           = "Please select at least one impact";
      if (!isSurvivorSafe)                  errs.isSurvivorSafe   = "Please indicate if the survivor is currently safe";
      if (!perpetratorAccess)               errs.perpetratorAccess = "Please indicate if the perpetrator has access";
    }

    if (s === 2) {
      if (!linkedToSOGI)                    errs.linkedToSOGI       = "Please answer this question";
      if (!linkedToEnvironment)             errs.linkedToEnvironment = "Please answer this question";
      if (!contributingFactors.length)      errs.contributingFactors = "Please select at least one contributing factor";
      if (!primaryDriver)                   errs.primaryDriver       = "Please select a primary driver";
    }

    if (s === 3) {
      if (!didReport)                       errs.didReport         = "Please indicate if you reported the incident";
      if (!servicesReceived.length)         errs.servicesReceived  = "Please select support services received (select 'None' if applicable)";
    }

    if (s === 4) {
      if (!prioritySupport.length)          errs.prioritySupport = "Please select at least one priority support need";
      if (!vals.needs?.urgencyLevel)        errs.urgencyLevel    = "Urgency level is required";
      if (!consentForContact)               errs.consentForContact = "Please indicate consent for contact";
      if (!immediateRisk.length)            errs.immediateRisk   = "Please select at least one risk indicator";
    }

    return errs;
  }

  function handleNext() {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) {
      setStepErrors(errs);
      // Scroll to top of form to show errors
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStepErrors({});
    setStep(s => Math.min(s + 1, SECTIONS.length - 1));
  }

  const prev = () => {
    setStepErrors({});
    setStep(s => Math.max(s - 1, 0));
  };

  const progress = ((step + 1) / SECTIONS.length) * 100;

  const onSubmit = async (data: any) => {
    setLoading(true); setSubmitError("");
    const payload = {
      survivor: { ...data.survivor, genderIdentity, disabilityStatus, isHRD },
      incident: {
        ...data.incident, violenceTypes,
        digitalAbuseTypes: showDigital ? digitalAbuseTypes : [],
        perpetrator, locationOfIncident, incidentFrequency,
        impactOfViolence, isSurvivorSafe, perpetratorAccess, urgentSupport,
      },
      context: {
        ...data.context, linkedToSOGI, identityFactors,
        linkedToEnvironment, environmentFactors, contributingFactors, primaryDriver,
      },
      reporting: { ...data.reporting, reportedTo, servicesReceived },
      needs: {
        ...data.needs, prioritySupport, immediateRisk,
        contactMethods: consentForContact === "Yes" ? contactMethods : [],
        contactDetails: consentForContact === "Yes" ? data.needs?.contactDetails : "",
      },
      reflection: { ...data.reflection, communityImpact, saferCommunity },
      consent: {
        dataCollection:     data.consent?.dataCollection     || false,
        referralServices:   data.consent?.referralServices   || false,
        anonymizedAdvocacy: data.consent?.anonymizedAdvocacy || false,
        signature:          data.consent?.signature          || "",
        consentDate:        data.consent?.consentDate        || "",
      },
    };
    try {
      const res = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (result.success) { router.push(`/report/success?ref=${result.caseRef}`); }
      else setSubmitError("Submission failed. Please try again.");
    } catch { setSubmitError("Network error. Please check your connection."); }
    finally { setLoading(false); }
  };

  // Helper: field error message
  const fe = (key: string) => stepErrors[key] ? (
    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
      {stepErrors[key]}
    </p>
  ) : null;

  const fieldClass = (key: string) => `form-input${stepErrors[key] ? " border-red-400 focus:border-red-400" : ""}`;
  const selectClass = (key: string) => `form-select${stepErrors[key] ? " border-red-400" : ""}`;

  // Show error summary at top of step if there are errors
  const ErrorSummary = () => {
    const keys = Object.keys(stepErrors);
    if (!keys.length) return null;
    return (
      <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 animate-[slideUp_0.3s_ease-out]">
        <p className="text-red-700 text-sm font-semibold mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          Please complete the following before continuing:
        </p>
        <ul className="space-y-1">
          {keys.map(k => <li key={k} className="text-red-600 text-xs">• {stepErrors[k]}</li>)}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="sticky top-0 z-40 shadow-md" style={{ background: "#1DB954" }}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-black/60 text-sm">Step {step + 1} of {SECTIONS.length}</p>
              <h2 className="text-white font-semibold text-lg truncate">{SECTIONS[step]}</h2>
            </div>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto px-4 py-6 pb-28">

        {/* STEP 0 — Survivor Info */}
        {step === 0 && (
          <div className="form-section animate-[slideUp_0.4s_ease-out]">
            <h3 className="form-section-title">Section 1: Survivor Information</h3>
            <p className="form-section-subtitle">Fields marked with <span className="text-red-500">*</span> are required.</p>
            <ErrorSummary />

            <TextInput label="Preferred Name or Case Code" name="survivor.preferredName" register={register} optional placeholder="A name or code word you choose" />

            <div className="mb-4">
              <label className="form-label">Age Range <span className="text-red-500">*</span></label>
              <select className={selectClass("ageRange")} {...register("survivor.ageRange")} onChange={() => setStepErrors(e => ({...e, ageRange: ""}))}>
                <option value="">— Select —</option>
                {AGE_RANGES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {fe("ageRange")}
            </div>

            <div className="mb-4">
              <label className="form-label">Gender <span className="text-red-500">*</span></label>
              <CheckboxGroup label="" options={GENDER_OPTIONS} values={genderIdentity} onChange={(v: string[]) => { setGenderIdentity(v); setStepErrors(e => ({...e, gender: ""})); }} />
              {fe("gender")}
            </div>
            {genderIdentity.includes("Self-describe") && (
              <TextInput label="Describe your gender (self-describe)" name="survivor.genderIdentityOther" register={register} optional />
            )}

            <TextInput label="Is there any aspect of your identity you'd like us to be aware of to better support you?" name="survivor.sexualOrientation" register={register} optional />

            <CheckboxGroup label="Disability Status" options={DISABILITY_OPTIONS} optional values={disabilityStatus} onChange={setDisabilityStatus} />
            {disabilityStatus.includes("Other") && (
              <TextInput label="Please describe" name="survivor.disabilityOther" register={register} optional />
            )}

            {/* HRD */}
            <div className="mb-4">
              <label className="form-label">Are you a Human Rights Defender? <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="space-y-1.5 mt-1">
                {["Yes", "No", "Prefer not to say"].map(opt => (
                  <label key={opt} className="radio-item">
                    <input type="radio" value={opt} className="w-4 h-4" checked={isHRD === opt} onChange={() => setIsHRD(opt)} />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            {isHRD === "Yes" && (
              <div className="animate-[slideUp_0.3s_ease-out]">
                <TextInput label="Organisation Affiliation and Thematic Area of Work" name="survivor.hrdOrganisation" register={register} optional placeholder="Name of your organisation and the thematic area of work" />
              </div>
            )}

            {/* District */}
            <div className="mb-4">
              <label className="form-label">District <span className="text-red-500">*</span></label>
              <select className={selectClass("district")} {...register("survivor.district")} onChange={e => { setSelectedDistrict(e.target.value); setStepErrors(err => ({...err, district: ""})); }}>
                <option value="">— Select —</option>
                {Object.keys(UGANDA_DISTRICTS).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {fe("district")}
            </div>

            {subCounties.length > 0 && (
              <div className="mb-4 animate-[slideUp_0.3s_ease-out]">
                <label className="form-label">Sub-County <span className="text-gray-400 font-normal">(optional)</span></label>
                <select className="form-select mb-4" {...register("survivor.subCounty")}>
                  <option value="">— Select sub-county —</option>
                  {subCounties.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="form-label">Region <span className="text-red-500">*</span></label>
              <input type="text" className={fieldClass("region")} placeholder="e.g. Western Region, Northern Region"
                {...register("survivor.region")} onChange={() => setStepErrors(e => ({...e, region: ""}))} />
              {fe("region")}
            </div>

            <div className="mb-4">
              <label className="form-label">Village / Parish / Exact Location <span className="text-red-500">*</span></label>
              <input type="text" className={fieldClass("village")} placeholder="e.g. Bwaise village, Kamwokya Parish"
                {...register("survivor.village")} onChange={() => setStepErrors(e => ({...e, village: ""}))} />
              {fe("village")}
            </div>

            <div className="mb-4">
              <label className="form-label">Occupation / Source of Livelihood <span className="text-red-500">*</span></label>
              <input type="text" className={fieldClass("occupation")} placeholder="e.g. Farmer, Teacher, Small business owner"
                {...register("survivor.occupation")} onChange={() => setStepErrors(e => ({...e, occupation: ""}))} />
              {fe("occupation")}
            </div>
          </div>
        )}

        {/* STEP 1 — Nature of Violation & Safety */}
        {step === 1 && (
          <div className="animate-[slideUp_0.4s_ease-out] space-y-5">
            <ErrorSummary />

            <div className="form-section">
              <h3 className="form-section-title">Section 2: Nature of Violation</h3>
              <p className="form-section-subtitle">Fields marked with <span className="text-red-500">*</span> are required.</p>

              <div className="mb-4">
                <label className="form-label">Type(s) of Violence Experienced <span className="text-red-500">*</span></label>
                <CheckboxGroup label="" options={VIOLENCE_TYPES} values={violenceTypes} onChange={v => { setViolenceTypes(v); setStepErrors(e => ({...e, violenceTypes: ""})); }} />
                {fe("violenceTypes")}
              </div>

              {showDigital && (
                <div className="mt-2 p-4 rounded-xl bg-purple-50 border border-purple-100">
                  <CheckboxGroup label="Digital Abuse Types" options={DIGITAL_ABUSE_TYPES} values={digitalAbuseTypes} onChange={setDigitalAbuseTypes} optional />
                  {digitalAbuseTypes.includes("Other") && (
                    <TextInput label="Describe other digital abuse" name="incident.digitalAbuseOther" register={register} optional />
                  )}
                </div>
              )}
              {violenceTypes.includes("Other") && (
                <TextInput label="Describe other violence type" name="incident.violenceOther" register={register} optional />
              )}

              <div className="mb-4">
                <label className="form-label">Perpetrator <span className="text-red-500">*</span></label>
                <CheckboxGroup label="" options={PERPETRATOR_OPTIONS} values={perpetrator} onChange={v => { setPerpetrator(v); setStepErrors(e => ({...e, perpetrator: ""})); }} />
                {fe("perpetrator")}
              </div>
              {perpetrator.includes("Other") && (
                <TextInput label="Describe perpetrator" name="incident.perpetratorOther" register={register} optional />
              )}
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Incident Details</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="form-label">Date of Incident <span className="text-red-500">*</span></label>
                  <input type="date" className={fieldClass("incidentDate")} {...register("incident.incidentDate")} onChange={() => setStepErrors(e => ({...e, incidentDate: ""}))} />
                  {fe("incidentDate")}
                </div>
                <div>
                  <label className="form-label">Time of Incident <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="time" className="form-input" {...register("incident.incidentTime")} />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Location of Incident <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {["Home", "Workplace", "School", "Public space", "Online", "Shelter / camp", "Other"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={locationOfIncident === opt}
                        onChange={() => { setLocationOfIncident(opt); setStepErrors(e => ({...e, location: ""})); }} />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {fe("location")}
                {locationOfIncident === "Other" && (
                  <div className="mt-2">
                    <input type="text" className="form-input" placeholder="Describe location type..." {...register("incident.locationOther")} />
                  </div>
                )}
                {locationOfIncident && (
                  <div className="mt-3 animate-[slideUp_0.3s_ease-out]">
                    <label className="form-label">Exact location <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input type="text" className="form-input" placeholder="e.g. Bwaise village, near the market, Kampala" {...register("incident.exactLocation")} />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label">Was this a one-time or repeated incident? <span className="text-red-500">*</span></label>
                <div className="space-y-1.5 mt-1">
                  {["One-time", "Repeated / ongoing"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={incidentFrequency === opt}
                        onChange={() => { setIncidentFrequency(opt); setStepErrors(e => ({...e, frequency: ""})); }} />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {fe("frequency")}
              </div>

              <TextareaInput label="Detailed Description of Incident" name="incident.description" register={register} optional rows={5} placeholder="Describe what happened in your own words. Share only what you feel comfortable sharing." />
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Impact of the Violence <span className="text-red-500">*</span></h3>
              <p className="form-section-subtitle">Select all that apply.</p>
              <CheckboxGroup label="" options={["Physical injury", "Emotional / mental distress", "Loss of income / livelihood", "Displacement / homelessness", "Social exclusion / stigma", "Interrupted education", "Health complications", "Fear for safety", "Other"]}
                values={impactOfViolence} onChange={v => { setImpactOfViolence(v); setStepErrors(e => ({...e, impact: ""})); }} />
              {fe("impact")}
              {impactOfViolence.includes("Other") && (
                <TextInput label="Describe other impact" name="incident.impactOther" register={register} optional />
              )}
            </div>

            <div className="form-section" style={{ borderColor: "#fecaca", borderWidth: "1.5px" }}>
              <h3 className="form-section-title" style={{ color: "#b91c1c" }}>⚠ Immediate Safety and Risk Assessment</h3>
              <p className="form-section-subtitle">Fields marked with <span className="text-red-500">*</span> are required.</p>

              <div className="mb-4">
                <label className="form-label">Is the survivor currently safe? <span className="text-red-500">*</span></label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No", "Not sure"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={isSurvivorSafe === opt}
                        onChange={() => { setIsSurvivorSafe(opt); setStepErrors(e => ({...e, isSurvivorSafe: ""})); }} />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {fe("isSurvivorSafe")}
              </div>

              <div className="mb-4">
                <label className="form-label">Does the perpetrator still have access to or is nearby the survivor? <span className="text-red-500">*</span></label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={perpetratorAccess === opt}
                        onChange={() => { setPerpetratorAccess(opt); setStepErrors(e => ({...e, perpetratorAccess: ""})); }} />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {fe("perpetratorAccess")}
              </div>

              <CheckboxGroup label="Urgent support needed" options={["Medical care", "Safe shelter", "Legal support", "Psychosocial support", "Emergency relocation", "Other"]} values={urgentSupport} onChange={setUrgentSupport} optional />
              {urgentSupport.includes("Other") && (
                <TextInput label="Describe other urgent support needed" name="incident.urgentSupportOther" register={register} optional />
              )}
            </div>
          </div>
        )}

        {/* STEP 2 — Context & Contributing Factors */}
        {step === 2 && (
          <div className="animate-[slideUp_0.4s_ease-out] space-y-5">
            <ErrorSummary />

            <div className="form-section">
              <h3 className="form-section-title">Link to Gender-Based Violence</h3>
              <p className="form-section-subtitle">Fields marked with <span className="text-red-500">*</span> are required.</p>
              <div className="mb-4">
                <label className="form-label">Do you believe the violence was related to your sex or gender identity? <span className="text-red-500">*</span></label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No", "Not sure"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={linkedToSOGI === opt}
                        onChange={() => { setLinkedToSOGI(opt); setStepErrors(e => ({...e, linkedToSOGI: ""})); }} />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {fe("linkedToSOGI")}
              </div>
              {showIdentityFactors && (
                <div className="mt-2 p-4 rounded-xl bg-blue-50 border border-blue-100 animate-[slideUp_0.3s_ease-out]">
                  <CheckboxGroup label="If yes or not sure, what do you think contributed? (Select all that apply)" options={IDENTITY_FACTORS} values={identityFactors} onChange={setIdentityFactors} optional />
                  {identityFactors.includes("Other") && (
                    <TextInput label="Please describe" name="context.identityFactorsOther" register={register} optional />
                  )}
                </div>
              )}
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Link to Environmental / Livelihood Factors</h3>
              <div className="mb-4">
                <label className="form-label">Do you believe the violence was linked to environmental, climate, or livelihood conditions? <span className="text-red-500">*</span></label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No", "Not sure"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={linkedToEnvironment === opt}
                        onChange={() => { setLinkedToEnvironment(opt); setStepErrors(e => ({...e, linkedToEnvironment: ""})); }} />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {fe("linkedToEnvironment")}
              </div>
              {showEnvFactors && (
                <div className="mt-2 p-4 rounded-xl bg-green-50 border border-green-100 animate-[slideUp_0.3s_ease-out]">
                  <CheckboxGroup label="If yes or not sure, how was it linked? (Select all that apply)" options={ENVIRONMENTAL_FACTORS} values={environmentFactors} onChange={setEnvironmentFactors} optional />
                  {environmentFactors.includes("Other") && (
                    <TextInput label="Please describe" name="context.environmentFactorsOther" register={register} optional />
                  )}
                </div>
              )}
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Contributing Factors <span className="text-red-500">*</span></h3>
              <p className="form-section-subtitle">Select all that apply.</p>
              <CheckboxGroup label="" options={CONTRIBUTING_FACTORS} values={contributingFactors}
                onChange={v => { setContributingFactors(v); setStepErrors(e => ({...e, contributingFactors: ""})); }} />
              {fe("contributingFactors")}
              {contributingFactors.includes("Other") && (
                <TextInput label="Please describe" name="context.contributingFactorsOther" register={register} optional />
              )}
            </div>

            <div className="form-section" style={{ background: "#fafafa" }}>
              <h3 className="form-section-title">Primary Driver <span className="text-red-500">*</span></h3>
              <p className="form-section-subtitle">If identifiable, select one.</p>
              <div className="space-y-1.5">
                {PRIMARY_DRIVERS.map(opt => (
                  <label key={opt} className="radio-item">
                    <input type="radio" value={opt} className="w-4 h-4" checked={primaryDriver === opt}
                      onChange={() => { setPrimaryDriver(opt); setStepErrors(e => ({...e, primaryDriver: ""})); }} />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
              {fe("primaryDriver")}
              {primaryDriver === "Other" && (
                <div className="mt-3">
                  <TextInput label="Please describe" name="context.primaryDriverOther" register={register} optional />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 — Reporting */}
        {step === 3 && (
          <div className="form-section animate-[slideUp_0.4s_ease-out]">
            <h3 className="form-section-title">Section 4: Reporting and Response</h3>
            <p className="form-section-subtitle">Fields marked with <span className="text-red-500">*</span> are required.</p>
            <ErrorSummary />

            <div className="mb-4">
              <label className="form-label">Did you report this incident? <span className="text-red-500">*</span></label>
              <div className="space-y-1.5 mt-1">
                {["Yes", "No"].map(opt => (
                  <label key={opt} className="radio-item">
                    <input type="radio" value={opt} className="w-4 h-4"
                      {...register("reporting.didReport")}
                      onChange={e => { register("reporting.didReport").onChange(e); setDidReport(e.target.value); setStepErrors(err => ({...err, didReport: ""})); }}
                    />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
              {fe("didReport")}
            </div>

            {didReport === "Yes" && (
              <>
                <CheckboxGroup label="Where did you report?" options={REPORTED_TO_OPTIONS} values={reportedTo} onChange={setReportedTo} optional />
                {reportedTo.includes("Other") && (
                  <TextInput label="Other reporting body" name="reporting.reportedToOther" register={register} optional />
                )}
                <TextareaInput label="Details of where / who you reported to" name="reporting.reportedToDetails" register={register} optional rows={3}
                  placeholder="e.g. Reported to Officer Jane Doe at Kampala Central Police Station, on 12 March 2026" />
                <TextareaInput label="Outcome of the report" name="reporting.reportOutcome" register={register} optional rows={3} placeholder="What happened after you reported?" />
              </>
            )}

            <div className="mb-4">
              <label className="form-label">Support services received <span className="text-red-500">*</span> <span className="text-gray-400 font-normal text-xs">(select 'None' if not applicable)</span></label>
              <CheckboxGroup label="" options={SUPPORT_SERVICES} values={servicesReceived}
                onChange={v => { setServicesReceived(v); setStepErrors(e => ({...e, servicesReceived: ""})); }} />
              {fe("servicesReceived")}
              {servicesReceived.includes("Other") && (
                <TextInput label="Other service" name="reporting.servicesOther" register={register} optional />
              )}
            </div>

            <TextareaInput label="Barriers to accessing support" name="reporting.barriers" register={register} optional rows={3} placeholder="What made it difficult to get help?" />
          </div>
        )}

        {/* STEP 4 — Needs */}
        {step === 4 && (
          <div className="animate-[slideUp_0.4s_ease-out] space-y-5">
            <ErrorSummary />

            <div className="form-section">
              <h3 className="form-section-title">Section 5: Current Needs</h3>
              <p className="form-section-subtitle">Fields marked with <span className="text-red-500">*</span> are required.</p>

              <div className="mb-4">
                <label className="form-label">Priority support needed <span className="text-red-500">*</span></label>
                <CheckboxGroup label="" options={PRIORITY_SUPPORT} values={prioritySupport}
                  onChange={v => { setPrioritySupport(v); setStepErrors(e => ({...e, prioritySupport: ""})); }} />
                {fe("prioritySupport")}
                {prioritySupport.includes("Other") && (
                  <TextInput label="Other support needed" name="needs.prioritySupportOther" register={register} optional />
                )}
              </div>

              <div className="mb-4">
                <label className="form-label">Urgency Level <span className="text-red-500">*</span></label>
                <div className="space-y-1.5 mt-1">
                  {["Emergency – Immediate danger or life-threatening situation", "High – Urgent support needed within 24–72 hours", "Medium – Support needed but not immediate", "Low – General support or follow-up"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4"
                        {...register("needs.urgencyLevel")}
                        onChange={e => { register("needs.urgencyLevel").onChange(e); setStepErrors(err => ({...err, urgencyLevel: ""})); }}
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {fe("urgencyLevel")}
              </div>

              <div className="mb-4">
                <label className="form-label">Consent for contact <span className="text-red-500">*</span></label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4"
                        {...register("needs.consentForContact")}
                        onChange={e => { register("needs.consentForContact").onChange(e); setConsentForContact(e.target.value); setStepErrors(err => ({...err, consentForContact: ""})); }}
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {fe("consentForContact")}
              </div>

              {consentForContact === "Yes" && (
                <div className="mt-1 space-y-4">
                  <CheckboxGroup label="Preferred contact method(s)" options={CONTACT_METHODS} values={contactMethods} onChange={setContactMethods} optional />
                  {contactMethods.length > 0 && (
                    <div className="p-4 rounded-xl border border-teal-100 bg-teal-50">
                      <label className="form-label">Your contact details <span className="text-gray-400 font-normal">(optional)</span></label>
                      <p className="text-xs text-gray-400 mb-2">Only share what you feel safe sharing. This will only be used to contact you about your case.</p>
                      <input type="text" className="form-input" placeholder={contactPlaceholder()} {...register("needs.contactDetails")} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-section" style={{ borderColor: "#fecaca", borderWidth: "1.5px" }}>
              <h3 className="form-section-title" style={{ color: "#b91c1c" }}>⚠ Immediate Risk Indicator <span className="text-red-500">*</span></h3>
              <p className="form-section-subtitle">Select all that apply. Select "None of the above" if not applicable.</p>
              <CheckboxGroup label="" options={["Survivor is in immediate danger", "Perpetrator has ongoing access to survivor", "Survivor has no safe place to stay", "Survivor requires urgent medical attention", "None of the above"]}
                values={immediateRisk} onChange={v => { setImmediateRisk(v); setStepErrors(e => ({...e, immediateRisk: ""})); }} />
              {fe("immediateRisk")}
            </div>
          </div>
        )}

        {/* STEP 5 — Reflection & Healing (all optional) */}
        {step === 5 && (
          <div className="animate-[slideUp_0.4s_ease-out] space-y-5">
            <div className="form-section">
              <h3 className="form-section-title">Impact on Community and Environment</h3>
              <p className="form-section-subtitle">How has this experience affected your sense of safety, belonging, or connection to your community or environment? You may share as much or as little as you feel comfortable.</p>
              <CheckboxGroup label="" options={["I feel less safe in my community", "I feel isolated or excluded", "I have reduced participation in community activities", "I have been displaced or had to relocate", "I feel unsafe accessing natural resources (e.g., water, land, workplaces)", "My trust in people or institutions has been affected", "No significant change", "Prefer not to say"]} values={communityImpact} onChange={setCommunityImpact} optional />
              <TextareaInput label="If you would like, please share more" name="reflection.communityImpactDetail" register={register} optional rows={3} placeholder="Any additional details you would like to share..." />
            </div>
            <div className="form-section">
              <h3 className="form-section-title">Pathways to Safer Communities</h3>
              <p className="form-section-subtitle">In your view, what changes would make your community safer and more supportive for GBV survivors? Select any that apply or add your own ideas.</p>
              <CheckboxGroup label="" options={["Stronger laws and enforcement against violence", "Safe and inclusive support services (health, legal, shelter)", "Community awareness and education", "Reduced stigma and discrimination", "Economic empowerment and livelihood opportunities", "Safer public spaces and housing", "Accountability for perpetrators", "Inclusion in climate and environmental programs", "Support from community, cultural, and religious leaders", "Protection for human rights defenders", "Other"]} values={saferCommunity} onChange={setSaferCommunity} optional />
              {saferCommunity.includes("Other") && (
                <TextInput label="Other suggestion" name="reflection.saferCommunityOther" register={register} optional />
              )}
              <TextareaInput label="Additional suggestions" name="reflection.saferCommunityDetail" register={register} optional rows={3} placeholder="Any other ideas or suggestions..." />
            </div>
            <div className="form-section">
              <h3 className="form-section-title">Message of Healing or Resilience</h3>
              <p className="form-section-subtitle">Would you like to share a message for yourself or others who may be going through similar experiences?</p>
              <TextareaInput label="" name="reflection.healingMessage" register={register} optional rows={4} placeholder="A word of strength, hope, or healing..." />
            </div>
          </div>
        )}

        {/* STEP 6 — Consent */}
        {step === 6 && (
          <div className="animate-[slideUp_0.4s_ease-out]">
            <div className="form-section">
              <h3 className="form-section-title">Section 7: Data Protection and Consent</h3>
              <div className="p-4 rounded-xl border border-yellow-100 bg-yellow-50 mb-5 text-sm text-gray-700 leading-relaxed">
                <p className="font-semibold text-yellow-800 mb-2">Before you submit</p>
                <p>By submitting this form, I confirm the information provided is accurate to the best of my knowledge. I understand that <strong>Rights 4 Her Uganda</strong> will use this information strictly for advocacy, referrals, and protection support, under confidentiality and data protection policies.</p>
              </div>
              <div className="mb-5">
                <p className="form-label mb-3">Consent and Confidentiality <span className="text-red-500 font-semibold">*</span></p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="mt-0.5 w-5 h-5 rounded" {...register("consent.dataCollection", { required: true })} />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Survivor consents to data collection</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="mt-0.5 w-5 h-5 rounded" {...register("consent.referralServices", { required: true })} />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Survivor consents to referral services</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="mt-0.5 w-5 h-5 rounded" {...register("consent.anonymizedAdvocacy", { required: true })} />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Survivor consents to anonymized data use for advocacy</span>
                  </label>
                </div>
                {(errors.consent as any)?.dataCollection || (errors.consent as any)?.referralServices || (errors.consent as any)?.anonymizedAdvocacy ? (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    All three consent boxes must be checked
                  </p>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="form-label">Signature / Initials <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" className="form-input" placeholder="e.g. A.K." {...register("consent.signature")} />
                </div>
                <div>
                  <label className="form-label">Date <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="date" className="form-input" {...register("consent.consentDate")} />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 w-5 h-5 rounded" {...register("dataConsent", { required: "You must confirm consent to submit." })} />
                  <span className="text-sm text-gray-700">I understand and consent to the above data protection statement.</span>
                </label>
                {errors.dataConsent && <p className="text-red-500 text-sm mt-2">{errors.dataConsent.message as string}</p>}
              </div>
            </div>
            {submitError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">{submitError}</div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-30 shadow-lg">
          <div className="max-w-2xl mx-auto flex gap-3">
            {step > 0 && (
              <button type="button" onClick={prev} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">
                Back
              </button>
            )}
            {step < SECTIONS.length - 1 ? (
              <button type="button" onClick={handleNext}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg,#1DB954,#000000)" }}>
                Continue
              </button>
            ) : (
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#1DB954,#000000)", color: "#ffffff" }}>
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
