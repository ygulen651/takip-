import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const originalKey = process.env.GEMINI_API_KEY || "";
        const apiKey = originalKey.trim();

        if (!apiKey || apiKey.length < 10) {
            return NextResponse.json({
                error: "Geçersiz veya eksik API Anahtarı (.env.local)."
            }, { status: 400 });
        }

        const { data } = await req.json();

        const prompt = `
      Sen bir iş takip asistanısın. Aşağıdaki dashboard verilerini analiz et ve kullanıcıya (Yönetici veya Çalışan) kısa, profesyonel ve motive edici bir özet çıkar.
      Türkçe cevap ver. Kritik gecikmelere dikkat çek ve önerilerde bulun.

      Veriler:
      - Geciken Görev Sayısı: ${data?.overdueTasks?.length || 0}
      - Bu Hafta Tamamlanan: ${data?.completedThisWeek || 0}
      - Toplam Bekleyen Ödeme: ${data?.paymentSummary?.totalUnpaid || 0} TL
      - Durum Dağılımı: ${JSON.stringify(data?.statusBreakdown || [])}

      Cevabını Markdown formatında, kısa paragraflar veya maddeler halinde ver. Çok uzun olmasın.
    `;

        // Using gemini-flash-latest as verified by check-models.mjs for better quota availability
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error Response:", JSON.stringify(result, null, 2));
            throw new Error(result.error?.message || "Gemini API request failed");
        }

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Özet oluşturulamadı.";
        console.log("AI Summary Generated Successfully via Fetch");

        return NextResponse.json({ summary: text });
    } catch (error: any) {
        console.error("Detailed AI Error:", error);
        return NextResponse.json({
            error: "AI hatası: " + (error.message || "Bilinmeyen hata"),
        }, { status: 500 });
    }
}
