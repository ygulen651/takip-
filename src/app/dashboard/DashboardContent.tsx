"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface DashboardData {
  overdueTasks: any[];
  completedThisWeek: number;
  paymentSummary: {
    totalUnpaid: number;
    pendingTasksCount: number;
  } | null;
  statusBreakdown: any[];
}

export default function DashboardContent({ isAdmin }: { isAdmin: boolean }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Veri alınamadı");
      const data = await res.json();
      setData(data);
    } catch (error) {
      toast.error("Dashboard verileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Yükleniyor...</div>;
  }

  if (!data) {
    return <div className="text-center py-12">Veri yüklenemedi</div>;
  }

  const statusLabels: Record<string, string> = {
    BACKLOG: "Beklemede",
    IN_PROGRESS: "Devam Ediyor",
    REVIEW: "İncelemede",
    DONE: "Tamamlandı",
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600">
            Bu Hafta Tamamlanan
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {data.completedThisWeek}
          </p>
        </div>

        {isAdmin && data.paymentSummary && (
          <>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600">
                Bekleyen Ödeme
              </h3>
              <p className="text-3xl font-bold text-red-600 mt-2">
                ₺{data.paymentSummary.totalUnpaid.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600">
                Ödeme Bekleyen Görev
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.paymentSummary.pendingTasksCount}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Status Breakdown */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Görev Durumu
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.statusBreakdown.map((item) => (
            <div key={item._id} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {statusLabels[item._id] || item._id}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {item.count}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Overdue Tasks */}
      {data.overdueTasks.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Geciken Görevler ({data.overdueTasks.length})
          </h2>
          <div className="space-y-3">
            {data.overdueTasks.map((task) => (
              <Link
                key={task._id}
                href={`/tasks/${task._id}`}
                className="block p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {task.projectId?.name}
                    </p>
                    {task.assigneeId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Atanan: {task.assigneeId.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`badge badge-status-${task.status}`}>
                      {statusLabels[task.status]}
                    </span>
                    {task.dueDate && (
                      <p className="text-xs text-red-600 mt-2">
                        Son: {format(new Date(task.dueDate), "dd MMM yyyy", { locale: tr })}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

