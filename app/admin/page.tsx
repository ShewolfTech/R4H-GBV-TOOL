"use client";
import { useState, Suspense } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const hasError = useSearchParams().get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(hasError ? "Invalid credentials. Please try again." : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.ok) { router.push("/admin/dashboard"); }
    else { setError("Invalid email or password."); setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(160deg,#7bdcb5 0%,#254252 100%)" }}>
      <div className="w-full max-w-sm animate-[fadeIn_0.5s_ease-in-out]">
        <div className="text-center mb-8 flex flex-col items-center gap-4">

          {/* Logo with overlay icon */}
          <div className="relative w-24 h-24">

            {/* Logo */}
            <Image
              src="/logo.jpg"
              alt="Rights 4 Her Uganda logo"
              fill
              className="object-cover rounded-xl"
            />

            {/* Floating lock icon */}
            <div
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border border-white/60 shadow-lg"
              style={{ background: "#731103" }}
            >
              <span className="text-lg">🔐</span>
            </div>

          </div>

          {/* Title */}
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display',serif" }}
          >
            Admin Login
          </h1>

          {/* Subtitle */}
          <p className="text-white/50 text-sm">
            Rights 4 Her Uganda — Case Management
          </p>

        </div>
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="form-input" placeholder="admin@rights4heruganda.org" autoComplete="email" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="form-input" placeholder="••••••••" autoComplete="current-password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white hover:opacity-90 disabled:opacity-60 transition-all"
              style={{ background: "linear-gradient(135deg,#7bdcb5,#000000)" }}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-5">Access restricted to authorized personnel only.</p>
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "linear-gradient(160deg,#7bdcb5,#254252)" }} />}>
      <LoginForm />
    </Suspense>
  );
}
