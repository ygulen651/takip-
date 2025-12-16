import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const projects = await Project.find()
      .populate("clientId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { name, clientId, status, startDate, endDate } = body;

    if (!name || !clientId) {
      return NextResponse.json(
        { error: "Proje adı ve müşteri gereklidir" },
        { status: 400 }
      );
    }

    const project = await Project.create({
      name,
      clientId,
      status: status || "ACTIVE",
      startDate,
      endDate,
    });

    const populatedProject = await Project.findById(project._id).populate(
      "clientId",
      "name email"
    );

    return NextResponse.json(populatedProject, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

