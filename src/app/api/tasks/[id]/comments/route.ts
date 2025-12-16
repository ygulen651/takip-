import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TaskComment } from "@/models/TaskComment";
import { Task } from "@/models/Task";
import { requireAuth, isAdmin } from "@/lib/auth-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    await connectDB();

    // Check if user can access this task
    const task = await Task.findById(params.id);
    if (!task) {
      return NextResponse.json({ error: "Görev bulunamadı" }, { status: 404 });
    }

    if (!isAdmin(user) && task.assigneeId?.toString() !== (user as any).id) {
      return NextResponse.json(
        { error: "Bu göreve erişim yetkiniz yok" },
        { status: 403 }
      );
    }

    const comments = await TaskComment.find({ taskId: params.id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    await connectDB();

    // Check if user can access this task
    const task = await Task.findById(params.id);
    if (!task) {
      return NextResponse.json({ error: "Görev bulunamadı" }, { status: 404 });
    }

    if (!isAdmin(user) && task.assigneeId?.toString() !== (user as any).id) {
      return NextResponse.json(
        { error: "Bu göreve yorum ekleme yetkiniz yok" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Yorum metni gereklidir" },
        { status: 400 }
      );
    }

    const comment = await TaskComment.create({
      taskId: params.id,
      userId: (user as any).id,
      text: text.trim(),
    });

    const populatedComment = await TaskComment.findById(comment._id).populate(
      "userId",
      "name email"
    );

    return NextResponse.json(populatedComment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

