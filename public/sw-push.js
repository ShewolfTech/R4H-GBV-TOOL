// Service Worker — handles push notifications when app is closed or in background

self.addEventListener("push", event => {
  if (!event.data) return;
  const { title, body, url, urgency } = event.data.json();
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:  "/icon-192.png",
      badge: "/icon-192.png",
      tag:   "gbv-incident",
      renotify: true,
      requireInteraction: urgency === "Emergency" || urgency === "High",
      data: { url },
      actions: [
        { action: "view",    title: "View Case" },
        { action: "dismiss", title: "Dismiss"   },
      ],
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const url = event.notification.data?.url || "/admin/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(self.location.origin + url);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
