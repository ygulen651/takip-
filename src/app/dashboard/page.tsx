import DashboardLayout from "@/components/DashboardLayout";
import { requireAuth, isAdmin } from "@/lib/auth-helpers";
import DashboardContent from "./DashboardContent";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Hoş geldiniz, {user.name}</p>
      </div>

      <DashboardContent isAdmin={isAdmin(user)} />
    </DashboardLayout>
  );
}

