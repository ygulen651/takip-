import DashboardLayout from "@/components/DashboardLayout";
import { requireAuth } from "@/lib/auth-helpers";
import MyTasksContent from "./MyTasksContent";

export default async function MyTasksPage() {
  await requireAuth();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Görevlerim</h1>
        <p className="text-gray-600 mt-1">Size atanan görevler ve başkalarına görev ekleyin</p>
      </div>
      <MyTasksContent />
    </DashboardLayout>
  );
}

