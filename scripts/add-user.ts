import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { User } from "../src/models/User";

config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ajans-tracker";

async function addUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("📡 MongoDB bağlantısı kuruldu.");

        const name = "Yeni Örnek Kullanıcı";
        const email = "yeni@example.com";
        const password = "password123";
        const role = "EMPLOYEE";

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("⚠️  Bu email ile zaten bir kullanıcı var:", email);
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            passwordHash,
            role,
        });

        console.log("✅ Yeni kullanıcı başarıyla eklendi:");
        console.log(`👤 İsim: ${name}`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔐 Şifre: ${password}`);
        console.log(`🎭 Rol: ${role}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error("❌ Hata:", error);
        process.exit(1);
    }
}

addUser();
