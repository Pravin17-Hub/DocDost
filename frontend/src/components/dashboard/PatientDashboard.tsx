"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User as UserIcon, Activity, FileText } from "lucide-react";
import Link from 'next/link';

export default function PatientDashboard({ user }: { user: any }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/mine`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-xl hover:bg-indigo-500/20 transition-colors cursor-pointer">
          <Link href="/ai-assistant" className="flex items-center gap-4 w-full h-full">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400"><Activity className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-600">Smart Triage</p>
              <h3 className="text-lg font-bold text-slate-900">AI Health Assistant</h3>
            </div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-6 rounded-3xl bg-orange-500/10 border border-orange-500/20 backdrop-blur-xl hover:bg-orange-500/20 transition-colors cursor-pointer">
          <Link href="/records" className="flex items-center gap-4 w-full h-full">
            <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400"><FileText className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-600">Medical Vault</p>
              <h3 className="text-lg font-bold text-slate-900">View Records</h3>
            </div>
          </Link>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-3xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400"><Calendar className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-600">Upcoming Apps</p>
              <h3 className="text-2xl font-bold text-slate-900">{appointments.filter(a => new Date(a.time) > new Date()).length}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl">
           <Link href="/book-appointment" className="flex items-center justify-between w-full h-full group">
             <div>
               <p className="text-sm text-emerald-400/80 mb-1">Need a consultation?</p>
               <h3 className="text-xl font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">Book Now</h3>
             </div>
             <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30 transition-colors"><Calendar className="w-6 h-6" /></div>
           </Link>
        </motion.div>
      </div>

      {/* Appointments List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-8 rounded-3xl bg-white shadow-sm border border-slate-100 border border-slate-200 backdrop-blur-xl">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Your Appointments
        </h3>
        {loading ? (
          <div className="text-slate-500">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="text-slate-500 py-8 text-center border border-dashed border-slate-200 rounded-2xl">No appointments scheduled yet.</div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-slate-100 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-medium">Dr. {apt.doctor?.user?.name || "Specialist"}</h4>
                    <p className="text-sm text-slate-500">{new Date(apt.time).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/consultation/${apt.id}`} className="px-4 py-2 rounded-xl bg-blue-600/20 text-blue-400 text-sm hover:bg-blue-600/40 transition-colors">
                    Join Call
                  </Link>
                  <span className={`px-3 py-1 text-xs rounded-full ${apt.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
