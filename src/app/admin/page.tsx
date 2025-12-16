import DashboardLayout from "@/components/DashboardLayout";
import { requireAdmin } from "@/lib/auth-helpers";
import AdminContent from "./AdminContent";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Paneli</h1>
        <p className="text-gray-600 mt-1">Kullanıcı yönetimi ve sistem ayarları</p>
      </div>
      <AdminContent />
    </DashboardLayout>
  );
}

