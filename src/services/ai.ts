import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface TicketAnalysis {
  classification: string;
  sentiment: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  suggestedResponse: string;
  escalationDecision: string;
  jiraBugDraft?: {
    title: string;
    description: string;
  };
  kbSuggestion?: {
    title: string;
    outline: string;
  };
}

const ticketAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    classification: {
      type: Type.STRING,
      description: "The category or classification of the ticket (e.g., Billing, Technical Support, Feature Request, Bug).",
    },
    sentiment: {
      type: Type.STRING,
      description: "Customer sentiment (e.g., Frustrated, Neutral, Happy).",
    },
    priority: {
      type: Type.STRING,
      description: "The priority or urgency level.",
      enum: ["Low", "Medium", "High", "Critical"],
    },
    suggestedResponse: {
      type: Type.STRING,
      description: "A professional, empathetic, and actionable suggested response to the customer.",
    },
    escalationDecision: {
      type: Type.STRING,
      description: "Decision on whether this needs to be escalated to tier 2 or engineering, including justification.",
    },
    jiraBugDraft: {
      type: Type.OBJECT,
      description: "Draft for a Jira bug report if the ticket describes a potential bug. Otherwise omit.",
      properties: {
        title: { type: Type.STRING, description: "Concise bug title" },
        description: { type: Type.STRING, description: "Detailed bug description with expected vs actual behavior and steps to reproduce (in markdown)" },
      },
      required: ["title", "description"],
    },
    kbSuggestion: {
      type: Type.OBJECT,
      description: "Suggestion for a knowledge base article based on this ticket, if it reveals a documentation gap. Otherwise omit.",
      properties: {
        title: { type: Type.STRING, description: "Suggested article title" },
        outline: { type: Type.STRING, description: "Brief outline or bullet points of the content" },
      },
      required: ["title", "outline"],
    },
  },
  required: ["classification", "sentiment", "priority", "suggestedResponse", "escalationDecision"],
};

export async function analyzeTicket(ticketContent: string): Promise<TicketAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Analyze the following support ticket:\n\n${ticketContent}`,
      config: {
        systemInstruction: "You are an expert AI Support Operations Copilot. Your job is to analyze incoming support tickets, classify them, determine priority based on urgency and business impact, draft empathetic customer responses, decide on escalation paths, and optionally draft engineering bugs or knowledge base articles. Ensure the highest quality analysis.",
        responseMimeType: "application/json",
        responseSchema: ticketAnalysisSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI model.");
    }

    return JSON.parse(text) as TicketAnalysis;
  } catch (error) {
    console.error("Error analyzing ticket:", error);
    throw new Error("Failed to analyze the ticket. Please try again.");
  }
}
