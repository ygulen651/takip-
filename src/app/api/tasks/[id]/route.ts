import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { requireAuth, isAdmin } from "@/lib/auth-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    await connectDB();

    const task = await Task.findById(params.id)
      .populate("projectId", "name status")
      .populate("assigneeId", "name email");

    if (!task) {
      return NextResponse.json({ error: "Görev bulunamadı" }, { status: 404 });
    }

    // Check ownership for employees
    if (!isAdmin(user) && task.assigneeId?._id.toString() !== (user as any).id) {
      return NextResponse.json(
        { error: "Bu görevi görme yetkiniz yok" },
        { status: 403 }
      );
    }

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    await connectDB();

    const task = await Task.findById(params.id);

    if (!task) {
      return NextResponse.json({ error: "Görev bulunamadı" }, { status: 404 });
    }

    // Check ownership for employees
    if (!isAdmin(user) && task.assigneeId?.toString() !== (user as any).id) {
      return NextResponse.json(
        { error: "Bu görevi düzenleme yetkiniz yok" },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (isAdmin(user)) {
      // Admin can update all fields
      const {
        projectId,
        assigneeId,
        title,
        description,
        status,
        priority,
        dueDate,
        deliveryLink,
        price,
      } = body;

      task.projectId = projectId ?? task.projectId;
      task.assigneeId = assigneeId ?? task.assigneeId;
      task.title = title ?? task.title;
      task.description = description ?? task.description;
      task.status = status ?? task.status;
      task.priority = priority ?? task.priority;
      task.dueDate = dueDate ?? task.dueDate;
      task.deliveryLink = deliveryLink ?? task.deliveryLink;
      task.price = price ?? task.price;

      if (status === "DONE" && task.status !== "DONE") {
        task.completedAt = new Date();
      }

      if (deliveryLink && !task.deliveredAt) {
        task.deliveredAt = new Date();
      }
    } else {
      // Employee can only update status and deliveryLink
      const { status, deliveryLink } = body;

      if (status) {
        task.status = status;
        if (status === "DONE" && !task.completedAt) {
          task.completedAt = new Date();
        }
      }

      if (deliveryLink) {
        task.deliveryLink = deliveryLink;
        if (!task.deliveredAt) {
          task.deliveredAt = new Date();
        }
      }
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("projectId", "name status")
      .populate("assigneeId", "name email");

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

