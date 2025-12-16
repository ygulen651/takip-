import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { requireAdmin } from "@/lib/auth-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { name, phone, email, notes } = body;

    const client = await Client.findByIdAndUpdate(
      params.id,
      { name, phone, email, notes },
      { new: true, runValidators: true }
    );

    if (!client) {
      return NextResponse.json(
        { error: "Müşteri bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await connectDB();

    const client = await Client.findByIdAndDelete(params.id);

    if (!client) {
      return NextResponse.json(
        { error: "Müşteri bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Müşteri silindi" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

