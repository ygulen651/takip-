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

        const { data } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                summary: "Gemini API anahtarı yapılandırılmamış. Lütfen yönetici ile iletişime geçin."
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      Sen bir iş takip asistanısın. Aşağıdaki dashboard verilerini analiz et ve kullanıcıya (Yönetici veya Çalışan) kısa, profesyonel ve motive edici bir özet çıkar. 
      Türkçe cevap ver. Kritik gecikmelere dikkat çek ve önerilerde bulun.

      Veriler:
      - Geciken Görev Sayısı: ${data.overdueTasks.length}
      - Bu Hafta Tamamlanan: ${data.completedThisWeek}
      - Toplam Bekleyen Ödeme: ${data.paymentSummary?.totalUnpaid || 0} TL
      - Durum Dağılımı: ${JSON.stringify(data.statusBreakdown)}

      Cevabını Markdown formatında, kısa paragraflar veya maddeler halinde ver. Çok uzun olmasın.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ summary: text });
    } catch (error) {
        console.error("AI Error:", error);
        return NextResponse.json({ error: "AI özeti oluşturulurken bir hata oluştu." }, { status: 500 });
    }
}
