import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const clients = await Client.find().sort({ createdAt: -1 });

    return NextResponse.json(clients);
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
    const { name, phone, email, notes } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Müşteri adı gereklidir" },
        { status: 400 }
      );
    }

    const client = await Client.create({
      name,
      phone,
      email,
      notes,
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

