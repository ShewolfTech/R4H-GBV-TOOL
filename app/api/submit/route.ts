import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Incident from "@/models/Incident";
import { generateCaseRef } from "@/lib/constants";
import { sendPushNotifications } from "@/lib/push";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const caseRef = generateCaseRef();

    const incident = await Incident.create({
      caseRef,
      dateRecorded: new Date(),
      status:       "Open",
      survivor:     body.survivor     || {},
      incident:     body.incident     || {},
      context:      body.context      || {},
      reporting:    body.reporting    || {},
      needs:        body.needs        || {},
      reflection:   body.reflection   || {},
      caseManagement: {},
    });

    // Fire push notification non-blocking — never delay the form response
    sendPushNotifications({
      caseRef,
      urgency:    body.needs?.urgencyLevel || "Unknown",
      district:   body.survivor?.district  || "Not specified",
      incidentId: incident._id.toString(),
    }).catch((err) => console.error("Push error:", err));

    return NextResponse.json({ success: true, caseRef, id: incident._id }, { status: 201 });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ success: false, error: "Submission failed. Please try again." }, { status: 500 });
  }
}
