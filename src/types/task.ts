export interface Task {
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
    updatedAt?: string;
}
