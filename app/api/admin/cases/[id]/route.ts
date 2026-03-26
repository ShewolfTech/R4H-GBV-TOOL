import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Incident from "@/models/Incident";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const incident = await Incident.findById(params.id);
  if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ incident });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const incident = await Incident.findByIdAndUpdate(params.id, { $set: body }, { new: true });
  if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, incident });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const incident = await Incident.findByIdAndDelete(params.id);
  if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
