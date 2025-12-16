import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeReceipt = async (base64Image: string): Promise<any> => {
  // Robustly extract MIME type and data from the Data URL
  // Format: data:image/jpeg;base64,/9j/4AAQ...
  const matches = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid image format. Please ensure the file is a valid image (PNG, JPG, WEBP).");
  }

  const mimeType = matches[1];
  const data = matches[2];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          },
          {
            text: `Analyze this receipt image and extract the expense details.
            Return a JSON object with:
            - amount (number)
            - currency (string, ISO code like USD, EUR, GBP, JPY. Default to USD if unclear)
            - date (string, YYYY-MM-DD format)
            - merchant (string, store or vendor name)
            - category (string, best guess among: Travel, Meals, Lodging, Office Supplies, Software)
            - description (string, brief summary of items)`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            date: { type: Type.STRING },
            merchant: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw error;
  }
};