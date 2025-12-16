import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { requireAuth, isAdmin } from "@/lib/auth-helpers";
import { startOfWeek, endOfWeek } from "date-fns";

export async function GET() {
  try {
    const user = await requireAuth();
    await connectDB();

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const query: any = {};

    // Employee only sees their own tasks
    if (!isAdmin(user)) {
      query.assigneeId = (user as any).id;
    }

    // Overdue tasks
    const overdueTasks = await Task.find({
      ...query,
      dueDate: { $lt: now },
      status: { $ne: "DONE" },
    })
      .populate("projectId", "name")
      .populate("assigneeId", "name email")
      .sort({ dueDate: 1 })
      .limit(10);

    // Tasks completed this week
    const completedThisWeek = await Task.countDocuments({
      ...query,
      completedAt: {
        $gte: weekStart,
        $lte: weekEnd,
      },
    });

    // Payment summary (admin only)
    let paymentSummary = null;
    if (isAdmin(user)) {
      const pendingPaymentTasks = await Task.find({
        paymentStatus: { $in: ["PENDING", "PARTIAL"] },
      });

      const totalUnpaid = pendingPaymentTasks.reduce(
        (sum, task) => sum + (task.price - task.paidAmount),
        0
      );

      paymentSummary = {
        totalUnpaid,
        pendingTasksCount: pendingPaymentTasks.length,
      };
    }

    // Task status breakdown
    const statusBreakdown = await Task.aggregate([
      { $match: query },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      overdueTasks,
      completedThisWeek,
      paymentSummary,
      statusBreakdown,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

