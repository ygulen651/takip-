"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Project {
  _id: string;
  name: string;
  clientId: { _id: string; name: string; email?: string };
  status: "ACTIVE" | "DONE";
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface Client {
  _id: string;
  name: string;
}

export default function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    status: "ACTIVE" as "ACTIVE" | "DONE",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, clientsRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/clients"),
      ]);

      if (!projectsRes.ok || !clientsRes.ok) throw new Error("Veri alınamadı");

      const projectsData = await projectsRes.json();
      const clientsData = await clientsRes.json();

      setProjects(projectsData);
      setClients(clientsData);
    } catch (error) {
      toast.error("Veriler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingProject
        ? `/api/projects/${editingProject._id}`
        : "/api/projects";
      const method = editingProject ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("İşlem başarısız");

      toast.success(editingProject ? "Proje güncellendi" : "Proje eklendi");
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("Bir hata oluştu");
    }
  };

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        clientId: project.clientId._id,
        status: project.status,
        startDate: project.startDate
          ? format(new Date(project.startDate), "yyyy-MM-dd")
          : "",
        endDate: project.endDate
          ? format(new Date(project.endDate), "yyyy-MM-dd")
          : "",
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      name: "",
      clientId: "",
      status: "ACTIVE",
      startDate: "",
      endDate: "",
    });
  };

  if (loading) {
    return <div className="text-center py-12">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <button onClick={() => openModal()} className="btn-primary">
          Yeni Proje Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div key={project._id} className="card">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {project.name}
              </h3>
              <span
                className={`badge ${
                  project.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {project.status === "ACTIVE" ? "Aktif" : "Tamamlandı"}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Müşteri: {project.clientId.name}
            </p>
            {project.startDate && (
              <p className="text-xs text-gray-500 mt-2">
                Başlangıç:{" "}
                {format(new Date(project.startDate), "dd MMM yyyy", {
                  locale: tr,
                })}
              </p>
            )}
            {project.endDate && (
              <p className="text-xs text-gray-500">
                Bitiş:{" "}
                {format(new Date(project.endDate), "dd MMM yyyy", {
                  locale: tr,
                })}
              </p>
            )}
            <button
              onClick={() => openModal(project)}
              className="btn-secondary btn-sm mt-4 w-full"
            >
              Düzenle
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingProject ? "Proje Düzenle" : "Yeni Proje"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Proje Adı *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="label">Müşteri *</label>
                <select
                  className="input"
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                  required
                >
                  <option value="">Müşteri seçin</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Durum</label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "ACTIVE" | "DONE",
                    })
                  }
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="DONE">Tamamlandı</option>
                </select>
              </div>
              <div>
                <label className="label">Başlangıç Tarihi</label>
                <input
                  type="date"
                  className="input"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Bitiş Tarihi</label>
                <input
                  type="date"
                  className="input"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingProject ? "Güncelle" : "Ekle"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

