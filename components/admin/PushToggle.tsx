"use client";
import { useState, useEffect } from "react";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function PushToggle() {
  const [status, setStatus] = useState<"unsupported"|"denied"|"enabled"|"disabled">("disabled");
  const [loading, setLoading] = useState(false);

  useEffect(() => { checkStatus(); }, []);

  async function checkStatus() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) { setStatus("unsupported"); return; }
    if (Notification.permission === "denied") { setStatus("denied"); return; }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    setStatus(sub ? "enabled" : "disabled");
  }

  async function enable() {
    setLoading(true);
    try {
      await navigator.serviceWorker.register("/sw-push.js");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setStatus("denied"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      await fetch("/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) });
      setStatus("enabled");
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function disable() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
        await sub.unsubscribe();
      }
      setStatus("disabled");
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (status === "unsupported") return null;

  return (
    <div>
      {status === "denied" && <span className="text-xs text-orange-500">Notifications blocked in browser settings</span>}
      {status === "enabled" && (
        <button onClick={disable} disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulseSoft_2s_infinite]"/>
          {loading ? "Updating..." : "Notifications On"}
        </button>
      )}
      {status === "disabled" && (
        <button onClick={enable} disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-60">
          🔔 {loading ? "Enabling..." : "Enable Notifications"}
        </button>
      )}
    </div>
  );
}
