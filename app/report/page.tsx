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
  const [stepWarning, setStepWarning] = useState("");
  const [confirmSkip, setConfirmSkip] = useState(false);

  // Controlled state
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [linkedToEnvironment, setLinkedToEnvironment] = useState("");
  const [linkedToSOGI, setLinkedToSOGI] = useState("");
  const [didReport, setDidReport] = useState("");
  const [consentForContact, setConsentForContact] = useState("");
  const [locationOfIncident, setLocationOfIncident] = useState("");
  const [incidentFrequency, setIncidentFrequency] = useState("");
  const [isSurvivorSafe, setIsSurvivorSafe] = useState("");
  const [perpetratorAccess, setPerpetratorAccess] = useState("");
  const [primaryDriver, setPrimaryDriver] = useState("");
  const [isHRD, setIsHRD] = useState("");
  const [communityImpact, setCommunityImpact] = useState<string[]>([]);
  const [saferCommunity, setSaferCommunity] = useState<string[]>([]);

  // Multi-select state
  const [genderIdentity, setGenderIdentity] = useState<string[]>([]);
  const [disabilityStatus, setDisabilityStatus] = useState<string[]>([]);
  const [violenceTypes, setViolenceTypes] = useState<string[]>([]);
  const [digitalAbuseTypes, setDigitalAbuseTypes] = useState<string[]>([]);
  const [perpetrator, setPerpetrator] = useState<string[]>([]);
  const [impactOfViolence, setImpactOfViolence] = useState<string[]>([]);
  const [urgentSupport, setUrgentSupport] = useState<string[]>([]);
  const [identityFactors, setIdentityFactors] = useState<string[]>([]);
  const [environmentFactors, setEnvironmentFactors] = useState<string[]>([]);
  const [contributingFactors, setContributingFactors] = useState<string[]>([]);
  const [reportedTo, setReportedTo] = useState<string[]>([]);
  const [servicesReceived, setServicesReceived] = useState<string[]>([]);
  const [prioritySupport, setPrioritySupport] = useState<string[]>([]);
  const [contactMethods, setContactMethods] = useState<string[]>([]);
  const [immediateRisk, setImmediateRisk] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const subCounties = selectedDistrict ? (UGANDA_DISTRICTS[selectedDistrict] || []) : [];
  const showDigital = violenceTypes.includes("Digital/Online Abuse");
  const showIdentityFactors = linkedToSOGI === "Yes" || linkedToSOGI === "Not sure";
  const showEnvFactors = linkedToEnvironment === "Yes" || linkedToEnvironment === "Not sure";

  const contactPlaceholder = () => {
    if (contactMethods.includes("Email") && contactMethods.includes("Phone")) return "Email address or phone number";
    if (contactMethods.includes("Email") && contactMethods.includes("WhatsApp")) return "Email address or WhatsApp number";
    if (contactMethods.includes("Phone") && contactMethods.includes("WhatsApp")) return "Phone or WhatsApp number";
    if (contactMethods.includes("Email")) return "Email address e.g. name@example.com";
    if (contactMethods.includes("Phone")) return "Phone number e.g. +256 700 000000";
    if (contactMethods.includes("WhatsApp")) return "WhatsApp number e.g. +256 700 000000";
    return "Email address or phone number";
  };

  function getStepWarning(s: number): string {
    switch (s) {
      case 0:
        if (!selectedDistrict && !genderIdentity.length && !disabilityStatus.length)
          return "You haven't filled in any survivor information. Are you sure you want to continue?";
        return "";
      case 1:
        if (!violenceTypes.length)
          return "Please select at least one type of violence experienced before continuing.";
        return "";
      case 2:
        if (!linkedToSOGI && !linkedToEnvironment && !contributingFactors.length)
          return "You haven't filled in any context information. Are you sure you want to continue?";
        return "";
      case 3:
        if (!didReport && !servicesReceived.length)
          return "You haven't filled in any reporting information. Are you sure you want to continue?";
        return "";
      case 4:
        if (!prioritySupport.length && !immediateRisk.length)
          return "Please select at least one priority support need or risk indicator before continuing.";
        return "";
      case 5:
        return "";
      default:
        return "";
    }
  }

  function handleNext() {
    const warning = getStepWarning(step);
    if (step === 1 && !violenceTypes.length) {
      setStepWarning("Please select at least one type of violence experienced before continuing.");
      setConfirmSkip(false);
      return;
    }
    if (step === 4 && !prioritySupport.length && !immediateRisk.length) {
      setStepWarning("Please select at least one priority support need or immediate risk indicator before continuing.");
      setConfirmSkip(false);
      return;
    }
    if (warning && !confirmSkip) {
      setStepWarning(warning);
      setConfirmSkip(true);
      return;
    }
    setStepWarning("");
    setConfirmSkip(false);
    setStep(s => Math.min(s + 1, SECTIONS.length - 1));
  }

  const prev = () => {
    setStepWarning("");
    setConfirmSkip(false);
    setStep(s => Math.max(s - 1, 0));
  };

  const progress = ((step + 1) / SECTIONS.length) * 100;

  const onSubmit = async (data: any) => {
    setLoading(true); setSubmitError("");
    const payload = {
      survivor: { ...data.survivor, genderIdentity, disabilityStatus, isHRD, },
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
        dataCollection: data.consent?.dataCollection || false,
        referralServices: data.consent?.referralServices || false,
        anonymizedAdvocacy: data.consent?.anonymizedAdvocacy || false,
        signature: data.consent?.signature || "",
        consentDate: data.consent?.consentDate || "",
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
            <p className="form-section-subtitle">All fields are optional — share only what you are comfortable with.</p>

            <TextInput label="Preferred Name or Case Code" name="survivor.preferredName" register={register} optional placeholder="A name or code word you choose" />
            <SelectInput label="Age Range" name="survivor.ageRange" register={register} options={AGE_RANGES} optional />
            <CheckboxGroup label="Gender" options={GENDER_OPTIONS} optional values={genderIdentity} onChange={setGenderIdentity} />
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
                <TextInput label="Organisation Affiliation and Themantic Area of Work" name="survivor.hrdOrganisation" register={register} optional placeholder="Name of your organisation and the thematic area of work" />
              </div>
            )}

            {/* District */}
            <div className="mb-4">
              <label className="form-label">District <span className="text-gray-400 font-normal">(optional)</span></label>
              <select className="form-select" {...register("survivor.district")} onChange={e => setSelectedDistrict(e.target.value)}>
                <option value="">— Select —</option>
                {Object.keys(UGANDA_DISTRICTS).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {subCounties.length > 0 && (
              <div className="mb-4 animate-[slideUp_0.3s_ease-out]">
                {/* Region */}
                <TextInput label="Region" name="survivor.region" register={register} optional placeholder="e.g. Western Region, Northern Region" />
                <label className="form-label">Sub-County <span className="text-gray-400 font-normal">(optional)</span></label>
                <select className="form-select mb-4" {...register("survivor.subCounty")}>
                  <option value="">— Select sub-county —</option>
                  {subCounties.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                </select>
                <TextInput label="Village / Parish / Exact Location" name="survivor.village" register={register} optional placeholder="e.g. Bwaise village, Kamwokya Parish" />
              </div>
            )}

            <TextInput label="Occupation / Source of Livelihood" name="survivor.occupation" register={register} optional />
          </div>
        )}

        {/* STEP 1 — Nature of Violation and Safety */}
        {step === 1 && (
          <div className="animate-[slideUp_0.4s_ease-out] space-y-5">
            <div className="form-section">
              <h3 className="form-section-title">Section 2: Nature of Violation</h3>
              <p className="form-section-subtitle">Select everything that applies to your experience.</p>
              <CheckboxGroup label="Type(s) of Violence Experienced" options={VIOLENCE_TYPES} values={violenceTypes} onChange={(v: string[]) => { setViolenceTypes(v); setStepWarning(""); }} optional />
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
              <CheckboxGroup label="Perpetrator" options={PERPETRATOR_OPTIONS} values={perpetrator} onChange={setPerpetrator} optional />
              {perpetrator.includes("Other") && (
                <TextInput label="Describe perpetrator" name="incident.perpetratorOther" register={register} optional />
              )}
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Incident Details</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="form-label">Date of Incident <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="date" className="form-input" {...register("incident.incidentDate")} />
                </div>
                <div>
                  <label className="form-label">Time of Incident <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="time" className="form-input" {...register("incident.incidentTime")} />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label">Location of Incident <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {["Home", "Workplace", "School", "Public space", "Online", "Shelter / camp", "Other"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={locationOfIncident === opt} onChange={() => setLocationOfIncident(opt)} />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
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
                <label className="form-label">Was this a one-time or repeated incident? <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="space-y-1.5 mt-1">
                  {["One-time", "Repeated / ongoing"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={incidentFrequency === opt} onChange={() => setIncidentFrequency(opt)} />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <TextareaInput label="Detailed Description of Incident" name="incident.description" register={register} optional rows={5} placeholder="Describe what happened in your own words. Share only what you feel comfortable sharing." />
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Impact of the Violence</h3>
              <p className="form-section-subtitle">Select all that apply.</p>
              <CheckboxGroup label="" options={["Physical injury", "Emotional / mental distress", "Loss of income / livelihood", "Displacement / homelessness", "Social exclusion / stigma", "Interrupted education", "Health complications", "Fear for safety", "Other"]} values={impactOfViolence} onChange={setImpactOfViolence} optional />
              {impactOfViolence.includes("Other") && (
                <TextInput label="Describe other impact" name="incident.impactOther" register={register} optional />
              )}
            </div>

            <div className="form-section" style={{ borderColor: "#fecaca", borderWidth: "1.5px" }}>
              <h3 className="form-section-title" style={{ color: "#b91c1c" }}>⚠ Immediate Safety and Risk Assessment</h3>
              <p className="form-section-subtitle">This helps us prioritise urgent support for you.</p>
              <div className="mb-4">
                <label className="form-label">Is the survivor currently safe? <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No", "Not sure"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={isSurvivorSafe === opt} onChange={() => setIsSurvivorSafe(opt)} />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label">Does the perpetrator still have access to or is nearby the survivor? <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={perpetratorAccess === opt} onChange={() => setPerpetratorAccess(opt)} />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <CheckboxGroup label="Urgent support needed" options={["Medical care", "Safe shelter", "Legal support", "Psychosocial support", "Emergency relocation", "Other"]} values={urgentSupport} onChange={setUrgentSupport} optional />
              {urgentSupport.includes("Other") && (
                <TextInput label="Describe other urgent support needed" name="incident.urgentSupportOther" register={register} optional />
              )}
            </div>
          </div>
        )}

        {/* STEP 2 — Context and Contributing Factors */}
        {step === 2 && (
          <div className="animate-[slideUp_0.4s_ease-out] space-y-5">
            <div className="form-section">
              <h3 className="form-section-title">Link to Gender-Based Violence</h3>
              <p className="form-section-subtitle">Optional — share only what you feel comfortable with.</p>
              <div className="mb-4">
                <label className="form-label">Do you believe the violence was related to your sex or gender identity?</label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No", "Not sure"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={linkedToSOGI === opt} onChange={() => { setLinkedToSOGI(opt); setStepWarning(""); }} />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
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
              <p className="form-section-subtitle">Optional.</p>
              <div className="mb-4">
                <label className="form-label">Do you believe the violence was linked to environmental, climate, or livelihood conditions?</label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No", "Not sure"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={linkedToEnvironment === opt} onChange={() => { setLinkedToEnvironment(opt); setStepWarning(""); }} />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
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
              <h3 className="form-section-title">Contributing Factors</h3>
              <p className="form-section-subtitle">Optional — select all that apply.</p>
              <CheckboxGroup label="" options={CONTRIBUTING_FACTORS} values={contributingFactors} onChange={(v: string[]) => { setContributingFactors(v); setStepWarning(""); }} optional />
              {contributingFactors.includes("Other") && (
                <TextInput label="Please describe" name="context.contributingFactorsOther" register={register} optional />
              )}
            </div>
            <div className="form-section" style={{ background: "#fafafa" }}>
              <h3 className="form-section-title">Primary Driver</h3>
              <p className="form-section-subtitle">Optional — if identifiable, select one.</p>
              <div className="space-y-1.5">
                {PRIMARY_DRIVERS.map(opt => (
                  <label key={opt} className="radio-item">
                    <input type="radio" value={opt} className="w-4 h-4" checked={primaryDriver === opt} onChange={() => setPrimaryDriver(opt)} />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
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
            <p className="form-section-subtitle">Select everything that applies to your experience.</p>
            <div className="mb-4">
              <label className="form-label">Did you report this incident? <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="space-y-1.5 mt-1">
                {["Yes", "No"].map(opt => (
                  <label key={opt} className="radio-item">
                    <input type="radio" value={opt} className="w-4 h-4"
                      {...register("reporting.didReport")}
                      onChange={e => { register("reporting.didReport").onChange(e); setDidReport(e.target.value); setStepWarning(""); }}
                    />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            {didReport === "Yes" && (
              <>
                <CheckboxGroup label="Where did you report?" options={REPORTED_TO_OPTIONS} values={reportedTo} onChange={setReportedTo} optional />
                {reportedTo.includes("Other") && (
                  <TextInput label="Other reporting body" name="reporting.reportedToOther" register={register} optional />
                )}
                <TextareaInput
                  label="Details of where / who you reported to"
                  name="reporting.reportedToDetails"
                  register={register}
                  optional
                  rows={3}
                  placeholder="e.g. Reported to Officer Jane Doe at Kampala Central Police Station, on 12 March 2026"
                />
                <TextareaInput label="Outcome of the report" name="reporting.reportOutcome" register={register} optional rows={3} placeholder="What happened after you reported?" />
              </>
            )}
            <CheckboxGroup label="Support services received" options={SUPPORT_SERVICES} values={servicesReceived} onChange={(v: string[]) => { setServicesReceived(v); setStepWarning(""); }} optional />
            {servicesReceived.includes("Other") && (
              <TextInput label="Other service" name="reporting.servicesOther" register={register} optional />
            )}
            <TextareaInput label="Barriers to accessing support" name="reporting.barriers" register={register} optional rows={3} placeholder="What made it difficult to get help?" />
          </div>
        )}

        {/* STEP 4 — Needs */}
        {step === 4 && (
          <div className="animate-[slideUp_0.4s_ease-out] space-y-5">
            <div className="form-section">
              <h3 className="form-section-title">Section 5: Current Needs</h3>
              <p className="form-section-subtitle">Select everything that applies to your experience.</p>
              <CheckboxGroup label="Priority support needed" options={PRIORITY_SUPPORT} values={prioritySupport} onChange={(v: string[]) => { setPrioritySupport(v); setStepWarning(""); }} optional />
              {prioritySupport.includes("Other") && (
                <TextInput label="Other support needed" name="needs.prioritySupportOther" register={register} optional />
              )}
              <RadioGroup label="Urgency Level" name="needs.urgencyLevel" options={["Emergency – Immediate danger or life-threatening situation", "High – Urgent support needed within 24–72 hours", "Medium – Support needed but not immediate", "Low – General support or follow-up"]} register={register} optional />
              <div className="mb-4">
                <label className="form-label">Consent for contact <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4"
                        {...register("needs.consentForContact")}
                        onChange={e => { register("needs.consentForContact").onChange(e); setConsentForContact(e.target.value); }}
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
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
              <h3 className="form-section-title" style={{ color: "#b91c1c" }}>⚠ Immediate Risk Indicator</h3>
              <p className="form-section-subtitle">Optional — select all that apply.</p>
              <CheckboxGroup label="" options={["Survivor is in immediate danger", "Perpetrator has ongoing access to survivor", "Survivor has no safe place to stay", "Survivor requires urgent medical attention", "None of the above"]} values={immediateRisk} onChange={(v: string[]) => { setImmediateRisk(v); setStepWarning(""); }} optional />
            </div>
          </div>
        )}

        {/* STEP 5 — Reflection and Healing */}
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
              <p className="form-section-subtitle">In your view, what changes would make your community safer and more supportive for women and queer persons? Select any that apply or add your own ideas.</p>
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
                    <input type="checkbox" className="mt-0.5 w-5 h-5 rounded" {...register("consent.dataCollection")} />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Survivor consents to data collection</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="mt-0.5 w-5 h-5 rounded" {...register("consent.referralServices")} />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Survivor consents to referral services</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="mt-0.5 w-5 h-5 rounded" {...register("consent.anonymizedAdvocacy")} />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Survivor consents to anonymized data use for advocacy</span>
                  </label>
                </div>
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
          <div className="max-w-2xl mx-auto space-y-2">
            {stepWarning && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs animate-[slideUp_0.3s_ease-out]">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span>{stepWarning}{confirmSkip ? " Tap Continue again to proceed anyway." : ""}</span>
              </div>
            )}
            <div className="flex gap-3">
              {step > 0 && (
                <button type="button" onClick={prev} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">
                  Back
                </button>
              )}
              {step < SECTIONS.length - 1 ? (
                <button type="button" onClick={handleNext}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: stepWarning && !confirmSkip ? "#d97706" : "linear-gradient(135deg,#1DB954,#000000)" }}>
                  {confirmSkip ? "Yes, Continue Anyway" : "Continue"}
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
        </div>
      </form>
    </div>
  );
}
