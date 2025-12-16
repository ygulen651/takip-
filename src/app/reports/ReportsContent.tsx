"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { format, subMonths } from "date-fns";

interface ReportData {
  completedCount: number;
  totalPaid: number;
  totalUnpaid: number;
  paymentBreakdown: any[];
  topAssignees: any[];
}

export default function ReportsContent() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(
    format(subMonths(new Date(), 1), "yyyy-MM-dd")
  );
  const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);

      const res = await fetch(`/api/reports/summary?${params}`);
      if (!res.ok) throw new Error("Veri alınamadı");
      const reportData = await res.json();
      setData(reportData);
    } catch (error) {
      toast.error("Rapor yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const paymentStatusLabels: Record<string, string> = {
    PENDING: "Bekliyor",
    PARTIAL: "Kısmi",
    PAID: "Ödendi",
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Rapor Filtreleri
        </h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="label">Başlangıç Tarihi</label>
            <input
              type="date"
              className="input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Bitiş Tarihi</label>
            <input
              type="date"
              className="input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? "Yükleniyor..." : "Rapor Oluştur"}
            </button>
          </div>
        </div>
      </div>

      {data && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600">
                Tamamlanan Görevler
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.completedCount}
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600">
                Toplam Ödenen
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ₺{data.totalPaid.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600">
                Toplam Ödenmemiş
              </h3>
              <p className="text-3xl font-bold text-red-600 mt-2">
                ₺{data.totalUnpaid.toLocaleString("tr-TR")}
              </p>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ödeme Durumu Dağılımı
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">
                      Durum
                    </th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">
                      Görev Sayısı
                    </th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">
                      Toplam Tutar
                    </th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">
                      Ödenen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.paymentBreakdown.map((item) => (
                    <tr key={item._id} className="border-b">
                      <td className="py-2 px-3">
                        <span
                          className={`badge badge-payment-${item._id}`}
                        >
                          {paymentStatusLabels[item._id]}
                        </span>
                      </td>
                      <td className="text-right py-2 px-3">{item.count}</td>
                      <td className="text-right py-2 px-3">
                        ₺{item.totalPrice.toLocaleString("tr-TR")}
                      </td>
                      <td className="text-right py-2 px-3">
                        ₺{item.totalPaid.toLocaleString("tr-TR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Assignees */}
          {data.topAssignees.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                En Çok Görev Tamamlayan Çalışanlar
              </h2>
              <div className="space-y-3">
                {data.topAssignees.map((assignee, index) => (
                  <div
                    key={assignee._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {assignee.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {assignee.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {assignee.completedCount} görev
                      </p>
                      <p className="text-sm text-green-600">
                        ₺{assignee.totalEarned.toLocaleString("tr-TR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

