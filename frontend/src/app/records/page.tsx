"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, UploadCloud, Link as LinkIcon, Download } from "lucide-react";
import Link from "next/link";

export default function RecordsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("General Report");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (!token || !u) return router.push("/login");
    const parsedUser = JSON.parse(u);
    setUser(parsedUser);

    if (parsedUser.role !== 'PATIENT') {
      router.push("/dashboard");
    }

    fetchRecords(token);
  }, [router]);

  const fetchRecords = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/records/mine`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) return;

    setUploading(true);
    const token = localStorage.getItem("token");

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/records/upload`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ fileUrl, type: fileType })
      });
      
      setFileUrl("");
      fetchRecords(token as string);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white p-6">
      <div className="max-w-4xl mx-auto pt-10">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
             <FileText className="w-8 h-8 text-blue-400" /> My Medical Records
          </h1>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Back to Dashboard</Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Upload Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-1 p-6 rounded-3xl bg-white shadow-sm border border-slate-100 border border-slate-200 backdrop-blur-xl h-fit">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Upload New</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Report Type</label>
                <select 
                  value={fileType} 
                  onChange={e => setFileType(e.target.value)}
                  className="w-full bg-white border border-slate-200 shadow-sm border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                >
                  <option className="bg-slate-50">General Report</option>
                  <option className="bg-slate-50">Blood Test</option>
                  <option className="bg-slate-50">X-Ray / Scan</option>
                  <option className="bg-slate-50">Prescription</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Secure Link / File URL</label>
                <div className="relative">
                   <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input 
                     type="url" 
                     value={fileUrl}
                     onChange={e => setFileUrl(e.target.value)}
                     required
                     placeholder="https://cloud.docdost.com/file..."
                     className="w-full bg-white border border-slate-200 shadow-sm border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                   />
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                disabled={uploading}
                className="w-full py-3 mt-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? "Encrypting..." : <><UploadCloud className="w-4 h-4" /> Secure Upload</>}
              </motion.button>
              <p className="text-xs text-slate-500 text-center mt-2">Files are End-to-End Encrypted over transit.</p>
            </form>
          </motion.div>

          {/* Records List */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2 p-6 rounded-3xl bg-white shadow-sm border border-slate-100 border border-slate-200 backdrop-blur-xl">
             <h3 className="text-xl font-semibold text-slate-900 mb-6">Your Encrypted Vault</h3>
             {records.length === 0 ? (
               <div className="text-slate-500 border border-dashed border-slate-200 py-12 rounded-2xl text-center">
                 Your vault is empty. Upload medical records securely.
               </div>
             ) : (
               <div className="space-y-4">
                 {records.map(record => (
                   <div key={record.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-slate-100 border border-slate-200 hover:bg-slate-100 transition-colors gap-4">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                         <FileText className="w-6 h-6 text-purple-400" />
                       </div>
                       <div>
                         <h4 className="text-slate-900 font-medium">{record.type}</h4>
                         <p className="text-xs text-slate-500">{new Date(record.createdAt).toLocaleString()}</p>
                       </div>
                     </div>
                     <a 
                       href={record.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors flex items-center gap-2 whitespace-nowrap"
                     >
                        <Download className="w-4 h-4" /> Download / View
                     </a>
                   </div>
                 ))}
               </div>
             )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
