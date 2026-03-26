import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const sub = await req.json();

  await PushSubscription.findOneAndUpdate(
    { endpoint: sub.endpoint },
    { endpoint: sub.endpoint, keys: sub.keys },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { endpoint } = await req.json();
  await PushSubscription.deleteOne({ endpoint });

  return NextResponse.json({ success: true });
}
