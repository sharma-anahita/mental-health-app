import axios, { AxiosInstance } from 'axios';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

const GROQ_API_BASE_URL = process.env.GROQ_API_BASE_URL || 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const groqClient: AxiosInstance = axios.create({
  baseURL: GROQ_API_BASE_URL,
  timeout: 12_000,
});

const buildSystemPrompt = (mood?: string): string => {
  const base =
    'You are a supportive mental wellness assistant. Keep responses concise, practical, and non-judgmental.';

  if (!mood) return base;

  const normalized = mood.trim().toLowerCase();

  if (normalized === 'sad') {
    return `${base} The user feels sad right now. Respond with extra empathy, warmth, and gentle reassurance.`;
  }

  if (normalized === 'happy') {
    return `${base} The user feels happy right now. Respond with an encouraging, positive, and uplifting tone.`;
  }

  return base;
};

export const generateChatReply = async (
  message: string,
  previousMessages: ChatMessage[],
  mood?: string
): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const payloadMessages: Array<{ role: 'system' | ChatRole; content: string }> = [
    { role: 'system', content: buildSystemPrompt(mood) },
    ...previousMessages,
    { role: 'user', content: message },
  ];

  const response = await groqClient.post(
    '/chat/completions',
    {
      model: GROQ_MODEL,
      messages: payloadMessages,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const aiMessage = response.data?.choices?.[0]?.message?.content;
  if (!aiMessage || typeof aiMessage !== 'string') {
    throw new Error('Invalid response from Groq API');
  }

  return aiMessage.trim();
};

export default { generateChatReply };
