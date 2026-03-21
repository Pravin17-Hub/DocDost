"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse,
  ArrowRight,
  Lock,
  Mail,
  User,
  Stethoscope,
} from "lucide-react";
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            name,
            role, // ✅ FIXED (dynamic role)
            specialization:
              role === "DOCTOR" ? specialization : undefined, // ✅ only for doctor
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // ✅ Redirect to login after success
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden py-12">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg p-8 rounded-3xl bg-white shadow-xl border border-slate-200"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition">
              <HeartPulse className="w-8 h-8 text-blue-400" />
            </div>
          </Link>

          <h2 className="text-3xl font-bold text-slate-900">
            Create Account
          </h2>
          <p className="text-slate-600 mt-2 text-sm text-center">
            Join DocDost for a smarter healthcare experience
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* ROLE SELECT */}
        <div className="flex p-1 mb-8 rounded-xl bg-white border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setRole("PATIENT")}
            className={`flex-1 py-2 rounded-lg ${
              role === "PATIENT"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500"
            }`}
          >
            Patient
          </button>

          <button
            type="button"
            onClick={() => setRole("DOCTOR")}
            className={`flex-1 py-2 rounded-lg ${
              role === "DOCTOR"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500"
            }`}
          >
            Doctor
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* NAME */}
          <div>
            <label className="text-sm text-slate-700">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 p-3 rounded-xl border border-slate-200"
                placeholder={
                  role === "DOCTOR" ? "Dr. John Doe" : "John Doe"
                }
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm text-slate-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 p-3 rounded-xl border border-slate-200"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 p-3 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          {/* DOCTOR FIELD */}
          <AnimatePresence>
            {role === "DOCTOR" && (
              <motion.div>
                <label className="text-sm text-slate-700">
                  Specialization
                </label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full pl-10 p-3 rounded-xl border border-slate-200"
                    placeholder="e.g. Cardiologist"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl flex justify-center gap-2"
          >
            {loading ? "Creating..." : "Create Account"}
            <ArrowRight />
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}