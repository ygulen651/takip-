"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CreateTaskModalProps {
  isAdmin: boolean;
  onClose: () => void;
}

export default function CreateTaskModal({
  isAdmin,
  onClose,
}: CreateTaskModalProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientId: "",
    projectId: "",
    assigneeId: "",
    status: "BACKLOG",
    priority: "MEDIUM",
    dueDate: "",
    price: "0",
  });

  useEffect(() => {
    fetchClients();
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Clients fetch error:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.filter((p: any) => p.status === "ACTIVE"));
      }
    } catch (error) {
      console.error("Projects fetch error:", error);
    }
  };

  const handleClientChange = (clientId: string) => {
    setFormData({ ...formData, clientId, projectId: "" });
    if (clientId) {
      const filtered = projects.filter((p: any) => p.clientId._id === clientId);
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Users fetch error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = { ...formData };
      if (isAdmin) {
        payload.price = parseFloat(formData.price) || 0;
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Görev oluşturulamadı");

      toast.success("Görev başarıyla oluşturuldu");
      onClose();
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const statusLabels = {
    BACKLOG: "Beklemede",
    IN_PROGRESS: "Devam Ediyor",
    REVIEW: "İncelemede",
    DONE: "Tamamlandı",
  };

  const priorityLabels = {
    LOW: "Düşük",
    MEDIUM: "Orta",
    HIGH: "Yüksek",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Yeni Görev Oluştur
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Başlık *</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="Görev başlığı"
            />
          </div>

          <div>
            <label className="label">Açıklama</label>
            <textarea
              className="input"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Görev detayları"
            />
          </div>

          <div>
            <label className="label">Müşteri *</label>
            <select
              className="input"
              value={formData.clientId}
              onChange={(e) => handleClientChange(e.target.value)}
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

          {formData.clientId && (
            <div>
              <label className="label">Proje *</label>
              <select
                className="input"
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value })
                }
                required
              >
                <option value="">Proje seçin</option>
                {filteredProjects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label">Kime Atanacak? *</label>
            <select
              className="input"
              value={formData.assigneeId}
              onChange={(e) =>
                setFormData({ ...formData, assigneeId: e.target.value })
              }
              required
            >
              <option value="">Kişi seçin</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Durum</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Öncelik</label>
              <select
                className="input"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                {Object.entries(priorityLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Son Tarih</label>
            <input
              type="date"
              className="input"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
          </div>

          {isAdmin && (
            <div>
              <label className="label">Fiyat (₺)</label>
              <input
                type="number"
                className="input"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? "Oluşturuluyor..." : "Görev Oluştur"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

