import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { requireAdmin } from "@/lib/auth-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await connectDB();

    const task = await Task.findById(params.id);

    if (!task) {
      return NextResponse.json({ error: "Görev bulunamadı" }, { status: 404 });
    }

    const body = await req.json();
    const { price, paidAmount, paymentStatus } = body;

    if (price !== undefined) task.price = price;
    if (paidAmount !== undefined) task.paidAmount = paidAmount;

    // Auto-calculate payment status based on amounts
    if (task.paidAmount === 0) {
      task.paymentStatus = "PENDING";
      task.paidAt = undefined;
    } else if (task.paidAmount >= task.price) {
      task.paymentStatus = "PAID";
      task.paidAmount = task.price; // Cap at price
      if (!task.paidAt) {
        task.paidAt = new Date();
      }
    } else {
      task.paymentStatus = "PARTIAL";
      task.paidAt = undefined;
    }

    // Allow manual override
    if (paymentStatus) {
      task.paymentStatus = paymentStatus;
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

