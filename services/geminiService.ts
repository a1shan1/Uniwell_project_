
import { GoogleGenAI, Tool } from "@google/genai";
import { GeminiResult, SearchParams } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const searchPlaces = async (
  params: SearchParams, 
  userLocation?: { lat: number; lng: number }
): Promise<GeminiResult> => {
  
  const { query, vibe, category, radius, features } = params;

  const tools: Tool[] = [{ googleMaps: {} }];
  
  let toolConfig = undefined;
  if (userLocation) {
    toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: userLocation.lat,
          longitude: userLocation.lng
        }
      }
    };
  }

  const locationContext = userLocation 
    ? `near my current location (lat: ${userLocation.lat}, lng: ${userLocation.lng}) within a ${radius} radius`
    : `in the Greater Toronto Area (GTA) within a ${radius} range of downtown`;

  const featureList = [];
  if (features.openLate) featureList.push("Must be open late");
  if (features.wifi) featureList.push("Must have good Wifi");
  if (features.cheapEats) featureList.push("Affordable/Student friendly prices");
  if (features.powerOutlets) featureList.push("Available power outlets/charging");

  const prompt = `
    I am a university student in the GTA.
    Find me a compilation of places that match these criteria:
    - What: ${category}
    - Vibe: ${vibe}
    - Radius/Location: ${locationContext}
    - Specific preferences: ${query}
    - Must Haves: ${featureList.join(", ") || "None"}
    
    Find exactly 5-6 specific, real locations.
    
    For each location provide:
    1. Name
    2. Exact Address
    3. A short, aesthetic description (max 2 sentences).
    4. 2-3 short tags (e.g. "Aesthetic", "Wifi", "Late Night").
    5. Accurate coordinates.
    6. A realistic rating (number between 3.8 and 4.9).
    7. A realistic review count (number).
    8. 2 short, realistic review snippets (what students say about it).
    9. A single keyword string for searching images (e.g. "coffee shop interior", "modern library").

    CRITICAL: Return the response primarily as a JSON block at the end. The text before it should be a very brief (1 sentence) summary like "Found these spots for you:".

    The JSON structure must be:
    \`\`\`json
    [
      {
        "name": "Location Name",
        "lat": 43.123,
        "lng": -79.123,
        "description": "Short summary",
        "address": "Street Address",
        "tags": ["Tag1", "Tag2"],
        "rating": 4.5,
        "reviews": 120,
        "reviewSnippets": ["Best coffee ever.", "Great for studying."],
        "imageKeywords": "latte art cafe"
      }
    ]
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools,
        toolConfig,
        systemInstruction: "You are a trendy local guide for Gen Z students. You know the aesthetic spots, the hidden gems, and the practical study hubs. Be concise."
      }
    });

    const text = response.text || "No results found.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as any;

    return {
      text,
      groundingChunks
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Error searching places. Please try again.",
    };
  }
};
