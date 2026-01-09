"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import { MoreHorizontal, Plus } from "lucide-react";

import { Task } from "@/types/task";

interface Props {
    id: string;
    title: string;
    tasks: Task[];
    isAdmin: boolean;
    onTaskClick: (task: Task) => void;
    onAddTask: () => void;
}

export function KanbanColumn({ id, title, tasks, isAdmin, onTaskClick, onAddTask }: Props) {
    const { setNodeRef } = useDroppable({
        id,
    });

    return (
        <div className="flex flex-col h-full min-w-[280px]">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase text-sm">
                        {title}
                    </h3>
                    <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-lg">
                        {tasks.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {isAdmin && (
                        <button
                            onClick={onAddTask}
                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-dark-card transition-colors text-gray-400 hover:text-primary-600"
                        >
                            <Plus size={16} />
                        </button>
                    )}
                    <button className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-dark-card transition-colors text-gray-400">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            <div
                ref={setNodeRef}
                className="kanban-column flex-1 space-y-4 overflow-y-auto pb-4 custom-scrollbar"
            >
                <SortableContext
                    items={tasks.map((t) => t._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            isAdmin={isAdmin}
                            onClick={() => onTaskClick(task)}
                        />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-gray-200 dark:border-dark-border rounded-2xl flex items-center justify-center text-xs font-medium text-gray-400 dark:text-gray-500">
                        Görev yok
                    </div>
                )}
            </div>
        </div>
    );
}
