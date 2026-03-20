"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, BrainCircuit, Activity, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AIAssistant() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setResult(null);

    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/triage`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ symptoms })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white p-6">
      <div className="max-w-3xl mx-auto pt-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
             <Bot className="w-8 h-8 text-indigo-400" /> Smart Triage AI
          </h1>
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-3xl bg-white shadow-sm border border-slate-100 border border-slate-200 backdrop-blur-xl mb-8">
           <div className="flex items-start gap-4 mb-6">
             <div className="p-3 bg-indigo-500/20 rounded-2xl shrink-0">
               <BrainCircuit className="w-6 h-6 text-indigo-400" />
             </div>
             <div>
               <h3 className="text-lg font-semibold text-slate-900">How are you feeling today?</h3>
               <p className="text-sm text-slate-600 mt-1">
                 Describe your symptoms in detail. Our AI will analyze your condition, determine the urgency, and recommend the best course of action.
               </p>
             </div>
           </div>

           <form onSubmit={handleTriage} className="relative">
             <textarea 
               value={symptoms}
               onChange={e => setSymptoms(e.target.value)}
               placeholder="I have a headache, slight fever, and a cough since yesterday..."
               className="w-full h-32 bg-white border border-slate-200 shadow-sm border border-slate-200 rounded-2xl p-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
               required
             ></textarea>
             <button 
               type="submit" 
               disabled={loading || !symptoms.trim()}
               className="absolute bottom-4 right-4 p-3 bg-indigo-600 hover:bg-indigo-500 text-slate-900 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)] disabled:opacity-50 transition-all flex items-center justify-center"
             >
               {loading ? <Activity className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
             </button>
           </form>
           <p className="text-xs text-center text-slate-400 mt-4">
             AI Triage does not replace professional medical advice. For emergencies, contact local emergency services.
           </p>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100 border border-slate-200 backdrop-blur-xl"
            >
               <div className={`p-4 ${
                 result.urgency === 'CRITICAL' ? 'bg-red-500/20 border-b border-red-500/20' : 
                 result.urgency === 'MEDIUM' ? 'bg-orange-500/20 border-b border-orange-500/20' : 
                 'bg-green-500/20 border-b border-green-500/20'
               }`}>
                  <div className="flex items-center gap-2">
                    {result.urgency === 'CRITICAL' && <ShieldAlert className="w-5 h-5 text-red-500" />}
                    <span className={`text-sm font-bold tracking-wider ${
                      result.urgency === 'CRITICAL' ? 'text-red-500' : 
                      result.urgency === 'MEDIUM' ? 'text-orange-500' : 
                      'text-green-500'
                    }`}>
                      {result.urgency} URGENCY
                    </span>
                  </div>
               </div>
               <div className="p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{result.condition}</h2>
                  <p className="text-slate-600 mb-6">Recommended Department: <span className="text-slate-900 font-medium">{result.department}</span></p>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-700 uppercase tracking-widest">Action Plan</h3>
                    <ul className="space-y-3">
                      {result.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                          <p className="text-slate-700">{rec}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <Link href="/book-appointment" className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-slate-900 font-medium transition-colors">
                      Book Specialist Now
                    </Link>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
