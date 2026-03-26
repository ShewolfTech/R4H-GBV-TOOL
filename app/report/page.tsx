"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  AGE_RANGES, GENDER_OPTIONS, DISABILITY_OPTIONS, UGANDA_DISTRICTS,
  VIOLENCE_TYPES, DIGITAL_ABUSE_TYPES, PERPETRATOR_OPTIONS,
  CONTRIBUTING_FACTORS, REPORTED_TO_OPTIONS, SUPPORT_SERVICES,
  PRIORITY_SUPPORT, CONTACT_METHODS,
} from "@/lib/constants";
import { TextInput, TextareaInput, SelectInput, CheckboxGroup, RadioGroup } from "@/components/form/FormFields";

const SECTIONS = [
  "Survivor Information","Nature of Violation","Context & Factors",
  "Reporting & Response","Current Needs","Reflection & Healing","Data Protection",
];

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [genderIdentity,    setGenderIdentity]    = useState<string[]>([]);
  const [disabilityStatus,  setDisabilityStatus]  = useState<string[]>([]);
  const [violenceTypes,     setViolenceTypes]     = useState<string[]>([]);
  const [digitalAbuseTypes, setDigitalAbuseTypes] = useState<string[]>([]);
  const [perpetrator,       setPerpetrator]       = useState<string[]>([]);
  const [contributingFactors, setContributingFactors] = useState<string[]>([]);
  const [reportedTo,        setReportedTo]        = useState<string[]>([]);
  const [servicesReceived,  setServicesReceived]  = useState<string[]>([]);
  const [prioritySupport,   setPrioritySupport]   = useState<string[]>([]);
  const [contactMethods,    setContactMethods]    = useState<string[]>([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const selectedDistrict     = watch("survivor.district");
  const linkedToEnvironment  = watch("context.linkedToEnvironment");
  const didReport            = watch("reporting.didReport");
  const consentForContact    = watch("needs.consentForContact");
  const subCounties          = selectedDistrict ? (UGANDA_DISTRICTS[selectedDistrict] || []) : [];
  const showDigital          = violenceTypes.includes("Digital/Online Abuse");

  const onSubmit = async (data: any) => {
    setLoading(true); setSubmitError("");
    const payload = {
      survivor:  { ...data.survivor, genderIdentity, disabilityStatus },
      incident:  { ...data.incident, violenceTypes, digitalAbuseTypes: showDigital ? digitalAbuseTypes : [], perpetrator },
      context:   { ...data.context, contributingFactors },
      reporting: { ...data.reporting, reportedTo, servicesReceived },
      needs:     { ...data.needs, prioritySupport, contactMethods: data.needs?.consentForContact === "Yes" ? contactMethods : [] },
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
      {/* Sticky header */}
      <div className="sticky top-0 z-40 shadow-md" style={{ background: "#1DB954" }}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
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
            <CheckboxGroup label="Gender Identity" options={GENDER_OPTIONS} optional values={genderIdentity} onChange={setGenderIdentity} />
            {genderIdentity.includes("Self-describe") && (
              <TextInput label="Describe your gender identity" name="survivor.genderIdentityOther" register={register} optional />
            )}
            <TextInput label="Sexual Orientation" name="survivor.sexualOrientation" register={register} optional />
            <CheckboxGroup label="Disability Status" options={DISABILITY_OPTIONS} optional values={disabilityStatus} onChange={setDisabilityStatus} />
            {disabilityStatus.includes("Other") && (
              <TextInput label="Please describe" name="survivor.disabilityOther" register={register} optional />
            )}
            <SelectInput label="District" name="survivor.district" register={register} options={Object.keys(UGANDA_DISTRICTS)} optional />
            {subCounties.length > 0 && (
              <SelectInput label="Sub-County" name="survivor.subCounty" register={register} options={subCounties} optional />
            )}
            <TextInput label="Occupation / Source of Livelihood" name="survivor.occupation" register={register} optional />
          </div>
        )}

        {/* STEP 1 — Nature of Violation */}
        {step === 1 && (
          <div className="form-section animate-[slideUp_0.4s_ease-out]">
            <h3 className="form-section-title">Section 2: Nature of Violation</h3>
            <p className="form-section-subtitle">Select everything that applies to your experience.</p>
            <CheckboxGroup label="Type(s) of Violence Experienced" options={VIOLENCE_TYPES} values={violenceTypes} onChange={setViolenceTypes} optional />
            {showDigital && (
              <div className="mt-2 p-4 rounded-xl bg-purple-50 border border-purple-100">
                <CheckboxGroup label="Digital Abuse Types" options={DIGITAL_ABUSE_TYPES} values={digitalAbuseTypes} onChange={setDigitalAbuseTypes} optional />
                {digitalAbuseTypes.includes("Other") && <TextInput label="Describe other digital abuse" name="incident.digitalAbuseOther" register={register} optional />}
              </div>
            )}
            {violenceTypes.includes("Other") && <TextInput label="Describe other violence type" name="incident.violenceOther" register={register} optional />}
            <CheckboxGroup label="Perpetrator" options={PERPETRATOR_OPTIONS} values={perpetrator} onChange={setPerpetrator} optional />
            {perpetrator.includes("Other") && <TextInput label="Describe perpetrator" name="incident.perpetratorOther" register={register} optional />}
            <div className="mb-4">
              <label className="form-label">Date / Time of Incident <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="date" className="form-input" {...register("incident.incidentDate")} />
            </div>
            <TextInput label="Location of Incident" name="incident.location" register={register} optional placeholder="Village, town, or general area" />
            <TextareaInput label="Detailed Description of Incident" name="incident.description" register={register} optional rows={5}
              placeholder="Describe what happened in your own words. Share only what you feel comfortable sharing." />
          </div>
        )}

        {/* STEP 2 — Context */}
        {step === 2 && (
          <div className="form-section animate-[slideUp_0.4s_ease-out]">
            <h3 className="form-section-title">Section 3: Context & Contributing Factors</h3>
            <RadioGroup label="Was the violence related to your sex, sexual orientation, or gender identity?" name="context.linkedToSOGI" options={["Yes","No","Not sure"]} register={register} optional />
            <RadioGroup label="Was the violence linked to environmental or livelihood factors?" name="context.linkedToEnvironment" options={["Yes","No","Not sure"]} register={register} optional />
            {linkedToEnvironment === "Yes" && (
              <TextareaInput label="Describe the environmental / livelihood link" name="context.environmentDescription" register={register} optional rows={3} />
            )}
            <CheckboxGroup label="Contributing Factors (select all that apply)" options={CONTRIBUTING_FACTORS} values={contributingFactors} onChange={setContributingFactors} optional />
            {contributingFactors.includes("Other") && <TextInput label="Other contributing factor" name="context.contributingFactorsOther" register={register} optional />}
          </div>
        )}

        {/* STEP 3 — Reporting */}
        {step === 3 && (
          <div className="form-section animate-[slideUp_0.4s_ease-out]">
            <h3 className="form-section-title">Section 4: Reporting & Response</h3>
            <RadioGroup label="Did you report this incident?" name="reporting.didReport" options={["Yes","No"]} register={register} optional />
            {didReport === "Yes" && (
              <>
                <CheckboxGroup label="Where did you report?" options={REPORTED_TO_OPTIONS} values={reportedTo} onChange={setReportedTo} optional />
                {reportedTo.includes("Other") && <TextInput label="Other reporting body" name="reporting.reportedToOther" register={register} optional />}
                <TextareaInput label="Outcome of the report" name="reporting.reportOutcome" register={register} optional rows={3} placeholder="What happened after you reported?" />
              </>
            )}
            <CheckboxGroup label="Support services received" options={SUPPORT_SERVICES} values={servicesReceived} onChange={setServicesReceived} optional />
            {servicesReceived.includes("Other") && <TextInput label="Other service" name="reporting.servicesOther" register={register} optional />}
            <TextareaInput label="Barriers to accessing support" name="reporting.barriers" register={register} optional rows={3} placeholder="What made it difficult to get help?" />
          </div>
        )}

        {/* STEP 4 — Needs */}
        {step === 4 && (
          <div className="form-section animate-[slideUp_0.4s_ease-out]">
            <h3 className="form-section-title">Section 5: Current Needs</h3>
            <CheckboxGroup label="Priority support needed" options={PRIORITY_SUPPORT} values={prioritySupport} onChange={setPrioritySupport} optional />
            {prioritySupport.includes("Other") && <TextInput label="Other support needed" name="needs.prioritySupportOther" register={register} optional />}
            <RadioGroup label="Urgency Level" name="needs.urgencyLevel" options={["Emergency","High","Medium","Low"]} register={register} optional />
            <RadioGroup label="Consent for contact" name="needs.consentForContact" options={["Yes","No"]} register={register} optional />
            {consentForContact === "Yes" && (
              <CheckboxGroup label="Preferred contact method(s)" options={CONTACT_METHODS} values={contactMethods} onChange={setContactMethods} optional />
            )}
          </div>
        )}

        {/* STEP 5 — Reflection */}
        {step === 5 && (
          <div className="form-section animate-[slideUp_0.4s_ease-out]">
            <h3 className="form-section-title">Section 6: Reflection & Healing</h3>
            <p className="form-section-subtitle">This section is entirely voluntary. Share only what feels right.</p>
            <TextareaInput label="How has this experience affected your connection with the community or environment?" name="reflection.communityConnection" register={register} optional rows={4} />
            <TextareaInput label="What would make your community safer for women and queer persons?" name="reflection.communitySafetyVision" register={register} optional rows={4} />
            <TextareaInput label="A message of healing or resilience (for yourself or others)" name="reflection.healingMessage" register={register} optional rows={4} placeholder="A word of strength, hope, or healing..." />
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
