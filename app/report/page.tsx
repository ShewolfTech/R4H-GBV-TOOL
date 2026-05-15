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

  // Controlled state (for fields that are not directly registered)
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

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors }
  } = useForm();

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

  // Helper to validate mandatory multi‑select fields for the current step
  function validateMultiSelects(stepIndex: number): string | null {
    switch (stepIndex) {
      case 0:
        if (genderIdentity.length === 0) return "Please select at least one gender option.";
        if (!selectedDistrict) return "Please select a district.";
        if (!getValues("survivor.region")) return "Region is required.";
        if (!getValues("survivor.village")) return "Village / Parish / Exact Location is required.";
        if (!getValues("survivor.occupation")) return "Occupation is required.";
        return null;
      case 1:
        if (violenceTypes.length === 0) return "Please select at least one type of violence.";
        if (perpetrator.length === 0) return "Please select at least one perpetrator.";
        if (!getValues("incident.incidentDate")) return "Date of incident is required.";
        if (!locationOfIncident) return "Location of incident is required.";
        if (!incidentFrequency) return "Please indicate if this was one‑time or repeated.";
        if (impactOfViolence.length === 0) return "Please select at least one impact of violence.";
        if (!isSurvivorSafe) return "Please indicate if the survivor is currently safe.";
        if (!perpetratorAccess) return "Please indicate if the perpetrator still has access.";
        return null;
      case 2:
        if (!linkedToSOGI) return "Please answer whether the violence was related to your sex/gender identity.";
        if (!linkedToEnvironment) return "Please answer whether the violence was linked to environmental/livelihood conditions.";
        if (contributingFactors.length === 0) return "Please select at least one contributing factor.";
        if (!primaryDriver) return "Please select a primary driver.";
        return null;
      case 3:
        if (!didReport) return "Please indicate if you reported the incident.";
        if (servicesReceived.length === 0) return "Please select support services received (select 'None' if applicable).";
        return null;
      case 4:
        if (prioritySupport.length === 0) return "Please select at least one priority support need.";
        if (!getValues("needs.urgencyLevel")) return "Urgency level is required.";
        if (!consentForContact) return "Please indicate consent for contact.";
        if (immediateRisk.length === 0) return "Please select at least one immediate risk indicator.";
        return null;
      case 6:
        if (!getValues("consent.dataCollection") || !getValues("consent.referralServices") || !getValues("consent.anonymizedAdvocacy"))
          return "All three consent checkboxes must be checked.";
        if (!getValues("dataConsent")) return "You must confirm consent to submit.";
        return null;
      default:
        return null;
    }
  }

  async function handleNext() {
    // First, trigger validation for all registered fields in the current step
    let fieldsToValidate: string[] = [];
    switch (step) {
      case 0:
        fieldsToValidate = ["survivor.preferredName", "survivor.ageRange", "survivor.region", "survivor.village", "survivor.occupation"];
        break;
      case 1:
        fieldsToValidate = ["incident.incidentDate", "incident.incidentTime", "incident.description", "incident.impactOther"];
        break;
      case 2:
        fieldsToValidate = ["context.identityFactorsOther", "context.environmentFactorsOther", "context.contributingFactorsOther", "context.primaryDriverOther"];
        break;
      case 3:
        fieldsToValidate = ["reporting.reportedToDetails", "reporting.reportOutcome", "reporting.servicesOther", "reporting.barriers"];
        break;
      case 4:
        fieldsToValidate = ["needs.prioritySupportOther", "needs.urgencyLevel", "needs.contactDetails"];
        break;
      case 5:
        fieldsToValidate = ["reflection.communityImpactDetail", "reflection.saferCommunityOther", "reflection.saferCommunityDetail", "reflection.healingMessage"];
        break;
      case 6:
        fieldsToValidate = ["consent.signature", "consent.consentDate", "dataConsent"];
        break;
    }
    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return;

    // Then validate multi‑select fields
    const multiError = validateMultiSelects(step);
    if (multiError) {
      setSubmitError(multiError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitError("");
    setStep(s => Math.min(s + 1, SECTIONS.length - 1));
  }

  const prev = () => {
    setSubmitError("");
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
            <p className="form-section-subtitle">All fields are required — please share what you can.</p>

            <TextInput label="Preferred Name or Case Code" name="survivor.preferredName" register={register} required placeholder="A name or code word you choose" error={errors.survivor?.preferredName} />
            <SelectInput label="Age Range" name="survivor.ageRange" register={register} options={AGE_RANGES} required error={errors.survivor?.ageRange} />
            <CheckboxGroup label="Gender" options={GENDER_OPTIONS} required values={genderIdentity} onChange={setGenderIdentity} error={genderIdentity.length === 0 ? "Please select at least one gender option" : undefined} />
            {genderIdentity.includes("Self-describe") && (
              <TextInput label="Describe your gender (self-describe)" name="survivor.genderIdentityOther" register={register} required error={errors.survivor?.genderIdentityOther} />
            )}
            <TextInput label="Is there any aspect of your identity you'd like us to be aware of to better support you?" name="survivor.sexualOrientation" register={register} required error={errors.survivor?.sexualOrientation} />
            <CheckboxGroup label="Disability Status" options={DISABILITY_OPTIONS} required values={disabilityStatus} onChange={setDisabilityStatus} error={disabilityStatus.length === 0 ? "Please select at least one option" : undefined} />
            {disabilityStatus.includes("Other") && (
              <TextInput label="Please describe" name="survivor.disabilityOther" register={register} required error={errors.survivor?.disabilityOther} />
            )}

            {/* HRD */}
            <div className="mb-4">
              <label className="form-label">Are you a Human Rights Defender? <span className="text-red-500">*</span></label>
              <div className="space-y-1.5 mt-1">
                {["Yes", "No", "Prefer not to say"].map(opt => (
                  <label key={opt} className="radio-item">
                    <input type="radio" value={opt} className="w-4 h-4" checked={isHRD === opt} onChange={() => setIsHRD(opt)} required />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
              {!isHRD && <p className="text-red-500 text-xs mt-1">This field is required.</p>}
            </div>
            {isHRD === "Yes" && (
              <div className="animate-[slideUp_0.3s_ease-out]">
                <TextInput label="Organisation Affiliation and Thematic Area of Work" name="survivor.hrdOrganisation" register={register} required error={errors.survivor?.hrdOrganisation} placeholder="Name of your organisation and the thematic area of work" />
              </div>
            )}

            {/* District */}
            <div className="mb-4">
              <label className="form-label">District <span className="text-red-500">*</span></label>
              <select className="form-select" {...register("survivor.district", { required: "District is required" })} onChange={e => setSelectedDistrict(e.target.value)}>
                <option value="">— Select —</option>
                {Object.keys(UGANDA_DISTRICTS).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.survivor?.district && <p className="text-red-500 text-xs mt-1">{errors.survivor.district.message as string}</p>}
            </div>
            {subCounties.length > 0 && (
              <div className="mb-4 animate-[slideUp_0.3s_ease-out]">
                <TextInput label="Region" name="survivor.region" register={register} required placeholder="e.g. Western Region, Northern Region" error={errors.survivor?.region} />
                <label className="form-label">Sub-County <span className="text-red-500">*</span></label>
                <select className="form-select mb-4" {...register("survivor.subCounty", { required: "Sub-County is required" })}>
                  <option value="">— Select sub-county —</option>
                  {subCounties.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                </select>
                {errors.survivor?.subCounty && <p className="text-red-500 text-xs mt-1">{errors.survivor.subCounty.message as string}</p>}
                <TextInput label="Village / Parish / Exact Location" name="survivor.village" register={register} required placeholder="e.g. Bwaise village, Kamwokya Parish" error={errors.survivor?.village} />
              </div>
            )}

            <TextInput label="Occupation / Source of Livelihood" name="survivor.occupation" register={register} required error={errors.survivor?.occupation} />
          </div>
        )}

        {/* STEP 1 — Nature of Violation and Safety */}
        {step === 1 && (
          <div className="animate-[slideUp_0.4s_ease-out] space-y-5">
            <div className="form-section">
              <h3 className="form-section-title">Section 2: Nature of Violation</h3>
              <p className="form-section-subtitle">All fields are required.</p>
              <CheckboxGroup label="Type(s) of Violence Experienced" options={VIOLENCE_TYPES} values={violenceTypes} onChange={setViolenceTypes} required error={violenceTypes.length === 0 ? "Please select at least one type of violence" : undefined} />
              {showDigital && (
                <div className="mt-2 p-4 rounded-xl bg-purple-50 border border-purple-100">
                  <CheckboxGroup label="Digital Abuse Types" options={DIGITAL_ABUSE_TYPES} values={digitalAbuseTypes} onChange={setDigitalAbuseTypes} required error={digitalAbuseTypes.length === 0 ? "Please select at least one digital abuse type" : undefined} />
                  {digitalAbuseTypes.includes("Other") && (
                    <TextInput label="Describe other digital abuse" name="incident.digitalAbuseOther" register={register} required error={errors.incident?.digitalAbuseOther} />
                  )}
                </div>
              )}
              {violenceTypes.includes("Other") && (
                <TextInput label="Describe other violence type" name="incident.violenceOther" register={register} required error={errors.incident?.violenceOther} />
              )}
              <CheckboxGroup label="Perpetrator" options={PERPETRATOR_OPTIONS} values={perpetrator} onChange={setPerpetrator} required error={perpetrator.length === 0 ? "Please select at least one perpetrator" : undefined} />
              {perpetrator.includes("Other") && (
                <TextInput label="Describe perpetrator" name="incident.perpetratorOther" register={register} required error={errors.incident?.perpetratorOther} />
              )}
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Incident Details</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="form-label">Date of Incident <span className="text-red-500">*</span></label>
                  <input type="date" className="form-input" {...register("incident.incidentDate", { required: "Date of incident is required" })} />
                  {errors.incident?.incidentDate && <p className="text-red-500 text-xs mt-1">{errors.incident.incidentDate.message as string}</p>}
                </div>
                <div>
                  <label className="form-label">Time of Incident <span className="text-red-500">*</span></label>
                  <input type="time" className="form-input" {...register("incident.incidentTime", { required: "Time of incident is required" })} />
                  {errors.incident?.incidentTime && <p className="text-red-500 text-xs mt-1">{errors.incident.incidentTime.message as string}</p>}
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label">Location of Incident <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {["Home", "Workplace", "School", "Public space", "Online", "Shelter / camp", "Other"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={locationOfIncident === opt} onChange={() => setLocationOfIncident(opt)} required />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {!locationOfIncident && <p className="text-red-500 text-xs mt-1">Please select a location.</p>}
                {locationOfIncident === "Other" && (
                  <div className="mt-2">
                    <TextInput label="Describe location type" name="incident.locationOther" register={register} required error={errors.incident?.locationOther} />
                  </div>
                )}
                {locationOfIncident && (
                  <div className="mt-3 animate-[slideUp_0.3s_ease-out]">
                    <TextInput label="Exact location" name="incident.exactLocation" register={register} required placeholder="e.g. Bwaise village, near the market, Kampala" error={errors.incident?.exactLocation} />
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="form-label">Was this a one-time or repeated incident? <span className="text-red-500">*</span></label>
                <div className="space-y-1.5 mt-1">
                  {["One-time", "Repeated / ongoing"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={incidentFrequency === opt} onChange={() => setIncidentFrequency(opt)} required />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {!incidentFrequency && <p className="text-red-500 text-xs mt-1">This field is required.</p>}
              </div>
              <TextareaInput label="Detailed Description of Incident" name="incident.description" register={register} required rows={5} placeholder="Describe what happened in your own words." error={errors.incident?.description} />
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Impact of the Violence</h3>
              <CheckboxGroup label="Select all that apply" options={["Physical injury", "Emotional / mental distress", "Loss of income / livelihood", "Displacement / homelessness", "Social exclusion / stigma", "Interrupted education", "Health complications", "Fear for safety", "Other"]} values={impactOfViolence} onChange={setImpactOfViolence} required error={impactOfViolence.length === 0 ? "Please select at least one impact" : undefined} />
              {impactOfViolence.includes("Other") && (
                <TextInput label="Describe other impact" name="incident.impactOther" register={register} required error={errors.incident?.impactOther} />
              )}
            </div>

            <div className="form-section" style={{ borderColor: "#fecaca", borderWidth: "1.5px" }}>
              <h3 className="form-section-title" style={{ color: "#b91c1c" }}>⚠ Immediate Safety and Risk Assessment</h3>
              <div className="mb-4">
                <label className="form-label">Is the survivor currently safe? <span className="text-red-500">*</span></label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No", "Not sure"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={isSurvivorSafe === opt} onChange={() => setIsSurvivorSafe(opt)} required />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {!isSurvivorSafe && <p className="text-red-500 text-xs mt-1">This field is required.</p>}
              </div>
              <div className="mb-4">
                <label className="form-label">Does the perpetrator still have access to or is nearby the survivor? <span className="text-red-500">*</span></label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={perpetratorAccess === opt} onChange={() => setPerpetratorAccess(opt)} required />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {!perpetratorAccess && <p className="text-red-500 text-xs mt-1">This field is required.</p>}
              </div>
              <CheckboxGroup label="Urgent support needed" options={["Medical care", "Safe shelter", "Legal support", "Psychosocial support", "Emergency relocation", "Other"]} values={urgentSupport} onChange={setUrgentSupport} required error={urgentSupport.length === 0 ? "Please select at least one urgent support need" : undefined} />
              {urgentSupport.includes("Other") && (
                <TextInput label="Describe other urgent support needed" name="incident.urgentSupportOther" register={register} required error={errors.incident?.urgentSupportOther} />
              )}
            </div>
          </div>
        )}

        {/* STEP 2 — Context and Contributing Factors */}
        {step === 2 && (
          <div className="animate-[slideUp_0.4s_ease-out] space-y-5">
            <div className="form-section">
              <h3 className="form-section-title">Link to Gender-Based Violence</h3>
              <div className="mb-4">
                <label className="form-label">Do you believe the violence was related to your sex or gender identity? <span className="text-red-500">*</span></label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No", "Not sure"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={linkedToSOGI === opt} onChange={() => setLinkedToSOGI(opt)} required />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {!linkedToSOGI && <p className="text-red-500 text-xs mt-1">This field is required.</p>}
              </div>
              {showIdentityFactors && (
                <div className="mt-2 p-4 rounded-xl bg-blue-50 border border-blue-100 animate-[slideUp_0.3s_ease-out]">
                  <CheckboxGroup label="If yes or not sure, what do you think contributed? (Select all that apply)" options={IDENTITY_FACTORS} values={identityFactors} onChange={setIdentityFactors} required error={identityFactors.length === 0 ? "Please select at least one contributing factor" : undefined} />
                  {identityFactors.includes("Other") && (
                    <TextInput label="Please describe" name="context.identityFactorsOther" register={register} required error={errors.context?.identityFactorsOther} />
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
                      <input type="radio" value={opt} className="w-4 h-4" checked={linkedToEnvironment === opt} onChange={() => setLinkedToEnvironment(opt)} required />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {!linkedToEnvironment && <p className="text-red-500 text-xs mt-1">This field is required.</p>}
              </div>
              {showEnvFactors && (
                <div className="mt-2 p-4 rounded-xl bg-green-50 border border-green-100 animate-[slideUp_0.3s_ease-out]">
                  <CheckboxGroup label="If yes or not sure, how was it linked? (Select all that apply)" options={ENVIRONMENTAL_FACTORS} values={environmentFactors} onChange={setEnvironmentFactors} required error={environmentFactors.length === 0 ? "Please select at least one link" : undefined} />
                  {environmentFactors.includes("Other") && (
                    <TextInput label="Please describe" name="context.environmentFactorsOther" register={register} required error={errors.context?.environmentFactorsOther} />
                  )}
                </div>
              )}
            </div>
            <div className="form-section">
              <h3 className="form-section-title">Contributing Factors</h3>
              <CheckboxGroup label="Select all that apply" options={CONTRIBUTING_FACTORS} values={contributingFactors} onChange={setContributingFactors} required error={contributingFactors.length === 0 ? "Please select at least one contributing factor" : undefined} />
              {contributingFactors.includes("Other") && (
                <TextInput label="Please describe" name="context.contributingFactorsOther" register={register} required error={errors.context?.contributingFactorsOther} />
              )}
            </div>
            <div className="form-section" style={{ background: "#fafafa" }}>
              <h3 className="form-section-title">Primary Driver</h3>
              <div className="space-y-1.5">
                {PRIMARY_DRIVERS.map(opt => (
                  <label key={opt} className="radio-item">
                    <input type="radio" value={opt} className="w-4 h-4" checked={primaryDriver === opt} onChange={() => setPrimaryDriver(opt)} required />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
              {!primaryDriver && <p className="text-red-500 text-xs mt-1">Please select a primary driver.</p>}
              {primaryDriver === "Other" && (
                <div className="mt-3">
                  <TextInput label="Please describe" name="context.primaryDriverOther" register={register} required error={errors.context?.primaryDriverOther} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 — Reporting */}
        {step === 3 && (
          <div className="form-section animate-[slideUp_0.4s_ease-out]">
            <h3 className="form-section-title">Section 4: Reporting and Response</h3>
            <div className="mb-4">
              <label className="form-label">Did you report this incident? <span className="text-red-500">*</span></label>
              <div className="space-y-1.5 mt-1">
                {["Yes", "No"].map(opt => (
                  <label key={opt} className="radio-item">
                    <input type="radio" value={opt} className="w-4 h-4" checked={didReport === opt} onChange={e => { setDidReport(e.target.value); }} required />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
              {!didReport && <p className="text-red-500 text-xs mt-1">This field is required.</p>}
            </div>
            {didReport === "Yes" && (
              <>
                <CheckboxGroup label="Where did you report?" options={REPORTED_TO_OPTIONS} values={reportedTo} onChange={setReportedTo} required error={reportedTo.length === 0 ? "Please select at least one reporting body" : undefined} />
                {reportedTo.includes("Other") && (
                  <TextInput label="Other reporting body" name="reporting.reportedToOther" register={register} required error={errors.reporting?.reportedToOther} />
                )}
                <TextareaInput
                  label="Details of where / who you reported to"
                  name="reporting.reportedToDetails"
                  register={register}
                  required
                  rows={3}
                  placeholder="e.g. Reported to Officer Jane Doe at Kampala Central Police Station, on 12 March 2026"
                  error={errors.reporting?.reportedToDetails}
                />
                <TextareaInput label="Outcome of the report" name="reporting.reportOutcome" register={register} required rows={3} placeholder="What happened after you reported?" error={errors.reporting?.reportOutcome} />
              </>
            )}
            <CheckboxGroup label="Support services received" options={SUPPORT_SERVICES} values={servicesReceived} onChange={setServicesReceived} required error={servicesReceived.length === 0 ? "Please select at least one service (or 'None' if not applicable)" : undefined} />
            {servicesReceived.includes("Other") && (
              <TextInput label="Other service" name="reporting.servicesOther" register={register} required error={errors.reporting?.servicesOther} />
            )}
            <TextareaInput label="Barriers to accessing support" name="reporting.barriers" register={register} required rows={3} placeholder="What made it difficult to get help?" error={errors.reporting?.barriers} />
          </div>
        )}

        {/* STEP 4 — Needs */}
        {step === 4 && (
          <div className="animate-[slideUp_0.4s_ease-out] space-y-5">
            <div className="form-section">
              <h3 className="form-section-title">Section 5: Current Needs</h3>
              <CheckboxGroup label="Priority support needed" options={PRIORITY_SUPPORT} values={prioritySupport} onChange={setPrioritySupport} required error={prioritySupport.length === 0 ? "Please select at least one priority support need" : undefined} />
              {prioritySupport.includes("Other") && (
                <TextInput label="Other support needed" name="needs.prioritySupportOther" register={register} required error={errors.needs?.prioritySupportOther} />
              )}
              <RadioGroup label="Urgency Level" name="needs.urgencyLevel" options={["Emergency – Immediate danger or life-threatening situation", "High – Urgent support needed within 24–72 hours", "Medium – Support needed but not immediate", "Low – General support or follow-up"]} register={register} required error={errors.needs?.urgencyLevel} />
              <div className="mb-4">
                <label className="form-label">Consent for contact <span className="text-red-500">*</span></label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4" checked={consentForContact === opt} onChange={e => setConsentForContact(e.target.value)} required />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
                {!consentForContact && <p className="text-red-500 text-xs mt-1">This field is required.</p>}
              </div>
              {consentForContact === "Yes" && (
                <div className="mt-1 space-y-4">
                  <CheckboxGroup label="Preferred contact method(s)" options={CONTACT_METHODS} values={contactMethods} onChange={setContactMethods} required error={contactMethods.length === 0 ? "Please select at least one contact method" : undefined} />
                  {contactMethods.length > 0 && (
                    <div className="p-4 rounded-xl border border-teal-100 bg-teal-50">
                      <TextInput label="Your contact details" name="needs.contactDetails" register={register} required placeholder={contactPlaceholder()} error={errors.needs?.contactDetails} />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="form-section" style={{ borderColor: "#fecaca", borderWidth: "1.5px" }}>
              <h3 className="form-section-title" style={{ color: "#b91c1c" }}>⚠ Immediate Risk Indicator</h3>
              <CheckboxGroup label="Select all that apply" options={["Survivor is in immediate danger", "Perpetrator has ongoing access to survivor", "Survivor has no safe place to stay", "Survivor requires urgent medical attention", "None of the above"]} values={immediateRisk} onChange={setImmediateRisk} required error={immediateRisk.length === 0 ? "Please select at least one risk indicator" : undefined} />
            </div>
          </div>
        )}

        {/* STEP 5 — Reflection and Healing */}
        {step === 5 && (
          <div className="animate-[slideUp_0.4s_ease-out] space-y-5">
            <div className="form-section">
              <h3 className="form-section-title">Impact on Community and Environment</h3>
              <CheckboxGroup label="Select all that apply" options={["I feel less safe in my community", "I feel isolated or excluded", "I have reduced participation in community activities", "I have been displaced or had to relocate", "I feel unsafe accessing natural resources (e.g., water, land, workplaces)", "My trust in people or institutions has been affected", "No significant change", "Prefer not to say"]} values={communityImpact} onChange={setCommunityImpact} required error={communityImpact.length === 0 ? "Please select at least one option" : undefined} />
              <TextareaInput label="If you would like, please share more" name="reflection.communityImpactDetail" register={register} required rows={3} placeholder="Any additional details you would like to share..." error={errors.reflection?.communityImpactDetail} />
            </div>
            <div className="form-section">
              <h3 className="form-section-title">Pathways to Safer Communities</h3>
              <CheckboxGroup label="Select all that apply" options={["Stronger laws and enforcement against violence", "Safe and inclusive support services (health, legal, shelter)", "Community awareness and education", "Reduced stigma and discrimination", "Economic empowerment and livelihood opportunities", "Safer public spaces and housing", "Accountability for perpetrators", "Inclusion in climate and environmental programs", "Support from community, cultural, and religious leaders", "Protection for human rights defenders", "Other"]} values={saferCommunity} onChange={setSaferCommunity} required error={saferCommunity.length === 0 ? "Please select at least one option" : undefined} />
              {saferCommunity.includes("Other") && (
                <TextInput label="Other suggestion" name="reflection.saferCommunityOther" register={register} required error={errors.reflection?.saferCommunityOther} />
              )}
              <TextareaInput label="Additional suggestions" name="reflection.saferCommunityDetail" register={register} required rows={3} placeholder="Any other ideas or suggestions..." error={errors.reflection?.saferCommunityDetail} />
            </div>
            <div className="form-section">
              <h3 className="form-section-title">Message of Healing or Resilience</h3>
              <TextareaInput label="" name="reflection.healingMessage" register={register} required rows={4} placeholder="A word of strength, hope, or healing..." error={errors.reflection?.healingMessage} />
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
                    <input type="checkbox" className="mt-0.5 w-5 h-5 rounded" {...register("consent.dataCollection", { required: "You must consent to data collection" })} />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Survivor consents to data collection</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="mt-0.5 w-5 h-5 rounded" {...register("consent.referralServices", { required: "You must consent to referral services" })} />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Survivor consents to referral services</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="mt-0.5 w-5 h-5 rounded" {...register("consent.anonymizedAdvocacy", { required: "You must consent to anonymized data use for advocacy" })} />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Survivor consents to anonymized data use for advocacy</span>
                  </label>
                </div>
                {(errors.consent?.dataCollection || errors.consent?.referralServices || errors.consent?.anonymizedAdvocacy) && (
                  <p className="text-red-500 text-xs mt-2">All three consent checkboxes must be checked.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <TextInput label="Signature / Initials" name="consent.signature" register={register} required placeholder="e.g. A.K." error={errors.consent?.signature} />
                </div>
                <div>
                  <label className="form-label">Date <span className="text-red-500">*</span></label>
                  <input type="date" className="form-input" {...register("consent.consentDate", { required: "Date is required" })} />
                  {errors.consent?.consentDate && <p className="text-red-500 text-xs mt-1">{errors.consent.consentDate.message as string}</p>}
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
            <div className="flex gap-3">
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
        </div>
      </form>
    </div>
  );
}
