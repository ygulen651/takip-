import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                suggestion: "Gemini API anahtarı yapılandırılmamış."
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      Sen bir proje yöneticisi asistanısın. Aşağıdaki görev başlığına göre profesyonel, detaylı ve maddeler halinde bir görev açıklaması yaz.
      Türkçe cevap ver. Gerekiyorsa teknik detaylar ekle.

      Görev Başlığı: ${title}

      Cevabını doğrudan açıklama metni olarak ver, başka bir giriş yapma.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ suggestion: text });
    } catch (error) {
        console.error("AI Suggest Error:", error);
        return NextResponse.json({ error: "Öneri oluşturulurken bir hata oluştu." }, { status: 500 });
    }
}
