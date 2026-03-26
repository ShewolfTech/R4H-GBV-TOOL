import webpush from "web-push";
import connectDB from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";

webpush.setVapidDetails(
  "https://rights4heruganda.org",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface PushPayload {
  caseRef:      string;
  urgency:      string;
  district:     string;
  incidentId:   string;
}

export async function sendPushNotifications(payload: PushPayload) {
  await connectDB();
  const subscriptions = await PushSubscription.find({});
  if (!subscriptions.length) return;

  const body = JSON.stringify({
    title: `New Incident — ${payload.urgency}`,
    body:  `${payload.caseRef} · ${payload.district || "Location not specified"}`,
    url:   `/admin/cases/${payload.incidentId}`,
    urgency: payload.urgency,
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, body)
    )
  );

  // Remove expired / invalid subscriptions automatically
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "rejected") {
      const err = r.reason as any;
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        await PushSubscription.deleteOne({ endpoint: subscriptions[i].endpoint });
      }
    }
  }
}
