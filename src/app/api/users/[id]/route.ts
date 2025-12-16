import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { requireAdmin } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { name, email, role, password } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
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

    const user = await User.findByIdAndDelete(params.id);

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Kullanıcı silindi" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

