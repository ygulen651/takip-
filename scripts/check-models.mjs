import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function listModels() {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
            return;
        }

        console.log("--- AVAILABLE MODELS (v1beta) ---");
        data.models?.forEach(m => {
            console.log(`- ${m.name}`);
        });
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

listModels();
