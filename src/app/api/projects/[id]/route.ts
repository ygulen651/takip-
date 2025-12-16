import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await connectDB();

    const project = await Project.findById(params.id).populate(
      "clientId",
      "name email phone"
    );

    if (!project) {
      return NextResponse.json(
        { error: "Proje bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
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
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { name, clientId, status, startDate, endDate } = body;

    const project = await Project.findByIdAndUpdate(
      params.id,
      { name, clientId, status, startDate, endDate },
      { new: true, runValidators: true }
    ).populate("clientId", "name email");

    if (!project) {
      return NextResponse.json(
        { error: "Proje bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

