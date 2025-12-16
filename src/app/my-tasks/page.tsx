import DashboardLayout from "@/components/DashboardLayout";
import { requireAuth, isAdmin } from "@/lib/auth-helpers";
import MyTasksContent from "./MyTasksContent";

export default async function MyTasksPage() {
  const user = await requireAuth();
  const userIsAdmin = isAdmin(user);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Görevlerim</h1>
        <p className="text-gray-600 mt-1">
          {userIsAdmin ? "Tüm görevler ve görev ekleme" : "Size atanan görevler"}
        </p>
      </div>
      <MyTasksContent isAdmin={userIsAdmin} />
    </DashboardLayout>
  );
}

