import DashboardLayout from "@/components/DashboardLayout";
import { requireAdmin } from "@/lib/auth-helpers";
import TasksContent from "./TasksContent";

export default async function TasksPage() {
  await requireAdmin();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Görevler</h1>
        <p className="text-gray-600 mt-1">Tüm görevleri yönetin</p>
      </div>
      <TasksContent isAdmin={true} />
    </DashboardLayout>
  );
}

