"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithAI = void 0;
const groqService_1 = require("../services/groqService");
const MAX_HISTORY_MESSAGES = 5;
const chatHistoryByUser = new Map();
const getUserHistory = (userId) => {
    const history = chatHistoryByUser.get(userId);
    return history ? [...history] : [];
};
const setUserHistory = (userId, history) => {
    chatHistoryByUser.set(userId, history.slice(-MAX_HISTORY_MESSAGES));
};
const chatWithAI = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { message, mood } = req.body;
        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ message: 'message is required' });
        }
        const userMessage = message.trim();
        const history = getUserHistory(userId);
        const aiResponse = await (0, groqService_1.generateChatReply)(userMessage, history, mood);
        const newEntries = [
            { role: 'user', content: userMessage },
            { role: 'assistant', content: aiResponse },
        ];
        const updatedHistory = [...history, ...newEntries].slice(-MAX_HISTORY_MESSAGES);
        setUserHistory(userId, updatedHistory);
        return res.json({ response: aiResponse });
    }
    catch (err) {
        next(err);
    }
};
exports.chatWithAI = chatWithAI;
exports.default = { chatWithAI: exports.chatWithAI };
