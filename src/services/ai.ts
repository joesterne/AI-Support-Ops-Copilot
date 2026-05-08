import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface TicketAnalysis {
  classification: string;
  sentiment: string;
  priority: string;
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

export async function analyzeTicket(
  ticketContent: string,
  allowedPriorities: string[] = ["Low", "Medium", "High", "Critical"],
  allowedClassifications: string[] = ["Billing", "Technical Support", "Feature Request", "Bug"]
): Promise<TicketAnalysis> {
  const ticketAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
      classification: {
        type: Type.STRING,
        description: `The category or classification of the ticket. Should be one of these if possible, but can create a new one if none fit: ${allowedClassifications.join(", ")}.`,
        enum: allowedClassifications.length > 0 ? allowedClassifications : undefined,
      },
      sentiment: {
        type: Type.STRING,
        description: "Customer sentiment (e.g., Frustrated, Neutral, Happy).",
      },
      priority: {
        type: Type.STRING,
        description: "The priority or urgency level.",
        enum: allowedPriorities.length > 0 ? allowedPriorities : undefined,
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

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export async function chatAboutTicket(
  ticketContent: string,
  analysisResult: TicketAnalysis,
  history: ChatMessage[],
  newMessage: string
): Promise<string> {
  const systemInstruction = `You are an expert AI Support Operations Copilot assisting a customer support agent.
The agent is currently looking at the following customer ticket:
----------------
${ticketContent}
----------------

Your previous analysis of this ticket:
${JSON.stringify(analysisResult, null, 2)}

Provide concise, highly actionable advice. Help the agent draft replies, navigate company policies, or handle angry customers.`;

  const contents: any[] = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));

  contents.push({ role: "user", parts: [{ text: newMessage }] });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    if (!response.text) {
      throw new Error("No response from AI model.");
    }

    return response.text;
  } catch (error) {
    console.error("Error chatting with AI:", error);
    throw new Error("Failed to get response from Gemini. Please try again.");
  }
}

export interface NewsArticle {
  title: string;
  summary: string;
  url?: string;
}

export async function fetchLatestNews(
  ticketContent: string,
  classification: string
): Promise<NewsArticle[]> {
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The title of the news article" },
        summary: { type: Type.STRING, description: "A concise summary of the news article" },
        url: { type: Type.STRING, description: "The URL of the news article" }
      },
      required: ["title", "summary", "url"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Find the 3 most recent news articles related to this customer ticket issue. 
      
Ticket Content:
${ticketContent}

Classification: ${classification}

Return the latest relevant news articles using the provided schema. If there are no relevant news articles, return an empty array.`,
      tools: [
        { googleSearch: {} }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2, // Low temperature for more factual results
      }
    });

    if (!response.text) {
      return [];
    }

    return JSON.parse(response.text) as NewsArticle[];
  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error("Failed to fetch latest news.");
  }
}
