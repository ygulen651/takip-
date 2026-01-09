import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Global instance removed to ensure key is read from env on each request

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { title } = await req.json();

        if (!title) {
            return NextResponse.json({ error: "Başlık gerekli" }, { status: 400 });
        }

        const apiKey = (process.env.GEMINI_API_KEY || "").trim();
        if (!apiKey || apiKey.length < 10) {
            return NextResponse.json({ suggestion: "Gemini API anahtarı yapılandırılmamış." });
        }

        const prompt = `
      Sen bir proje yöneticisi asistanısın. Aşağıdaki görev başlığına göre profesyonel, detaylı ve maddeler halinde bir görev açıklaması yaz.
      Türkçe cevap ver. Gerekiyorsa teknik detaylar ekle.

      Görev Başlığı: ${title}

      Cevabını doğrudan açıklama metni olarak ver, başka bir giriş yapma.
    `;

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
            console.error("Gemini Suggest Error Response:", JSON.stringify(result, null, 2));
            throw new Error(result.error?.message || "Gemini API request failed");
        }

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Öneri oluşturulamadı.";
        return NextResponse.json({ suggestion: text });
    } catch (error: any) {
        console.error("AI Suggest Error:", error);
        return NextResponse.json({ error: "Öneri oluşturulurken bir hata oluştu: " + error.message }, { status: 500 });
    }
}
