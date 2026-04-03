import { useMemo, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { sendChatMessage } from '../../services/chatService';

type MoodType = 'neutral' | 'sad' | 'happy';

type UIMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const MAX_VISIBLE_MESSAGES = 20;

function moodToRequestValue(mood: MoodType): string | undefined {
  if (mood === 'neutral') return undefined;
  return mood;
}

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [mood, setMood] = useState<MoodType>('neutral');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<UIMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: 'Hi, I am here to support you. How are you feeling today?',
    },
  ]);

  const canSend = input.trim().length > 0 && !isLoading;

  const visibleMessages = useMemo(() => messages.slice(-MAX_VISIBLE_MESSAGES), [messages]);

  const onSend = async () => {
    if (!canSend) return;

    const content = input.trim();
    const userMessage: UIMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
    };

    setInput('');
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const data = await sendChatMessage({
        message: content,
        mood: moodToRequestValue(mood),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.response || 'I could not generate a response right now.',
        },
      ]);
    } catch (error: any) {
      const message =
        error?.message ||
        'Something went wrong while contacting AI. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      {isOpen ? (
        <div
          className="w-[min(92vw,360px)] rounded-2xl border shadow-2xl backdrop-blur-sm"
          style={{
            background: 'var(--theme-card-bg)',
            borderColor: 'var(--theme-card-ring)',
            boxShadow: '0 18px 45px rgba(0,0,0,0.2)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b rounded-t-2xl"
            style={{ borderColor: 'var(--theme-card-ring)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--theme-accent-subtle)' }}
              >
                <MessageCircle className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                  Chat with AI
                </p>
                <p className="text-xs" style={{ color: 'var(--theme-text-subtle)' }}>
                  Always here to listen
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg"
              style={{ color: 'var(--theme-text-secondary)' }}
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-4 pt-3 pb-2">
            <label className="text-xs font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
              Mood tone
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value as MoodType)}
              className="mt-1 w-full rounded-lg border px-2 py-1.5 text-sm bg-transparent outline-none"
              style={{
                borderColor: 'var(--theme-card-ring)',
                color: 'var(--theme-text-primary)',
              }}
            >
              <option value="neutral">Neutral</option>
              <option value="sad">Sad</option>
              <option value="happy">Happy</option>
            </select>
          </div>

          <div className="px-4 h-72 overflow-y-auto space-y-3 pb-3">
            {visibleMessages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === 'user' ? 'ml-auto' : 'mr-auto'
                }`}
                style={
                  msg.role === 'user'
                    ? {
                        background: 'var(--theme-accent)',
                        color: '#ffffff',
                      }
                    : {
                        background: 'var(--theme-accent-subtle)',
                        color: 'var(--theme-text-primary)',
                      }
                }
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div
                className="mr-auto max-w-[85%] rounded-xl px-3 py-2 text-sm"
                style={{
                  background: 'var(--theme-accent-subtle)',
                  color: 'var(--theme-text-secondary)',
                }}
              >
                Thinking...
              </div>
            )}
          </div>

          <div
            className="p-3 border-t rounded-b-2xl"
            style={{ borderColor: 'var(--theme-card-ring)' }}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: 'var(--theme-card-ring)',
                  background: 'transparent',
                  color: 'var(--theme-text-primary)',
                }}
              />
              <button
                type="button"
                onClick={onSend}
                disabled={!canSend}
                className="rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-50"
                style={{
                  background: 'var(--theme-accent)',
                  color: '#ffffff',
                }}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold shadow-lg"
          style={{
            background: 'var(--theme-accent)',
            color: '#ffffff',
            boxShadow: '0 12px 25px rgba(0,0,0,0.2)',
          }}
          aria-label="Open AI chat"
        >
          <MessageCircle className="w-4 h-4" />
          Chat with AI
        </button>
      )}
    </div>
  );
};

export default AIChatWidget;
