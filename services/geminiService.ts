import { GoogleGenAI, Chat, Modality, Type, Schema, Content } from "@google/genai";
import { AppConfig, UserProfile, VoicePersona, ChatMessage } from "../types";

// Define the response schema to separate display text from speech text
const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    markdownResponse: {
      type: Type.STRING,
      description: "The formatted text to display in the chat UI. Use Markdown for styling code, lists, and emphasis.",
    },
    speechResponse: {
      type: Type.STRING,
      description: "The clean, natural spoken version of the response. DO NOT include special characters, punctuation names, or formatting symbols. Use simple, conversational English (Indian style).",
    },
  },
  required: ["markdownResponse", "speechResponse"],
};

const SYSTEM_INSTRUCTION_BASE = `
SYSTEM_MODE: CYBER_MENTOR
VERSION: INDIAN_ENGLISH_SPEECH_OPTIMIZED

ROLE:
You are a 10X Cybersecurity Master Mentor with real-world expertise in Red Team, Blue Team, and SOC Analyst roles.
You understand Indian learners, career pressure, and the job market.
You are NOT a foreign-style AI. You speak and think like an Indian professional mentor.

COMMUNICATION STYLE:
- Natural Indian professional conversation.
- Clear, slow, human-like pacing.
- Keep responses CONCISE and TO THE POINT to respect the user's time.
- Simple sentences, no heavy vocabulary.
- Mentor-like reassurance.

ABSOLUTE SPEECH RULES (CRITICAL):
- In the 'speechResponse' field, DO NOT read symbols aloud.
- DO NOT pronounce special characters (hyphens, slashes, colons, code blocks).
- Convert meaning silently (e.g., "Red-Team" -> "Red Team").
- Speak ONLY clean English sentences.

INTERACTION:
- Encourage consistently.
- Reduce fear of complexity.
- If the learner is bored, change style, give real examples.
`;

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

const getAI = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API Key not found");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const initializeChat = async (config: AppConfig, profile: UserProfile, previousMessages: ChatMessage[] = []) => {
  const aiInstance = getAI();
  
  const personaInstruction = `
    ${SYSTEM_INSTRUCTION_BASE}
    
    CURRENT STUDENT PROFILE:
    Name: ${profile.name}
    Age: ${profile.age}
    Education: ${profile.education}
    Goal: ${profile.goal}
    
    SELECTED CONFIG:
    Accent: ${config.accent}
    Speed: ${config.speed}
    Track: ${config.track}
    Voice Persona: ${config.voice}

    Start the conversation by welcoming ${profile.name} and acknowledging their goal of ${profile.goal}.
    Keep it brief and encouraging.
  `;

  // Map internal ChatMessage history to Gemini Content format
  // This allows the model to "remember" the previous context immediately
  const history: Content[] = previousMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.sender === 'user' ? msg.text : JSON.stringify({
        markdownResponse: msg.text,
        speechResponse: msg.speechText || msg.text
    })}]
  }));

  chatSession = aiInstance.chats.create({
    model: 'gemini-3-flash-preview',
    history: history,
    config: {
      systemInstruction: personaInstruction,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  return chatSession;
};

export interface AgentResponse {
  markdownResponse: string;
  speechResponse: string;
}

export const sendMessageToGemini = async (message: string): Promise<AgentResponse> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  const result = await chatSession.sendMessage({
    message: message
  });

  const text = result.text;
  if (!text) throw new Error("No response from Gemini");

  try {
    return JSON.parse(text) as AgentResponse;
  } catch (e) {
    console.error("Failed to parse JSON response:", text);
    // Fallback if model fails to output JSON
    return {
      markdownResponse: text,
      speechResponse: text.replace(/[*#`_]/g, '') // Basic cleanup
    };
  }
};

export const synthesizeSpeech = async (text: string, voice: VoicePersona): Promise<ArrayBuffer> => {
  const aiInstance = getAI();
  
  // Voice name is passed directly from the enum (Puck, Charon, Kore, Fenrir, Zephyr)
  const voiceName = voice;

  const response = await aiInstance.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: {
      parts: [{ text: text }],
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  const base64Audio = part?.inlineData?.data;
  
  if (!base64Audio) {
    if (part?.text) {
        console.warn("TTS Model returned text instead of audio:", part.text);
    }
    throw new Error("No audio data generated");
  }

  // Convert Base64 to ArrayBuffer
  const binaryString = window.atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};
