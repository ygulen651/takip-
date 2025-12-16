import DashboardLayout from "@/components/DashboardLayout";
import { requireAdmin } from "@/lib/auth-helpers";
import ProjectsContent from "./ProjectsContent";

export default async function ProjectsPage() {
  await requireAdmin();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Projeler</h1>
        <p className="text-gray-600 mt-1">Proje yönetimi ve takibi</p>
      </div>
      <ProjectsContent />
    </DashboardLayout>
  );
}

