"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, ArrowRight, Lock, Mail, User, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [role, setRole] = useState("PATIENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, name, specialization: role === "DOCTOR" ? specialization : undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Redirect to login after successful registry
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden py-12">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-8 rounded-3xl bg-white shadow-sm border border-slate-100 border border-slate-200 backdrop-blur-xl relative z-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-transform">
              <HeartPulse className="w-8 h-8 text-blue-400" />
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-slate-600 mt-2 text-sm text-center">Join DocDost for a smarter healthcare experience</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Role Selector */}
        <div className="flex p-1 mb-8 rounded-xl bg-white border border-slate-200 shadow-sm border border-slate-200">
          <button 
            type="button"
            onClick={() => setRole("PATIENT")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === "PATIENT" ? "bg-slate-100 shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
          >
            Patient
          </button>
          <button 
            type="button"
            onClick={() => setRole("DOCTOR")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === "DOCTOR" ? "bg-slate-100 shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
          >
            Doctor
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 shadow-sm border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder={role === "DOCTOR" ? "Dr. John Doe" : "John Doe"}
              />
            </div>
          </div>

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
                placeholder="email@example.com"
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

          <AnimatePresence>
            {role === "DOCTOR" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-sm font-medium text-slate-700">Specialization</label>
                <div className="relative">
                  <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text" 
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required={role === "DOCTOR"}
                    className="w-full bg-white border border-slate-200 shadow-sm border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="e.g. Cardiologist"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-4 mt-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Creating account..." : <>Create Account <ArrowRight className="w-5 h-5" /></>}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 font-medium hover:underline hover:text-blue-300">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
