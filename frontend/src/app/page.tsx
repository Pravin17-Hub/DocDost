"use client";

import { motion } from "framer-motion";
import { Activity, CalendarHeart, FileText, HeartPulse, Video, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: CalendarHeart, title: "Smart Scheduling", desc: "AI-powered appointment scheduling with conflict detection." },
  { icon: Video, title: "Telemedicine", desc: "High-quality video consultations with real-time chat & prescriptions." },
  { icon: FileText, title: "Secure Records", desc: "End-to-end encrypted medical records accessible anywhere." },
  { icon: Cpu, title: "AI Health Assistant", desc: "Predictive health analytics and smart symptom checking." },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-blue-500" />
            <span className="font-bold text-xl tracking-tight text-slate-900">DocDost</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-900/70 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl text-center space-y-8 relative z-10 py-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border border-slate-100 border border-slate-200 text-sm text-blue-400 mb-4 backdrop-blur-md">
            <Activity className="w-4 h-4" />
            <span>The Future of Healthcare is Here</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-blue-600 drop-shadow-sm">
            Intelligent Care, <br /> Seamlessly Connected.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Experience next-generation healthcare with AI-powered telemedicine, secure records, and smart appointment matching to top-tier specialists.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
            >
              Book Consultation <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white shadow-sm border border-slate-100 hover:bg-slate-100 border border-slate-200 text-slate-900 font-semibold flex items-center justify-center gap-2 backdrop-blur-md transition-all"
            >
              <ShieldCheck className="w-5 h-5 text-blue-400" /> Are you a doctor?
            </motion.button>
          </div>
        </motion.div>

        {/* Features Grid using Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mt-12 relative z-10"
        >
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 border border-slate-200 backdrop-blur-lg hover:bg-slate-100 transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
