

import { GoogleGenAI, Chat, Type, Modality } from "@google/genai";
import type { QuizItem, TimestampedNote } from '../types';

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

export async function generateQuiz(title: string, notes: TimestampedNote[]): Promise<QuizItem[]> {
  try {
    const notesContext = notes.length > 0
      ? 'The video has the following user-created notes which you can use for context: ' + notes.map(n => n.content).join(', ')
      : '';
      
    const prompt = `Generate a short multiple-choice quiz with 3-5 questions to test a user's understanding of a YouTube video titled "${title}". ${notesContext} The questions should be relevant to the potential content of such a video. Ensure the "correctAnswer" value is one of the strings from the "options" array.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { 
                type: Type.STRING,
                description: "The quiz question."
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 3 to 4 possible answers."
              },
              correctAnswer: { 
                type: Type.STRING,
                description: "The correct answer, which must be one of the strings in the 'options' array."
              }
            },
            required: ['question', 'options', 'correctAnswer']
          }
        }
      }
    });
    
    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("Received an empty response from the AI.");
    }

    const quizData = JSON.parse(jsonText);

    if (!Array.isArray(quizData) || quizData.length === 0) {
        throw new Error("AI returned invalid quiz format.");
    }
    
    return quizData as QuizItem[];

  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate a quiz. The AI may be unable to process this topic. Please try again later.");
  }
}

export async function generateImageForFlashcard(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        return part.inlineData.data; // This is the base64 string
      }
    }

    throw new Error("AI did not return an image.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate an image. The AI may be busy or the prompt could not be processed. Please try again.");
  }
}