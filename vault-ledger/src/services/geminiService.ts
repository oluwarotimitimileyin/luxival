import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface ExtractedExpense {
  merchantName: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  taxAmount?: number;
  taxRate?: number;
  reference?: string;
  isBusiness: boolean;
  explanation: string;
  isRecurring: boolean;
  frequency?: 'weekly' | 'monthly' | 'yearly';
}

export async function extractExpenseFromImage(fileData: string, mimeType: string): Promise<ExtractedExpense> {
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: "Analyze this document (receipt, invoice, bill, or financial statement). Extract the transaction details into JSON. Rules: 1. Convert any currency to its ISO symbol (e.g. €). 2. Categorize based on business purpose. 3. If it's clearly a personal item, mark isBusiness as false. 4. Identify if this is likely a recurring subscription (e.g. SaaS, utility, rent) and set isRecurring accordingly. 5. If recurring, estimate the frequency (weekly, monthly, yearly). 6. Identify the tax amount and tax rate (percentage) if present. 7. Provide a brief explanation for your choices.",
          },
          {
            inlineData: {
              data: fileData,
              mimeType: mimeType,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          merchantName: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          date: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["transport", "fuel", "software", "subscriptions", "office_supplies", "food", "maintenance", "marketing", "utilities", "miscellaneous"] },
          taxAmount: { type: Type.NUMBER },
          taxRate: { type: Type.NUMBER },
          reference: { type: Type.STRING },
          isBusiness: { type: Type.BOOLEAN },
          explanation: { type: Type.STRING },
          isRecurring: { type: Type.BOOLEAN },
          frequency: { type: Type.STRING, enum: ["weekly", "monthly", "yearly"] },
        },
        required: ["merchantName", "amount", "currency", "date", "category", "isBusiness", "explanation", "isRecurring"],
      },
    },
  });

  if (!result.text) {
    throw new Error("Failed to extract data from receipt");
  }

  return JSON.parse(result.text.trim());
}
