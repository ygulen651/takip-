"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "@/components/KanbanColumn";
import { TaskCard } from "@/components/TaskCard";
import TaskModal from "@/components/TaskModal";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

import { Task } from "@/types/task";

const COLUMNS = [
  { id: "BACKLOG", title: "Beklemede" },
  { id: "IN_PROGRESS", title: "Devam Ediyor" },
  { id: "REVIEW", title: "İncelemede" },
  { id: "DONE", title: "Tamamlandı" },
];

export default function TasksContent({ isAdmin }: { isAdmin: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Veri alınamadı");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      toast.error("Görevler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Güncelleme başarısız");
      toast.success("Durum güncellendi");
    } catch (error) {
      toast.error("Durum güncellenemedi");
      fetchTasks(); // Revert state on error
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t._id === activeId);
        const overIndex = tasks.findIndex((t) => t._id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          tasks[activeIndex].status = tasks[overIndex].status as any;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Dropping a Task over a Column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t._id === activeId);
        tasks[activeIndex].status = overId as any;
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    const task = tasks.find((t) => t._id === taskId);
    if (task && task.status !== activeTask?.status) {
      updateTaskStatus(taskId, task.status);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const openModal = (task?: Task) => {
    setSelectedTask(task || null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            İş Akışı
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Görevleri sürükleyerek durumlarını güncelleyin
          </p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <span className="text-xl">+</span> Yeni Görev
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-6 h-full overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={tasks.filter((t) => t.status === col.id)}
              isAdmin={isAdmin}
              onTaskClick={handleTaskClick}
              onAddTask={openModal}
            />
          ))}
        </div>

        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay
              dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: {
                    active: {
                      opacity: "0.5",
                    },
                  },
                }),
              }}
            >
              {activeTask ? (
                <div className="scale-105 rotate-3 transition-transform">
                  <TaskCard
                    task={activeTask}
                    isAdmin={isAdmin}
                    onClick={() => { }}
                  />
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
      </DndContext>

      {showModal && (
        <TaskModal
          task={selectedTask}
          isAdmin={isAdmin}
          onClose={() => {
            setShowModal(false);
            setSelectedTask(null);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}
