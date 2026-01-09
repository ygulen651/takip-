"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion } from "framer-motion";
import { Calendar, User, CheckCircle2, Clock, AlertCircle } from "lucide-react";

import { Task } from "@/types/task";

export function TaskCard({ task, isAdmin, onClick }: { task: Task, isAdmin: boolean, onClick: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task._id,
        data: {
            type: "Task",
            task,
        },
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const priorityIcons = {
        LOW: <Clock className="w-3.5 h-3.5" />,
        MEDIUM: <AlertCircle className="w-3.5 h-3.5" />,
        HIGH: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 premium-card h-[160px] cursor-grabbing border-primary-500 border-2"
            />
        );
    }

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-card cursor-grab active:cursor-grabbing group"
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`badge badge-priority-${task.priority} flex gap-1 items-center`}>
                    {priorityIcons[task.priority]}
                    {task.priority === "LOW" ? "Düşük" : task.priority === "MEDIUM" ? "Orta" : "Yüksek"}
                </span>
                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 group-hover:text-primary-500 transition-colors">
                    #{task._id.slice(-4).toUpperCase()}
                </div>
            </div>

            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                {task.title}
            </h4>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">
                {task.projectId.name}
            </p>

            <div className="flex flex-wrap gap-2 mt-auto">
                {task.assigneeId && (
                    <div className="flex items-center text-[11px] font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-dark-border px-2 py-1 rounded-lg">
                        <User className="w-3 h-3 mr-1.5" />
                        {task.assigneeId.name}
                    </div>
                )}

                {task.dueDate && (
                    <div className={`flex items-center text-[11px] font-medium px-2 py-1 rounded-lg ${new Date(task.dueDate) < new Date() && task.status !== "DONE"
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                        : "bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-gray-400"
                        }`}>
                        <Calendar className="w-3 h-3 mr-1.5" />
                        {format(new Date(task.dueDate), "dd MMM", { locale: tr })}
                    </div>
                )}
            </div>

            {isAdmin && task.price > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border flex justify-between items-center">
                    <span className="text-xs font-black text-primary-600 dark:text-primary-400">
                        ₺{task.price.toLocaleString("tr-TR")}
                    </span>
                    <span className={`badge badge-payment-${task.paymentStatus} text-[10px]`}>
                        {task.paymentStatus === "PAID" ? "ÖDENDİ" : task.paymentStatus === "PARTIAL" ? "KISMİ" : "BEKLİYOR"}
                    </span>
                </div>
            )}
        </motion.div>
    );
}
