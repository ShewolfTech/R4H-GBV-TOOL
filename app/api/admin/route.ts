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
  const page      = parseInt(searchParams.get("page")  || "1");
  const limit     = parseInt(searchParams.get("limit") || "20");

  const query: any = {};
  if (status    !== "all") query.status = status;
  if (urgency   !== "all") query["needs.urgencyLevel"]  = urgency;
  if (district  !== "all") query["survivor.district"]   = district;
  if (subCounty !== "all") query["survivor.subCounty"]  = subCounty;
  if (search) {
    query.$or = [
      { caseRef:                  { $regex: search, $options: "i" } },
      { "survivor.preferredName": { $regex: search, $options: "i" } },
      { "survivor.district":      { $regex: search, $options: "i" } },
    ];
  }

  const total     = await Incident.countDocuments(query);
  const incidents = await Incident.find(query)
    .sort({ dateRecorded: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select("caseRef dateRecorded status needs.urgencyLevel survivor.district survivor.subCounty incident.violenceTypes caseManagement.caseOfficer");

  return NextResponse.json({ incidents, total, page, pages: Math.ceil(total / limit) });
}
