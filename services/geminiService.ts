import { GoogleGenAI, Type } from "@google/genai";
import type { Expense, AnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        categoryTotals: {
            type: Type.ARRAY,
            description: "An array of objects, each representing a spending category and its total amount. Categories should be concise (e.g., 'Food & Drink', 'Transportation', 'Shopping', 'Bills', 'Entertainment', 'Other').",
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING },
                    total: { type: Type.NUMBER }
                },
                required: ["category", "total"]
            }
        },
        summary: {
            type: Type.STRING,
            description: "A brief, insightful, and friendly summary including INR value of spending habits based on the provided data. All monetary values should be in INR."
        },
        tips: {
            type: Type.ARRAY,
            description: "A list of 2-3 actionable, concise financial tips based on the spending patterns; Always show INR value that can be reduced or saved by implementing the tips.",
            items: { type: Type.STRING }
        }
    },
    required: ["categoryTotals", "summary", "tips"]
};

export async function analyzeExpenses(expenses: Expense[]): Promise<AnalysisResult> {
    // Aggregate expenses by category. This drastically reduces the prompt size,
    // preventing token limit errors which are the likely cause of the API failure.
    const aggregatedExpenses: { [key: string]: { total: number; count: number; examples: string[] } } = {};

    expenses.forEach(expense => {
        const category = expense.category || 'Uncategorized';
        if (!aggregatedExpenses[category]) {
            aggregatedExpenses[category] = { total: 0, count: 0, examples: [] };
        }
        aggregatedExpenses[category].total += expense.amount;
        aggregatedExpenses[category].count++;
        // Add a few example descriptions for context, without making the prompt too large
        if (aggregatedExpenses[category].examples.length < 3) {
            aggregatedExpenses[category].examples.push(expense.description);
        }
    });

    const expenseDataForAI = Object.entries(aggregatedExpenses).map(([category, data]) => ({
        category,
        totalAmount: parseFloat(data.total.toFixed(2)),
        transactionCount: data.count,
        exampleDescriptions: data.examples,
    }));

    const prompt = `
        Analyze the following aggregated list of personal expenses with amounts in INR.
        Based on this data, provide:
        1. A consolidated list of spending category totals. You can merge similar categories (e.g., 'Food - Swiggy' and 'Food - Zomato' into 'Food Delivery'). The output must match the schema: an array of objects, each with 'category' and 'total'.
        2. A brief, insightful, and friendly summary of the spending habits. Mention total spending and percentage of spend and key areas. All monetary values must be in INR.
        3. A list of 2-3 actionable, concise financial tips including spends to stop and avoid or reduce based on the spending patterns. Always show total INR value that can be saved by implementing the tips.

        Aggregated Expenses Data: ${JSON.stringify(expenseDataForAI)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.5,
            },
        });
        
        const jsonText = response.text;

        // The original error was 'Cannot read properties of undefined (reading 'trim')',
        // which happens when response.text is undefined. This check handles that case.
        if (!jsonText) {
            console.error("Gemini API returned no text. Full response:", JSON.stringify(response, null, 2));
            const finishReason = response.candidates?.[0]?.finishReason;
            if (finishReason === 'SAFETY') {
                throw new Error("Analysis was blocked due to safety concerns. Please check expense descriptions for any problematic content.");
            }
            throw new Error("The AI model returned an empty response. This might be a temporary issue with the API. Please try again.");
        }
        
        const parsedResult = JSON.parse(jsonText.trim());

        // Basic validation
        if (!parsedResult.categoryTotals || !parsedResult.summary || !parsedResult.tips) {
            throw new Error("Invalid analysis format received from AI.");
        }
        
        return parsedResult as AnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        if (error instanceof SyntaxError) {
             throw new Error("Could not get analysis from Gemini API: The model returned an invalid format.");
        }
        throw new Error(`Could not get analysis from Gemini API. ${errorMessage}`);
    }
}

export async function getChatbotResponse(expenses: Expense[], userPrompt: string): Promise<string> {
    const expenseDataForAI = expenses.map(({ date, description, amount, level1, level2, level3 }) => 
      ({ date, description, amount: parseFloat(amount.toFixed(2)), level1, level2, level3 })
    );

    const prompt = `
      You are a personal financial analyst chatbot.
      Your task is to analyze a user's filtered expense data and answer their question.
      The user has already filtered their transactions to a specific view, and you are being provided with ONLY that filtered data.
      The user's question is: "${userPrompt}"

      Based on the following JSON data of their expenses (in INR), provide a crisp response.
      Your response MUST be friendly, insightful, provide future actionable points, and be less than 100 words.
      Do not repeat the user's question. Focus on the answer and actionable advice.

      Expense Data: ${JSON.stringify(expenseDataForAI.slice(0, 100))}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const text = response.text;
        if (!text) {
             throw new Error("The AI model returned an empty response.");
        }
        return text;
    } catch (error) {
        console.error("Error calling Gemini API for chatbot:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(`Could not get analysis from AI. ${errorMessage}`);
    }
}
