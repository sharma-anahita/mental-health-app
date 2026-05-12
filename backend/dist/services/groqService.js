"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateChatReply = void 0;
const axios_1 = __importDefault(require("axios"));
const GROQ_API_BASE_URL = process.env.GROQ_API_BASE_URL || 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const groqClient = axios_1.default.create({
    baseURL: GROQ_API_BASE_URL,
    timeout: 12000,
});
const buildSystemPrompt = (mood) => {
    const base = 'You are a supportive mental wellness assistant. Keep responses concise, practical, and non-judgmental.';
    if (!mood)
        return base;
    const normalized = mood.trim().toLowerCase();
    if (normalized === 'sad') {
        return `${base} The user feels sad right now. Respond with extra empathy, warmth, and gentle reassurance.`;
    }
    if (normalized === 'happy') {
        return `${base} The user feels happy right now. Respond with an encouraging, positive, and uplifting tone.`;
    }
    return base;
};
const generateChatReply = async (message, previousMessages, mood) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not configured');
    }
    const payloadMessages = [
        { role: 'system', content: buildSystemPrompt(mood) },
        ...previousMessages,
        { role: 'user', content: message },
    ];
    const response = await groqClient.post('/chat/completions', {
        model: GROQ_MODEL,
        messages: payloadMessages,
        temperature: 0.7,
    }, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
    });
    const aiMessage = response.data?.choices?.[0]?.message?.content;
    if (!aiMessage || typeof aiMessage !== 'string') {
        throw new Error('Invalid response from Groq API');
    }
    return aiMessage.trim();
};
exports.generateChatReply = generateChatReply;
exports.default = { generateChatReply: exports.generateChatReply };
