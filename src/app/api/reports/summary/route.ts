import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    const query: any = {};

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Completed tasks count
    const completedCount = await Task.countDocuments({
      ...query,
      status: "DONE",
    });

    // Total paid
    const paidTasks = await Task.find({
      ...query,
      paymentStatus: "PAID",
    });
    const totalPaid = paidTasks.reduce((sum, task) => sum + task.paidAmount, 0);

    // Total unpaid (pending + partial)
    const unpaidTasks = await Task.find({
      ...query,
      paymentStatus: { $in: ["PENDING", "PARTIAL"] },
    });
    const totalUnpaid = unpaidTasks.reduce(
      (sum, task) => sum + (task.price - task.paidAmount),
      0
    );

    // Payment breakdown
    const paymentBreakdown = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalPrice: { $sum: "$price" },
          totalPaid: { $sum: "$paidAmount" },
        },
      },
    ]);

    // Top assignees by completed tasks
    const topAssignees = await Task.aggregate([
      { $match: { ...query, status: "DONE", assigneeId: { $ne: null } } },
      {
        $group: {
          _id: "$assigneeId",
          completedCount: { $sum: 1 },
          totalEarned: { $sum: "$paidAmount" },
        },
      },
      { $sort: { completedCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          name: "$user.name",
          email: "$user.email",
          completedCount: 1,
          totalEarned: 1,
        },
      },
    ]);

    return NextResponse.json({
      completedCount,
      totalPaid,
      totalUnpaid,
      paymentBreakdown,
      topAssignees,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

