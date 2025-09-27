import { GoogleGenAI, Chat } from "@google/genai";

// FIX: Initialize GoogleGenAI with the API key directly from environment variables as per guidelines.
// Removed fallback logic and warning messages for the API key.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

export function getGeminiChat(): Chat {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are a helpful AI assistant called Studytube AI. Help users with their questions concisely and accurately.',
    },
  });
}
