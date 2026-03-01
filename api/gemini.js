import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // The Vercel environment variable should be set as GEMINI_API_KEY in the Vercel dashboard
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured on server" });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const { action, params } = req.body;

        if (action === 'generateContent') {
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: params.contents,
                config: params.config
            });
            return res.status(200).json({ text: response.text });
        }

        if (action === 'generateContentStream') {
            // For simple proxying, we'll just return the full text for now as setting up SSE streaming 
            // in Vercel Serverless Functions requires specific headers and stream processing.
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: params.contents,
                config: params.config
            });
            return res.status(200).json({ text: response.text });
        }

        return res.status(400).json({ error: "Unknown AI action" });

    } catch (error) {
        console.error("Vercel AI Proxy Error:", error);
        return res.status(500).json({ error: error.message || "Failed to process AI request" });
    }
}
