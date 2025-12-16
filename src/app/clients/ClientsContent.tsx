"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Client {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
}

export default function ClientsContent() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Veri alınamadı");
      const data = await res.json();
      setClients(data);
    } catch (error) {
      toast.error("Müşteriler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingClient
        ? `/api/clients/${editingClient._id}`
        : "/api/clients";
      const method = editingClient ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("İşlem başarısız");

      toast.success(
        editingClient ? "Müşteri güncellendi" : "Müşteri eklendi"
      );
      setShowModal(false);
      resetForm();
      fetchClients();
    } catch (error) {
      toast.error("Bir hata oluştu");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu müşteriyi silmek istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silme başarısız");

      toast.success("Müşteri silindi");
      fetchClients();
    } catch (error) {
      toast.error("Müşteri silinemedi");
    }
  };

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email || "",
        phone: client.phone || "",
        notes: client.notes || "",
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingClient(null);
    setFormData({ name: "", email: "", phone: "", notes: "" });
  };

  if (loading) {
    return <div className="text-center py-12">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <button onClick={() => openModal()} className="btn-primary">
          Yeni Müşteri Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div key={client._id} className="card">
            <h3 className="text-lg font-semibold text-gray-900">
              {client.name}
            </h3>
            {client.email && (
              <p className="text-sm text-gray-600 mt-1">{client.email}</p>
            )}
            {client.phone && (
              <p className="text-sm text-gray-600">{client.phone}</p>
            )}
            {client.notes && (
              <p className="text-sm text-gray-500 mt-2">{client.notes}</p>
            )}
            <p className="text-xs text-gray-400 mt-3">
              {format(new Date(client.createdAt), "dd MMM yyyy", { locale: tr })}
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => openModal(client)}
                className="btn-secondary btn-sm flex-1"
              >
                Düzenle
              </button>
              <button
                onClick={() => handleDelete(client._id)}
                className="btn-danger btn-sm flex-1"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingClient ? "Müşteri Düzenle" : "Yeni Müşteri"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">İsim *</label>
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
                <label className="label">E-posta</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Telefon</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Notlar</label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingClient ? "Güncelle" : "Ekle"}
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

