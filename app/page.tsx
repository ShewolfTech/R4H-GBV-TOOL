import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main
        className="min-h-screen flex flex-col"
        style={{
          background: `
      radial-gradient(circle at top left, rgba(29, 185, 84, 0.35), transparent 55%),
      radial-gradient(circle at top right, rgba(29, 185, 84, 0.35), transparent 55%),
      radial-gradient(circle at bottom left, rgba(29, 185, 84, 0.35), transparent 55%),
      radial-gradient(circle at bottom right, rgba(29, 185, 84, 0.35), transparent 55%),
      #000000
    `
        }}
      >
        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, #D4A853 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="max-w-md mx-auto animate-[fadeIn_0.6s_ease-in-out]">

            {/* Org mark */}
            <div className="mb-8 flex flex-col items-center gap-2">
              <div
                className="flex items-center justify-center overflow-hidden"
              >
                <Image
                  src="/logo.jpg"
                  alt="Rights 4 Her Uganda logo"
                  width={100}
                  height={100}
                  className="object-contain rounded-sm w-auto h-auto"
                />
              </div>

              <p className="text-white text-sm tracking-widest uppercase font-medium">
                Rights 4 <span className="text-red-500">Her</span> Uganda
              </p>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight" style={{ fontFamily: "'Playfair Display',serif" }}>
              You Are Not Alone
            </h1>

            <p className="text-white/80 text-base leading-relaxed mb-3">
              This is a safe, confidential space to document experiences of gender-based violence. Your report helps us provide support, advocate for justice, and protect others.
            </p>
            <p className="text-white/50 text-sm mb-8">
              All information is protected. You may remain anonymous. You are in control of what you share.
            </p>

            {/* Assurance pills */}
            <div className="flex justify-center gap-3 flex-wrap mb-10">
              {[["🔒", "Confidential"], ["👤", "Anonymous option"], ["💜", "Survivor-centred"]].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/80 border border-white/15" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <span>{icon}</span><span>{label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link href="/report"
              className="inline-flex items-center justify-center gap-2 w-full max-w-xs px-8 py-4 rounded-2xl font-semibold text-base shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg,#D4A853,#b8892e)", color: "#1a0800" }}>
              Report an Incident
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            {/* Helplines */}
            <div className="mt-8 p-4 rounded-2xl border border-white/10 text-left" style={{ background: "rgba(255,255,255,0.05)" }}>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">Emergency Helplines</p>
              <div className="space-y-1">
                <p className="text-white/70 text-sm"><a href="tel:116" className="text-white/90 font-semibold">116</a> — Uganda Police</p>
                <p className="text-white/70 text-sm"><a href="tel:0800199699" className="text-white/90 font-semibold">0800 199 699</a> — GBV Helpline (toll-free)</p>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="py-4 px-6 text-center text-xs" style={{ background: "#2a0918", color: "rgba(255,255,255,0.3)" }}>
        © {new Date().getFullYear()} Rights 4 Her Uganda · Confidential GBV Documentation Tool
      </div> */}
      </main>
      <footer
        className="py-4 px-6 text-center text-xs mt-auto"
        style={{
          background: "#000",
          color: "rgba(255, 255, 255, 0.6)"
        }}
      >
        © {new Date().getFullYear()} Rights 4 Her Uganda · Confidential GBV Documentation Tool
      </footer>
    </div>
  );
}
