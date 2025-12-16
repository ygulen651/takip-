"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface TaskModalProps {
  task: any | null;
  isAdmin: boolean;
  onClose: () => void;
}

export default function TaskModal({ task, isAdmin, onClose }: TaskModalProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    assigneeId: "",
    status: "BACKLOG",
    priority: "MEDIUM",
    dueDate: "",
    price: "0",
    deliveryLink: "",
  });
  const [paymentData, setPaymentData] = useState({
    price: "0",
    paidAmount: "0",
  });

  useEffect(() => {
    if (isAdmin) {
      fetchProjects();
      fetchUsers();
    }
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        projectId: task.projectId._id,
        assigneeId: task.assigneeId?._id || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate
          ? format(new Date(task.dueDate), "yyyy-MM-dd")
          : "",
        price: task.price.toString(),
        deliveryLink: task.deliveryLink || "",
      });
      setPaymentData({
        price: task.price.toString(),
        paidAmount: task.paidAmount.toString(),
      });
      fetchComments();
    }
  }, [task, isAdmin]);

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

  const fetchComments = async () => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${task._id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Comments fetch error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = task ? `/api/tasks/${task._id}` : "/api/tasks";
      const method = task ? "PATCH" : "POST";

      const payload: any = { ...formData };
      payload.price = parseFloat(formData.price) || 0;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("İşlem başarısız");

      toast.success(task ? "Görev güncellendi" : "Görev oluşturuldu");
      onClose();
    } catch (error) {
      toast.error("Bir hata oluştu");
    }
  };

  const handlePaymentUpdate = async () => {
    if (!task || !isAdmin) return;

    try {
      const res = await fetch(`/api/tasks/${task._id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: parseFloat(paymentData.price) || 0,
          paidAmount: parseFloat(paymentData.paidAmount) || 0,
        }),
      });

      if (!res.ok) throw new Error("Ödeme güncellenemedi");

      toast.success("Ödeme güncellendi");
      onClose();
    } catch (error) {
      toast.error("Ödeme güncellenemedi");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim()) return;

    try {
      const res = await fetch(`/api/tasks/${task._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment }),
      });

      if (!res.ok) throw new Error("Yorum eklenemedi");

      toast.success("Yorum eklendi");
      setNewComment("");
      fetchComments();
    } catch (error) {
      toast.error("Yorum eklenemedi");
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
          {task ? "Görev Detayı" : "Yeni Görev"}
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
              disabled={!isAdmin && task}
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
              disabled={!isAdmin && task}
            />
          </div>

          {isAdmin && (
            <>
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
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Atanan Kişi</label>
                <select
                  className="input"
                  value={formData.assigneeId}
                  onChange={(e) =>
                    setFormData({ ...formData, assigneeId: e.target.value })
                  }
                >
                  <option value="">Atama yapılmadı</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.email}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

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

            {isAdmin && (
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
            )}
          </div>

          {isAdmin && (
            <>
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
            </>
          )}

          <div>
            <label className="label">Teslim Linki</label>
            <input
              type="url"
              className="input"
              value={formData.deliveryLink}
              onChange={(e) =>
                setFormData({ ...formData, deliveryLink: e.target.value })
              }
              placeholder="https://"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {task ? "Güncelle" : "Oluştur"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Kapat
            </button>
          </div>
        </form>

        {/* Payment Section (Admin Only) */}
        {task && isAdmin && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-3">
              Ödeme Yönetimi
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Toplam Fiyat (₺)</label>
                <input
                  type="number"
                  className="input"
                  value={paymentData.price}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, price: e.target.value })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label">Ödenen Miktar (₺)</label>
                <input
                  type="number"
                  className="input"
                  value={paymentData.paidAmount}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      paidAmount: e.target.value,
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <button
              onClick={handlePaymentUpdate}
              className="btn-primary w-full mt-3"
            >
              Ödeme Güncelle
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Durum: <span className={`badge badge-payment-${task.paymentStatus}`}>
                {task.paymentStatus}
              </span>
            </p>
          </div>
        )}

        {/* Comments Section */}
        {task && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-3">Yorumlar</h3>
            <form onSubmit={handleAddComment} className="mb-4">
              <textarea
                className="input"
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Yorum ekle..."
              />
              <button type="submit" className="btn-primary btn-sm mt-2">
                Yorum Ekle
              </button>
            </form>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment._id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {comment.userId.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(comment.createdAt), "dd MMM HH:mm", {
                        locale: tr,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

