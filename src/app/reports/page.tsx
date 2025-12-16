import DashboardLayout from "@/components/DashboardLayout";
import { requireAdmin } from "@/lib/auth-helpers";
import ReportsContent from "./ReportsContent";

export default async function ReportsPage() {
  await requireAdmin();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
        <p className="text-gray-600 mt-1">Detaylı analiz ve istatistikler</p>
      </div>
      <ReportsContent />
    </DashboardLayout>
  );
}

