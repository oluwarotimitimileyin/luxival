import { GoogleGenAI } from '@google/genai';
import { Message, AgentConfig } from '../types';

// Initialize the client. Assumes process.env.API_KEY is available in the environment.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

export const streamChatResponse = async function* (
  history: Message[],
  newMessage: string,
  config: AgentConfig,
  imageBase64?: string,
  mimeType?: string
) {
  try {
    // Format history for the API
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Add the new message
    const newParts: any[] = [];
    if (imageBase64 && mimeType) {
      newParts.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      });
    }
    newParts.push({ text: newMessage });

    contents.push({
      role: 'user',
      parts: newParts
    });

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: config.systemInstruction,
        temperature: 0.7,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Error in Gemini stream:", error);
    yield "I'm sorry, I encountered an error processing your request. Please try again later.";
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data:image/jpeg;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
};