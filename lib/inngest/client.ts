import { Inngest } from "inngest";

export const isAIEnabled = !!process.env.GEMINI_API_KEY;

if (!isAIEnabled) {
  console.warn("GEMINI_API_KEY is missing. AI-powered features in Inngest (like personalized emails) will be disabled or use fallbacks.")
}

export const inngest = new Inngest({
    id: "Stocket",
    ...(isAIEnabled ? { ai: { gemini: { apiKey: process.env.GEMINI_API_KEY } } } : {})
})