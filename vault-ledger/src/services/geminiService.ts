import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface ExtractedExpense {
  merchantName: string;
  merchantAddress?: string;
  merchantPhone?: string;
  merchantVatNumber?: string;
  merchantBusinessId?: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  taxAmount?: number;
  taxRate?: number;
  receiptNumber?: string;
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
            text: "Analyze this document (receipt, invoice, bill, or financial statement). Extract ALL available transaction details into JSON. Rules: 1. Convert any currency to its ISO symbol (e.g. €). 2. Extract the full business/merchant name. 3. Extract the merchant's address (street, city, postcode) if printed. 4. Extract the merchant's phone number if printed. 5. Extract the merchant's VAT number, GST number, or tax registration number if printed (e.g. VAT No., GSTIN, ABN, TVA). 6. Extract the merchant's company registration number, business ID, or company number if printed (e.g. Co. Reg, Company No., Business ID). 7. Extract the receipt number, invoice number, or bill number if present. 8. Extract the transaction reference or payment reference number if present. 9. Identify the VAT/tax amount and VAT/tax rate (percentage) — look for VAT, GST, TVA, MwSt, or similar labels. 10. Categorize based on business purpose. 11. If it's clearly a personal item, mark isBusiness as false. 12. Identify if this is a recurring subscription (e.g. SaaS, utility, rent) and set isRecurring accordingly. 13. If recurring, estimate the frequency (weekly, monthly, yearly). 14. Provide a brief explanation for your choices.",
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
          merchantAddress: { type: Type.STRING },
          merchantPhone: { type: Type.STRING },
          merchantVatNumber: { type: Type.STRING },
          merchantBusinessId: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          date: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["transport", "fuel", "software", "subscriptions", "office_supplies", "food", "maintenance", "marketing", "utilities", "miscellaneous"] },
          taxAmount: { type: Type.NUMBER },
          taxRate: { type: Type.NUMBER },
          receiptNumber: { type: Type.STRING },
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
