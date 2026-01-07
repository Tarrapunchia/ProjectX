
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const summarizeDocument = async (content: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Please provide a concise summary of the following document content: ${content}`,
      config: {
        systemInstruction: "You are a professional workspace assistant. Summarize documents into 3-5 key bullet points.",
      }
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating summary.";
  }
};

export const suggestTasks = async (content: string): Promise<any[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this document content, suggest 3-5 actionable tasks: ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
            },
            required: ['title', 'description', 'priority']
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Task Suggestion Error:", error);
    return [];
  }
};

export const generateCanvasDesign = async (prompt: string): Promise<any[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a visual layout for: ${prompt}. Return a list of SVG-like elements (rect, circle, text).`,
      config: {
        systemInstruction: "You are a visual design assistant. Generate layouts as JSON arrays. Coordinates should be between 0 and 800. Colors should be modern hex codes.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['rect', 'circle', 'text'] },
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              width: { type: Type.NUMBER },
              height: { type: Type.NUMBER },
              fill: { type: Type.STRING },
              text: { type: Type.STRING }
            },
            required: ['type', 'x', 'y', 'width', 'height', 'fill']
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Design Generation Error:", error);
    return [];
  }
};
