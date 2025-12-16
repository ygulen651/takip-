"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import TaskModal from "@/components/TaskModal";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  projectId: { _id: string; name: string };
  assigneeId?: { _id: string; name: string };
  dueDate?: string;
  price: number;
  paymentStatus: "PENDING" | "PARTIAL" | "PAID";
  paidAmount: number;
  deliveryLink?: string;
  createdAt: string;
}

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

export default function TasksContent({ isAdmin }: { isAdmin: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/tasks?${params}`);
      if (!res.ok) throw new Error("Veri alınamadı");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      toast.error("Görevler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (task?: Task) => {
    setSelectedTask(task || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    fetchTasks();
  };

  if (loading) {
    return <div className="text-center py-12">Yükleniyor...</div>;
  }

  const groupedTasks = {
    BACKLOG: tasks.filter((t) => t.status === "BACKLOG"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    REVIEW: tasks.filter((t) => t.status === "REVIEW"),
    DONE: tasks.filter((t) => t.status === "DONE"),
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button onClick={() => openModal()} className="btn-primary">
          Yeni Görev Ekle
        </button>
        <select
          className="input max-w-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tüm Durumlar</option>
          <option value="BACKLOG">Beklemede</option>
          <option value="IN_PROGRESS">Devam Ediyor</option>
          <option value="REVIEW">İncelemede</option>
          <option value="DONE">Tamamlandı</option>
        </select>
      </div>

      {/* Kanban View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(groupedTasks).map(([status, statusTasks]) => (
          <div key={status} className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              {statusLabels[status as keyof typeof statusLabels]} (
              {statusTasks.length})
            </h3>
            <div className="space-y-3">
              {statusTasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => openModal(task)}
                  className="card cursor-pointer hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-gray-900 mb-2">
                    {task.title}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    {task.projectId.name}
                  </p>
                  <div className="flex gap-2 mb-2">
                    <span
                      className={`badge badge-priority-${task.priority}`}
                    >
                      {priorityLabels[task.priority]}
                    </span>
                    {isAdmin && (
                      <span
                        className={`badge badge-payment-${task.paymentStatus}`}
                      >
                        {task.paymentStatus}
                      </span>
                    )}
                  </div>
                  {task.assigneeId && (
                    <p className="text-xs text-gray-500">
                      {task.assigneeId.name}
                    </p>
                  )}
                  {task.dueDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Son:{" "}
                      {format(new Date(task.dueDate), "dd MMM", {
                        locale: tr,
                      })}
                    </p>
                  )}
                  {isAdmin && task.price > 0 && (
                    <p className="text-xs font-medium text-primary-600 mt-2">
                      ₺{task.price.toLocaleString("tr-TR")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <TaskModal
          task={selectedTask}
          isAdmin={isAdmin}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

