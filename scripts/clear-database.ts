import mongoose from "mongoose";
import { config } from "dotenv";
import { User } from "../src/models/User";
import { Client } from "../src/models/Client";
import { Project } from "../src/models/Project";
import { Task } from "../src/models/Task";
import { TaskComment } from "../src/models/TaskComment";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ajans-tracker";

async function clearDatabase() {
  try {
    console.log("🗑️  Veritabanı temizleniyor (Kullanıcılar HARİÇ)...");
    console.log("📡 MongoDB bağlantısı kuruluyor:", MONGODB_URI);

    await mongoose.connect(MONGODB_URI);

    console.log("✅ MongoDB bağlantısı başarılı");

    // Clear all collections EXCEPT users
    console.log("🗑️  İş verileri siliniyor...");
    console.log("   ⚠️  Kullanıcılar korunuyor");
    
    await Client.deleteMany({});
    console.log("   ✓ Müşteriler silindi");
    
    await Project.deleteMany({});
    console.log("   ✓ Projeler silindi");
    
    await Task.deleteMany({});
    console.log("   ✓ Görevler silindi");
    
    await TaskComment.deleteMany({});
    console.log("   ✓ Yorumlar silindi");

    const userCount = await User.countDocuments();
    console.log(`   ✓ ${userCount} kullanıcı korundu`);

    console.log("\n✅ İş verileri başarıyla silindi!");
    console.log("✅ Kullanıcılar güvende!");
    console.log("\n💡 Şimdi yeni müşteri, proje ve görevler ekleyebilirsiniz.");

    await mongoose.disconnect();
    console.log("👋 MongoDB bağlantısı kapatıldı");
  } catch (error) {
    console.error("❌ Temizleme hatası:", error);
    process.exit(1);
  }
}

clearDatabase();

