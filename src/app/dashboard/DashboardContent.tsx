"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
  TrendingUp, AlertCircle, CheckCircle2, Clock, Sparkles,
  ArrowUpRight, DollarSign, Briefcase
} from "lucide-react";

interface DashboardData {
  overdueTasks: any[];
  completedThisWeek: number;
  paymentSummary: {
    totalUnpaid: number;
    pendingTasksCount: number;
  } | null;
  statusBreakdown: any[];
}

const COLORS = ["#6366f1", "#f59e0b", "#3b82f6", "#10b981"];

export default function DashboardContent({ isAdmin }: { isAdmin: boolean }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Veri alınamadı");
      const data = await res.json();
      setData(data);
      if (data) fetchAiSummary(data);
    } catch (error) {
      toast.error("Dashboard verileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiSummary = async (dashboardData: any) => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dashboardData }),
      });
      const result = await res.json();

      if (!res.ok) {
        setAiSummary(result.error || result.summary || "AI özeti alınamadı.");
      } else {
        setAiSummary(result.summary || "AI özeti boş döndü.");
      }
    } catch (error) {
      console.error("AI Fetch Error:", error);
      setAiSummary("Bağlantı hatası: AI servisine ulaşılamadı.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const chartData = data.statusBreakdown.map((item, index) => ({
    name: item._id === "BACKLOG" ? "Beklemede" : item._id === "IN_PROGRESS" ? "Devam" : item._id === "REVIEW" ? "İnceleme" : "Tamam",
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight"> Hoş Geldiniz! 👋 </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium"> İşte bugünkü genel durum ve veriler </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fetchDashboard()} className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-dark-card dark:hover:bg-dark-card/80 text-gray-500 transition-all border border-gray-100 dark:border-dark-border">
            <TrendingUp size={20} />
          </button>
        </div>
      </div>

      {/* AI Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card bg-gradient-to-br from-primary-600/5 to-blue-500/5 border-primary-100 dark:border-primary-900/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
            <Sparkles size={20} />
          </div>
          <h3 className="font-black text-gray-900 dark:text-gray-100">AI Asistan Özeti</h3>
        </div>

        {isAiLoading ? (
          <div className="flex items-center gap-2 p-4">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed">
            {aiSummary || "Analiz yapılıyor..."}
          </div>
        )}
      </motion.div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<CheckCircle2 className="text-emerald-500" />}
          label="Tamamlanan"
          value={data.completedThisWeek}
          subValue="Bu Hafta"
          color="emerald"
        />
        {isAdmin && data.paymentSummary && (
          <StatCard
            icon={<DollarSign className="text-rose-500" />}
            label="Bekleyen Ödeme"
            value={`₺${data.paymentSummary.totalUnpaid.toLocaleString("tr-TR")}`}
            subValue={`${data.paymentSummary.pendingTasksCount} Görev`}
            color="rose"
          />
        )}
        <StatCard
          icon={<Briefcase className="text-blue-500" />}
          label="Aktif Projeler"
          value={data.overdueTasks.length}
          subValue="Geciken Görev"
          color="blue"
        />
        <StatCard
          icon={<Clock className="text-amber-500" />}
          label="Bekleyen"
          value={data.statusBreakdown.find(s => s._id === "BACKLOG")?.count || 0}
          subValue="Yeni Görev"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Card */}
        <div className="lg:col-span-2 premium-card">
          <h3 className="font-black text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-500" />
            Görev Dağılımı Analizi
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    padding: "12px"
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="premium-card overflow-hidden">
          <h3 className="font-black text-gray-900 dark:text-gray-100 mb-6">İş Yükü Dağılımı</h3>
          <div className="space-y-4">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border group hover:border-primary-500 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="text-sm font-black text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Tamamlanma Oranı</span>
              <span className="text-xs font-black text-emerald-600">
                %{Math.round((data.statusBreakdown.find(s => s._id === "DONE")?.count || 0) / (data.statusBreakdown.reduce((a, b) => a + b.count, 0) || 1) * 100)}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-dark-border h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(data.statusBreakdown.find(s => s._id === "DONE")?.count || 0) / (data.statusBreakdown.reduce((a, b) => a + b.count, 0) || 1) * 100}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="premium-card group cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-${color}-50 dark:bg-${color}-900/10 transition-colors group-hover:bg-${color}-100 dark:group-hover:bg-${color}-900/20`}>
          {icon}
        </div>
        <ArrowUpRight className="text-gray-300 group-hover:text-primary-500 transition-colors" size={18} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1"> {label} </p>
        <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight"> {value} </p>
        <p className={`text-[11px] font-bold mt-2 text-${color}-600 dark:text-${color}-400`}> {subValue} </p>
      </div>
    </motion.div>
  );
}
