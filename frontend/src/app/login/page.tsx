"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HeartPulse, ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [mfaCode, setMfaCode] = useState("");
  const [showMfa, setShowMfa] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: any = { email, password };
      if (showMfa) {
        payload.mfaCode = mfaCode;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (data.requiresMfa) {
        setShowMfa(true);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white shadow-sm border border-slate-100 border border-slate-200 backdrop-blur-xl relative z-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-transform">
              <HeartPulse className="w-8 h-8 text-blue-400" />
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-600 mt-2 text-sm">Sign in to access your DocDost account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {!showMfa ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 shadow-sm border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="doctor@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 shadow-sm border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Multi-Factor Authentication</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 shadow-sm border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-center tracking-[0.5em] text-lg font-mono"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-center text-slate-500 mt-2 hover:text-slate-600 transition-colors cursor-pointer">
                Enter your 6-digit authenticator code.
              </p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-4 mt-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (showMfa ? "Verifying..." : "Signing in...") : (showMfa ? <>Verify <ArrowRight className="w-5 h-5" /></> : <>Sign In <ArrowRight className="w-5 h-5" /></>)}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-400 font-medium hover:underline hover:text-blue-300">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
