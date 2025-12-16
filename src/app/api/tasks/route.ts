import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { requireAuth, isAdmin } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const assigneeId = searchParams.get("assigneeId");
    const projectId = searchParams.get("projectId");
    const paymentStatus = searchParams.get("paymentStatus");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    const query: any = {};

    // Employee can only see their own tasks
    if (!isAdmin(user)) {
      query.assigneeId = (user as any).id;
    } else {
      // Admin can filter by assigneeId
      if (assigneeId) {
        query.assigneeId = assigneeId;
      }
    }

    if (status) query.status = status;
    if (projectId) query.projectId = projectId;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const tasks = await Task.find(query)
      .populate("projectId", "name status")
      .populate("assigneeId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const body = await req.json();
    const {
      projectId,
      clientId,
      assigneeId,
      title,
      description,
      status,
      priority,
      dueDate,
      price,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Görev başlığı gereklidir" },
        { status: 400 }
      );
    }

    // ProjectId yoksa clientId'den proje bul/oluştur
    let taskProjectId = projectId;
    
    if (!taskProjectId && clientId) {
      const { Project } = await import("@/models/Project");
      const { Client } = await import("@/models/Client");
      
      // Müşterinin aktif projesi var mı?
      let clientProject = await Project.findOne({
        clientId,
        status: "ACTIVE",
      });

      // Yoksa oluştur
      if (!clientProject) {
        const client = await Client.findById(clientId);
        clientProject = await Project.create({
          name: `${client?.name || "Müşteri"} - Genel`,
          clientId,
          status: "ACTIVE",
        });
      }

      taskProjectId = clientProject._id;
    }

    if (!taskProjectId) {
      return NextResponse.json(
        { error: "Proje veya müşteri gereklidir" },
        { status: 400 }
      );
    }

    // Employee can create tasks but with limitations
    const taskData: any = {
      projectId: taskProjectId,
      assigneeId,
      title,
      description,
      status: status || "BACKLOG",
      priority: priority || "MEDIUM",
      dueDate,
    };

    // Only admin can set price
    if (isAdmin(user)) {
      taskData.price = price || 0;
    } else {
      taskData.price = 0; // Employees can't set price
    }

    const task = await Task.create(taskData);

    const populatedTask = await Task.findById(task._id)
      .populate("projectId", "name status")
      .populate("assigneeId", "name email");

    return NextResponse.json(populatedTask, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

