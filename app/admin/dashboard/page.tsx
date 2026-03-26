"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import PushToggle from "@/components/admin/PushToggle";

const URGENCY_CLS: Record<string,string> = { Emergency:"badge-emergency", High:"badge-high", Medium:"badge-medium", Low:"badge-low" };
const STATUS_CLS:  Record<string,string> = { Open:"status-open", Referred:"status-referred", Closed:"status-closed" };

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows]         = useState<any[]>([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [statusF, setStatusF]   = useState("all");
  const [urgencyF, setUrgencyF] = useState("all");
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);

  useEffect(() => { if (status === "unauthenticated") router.push("/admin"); }, [status]);
  useEffect(() => { if (status === "authenticated") fetchRows(); }, [statusF, urgencyF, search, page, status]);

  async function fetchRows() {
    setLoading(true);
    const p = new URLSearchParams({ status: statusF, urgency: urgencyF, search, page: String(page), limit: "20" });
    const res = await fetch(`/api/admin?${p}`);
    const data = await res.json();
    setRows(data.incidents || []); setTotal(data.total || 0); setPages(data.pages || 1);
    setLoading(false);
  }

  const stats = [
    { label: "Total", value: total, color: "#7bdcb5" },
    { label: "Open", value: rows.filter(r => r.status === "Open").length, color: "#2563EB" },
    { label: "Referred", value: rows.filter(r => r.status === "Referred").length, color: "#7C3AED" },
    { label: "Closed", value: rows.filter(r => r.status === "Closed").length, color: "#6B7280" },
  ];

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}><p className="text-gray-400 text-sm">Loading…</p></div>;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
          <Image
                  src="/logo.jpg"
                  alt="Rights 4 Her Uganda logo"
                  width={70}
                  height={70}
                  className="object-contain rounded-sm"
                />
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
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="search" placeholder="Search by case ref, name, or district…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="form-input flex-1" />
            <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} className="form-select sm:w-36">
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="Referred">Referred</option>
              <option value="Closed">Closed</option>
            </select>
            <select value={urgencyF} onChange={e => { setUrgencyF(e.target.value); setPage(1); }} className="form-select sm:w-40">
              <option value="all">All Urgency</option>
              <option value="Emergency">Emergency</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Loading cases…</div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No cases found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Case Ref</th><th>Date</th><th>District</th>
                    <th>Violence Type(s)</th><th>Urgency</th><th>Status</th>
                    <th>Officer</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row._id}>
                      <td><span className="font-mono text-xs font-semibold text-primary-500">{row.caseRef}</span></td>
                      <td className="text-xs text-gray-500">{format(new Date(row.dateRecorded), "dd MMM yyyy")}</td>
                      <td className="text-xs">{row.survivor?.district || "—"}</td>
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
                        <Link href={`/admin/cases/${row._id}`} className="text-xs font-medium text-primary-500 hover:text-primary-700 whitespace-nowrap">
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
