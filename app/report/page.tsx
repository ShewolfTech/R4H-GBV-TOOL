"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  AGE_RANGES, GENDER_OPTIONS, DISABILITY_OPTIONS, UGANDA_DISTRICTS,
  VIOLENCE_TYPES, DIGITAL_ABUSE_TYPES, PERPETRATOR_OPTIONS,
  CONTACT_METHODS, SUPPORT_SERVICES, REPORTED_TO_OPTIONS, PRIORITY_SUPPORT,
} from "@/lib/constants";
import { TextInput, TextareaInput, SelectInput, CheckboxGroup, RadioGroup } from "@/components/form/FormFields";

const SECTIONS = [
  "Survivor Information", "Nature of Violation & Safety", "Context & Factors",
  "Reporting & Response", "Current Needs", "Reflection & Healing", "Data Protection",
];

const IDENTITY_FACTORS = [
  "Gender (being a woman, man, or gender-diverse person)",
  "Gender identity (e.g. non-binary)",
  "Expression or appearance (how you dress, speak, or present yourself)",
  "Perceived identity (assumptions made about you)",
  "Community stigma or discrimination",
  "Laws or policies affecting certain identities",
  "Other",
];

const ENVIRONMENTAL_FACTORS = [
  "Loss of income or livelihood",
  "Resource scarcity (e.g., water, land, food)",
  "Displacement (due to floods, drought, evictions, disasters)",
  "Increased household stress due to economic hardship",
  "Conflict over land or natural resources",
  "Unsafe migration or relocation",
  "Living/working in high-risk environments (e.g., informal settlements, fishing communities)",
  "Climate-related disaster (floods, drought, landslides, etc.)",
  "Exclusion from climate or livelihood support programs",
  "Other",
];

const CONTRIBUTING_FACTORS = [
  "Gender inequality and power imbalances",
  "Economic dependency or lack of financial independence",
  "Poverty and unemployment",
  "Harmful cultural, religious, or social norms",
  "Family or community pressure",
  "Substance abuse (alcohol/drugs)",
  "Weak legal and justice systems",
  "Lack of access to justice or legal protection",
  "Discrimination or stigma (e.g., based on gender, sexuality, disability, HIV status)",
  "Political instability or conflict",
  "Climate and environmental stress (e.g., drought, floods, resource scarcity)",
  "Housing insecurity or unsafe living conditions",
  "Limited access to education or information",
  "Digital exposure or online vulnerability",
  "Isolation or lack of social support",
  "Other",
];

const PRIMARY_DRIVERS = [
  "Gender-based discrimination",
  "Economic stress",
  "Environmental / climate-related stress",
  "Social / cultural norms",
  "Legal / policy environment",
  "Multiple factors combined",
  "Not sure",
  "Other",
];

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Controlled state for conditional rendering
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

  const onSubmit = async (data: any) => {
    setLoading(true); setSubmitError("");
    const payload = {
      survivor: { ...data.survivor, genderIdentity, disabilityStatus },
      incident: {
        ...data.incident,
        violenceTypes,
        digitalAbuseTypes: showDigital ? digitalAbuseTypes : [],
        perpetrator,
        locationOfIncident,
        incidentFrequency,
        impactOfViolence,
        isSurvivorSafe,
        perpetratorAccess,
        urgentSupport,
      },
      context: {
        ...data.context,
        linkedToSOGI,
        identityFactors,
        linkedToEnvironment,
        environmentFactors,
        contributingFactors,
        primaryDriver,
      },
      reporting: { ...data.reporting, reportedTo, servicesReceived },
      needs: {
        ...data.needs,
        prioritySupport,
        contactMethods: consentForContact === "Yes" ? contactMethods : [],
        contactDetails: consentForContact === "Yes" ? data.needs?.contactDetails : "",
      },
      reflection: data.reflection || {},
    };
    try {
      const res = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (result.success) { router.push(`/report/success?ref=${result.caseRef}`); }
      else setSubmitError("Submission failed. Please try again.");
    } catch { setSubmitError("Network error. Please check your connection."); }
    finally { setLoading(false); }
  };

  const next = () => setStep(s => Math.min(s + 1, SECTIONS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));
  const progress = ((step + 1) / SECTIONS.length) * 100;

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
            <div className="mb-4">
              <label className="form-label">District <span className="text-gray-400 font-normal">(optional)</span></label>
              <select className="form-select" {...register("survivor.district")} onChange={e => setSelectedDistrict(e.target.value)}>
                <option value="">— Select —</option>
                {Object.keys(UGANDA_DISTRICTS).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {subCounties.length > 0 && (
              <div className="mb-4 animate-[slideUp_0.3s_ease-out]">
                <label className="form-label">Sub-County <span className="text-gray-400 font-normal">(optional)</span></label>
                <select className="form-select" {...register("survivor.subCounty")}>
                  <option value="">— Select sub-county —</option>
                  {subCounties.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                </select>
              </div>
            )}
            <TextInput label="Occupation / Source of Livelihood" name="survivor.occupation" register={register} optional />
          </div>
        )}

        {/* STEP 1 — Nature of Violation & Safety */}
        {step === 1 && (
          <div className="animate-[slideUp_0.4s_ease-out] space-y-5">

            <div className="form-section">
              <h3 className="form-section-title">Section 2: Nature of Violation</h3>
              <p className="form-section-subtitle">Select everything that applies to your experience.</p>
              <CheckboxGroup label="Type(s) of Violence Experienced" options={VIOLENCE_TYPES} values={violenceTypes} onChange={setViolenceTypes} optional />
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
                    <input type="text" className="form-input" placeholder="Describe location..." {...register("incident.locationOther")} />
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
              <TextareaInput label="Detailed Description of Incident" name="incident.description" register={register} optional rows={5}
                placeholder="Describe what happened in your own words. Share only what you feel comfortable sharing." />
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Impact of the Violence</h3>
              <p className="form-section-subtitle">Select all that apply.</p>
              <CheckboxGroup
                label=""
                options={["Physical injury", "Emotional / mental distress", "Loss of income / livelihood", "Displacement / homelessness", "Social exclusion / stigma", "Interrupted education", "Health complications", "Fear for safety", "Other"]}
                values={impactOfViolence}
                onChange={setImpactOfViolence}
                optional
              />
              {impactOfViolence.includes("Other") && (
                <TextInput label="Describe other impact" name="incident.impactOther" register={register} optional />
              )}
            </div>

            <div className="form-section" style={{ borderColor: "#fecaca", borderWidth: "1.5px" }}>
              <h3 className="form-section-title" style={{ color: "#b91c1c" }}>⚠ Immediate Safety & Risk Assessment</h3>
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
              <CheckboxGroup
                label="Urgent support needed"
                options={["Medical care", "Safe shelter", "Legal support", "Psychosocial support", "Emergency relocation", "Other"]}
                values={urgentSupport}
                onChange={setUrgentSupport}
                optional
              />
              {urgentSupport.includes("Other") && (
                <TextInput label="Describe other urgent support needed" name="incident.urgentSupportOther" register={register} optional />
              )}
            </div>

          </div>
        )}

        {/* STEP 2 — Context & Contributing Factors */}
        {step === 2 && (
          <div className="animate-[slideUp_0.4s_ease-out] space-y-5">

            {/* Identity-Based Violence */}
            <div className="form-section">
              <h3 className="form-section-title">Link to Identity-Based Violence</h3>
              <p className="form-section-subtitle">Optional — share only what you feel comfortable with.</p>
              <div className="mb-4">
                <label className="form-label">Do you believe the violence was related to your sex or gender identity?</label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No", "Not sure"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4"
                        checked={linkedToSOGI === opt}
                        onChange={() => setLinkedToSOGI(opt)}
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              {showIdentityFactors && (
                <div className="mt-2 p-4 rounded-xl bg-blue-50 border border-blue-100 animate-[slideUp_0.3s_ease-out]">
                  <CheckboxGroup
                    label="If yes or not sure, what do you think contributed? (Select all that apply)"
                    options={IDENTITY_FACTORS}
                    values={identityFactors}
                    onChange={setIdentityFactors}
                    optional
                  />
                  {identityFactors.includes("Other") && (
                    <TextInput label="Please describe" name="context.identityFactorsOther" register={register} optional />
                  )}
                </div>
              )}
            </div>

            {/* Environmental / Livelihood Factors */}
            <div className="form-section">
              <h3 className="form-section-title">Link to Environmental / Livelihood Factors</h3>
              <p className="form-section-subtitle">Optional.</p>
              <div className="mb-4">
                <label className="form-label">Do you believe the violence was linked to environmental, climate, or livelihood conditions?</label>
                <div className="space-y-1.5 mt-1">
                  {["Yes", "No", "Not sure"].map(opt => (
                    <label key={opt} className="radio-item">
                      <input type="radio" value={opt} className="w-4 h-4"
                        checked={linkedToEnvironment === opt}
                        onChange={() => setLinkedToEnvironment(opt)}
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              {showEnvFactors && (
                <div className="mt-2 p-4 rounded-xl bg-green-50 border border-green-100 animate-[slideUp_0.3s_ease-out]">
                  <CheckboxGroup
                    label="If yes or not sure, how was it linked? (Select all that apply)"
                    options={ENVIRONMENTAL_FACTORS}
                    values={environmentFactors}
                    onChange={setEnvironmentFactors}
                    optional
                  />
                  {environmentFactors.includes("Other") && (
                    <TextInput label="Please describe" name="context.environmentFactorsOther" register={register} optional />
                  )}
                </div>
              )}
            </div>

            {/* Contributing Factors */}
            <div className="form-section">
              <h3 className="form-section-title">Contributing Factors</h3>
              <p className="form-section-subtitle">Optional — select all that apply.</p>
              <CheckboxGroup
                label=""
                options={CONTRIBUTING_FACTORS}
                values={contributingFactors}
                onChange={setContributingFactors}
                optional
              />
              {contributingFactors.includes("Other") && (
                <TextInput label="Please describe" name="context.contributingFactorsOther" register={register} optional />
              )}
            </div>

            {/* Primary Driver */}
            <div className="form-section" style={{ background: "#fafafa" }}>
              <h3 className="form-section-title">Primary Driver</h3>
              <p className="form-section-subtitle">Optional — if identifiable, select one.</p>
              <div className="space-y-1.5">
                {PRIMARY_DRIVERS.map(opt => (
                  <label key={opt} className="radio-item">
                    <input type="radio" value={opt} className="w-4 h-4"
                      checked={primaryDriver === opt}
                      onChange={() => setPrimaryDriver(opt)}
                    />
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
            <h3 className="form-section-title">Section 4: Reporting & Response</h3>
            <p className="form-section-subtitle">Select everything that applies to your experience.</p>
            <div className="mb-4">
              <label className="form-label">Did you report this incident? <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="space-y-1.5 mt-1">
                {["Yes", "No"].map(opt => (
                  <label key={opt} className="radio-item">
                    <input type="radio" value={opt} className="w-4 h-4"
                      {...register("reporting.didReport")}
                      onChange={e => { register("reporting.didReport").onChange(e); setDidReport(e.target.value); }}
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
                <TextareaInput label="Outcome of the report" name="reporting.reportOutcome" register={register} optional rows={3} placeholder="What happened after you reported?" />
              </>
            )}
            <CheckboxGroup label="Support services received" options={SUPPORT_SERVICES} values={servicesReceived} onChange={setServicesReceived} optional />
            {servicesReceived.includes("Other") && (
              <TextInput label="Other service" name="reporting.servicesOther" register={register} optional />
            )}
            <TextareaInput label="Barriers to accessing support" name="reporting.barriers" register={register} optional rows={3} placeholder="What made it difficult to get help?" />
          </div>
        )}

        {/* STEP 4 — Needs */}
        {step === 4 && (
          <div className="form-section animate-[slideUp_0.4s_ease-out]">
            <h3 className="form-section-title">Section 5: Current Needs</h3>
            <p className="form-section-subtitle">Select everything that applies to your experience.</p>
            <CheckboxGroup label="Priority support needed" options={PRIORITY_SUPPORT} values={prioritySupport} onChange={setPrioritySupport} optional />
            {prioritySupport.includes("Other") && (
              <TextInput label="Other support needed" name="needs.prioritySupportOther" register={register} optional />
            )}
            <RadioGroup label="Urgency Level" name="needs.urgencyLevel" options={["Emergency", "High", "Medium", "Low"]} register={register} optional />
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
        )}

        {/* STEP 5 — Reflection */}
        {step === 5 && (
          <div className="form-section animate-[slideUp_0.4s_ease-out]">
            <h3 className="form-section-title">Section 6: Reflection & Healing</h3>
            <p className="form-section-subtitle">This section is entirely voluntary. Share only what feels right.</p>
            <TextareaInput label="How has this experience affected your connection with the community or environment?" name="reflection.communityConnection" register={register} optional rows={4} />
            <TextareaInput label="What would make your community safer for women in their diversity?" name="reflection.communitySafetyVision" register={register} optional rows={4} />
            <TextareaInput label="Is there any other information or message you would like to share?" name="reflection.healingMessage" register={register} optional rows={4} placeholder="Any other info relevant to this incident..." />
          </div>
        )}

        {/* STEP 6 — Consent */}
        {step === 6 && (
          <div className="animate-[slideUp_0.4s_ease-out]">
            <div className="form-section">
              <h3 className="form-section-title">Section 7: Data Protection & Consent</h3>
              <div className="p-4 rounded-xl border border-yellow-100 bg-yellow-50 mb-5 text-sm text-gray-700 leading-relaxed">
                <p className="font-semibold text-yellow-800 mb-2">Before you submit</p>
                <p>By submitting this form, I confirm the information provided is accurate to the best of my knowledge. I understand that <strong>Rights 4 Her Uganda</strong> will use this information strictly for advocacy, referrals, and protection support, under confidentiality and data protection policies.</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-0.5 w-5 h-5 rounded" {...register("dataConsent", { required: "You must confirm consent to submit." })} />
                <span className="text-sm text-gray-700">I understand and consent to the above data protection statement.</span>
              </label>
              {errors.dataConsent && <p className="text-red-500 text-md mt-2">{errors.dataConsent.message as string}</p>}
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
              <button type="button" onClick={next} className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95" style={{ background: "linear-gradient(135deg,#1DB954,#000000)" }}>
                Continue
              </button>
            ) : (
              <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60" style={{ background: "linear-gradient(135deg,#1DB954,#000000)", color: "#ffffff" }}>
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
