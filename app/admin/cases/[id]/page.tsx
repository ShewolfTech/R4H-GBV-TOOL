"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { RISK_ASSESSMENT_OPTIONS } from "@/lib/constants";

function InfoRow({ label, value }: { label: string; value?: any }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <dt className="text-xs text-gray-400 font-medium sm:w-44 shrink-0 mt-0.5 mb-0.5 sm:mb-0">{label}</dt>
      <dd className="text-sm text-gray-800">{Array.isArray(value) ? value.join(", ") : String(value)}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-4" style={{ fontFamily: "'Playfair Display',serif" }}>{title}</h2>
      <dl>{children}</dl>
    </div>
  );
}

export default function CaseDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [caseStatus, setCaseStatus] = useState("Open");
  const [cm, setCm] = useState({
    caseOfficer: "", immediateActions: "", referralPartners: "",
    riskAssessment: [] as string[], confidentialityLevel: "", notes: "",
  });

  useEffect(() => { if (status === "unauthenticated") router.push("/admin"); }, [status]);
  useEffect(() => { if (id) load(); }, [id]);

  async function load() {
    setLoading(true);
    const res  = await fetch(`/api/admin/cases/${id}`);
    const data = await res.json();
    if (data.incident) {
      setIncident(data.incident);
      setCaseStatus(data.incident.status || "Open");
      const c = data.incident.caseManagement || {};
      setCm({
        caseOfficer: c.caseOfficer || "", immediateActions: c.immediateActions || "",
        referralPartners: c.referralPartners || "", riskAssessment: c.riskAssessment || [],
        confidentialityLevel: c.confidentialityLevel || "", notes: c.notes || "",
      });
    }
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseManagement: cm, status: caseStatus }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleDelete() {
    if (!confirm(`Permanently delete case ${incident?.caseRef}? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/admin/cases/${id}`, { method: "DELETE" });
    router.push("/admin/dashboard");
  }

  const toggleRisk = (opt: string) =>
    setCm(p => ({ ...p, riskAssessment: p.riskAssessment.includes(opt) ? p.riskAssessment.filter(r => r !== opt) : [...p.riskAssessment, opt] }));

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}><p className="text-gray-400 text-sm">Loading case…</p></div>;
  if (!incident) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}><p className="text-gray-500">Case not found.</p></div>;

  const inc = incident.incident || {};
  const sur = incident.survivor || {};
  const ctx = incident.context  || {};
  const rep = incident.reporting || {};
  const ned = incident.needs    || {};
  const ref = incident.reflection || {};

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </Link>
            <div>
              <p className="text-xs text-gray-400">Case Detail</p>
              <h1 className="text-sm font-bold font-mono" style={{ color: "#7bdcb5" }}>{incident.caseRef}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">Recorded {format(new Date(incident.dateRecorded), "dd MMM yyyy, HH:mm")}</span>
            <button onClick={handleDelete} disabled={deleting} className="text-xs text-red-400 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40">
              {deleting ? "Deleting…" : "Delete Case"}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — submission data */}
        <div className="lg:col-span-2 space-y-4">
          <Section title="Survivor Information">
            <InfoRow label="Preferred Name / Code" value={sur.preferredName} />
            <InfoRow label="Age Range" value={sur.ageRange} />
            <InfoRow label="Gender Identity" value={sur.genderIdentity} />
            <InfoRow label="Gender (Self-describe)" value={sur.genderIdentityOther} />
            <InfoRow label="Sexual Orientation" value={sur.sexualOrientation} />
            <InfoRow label="Disability Status" value={sur.disabilityStatus} />
            <InfoRow label="District" value={sur.district} />
            <InfoRow label="Sub-County" value={sur.subCounty} />
            <InfoRow label="Occupation" value={sur.occupation} />
          </Section>

          <Section title="Nature of Violation">
            <InfoRow label="Violence Types" value={inc.violenceTypes} />
            <InfoRow label="Digital Abuse Types" value={inc.digitalAbuseTypes} />
            <InfoRow label="Perpetrator" value={inc.perpetrator} />
            <InfoRow label="Date of Incident" value={inc.incidentDate ? format(new Date(inc.incidentDate), "dd MMM yyyy") : null} />
            <InfoRow label="Location" value={inc.location} />
            {inc.description && (
              <div className="mt-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 font-medium mb-1">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{inc.description}</p>
              </div>
            )}
          </Section>

          <Section title="Context & Contributing Factors">
            <InfoRow label="Linked to SOGI" value={ctx.linkedToSOGI} />
            <InfoRow label="Linked to Environment" value={ctx.linkedToEnvironment} />
            <InfoRow label="Environmental Description" value={ctx.environmentDescription} />
            <InfoRow label="Contributing Factors" value={ctx.contributingFactors} />
          </Section>

          <Section title="Reporting & Response">
            <InfoRow label="Did Report?" value={rep.didReport} />
            <InfoRow label="Reported To" value={rep.reportedTo} />
            <InfoRow label="Report Outcome" value={rep.reportOutcome} />
            <InfoRow label="Services Received" value={rep.servicesReceived} />
            <InfoRow label="Barriers" value={rep.barriers} />
          </Section>

          <Section title="Current Needs">
            <InfoRow label="Priority Support" value={ned.prioritySupport} />
            <InfoRow label="Urgency Level" value={ned.urgencyLevel} />
            <InfoRow label="Consent for Contact" value={ned.consentForContact} />
            <InfoRow label="Contact Methods" value={ned.contactMethods} />
          </Section>

          {(ref.communityConnection || ref.communitySafetyVision || ref.healingMessage) && (
            <Section title="Reflection & Healing">
              <InfoRow label="Community Connection" value={ref.communityConnection} />
              <InfoRow label="Safety Vision" value={ref.communitySafetyVision} />
              <InfoRow label="Healing Message" value={ref.healingMessage} />
            </Section>
          )}
        </div>

        {/* Right — case management */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 mb-4" style={{ fontFamily: "'Playfair Display',serif" }}>Case Status</h2>
            <select value={caseStatus} onChange={e => setCaseStatus(e.target.value)} className="form-select">
              <option value="Open">Open</option>
              <option value="Referred">Referred</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="bg-white rounded-xl p-5 border border-primary-100 shadow-sm" style={{ borderColor: "#f9a8d4" }}>
            <h2 className="text-base font-semibold text-gray-800 mb-1" style={{ fontFamily: "'Playfair Display',serif" }}>Section 6: Case Management</h2>
            <p className="text-xs text-gray-400 mb-4">Staff only — fill in after reviewing the submission.</p>

            <div className="space-y-4">
              <div>
                <label className="form-label">Case Officer</label>
                <input type="text" className="form-input" placeholder="Assigned officer name"
                  value={cm.caseOfficer} onChange={e => setCm(p => ({ ...p, caseOfficer: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Immediate Actions Taken</label>
                <textarea className="form-textarea" rows={3} placeholder="Actions taken after reviewing…"
                  value={cm.immediateActions} onChange={e => setCm(p => ({ ...p, immediateActions: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Referral Partners Contacted</label>
                <textarea className="form-textarea" rows={3} placeholder="Partners, organisations, services…"
                  value={cm.referralPartners} onChange={e => setCm(p => ({ ...p, referralPartners: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Risk Assessment</label>
                <div className="space-y-2 mt-1">
                  {RISK_ASSESSMENT_OPTIONS.map(opt => (
                    <label key={opt} className="checkbox-item">
                      <input type="checkbox" className="w-4 h-4 rounded" checked={cm.riskAssessment.includes(opt)} onChange={() => toggleRisk(opt)} />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Confidentiality Level</label>
                <select className="form-select" value={cm.confidentialityLevel} onChange={e => setCm(p => ({ ...p, confidentialityLevel: e.target.value }))}>
                  <option value="">— Select —</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="form-label">Internal Notes</label>
                <textarea className="form-textarea" rows={4} placeholder="Follow-up notes, observations…"
                  value={cm.notes} onChange={e => setCm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <button onClick={save} disabled={saving}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white hover:opacity-90 disabled:opacity-60 transition-all"
                style={{ background: saved ? "#2D6A4F" : "linear-gradient(135deg,#7bdcb5,#000000)" }}>
                {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Case Management"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
