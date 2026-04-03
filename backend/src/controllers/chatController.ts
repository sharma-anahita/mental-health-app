import { Request, Response, NextFunction } from 'express';
import { ChatMessage, generateChatReply } from '../services/groqService';

type AuthRequest = Request & { userId?: string };

const MAX_HISTORY_MESSAGES = 5;
const chatHistoryByUser = new Map<string, ChatMessage[]>();

const getUserHistory = (userId: string): ChatMessage[] => {
  const history = chatHistoryByUser.get(userId);
  return history ? [...history] : [];
};

const setUserHistory = (userId: string, history: ChatMessage[]): void => {
  chatHistoryByUser.set(userId, history.slice(-MAX_HISTORY_MESSAGES));
};

export const chatWithAI = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { message, mood } = req.body as { message?: string; mood?: string };

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'message is required' });
    }

    const userMessage = message.trim();
    const history = getUserHistory(userId);

    const aiResponse = await generateChatReply(userMessage, history, mood);

    const newEntries: ChatMessage[] = [
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiResponse },
    ];
    const updatedHistory = [...history, ...newEntries].slice(-MAX_HISTORY_MESSAGES);

    setUserHistory(userId, updatedHistory);

    return res.json({ response: aiResponse });
  } catch (err) {
    next(err);
  }
};

export default { chatWithAI };
