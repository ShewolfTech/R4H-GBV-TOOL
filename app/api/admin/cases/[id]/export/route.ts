import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Incident from "@/models/Incident";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const incident = await Incident.findById(params.id);
  if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const html = buildSingleCasePDF(incident);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function fmt(date: any) {
  if (!date) return "—";
  try { return new Date(date).toLocaleDateString("en-UG", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "—"; }
}

function fmtDateTime(date: any) {
  if (!date) return "—";
  try { return new Date(date).toLocaleString("en-UG", { timeZone: "Africa/Kampala", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return "—"; }
}

function arr(val: any) {
  if (!val) return "—";
  if (Array.isArray(val)) return val.length ? val.join(", ") : "—";
  return val ? String(val) : "—";
}

function row(label: string, value: any) {
  const v = arr(value);
  if (!v || v === "—") return "";
  return `
    <tr>
      <td style="padding:7px 12px;font-size:11px;color:#666;font-weight:500;width:200px;vertical-align:top;border-bottom:1px solid #f0f0f0">${label}</td>
      <td style="padding:7px 12px;font-size:12px;color:#1a1a1a;border-bottom:1px solid #f0f0f0">${v}</td>
    </tr>`;
}

function section(title: string, rows: string) {
  if (!rows.trim()) return "";
  return `
    <div style="margin-bottom:20px">
      <div style="background:#254252;color:white;padding:8px 16px;border-radius:8px 8px 0 0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">${title}</div>
      <table style="width:100%;border-collapse:collapse;background:white;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;overflow:hidden">${rows}</table>
    </div>`;
}

function buildSingleCasePDF(incident: any) {
  const sur = incident.survivor       || {};
  const inc = incident.incident       || {};
  const ctx = incident.context        || {};
  const rep = incident.reporting      || {};
  const ned = incident.needs          || {};
  const ref = incident.reflection     || {};
  const cm  = incident.caseManagement || {};

  const urgencyColors: Record<string,string> = { Emergency:"#C0392B", High:"#E67E22", Medium:"#F39C12", Low:"#27AE60" };
  const statusColors:  Record<string,string> = { Open:"#2563EB", Referred:"#7C3AED", Closed:"#6B7280" };
  const u = ned.urgencyLevel || "";
  const s = incident.status  || "Open";
  const now = fmtDateTime(new Date());

  const survivorRows = [
    row("Preferred Name / Code",  sur.preferredName),
    row("Age Range",               sur.ageRange),
    row("Gender Identity",         sur.genderIdentity),
    row("Gender (Self-describe)",  sur.genderIdentityOther),
    row("Sexual Orientation",      sur.sexualOrientation),
    row("Disability Status",       sur.disabilityStatus),
    row("District",                sur.district),
    row("Sub-County",              sur.subCounty),
    row("Occupation",              sur.occupation),
  ].join("");

  const incidentRows = [
    row("Violence Types",          inc.violenceTypes),
    row("Digital Abuse Types",     inc.digitalAbuseTypes),
    row("Perpetrator",             inc.perpetrator),
    row("Date of Incident",        fmt(inc.incidentDate)),
    row("Location",                inc.location),
    inc.description ? `<tr><td style="padding:7px 12px;font-size:11px;color:#666;font-weight:500;vertical-align:top;border-bottom:1px solid #f0f0f0">Description</td><td style="padding:7px 12px;font-size:12px;color:#1a1a1a;border-bottom:1px solid #f0f0f0;white-space:pre-wrap;line-height:1.6">${inc.description}</td></tr>` : "",
  ].join("");

  const contextRows = [
    row("Linked to SOGI",              ctx.linkedToSOGI),
    row("Linked to Environment",       ctx.linkedToEnvironment),
    row("Environmental Description",   ctx.environmentDescription),
    row("Contributing Factors",        ctx.contributingFactors),
  ].join("");

  const reportingRows = [
    row("Did Report?",       rep.didReport),
    row("Reported To",       rep.reportedTo),
    row("Report Outcome",    rep.reportOutcome),
    row("Services Received", rep.servicesReceived),
    row("Barriers",          rep.barriers),
  ].join("");

  const needsRows = [
    row("Priority Support",    ned.prioritySupport),
    row("Urgency Level",       ned.urgencyLevel),
    row("Consent for Contact", ned.consentForContact),
    row("Contact Methods",     ned.contactMethods),
  ].join("");

  const reflectionRows = [
    row("Community Connection", ref.communityConnection),
    row("Safety Vision",        ref.communitySafetyVision),
    row("Healing Message",      ref.healingMessage),
  ].join("");

  const cmRows = [
    row("Case Officer",           cm.caseOfficer),
    row("Immediate Actions",      cm.immediateActions),
    row("Referral Partners",      cm.referralPartners),
    row("Risk Assessment",        cm.riskAssessment),
    row("Confidentiality Level",  cm.confidentialityLevel),
    row("Internal Notes",         cm.notes),
  ].join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Case ${incident.caseRef} — R4H GBV Tool</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'DM Sans',sans-serif; background:#f5f5f5; color:#1a1a1a; padding:24px; }
    .page { max-width:800px; margin:0 auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#254252,#7bdcb5); padding:28px 32px; color:white; }
    .org { font-size:10px; opacity:0.7; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:4px; }
    .case-ref { font-family:monospace; font-size:22px; font-weight:700; color:#7bdcb5; margin-bottom:4px; }
    .title { font-size:14px; opacity:0.8; }
    .badges { display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; }
    .badge { padding:4px 14px; border-radius:20px; font-size:11px; font-weight:600; }
    .meta-bar { background:#f8f9fa; border-bottom:1px solid #eee; padding:12px 32px; display:flex; gap:24px; flex-wrap:wrap; }
    .meta-item { font-size:11px; }
    .meta-label { color:#999; margin-bottom:1px; }
    .meta-value { color:#1a1a1a; font-weight:500; }
    .body { padding:24px 32px; }
    .confidential { background:#FEF3C7; border:1px solid #F59E0B; border-radius:6px; padding:8px 12px; margin-bottom:20px; font-size:11px; color:#92400E; }
    .footer { padding:16px 32px; border-top:1px solid #eee; display:flex; justify-content:space-between; font-size:10px; color:#999; }
    @media print {
      body { background:white; padding:0; }
      .page { box-shadow:none; border-radius:0; }
      * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="org">Rights 4 Her Uganda — GBV Documentation Tool</div>
      <div class="case-ref">${incident.caseRef}</div>
      <div class="title">Incident Case Report</div>
      <div class="badges">
        <span class="badge" style="background:${urgencyColors[u] || "#666"}30;color:${urgencyColors[u] || "#666"};border:1px solid ${urgencyColors[u] || "#666"}50">${u || "Urgency not set"}</span>
        <span class="badge" style="background:${statusColors[s]}30;color:${statusColors[s]};border:1px solid ${statusColors[s]}50">${s}</span>
        ${cm.confidentialityLevel ? `<span class="badge" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3)">Confidentiality: ${cm.confidentialityLevel}</span>` : ""}
      </div>
    </div>

    <div class="meta-bar">
      <div class="meta-item"><div class="meta-label">Date Recorded</div><div class="meta-value">${fmtDateTime(incident.dateRecorded)}</div></div>
      <div class="meta-item"><div class="meta-label">District</div><div class="meta-value">${sur.district || "—"}</div></div>
      <div class="meta-item"><div class="meta-label">Sub-County</div><div class="meta-value">${sur.subCounty || "—"}</div></div>
      <div class="meta-item"><div class="meta-label">Case Officer</div><div class="meta-value">${cm.caseOfficer || "Unassigned"}</div></div>
      <div class="meta-item"><div class="meta-label">Exported</div><div class="meta-value">${now}</div></div>
    </div>

    <div class="body">
      <div class="confidential">🔒 <strong>Confidential</strong> — Contains sensitive survivor data. Handle in accordance with Rights 4 Her Uganda data protection policies.</div>

      ${section("Section 1 — Survivor Information", survivorRows)}
      ${section("Section 2 — Nature of Violation", incidentRows)}
      ${section("Section 3 — Context & Contributing Factors", contextRows)}
      ${section("Section 4 — Reporting & Response", reportingRows)}
      ${section("Section 5 — Current Needs", needsRows)}
      ${ref.communityConnection || ref.communitySafetyVision || ref.healingMessage ? section("Section 6 — Reflection & Healing", reflectionRows) : ""}
      ${cmRows.trim() ? section("Section 7 — Case Management (Internal)", cmRows) : ""}
    </div>

    <div class="footer">
      <span>Rights 4 Her Uganda — GBV Documentation Tool</span>
      <span>CONFIDENTIAL · ${incident.caseRef} · ${now}</span>
    </div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;
}
