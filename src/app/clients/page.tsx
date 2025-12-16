import DashboardLayout from "@/components/DashboardLayout";
import { requireAdmin } from "@/lib/auth-helpers";
import ClientsContent from "./ClientsContent";

export default async function ClientsPage() {
  await requireAdmin();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Müşteriler</h1>
        <p className="text-gray-600 mt-1">Müşteri yönetimi ve takibi</p>
      </div>
      <ClientsContent />
    </DashboardLayout>
  );
}

