import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Incident from "@/models/Incident";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const status    = searchParams.get("status")    || "all";
  const urgency   = searchParams.get("urgency")   || "all";
  const district  = searchParams.get("district")  || "all";
  const subCounty = searchParams.get("subCounty") || "all";
  const search    = searchParams.get("search")    || "";

  const query: any = {};
  if (status    !== "all") query.status = status;
  if (urgency   !== "all") query["needs.urgencyLevel"] = urgency;
  if (district  !== "all") query["survivor.district"]  = district;
  if (subCounty !== "all") query["survivor.subCounty"] = subCounty;
  if (search) {
    query.$or = [
      { caseRef:                  { $regex: search, $options: "i" } },
      { "survivor.preferredName": { $regex: search, $options: "i" } },
      { "survivor.district":      { $regex: search, $options: "i" } },
    ];
  }

  const incidents = await Incident.find(query).sort({ dateRecorded: -1 }).limit(500);

  // Build filter description for the PDF header
  const filterParts: string[] = [];
  if (status    !== "all") filterParts.push(`Status: ${status}`);
  if (urgency   !== "all") filterParts.push(`Urgency: ${urgency}`);
  if (district  !== "all") filterParts.push(`District: ${district}`);
  if (subCounty !== "all") filterParts.push(`Sub-County: ${subCounty}`);
  if (search)               filterParts.push(`Search: "${search}"`);
  const filterDesc = filterParts.length ? filterParts.join("  |  ") : "All cases";

  const html = buildFilteredPDF(incidents, filterDesc);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Export-Count": String(incidents.length),
    },
  });
}

function fmt(date: any) {
  if (!date) return "—";
  try { return new Date(date).toLocaleDateString("en-UG", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "—"; }
}

function arr(val: any) {
  if (!val) return "—";
  if (Array.isArray(val)) return val.length ? val.join(", ") : "—";
  return String(val);
}

function urgencyColor(u: string) {
  const map: Record<string, string> = { Emergency: "#C0392B", High: "#E67E22", Medium: "#F39C12", Low: "#27AE60" };
  return map[u] || "#666";
}

function statusColor(s: string) {
  const map: Record<string, string> = { Open: "#2563EB", Referred: "#7C3AED", Closed: "#6B7280" };
  return map[s] || "#666";
}

function buildFilteredPDF(incidents: any[], filterDesc: string) {
  const rows = incidents.map((inc, i) => {
    const sur  = inc.survivor       || {};
    const viol = inc.incident       || {};
    const ned  = inc.needs          || {};
    const cm   = inc.caseManagement || {};
    const u    = ned.urgencyLevel   || "";
    const s    = inc.status         || "Open";

    return `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#f9f9f9"}">
        <td style="padding:8px 10px;font-family:monospace;font-size:11px;color:#7bdcb5;font-weight:600;white-space:nowrap">${inc.caseRef || "—"}</td>
        <td style="padding:8px 10px;font-size:11px;white-space:nowrap">${fmt(inc.dateRecorded)}</td>
        <td style="padding:8px 10px;font-size:11px">${sur.district || "—"}</td>
        <td style="padding:8px 10px;font-size:11px">${sur.subCounty || "—"}</td>
        <td style="padding:8px 10px;font-size:11px">${arr(viol.violenceTypes)}</td>
        <td style="padding:8px 10px;font-size:11px">
          <span style="background:${urgencyColor(u)}20;color:${urgencyColor(u)};border:1px solid ${urgencyColor(u)}40;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600">${u || "—"}</span>
        </td>
        <td style="padding:8px 10px;font-size:11px">
          <span style="background:${statusColor(s)}15;color:${statusColor(s)};border:1px solid ${statusColor(s)}30;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600">${s}</span>
        </td>
        <td style="padding:8px 10px;font-size:11px">${cm.caseOfficer || "—"}</td>
      </tr>`;
  }).join("");

  const now = new Date().toLocaleString("en-UG", { timeZone: "Africa/Kampala", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>R4H GBV Case Export</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'DM Sans',sans-serif; background:#fff; color:#1a1a1a; font-size:12px; }
    .header { background:linear-gradient(135deg,#254252,#7bdcb5); padding:28px 32px; color:white; }
    .header-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
    .org { font-size:11px; opacity:0.7; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:4px; }
    .title { font-size:22px; font-weight:700; font-family:Georgia,serif; }
    .meta { font-size:10px; opacity:0.7; margin-top:4px; }
    .filter-bar { background:rgba(255,255,255,0.15); border-radius:8px; padding:10px 14px; font-size:11px; }
    .filter-label { opacity:0.7; margin-bottom:4px; font-size:10px; text-transform:uppercase; letter-spacing:0.06em; }
    .filter-value { font-weight:600; }
    .stats { display:flex; gap:16px; padding:16px 32px; background:#f8f9fa; border-bottom:1px solid #eee; }
    .stat { text-align:center; }
    .stat-num { font-size:20px; font-weight:700; color:#254252; }
    .stat-label { font-size:10px; color:#888; margin-top:2px; }
    .table-wrap { padding:24px 32px; }
    table { width:100%; border-collapse:collapse; }
    th { background:#254252; color:white; text-align:left; padding:10px 10px; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
    tr:hover td { background:#f0faf7 !important; }
    .footer { padding:16px 32px; border-top:1px solid #eee; display:flex; justify-content:space-between; font-size:10px; color:#999; margin-top:8px; }
    .confidential { background:#FEF3C7; border:1px solid #F59E0B; border-radius:6px; padding:8px 12px; margin:0 32px 16px; font-size:11px; color:#92400E; }
    @media print {
      body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .no-print { display:none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-top">
      <div>
        <div class="org">Rights 4 Her Uganda</div>
        <div class="title">GBV Case Export Report</div>
        <div class="meta">Generated: ${now} · EAT (Africa/Kampala)</div>
      </div>
      <div style="text-align:right;font-size:11px;opacity:0.8">
        <div style="font-weight:600;font-size:16px">${incidents.length}</div>
        <div>case${incidents.length !== 1 ? "s" : ""} exported</div>
      </div>
    </div>
    <div class="filter-bar">
      <div class="filter-label">Active Filters</div>
      <div class="filter-value">${filterDesc}</div>
    </div>
  </div>

  <div class="confidential">
    🔒 <strong>Confidential</strong> — This document contains sensitive survivor data. Handle in accordance with Rights 4 Her Uganda data protection policies. Do not share externally.
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-num">${incidents.length}</div><div class="stat-label">Total</div></div>
    <div class="stat"><div class="stat-num">${incidents.filter((i:any) => i.status === "Open").length}</div><div class="stat-label">Open</div></div>
    <div class="stat"><div class="stat-num">${incidents.filter((i:any) => i.status === "Referred").length}</div><div class="stat-label">Referred</div></div>
    <div class="stat"><div class="stat-num">${incidents.filter((i:any) => i.status === "Closed").length}</div><div class="stat-label">Closed</div></div>
    <div class="stat"><div class="stat-num">${incidents.filter((i:any) => i.needs?.urgencyLevel === "Emergency").length}</div><div class="stat-label">Emergency</div></div>
    <div class="stat"><div class="stat-num">${incidents.filter((i:any) => i.needs?.urgencyLevel === "High").length}</div><div class="stat-label">High</div></div>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Case Ref</th>
          <th>Date</th>
          <th>District</th>
          <th>Sub-County</th>
          <th>Violence Type(s)</th>
          <th>Urgency</th>
          <th>Status</th>
          <th>Case Officer</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="8" style="padding:20px;text-align:center;color:#999">No cases match the selected filters.</td></tr>'}</tbody>
    </table>
  </div>

  <div class="footer">
    <span>Rights 4 Her Uganda — GBV Documentation Tool</span>
    <span>CONFIDENTIAL · ${now}</span>
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;
}
