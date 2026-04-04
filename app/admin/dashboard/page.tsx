"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import PushToggle from "@/components/admin/PushToggle";
import { UGANDA_DISTRICTS } from "@/lib/constants";

const URGENCY_CLS: Record<string,string> = { Emergency:"badge-emergency", High:"badge-high", Medium:"badge-medium", Low:"badge-low" };
const STATUS_CLS:  Record<string,string> = { Open:"status-open", Referred:"status-referred", Closed:"status-closed" };

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows]           = useState<any[]>([]);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [loading, setLoading]     = useState(true);
  const [exporting, setExporting] = useState(false);

  const [statusF,    setStatusF]    = useState("all");
  const [urgencyF,   setUrgencyF]   = useState("all");
  const [districtF,  setDistrictF]  = useState("all");
  const [subCountyF, setSubCountyF] = useState("all");
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);

  const subCountyOptions = districtF !== "all" ? (UGANDA_DISTRICTS[districtF] || []) : [];

  useEffect(() => { if (status === "unauthenticated") router.push("/admin"); }, [status]);
  useEffect(() => { if (status === "authenticated") fetchRows(); }, [statusF, urgencyF, districtF, subCountyF, search, page, status]);
  useEffect(() => { setSubCountyF("all"); setPage(1); }, [districtF]);

  async function fetchRows() {
    setLoading(true);
    const p = new URLSearchParams({ status: statusF, urgency: urgencyF, district: districtF, subCounty: subCountyF, search, page: String(page), limit: "20" });
    const res  = await fetch(`/api/admin?${p}`);
    const data = await res.json();
    setRows(data.incidents || []); setTotal(data.total || 0); setPages(data.pages || 1);
    setLoading(false);
  }

  function handleExport() {
    setExporting(true);
    const p = new URLSearchParams({ status: statusF, urgency: urgencyF, district: districtF, subCounty: subCountyF, search });
    window.open(`/api/admin/export?${p}`, "_blank");
    setTimeout(() => setExporting(false), 2000);
  }

  const stats = [
    { label: "Total",    value: total,                                             color: "#254252" },
    { label: "Open",     value: rows.filter(r => r.status === "Open").length,     color: "#2563EB" },
    { label: "Referred", value: rows.filter(r => r.status === "Referred").length, color: "#7C3AED" },
    { label: "Closed",   value: rows.filter(r => r.status === "Closed").length,   color: "#6B7280" },
  ];

  const hasFilters = statusF !== "all" || urgencyF !== "all" || districtF !== "all" || subCountyF !== "all" || search;

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}><p className="text-gray-400 text-sm">Loading…</p></div>;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🌸</span>
            <div>
              <p className="text-xs text-gray-400">Rights 4 Her Uganda</p>
              <h1 className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display',serif" }}>GBV Case Management</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PushToggle />
            <span className="text-xs text-gray-500 hidden sm:block">{session?.user?.name}</span>
            <button onClick={() => signOut({ callbackUrl: "/admin" })} className="text-xs text-gray-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Sign out</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-4">
          <div className="flex flex-col gap-3">
            {/* Search + export */}
            <div className="flex gap-3">
              <input type="search" placeholder="Search by case ref, name, or district…"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="form-input flex-1" />
              <button onClick={handleExport} disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white whitespace-nowrap transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#254252,#7bdcb5)" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
                {exporting ? "Opening…" : "Export PDF"}
              </button>
            </div>

            {/* Filter dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} className="form-select">
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="Referred">Referred</option>
                <option value="Closed">Closed</option>
              </select>
              <select value={urgencyF} onChange={e => { setUrgencyF(e.target.value); setPage(1); }} className="form-select">
                <option value="all">All Urgency</option>
                <option value="Emergency">Emergency</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select value={districtF} onChange={e => { setDistrictF(e.target.value); setPage(1); }} className="form-select">
                <option value="all">All Districts</option>
                {Object.keys(UGANDA_DISTRICTS).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={subCountyF} onChange={e => { setSubCountyF(e.target.value); setPage(1); }}
                className="form-select" disabled={districtF === "all"}>
                <option value="all">{districtF === "all" ? "Select district first" : "All Sub-Counties"}</option>
                {subCountyOptions.map(sc => <option key={sc} value={sc}>{sc}</option>)}
              </select>
            </div>

            {/* Active filter pills */}
            {hasFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">Active filters:</span>
                {statusF    !== "all" && <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">Status: {statusF}</span>}
                {urgencyF   !== "all" && <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">Urgency: {urgencyF}</span>}
                {districtF  !== "all" && <span className="text-xs bg-teal-50 text-teal-600 border border-teal-200 px-2 py-0.5 rounded-full">District: {districtF}</span>}
                {subCountyF !== "all" && <span className="text-xs bg-teal-50 text-teal-600 border border-teal-200 px-2 py-0.5 rounded-full">Sub-County: {subCountyF}</span>}
                {search && <span className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">Search: {search}</span>}
                <button onClick={() => { setStatusF("all"); setUrgencyF("all"); setDistrictF("all"); setSubCountyF("all"); setSearch(""); setPage(1); }}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors ml-1">Clear all</button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Loading cases…</div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No cases found for the selected filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Case Ref</th><th>Date</th><th>District</th><th>Sub-County</th>
                    <th>Violence Type(s)</th><th>Urgency</th><th>Status</th><th>Officer</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row._id}>
                      <td><span className="font-mono text-xs font-semibold" style={{ color: "#7bdcb5" }}>{row.caseRef}</span></td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">{format(new Date(row.dateRecorded), "dd MMM yyyy")}</td>
                      <td className="text-xs">{row.survivor?.district || "—"}</td>
                      <td className="text-xs">{row.survivor?.subCounty || "—"}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {(row.incident?.violenceTypes || []).slice(0,2).map((t: string) => (
                            <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                          {(row.incident?.violenceTypes || []).length > 2 && (
                            <span className="text-xs text-gray-400">+{row.incident.violenceTypes.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td>{row.needs?.urgencyLevel ? <span className={`badge ${URGENCY_CLS[row.needs.urgencyLevel] || ""}`}>{row.needs.urgencyLevel}</span> : "—"}</td>
                      <td><span className={`badge ${STATUS_CLS[row.status] || ""}`}>{row.status}</span></td>
                      <td className="text-xs text-gray-500">{row.caseManagement?.caseOfficer || <span className="text-orange-400">Unassigned</span>}</td>
                      <td>
                        <Link href={`/admin/cases/${row._id}`} className="text-xs font-medium hover:opacity-70 whitespace-nowrap" style={{ color: "#7bdcb5" }}>
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && (
            <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400">Page {page} of {pages} · {total} total</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(p-1,1))} disabled={page===1} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Previous</button>
                <button onClick={() => setPage(p => Math.min(p+1,pages))} disabled={page===pages} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
