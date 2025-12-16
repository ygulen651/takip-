import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { requireAdmin } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
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
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "İsim, email ve şifre gereklidir" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || "EMPLOYEE",
    });

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Hata oluştu" },
      { status: error.message?.includes("yetkisi") ? 403 : 500 }
    );
  }
}

