"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SuccessContent() {
  const ref = useSearchParams().get("ref");
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "linear-gradient(160deg,#7bdcb5 0%,#254252 100%)" }}>
      <div className="max-w-md mx-auto animate-[fadeIn_0.6s_ease-in-out]">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-white/20" style={{ background: "rgba(212,168,83,0.2)" }}>
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="#D4A853" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display',serif" }}>Report Submitted</h1>
        <p className="text-white/75 text-base mb-6 leading-relaxed">
          Thank you for trusting us. Your report has been securely received and will be reviewed by our team.
        </p>
        {ref && (
          <div className="rounded-2xl p-5 mb-6 border border-white/15" style={{ background: "rgba(255,255,255,0.1)" }}>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Your Case Reference Number</p>
            <p className="text-2xl font-bold text-white font-mono">{ref}</p>
            <p className="text-white/40 text-xs mt-2">Keep this number for your records when following up with us.</p>
          </div>
        )}
        <div className="space-y-3 text-left mb-8">
          {[
            ["🔒","Your report is encrypted and securely stored."],
            ["👩‍💼","A case officer will review your submission."],
            ["💜","If you consented to contact, we will reach out."],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-start gap-3">
              <span className="text-lg">{icon}</span>
              <p className="text-white/70 text-sm">{text}</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-2xl border border-white/10 text-left mb-6" style={{ background: "rgba(255,255,255,0.05)" }}>
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">If you need immediate help</p>
          <p className="text-white/70 text-sm"><a href="tel:116" className="text-white/90 font-semibold">116</a> — Uganda Police</p>
          <p className="text-white/70 text-sm mt-1"><a href="tel:0800199699" className="text-white/90 font-semibold">0800 199 699</a> — GBV Helpline (toll-free)</p>
        </div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Return to home
        </Link>
      </div>
    </main>
  );
}
