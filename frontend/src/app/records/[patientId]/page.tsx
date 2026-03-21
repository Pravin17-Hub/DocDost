"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, Download, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PatientRecordsPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
      const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/records/patient/${patientId}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [patientId, router]);

  return (
    <div className="min-h-screen bg-white text-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white p-6">
      <div className="max-w-4xl mx-auto pt-10">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
            Patient Records
          </h1>
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 backdrop-blur-xl"
        >
          <h3 className="text-xl font-semibold text-slate-900 mb-6">
            Medical Vault Access
          </h3>

          {loading ? (
            <div className="text-slate-500">Loading patient data...</div>
          ) : records.length === 0 ? (
            <div className="text-slate-500 border border-dashed border-slate-200 py-12 rounded-2xl text-center">
              This patient has not uploaded any medical records yet.
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-slate-200 hover:bg-slate-100 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-slate-900 font-medium">
                        {record.type}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {new Date(record.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <a
                    href={record.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    Download / View
                  </a>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}