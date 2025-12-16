import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { User } from "../src/models/User";
import { Client } from "../src/models/Client";
import { Project } from "../src/models/Project";
import { Task } from "../src/models/Task";
import { TaskComment } from "../src/models/TaskComment";

// Load environment variables from .env.local or .env
config({ path: ".env.local" });
config({ path: ".env" });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ajans-tracker";

async function seed() {
  try {
    console.log("🌱 Seed işlemi başlatılıyor...");
    console.log("📡 MongoDB bağlantısı kuruluyor:", MONGODB_URI);

    await mongoose.connect(MONGODB_URI);

    console.log("✅ MongoDB bağlantısı başarılı");

    // Clear existing data
    console.log("🗑️  Mevcut veriler temizleniyor...");
    await User.deleteMany({});
    await Client.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await TaskComment.deleteMany({});

    // Create Users
    console.log("👥 Kullanıcılar oluşturuluyor...");
    const passwordHash = await bcrypt.hash("password123", 10);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
    });

    const employee1 = await User.create({
      name: "Ahmet Yılmaz",
      email: "employee1@example.com",
      passwordHash,
      role: "EMPLOYEE",
    });

    const employee2 = await User.create({
      name: "Ayşe Demir",
      email: "employee2@example.com",
      passwordHash,
      role: "EMPLOYEE",
    });

    console.log("✅ Kullanıcılar oluşturuldu");

    // Create Clients
    console.log("🏢 Müşteriler oluşturuluyor...");
    const client1 = await Client.create({
      name: "Acme Corporation",
      email: "info@acme.com",
      phone: "+90 212 555 0001",
      notes: "Büyük kurumsal müşteri, öncelikli",
    });

    const client2 = await Client.create({
      name: "TechStart Ltd.",
      email: "hello@techstart.com",
      phone: "+90 216 555 0002",
      notes: "Startup müşteri, hızlı iletişim",
    });

    console.log("✅ Müşteriler oluşturuldu");

    // Create Projects
    console.log("📁 Projeler oluşturuluyor...");
    const project1 = await Project.create({
      name: "Website Redesign",
      clientId: client1._id,
      status: "ACTIVE",
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-03-31"),
    });

    const project2 = await Project.create({
      name: "Mobile App Development",
      clientId: client2._id,
      status: "ACTIVE",
      startDate: new Date("2024-02-01"),
    });

    console.log("✅ Projeler oluşturuldu");

    // Create Tasks
    console.log("📋 Görevler oluşturuluyor...");

    // Task 1 - Completed & Paid
    const task1 = await Task.create({
      projectId: project1._id,
      assigneeId: employee1._id,
      title: "Homepage Design",
      description: "Ana sayfa tasarımı ve mockup hazırlama",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date("2024-02-15"),
      deliveryLink: "https://figma.com/design/homepage",
      deliveredAt: new Date("2024-02-14"),
      completedAt: new Date("2024-02-14"),
      price: 5000,
      paymentStatus: "PAID",
      paidAmount: 5000,
      paidAt: new Date("2024-02-20"),
    });

    // Task 2 - In Progress, Payment Pending
    const task2 = await Task.create({
      projectId: project1._id,
      assigneeId: employee2._id,
      title: "Backend API Development",
      description: "RESTful API geliştirme ve dokümantasyon",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date("2024-03-15"),
      price: 8000,
      paymentStatus: "PENDING",
      paidAmount: 0,
    });

    // Task 3 - Review, Partial Payment
    const task3 = await Task.create({
      projectId: project2._id,
      assigneeId: employee1._id,
      title: "UI/UX Design",
      description: "Mobil uygulama arayüz tasarımı",
      status: "REVIEW",
      priority: "MEDIUM",
      dueDate: new Date("2024-02-28"),
      deliveryLink: "https://figma.com/design/mobile-app",
      deliveredAt: new Date("2024-02-25"),
      price: 6000,
      paymentStatus: "PARTIAL",
      paidAmount: 3000,
    });

    // Task 4 - Overdue
    const task4 = await Task.create({
      projectId: project1._id,
      assigneeId: employee2._id,
      title: "Content Migration",
      description: "Eski siteden içerik aktarımı",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: new Date("2024-01-31"),
      price: 2000,
      paymentStatus: "PENDING",
      paidAmount: 0,
    });

    // Task 5 - Backlog
    const task5 = await Task.create({
      projectId: project2._id,
      assigneeId: employee1._id,
      title: "User Authentication Module",
      description: "Kullanıcı giriş ve kayıt sistemi",
      status: "BACKLOG",
      priority: "HIGH",
      dueDate: new Date("2024-03-20"),
      price: 4500,
      paymentStatus: "PENDING",
      paidAmount: 0,
    });

    // Task 6 - Done & Paid
    const task6 = await Task.create({
      projectId: project1._id,
      assigneeId: employee1._id,
      title: "Logo Design",
      description: "Yeni logo tasarımı ve brand guidelines",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date("2024-01-20"),
      deliveryLink: "https://drive.google.com/logo",
      deliveredAt: new Date("2024-01-18"),
      completedAt: new Date("2024-01-18"),
      price: 3000,
      paymentStatus: "PAID",
      paidAmount: 3000,
      paidAt: new Date("2024-01-25"),
    });

    // Task 7 - In Progress
    const task7 = await Task.create({
      projectId: project2._id,
      assigneeId: employee2._id,
      title: "Database Schema Design",
      description: "Veritabanı şeması ve ilişkileri tasarlama",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date("2024-03-01"),
      price: 3500,
      paymentStatus: "PENDING",
      paidAmount: 0,
    });

    // Task 8 - Review
    const task8 = await Task.create({
      projectId: project1._id,
      assigneeId: employee1._id,
      title: "Responsive Design Testing",
      description: "Farklı cihazlarda responsive test",
      status: "REVIEW",
      priority: "MEDIUM",
      dueDate: new Date("2024-03-10"),
      deliveryLink: "https://staging.example.com",
      deliveredAt: new Date("2024-03-08"),
      price: 1500,
      paymentStatus: "PENDING",
      paidAmount: 0,
    });

    // Task 9 - Backlog
    const task9 = await Task.create({
      projectId: project2._id,
      title: "Push Notification System",
      description: "Bildirim sistemi entegrasyonu",
      status: "BACKLOG",
      priority: "LOW",
      dueDate: new Date("2024-04-15"),
      price: 2500,
      paymentStatus: "PENDING",
      paidAmount: 0,
    });

    // Task 10 - Done, Partial Payment
    const task10 = await Task.create({
      projectId: project1._id,
      assigneeId: employee2._id,
      title: "SEO Optimization",
      description: "On-page SEO optimizasyonu",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: new Date("2024-02-10"),
      completedAt: new Date("2024-02-09"),
      price: 2000,
      paymentStatus: "PARTIAL",
      paidAmount: 1000,
    });

    console.log("✅ Görevler oluşturuldu");

    // Create Comments
    console.log("💬 Yorumlar oluşturuluyor...");

    await TaskComment.create([
      {
        taskId: task1._id,
        userId: admin._id,
        text: "Harika bir tasarım olmuş, teşekkürler!",
      },
      {
        taskId: task1._id,
        userId: employee1._id,
        text: "Çok teşekkür ederim. Müşteri feedbackını bekliyorum.",
      },
      {
        taskId: task2._id,
        userId: admin._id,
        text: "API dokümantasyonu eksiksiz olmalı lütfen.",
      },
      {
        taskId: task3._id,
        userId: employee1._id,
        text: "Tasarım tamamlandı, incelemenizi bekliyorum.",
      },
      {
        taskId: task4._id,
        userId: admin._id,
        text: "Bu görev gecikmiş durumda, acil tamamlanmalı.",
      },
      {
        taskId: task7._id,
        userId: employee2._id,
        text: "Schema tasarımı neredeyse bitti, yarın paylaşacağım.",
      },
    ]);

    console.log("✅ Yorumlar oluşturuldu");

    // Summary
    console.log("\n📊 SEED ÖZET:");
    console.log("-------------------");
    console.log(`👥 Kullanıcılar: ${await User.countDocuments()}`);
    console.log(`🏢 Müşteriler: ${await Client.countDocuments()}`);
    console.log(`📁 Projeler: ${await Project.countDocuments()}`);
    console.log(`📋 Görevler: ${await Task.countDocuments()}`);
    console.log(`💬 Yorumlar: ${await TaskComment.countDocuments()}`);
    console.log("\n🔐 GİRİŞ BİLGİLERİ:");
    console.log("-------------------");
    console.log("Admin:");
    console.log("  Email: admin@example.com");
    console.log("  Şifre: password123");
    console.log("\nÇalışan 1:");
    console.log("  Email: employee1@example.com");
    console.log("  Şifre: password123");
    console.log("\nÇalışan 2:");
    console.log("  Email: employee2@example.com");
    console.log("  Şifre: password123");
    console.log("\n✅ Seed işlemi başarıyla tamamlandı!");

    await mongoose.disconnect();
    console.log("👋 MongoDB bağlantısı kapatıldı");
  } catch (error) {
    console.error("❌ Seed hatası:", error);
    process.exit(1);
  }
}

seed();

