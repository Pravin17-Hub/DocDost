"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, User as UserIcon, Clock, CheckCircle } from "lucide-react";
import Link from 'next/link';

export default function BookAppointment() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/doctors`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
       setDoctors(data);
       setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [router]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !date || !time) return;

    setError("");
    const token = localStorage.getItem("token");
    const dateTime = new Date(`${date}T${time}`).toISOString();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/book`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ doctorId: selectedDoctor, time: dateTime })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to book");

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-slate-900">Loading doctors...</div>;

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
          <h2 className="text-3xl font-bold mb-2">Appointment Booked!</h2>
          <p className="text-slate-600">Your appointment has been successfully scheduled.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white p-6">
      <div className="max-w-4xl mx-auto pt-10">
        <div className="flex items-center justify-between mb-10">
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Book an Appointment</h1>
           <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">Back to Dashboard</Link>
        </div>

        {error && <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">{error}</div>}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-8 rounded-3xl bg-white shadow-sm border border-slate-100 border border-slate-200 backdrop-blur-xl">
            <form onSubmit={handleBook} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Select Doctor</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <select 
                    value={selectedDoctor}
                    onChange={e => setSelectedDoctor(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 shadow-sm border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                  >
                    <option value="" className="bg-slate-50 text-slate-500">Choose a specialist...</option>
                    {doctors.map((doc: any) => (
                      <option key={doc.id} value={doc.id} className="bg-slate-50">Dr. {doc.user?.name || doc.specialization} - {doc.specialization}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-blue-400" /> Date</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() + i + 1); // start from tomorrow
                    const dateStr = d.toISOString().split('T')[0];
                    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
                    const dateNum = d.getDate();
                    
                    return (
                      <div 
                        key={dateStr}
                        onClick={() => setDate(dateStr)}
                        className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${date === dateStr ? 'bg-blue-600 border border-blue-400 text-slate-900 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white border border-slate-200 shadow-sm border border-slate-200 text-slate-600 hover:border-white/30'}`}
                      >
                         <span className="text-xs font-medium uppercase">{dayLabel}</span>
                         <span className="text-lg font-bold mt-1">{dateNum}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {date && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> Time</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "15:00", "16:00", "16:30"].map(t => (
                      <div 
                        key={t}
                        onClick={() => setTime(t)}
                        className={`py-3 rounded-xl text-center text-sm cursor-pointer transition-all ${time === t ? 'bg-blue-600 text-slate-900 font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white border border-slate-200 shadow-sm border border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-4 mt-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold transition-all">
                Confirm Booking
              </motion.button>
            </form>
          </motion.div>

          {/* Info Side */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:flex flex-col justify-center space-y-6">
             <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
               <h3 className="text-lg font-semibold text-blue-400 mb-2">Smart Scheduling</h3>
               <p className="text-slate-600 text-sm leading-relaxed">Our AI ensures you are booking optimal slots without conflict. Connect with top-tier specialists instantly securely and privately.</p>
             </div>
             <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20">
               <h3 className="text-lg font-semibold text-purple-400 mb-2">Telemedicine Ready</h3>
               <p className="text-slate-600 text-sm leading-relaxed">Your scheduled appointments can trigger live secure WebRTC video consultations straight from your dashboard.</p>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
