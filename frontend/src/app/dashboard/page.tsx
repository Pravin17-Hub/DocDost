"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from 'next/link';
import PatientDashboard from "../../components/dashboard/PatientDashboard";
import DoctorDashboard from "../../components/dashboard/DoctorDashboard";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      router.push("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return <div className="min-h-screen bg-white flex items-center justify-center text-slate-900">Loading...</div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-950 via-white to-white">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-white border border-slate-200 shadow-sm backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">DocDost Dashboard</h1>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-slate-900/70">
            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-slate-500" />
            </span>
            <span className="text-sm font-medium">{user.email.split('@')[0]}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">{user.role}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 mt-6">
        <AnimatePresence mode="wait">
           <motion.div 
             key={user.role}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.3 }}
           >
             {user.role === 'PATIENT' ? (
                <PatientDashboard user={user} />
             ) : user.role === 'DOCTOR' ? (
                <DoctorDashboard user={user} />
             ) : (
                <div className="text-slate-900">Admin Dashboard - Coming Soon</div>
             )}
           </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
