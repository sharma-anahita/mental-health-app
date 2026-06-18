import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import Button from '../ui/Button';

interface FeedbackButtonsProps {
  rating: 'helpful' | 'not_helpful' | null;
  onRating: (rating: 'helpful' | 'not_helpful') => Promise<void> | void;
  disabled?: boolean;
}

export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  rating,
  onRating,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);

  const handleRating = async (r: 'helpful' | 'not_helpful') => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      await onRating(r);
    } catch (err) {
      // Failure is reverted by store, ignored locally
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        type="button"
        onClick={() => handleRating('helpful')}
        disabled={disabled || loading}
        className={`px-3 py-1.5 flex items-center gap-1.5 text-xs rounded-xl shadow-none transition-all ${
          rating === 'helpful'
            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-150 border border-emerald-200'
            : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)] hover:ring-1 hover:ring-[var(--theme-card-ring)]'
        }`}
        title="Helpful"
      >
        <ThumbsUp className={`w-3.5 h-3.5 ${rating === 'helpful' ? 'fill-emerald-800 text-emerald-850' : 'text-[var(--theme-text-subtle)]'}`} />
        <span>Helpful</span>
      </Button>

      <Button
        variant="ghost"
        type="button"
        onClick={() => handleRating('not_helpful')}
        disabled={disabled || loading}
        className={`px-3 py-1.5 flex items-center gap-1.5 text-xs rounded-xl shadow-none transition-all ${
          rating === 'not_helpful'
            ? 'bg-rose-100 text-rose-800 hover:bg-rose-150 border border-rose-200'
            : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)] hover:ring-1 hover:ring-[var(--theme-card-ring)]'
        }`}
        title="Not Helpful"
      >
        <ThumbsDown className={`w-3.5 h-3.5 ${rating === 'not_helpful' ? 'fill-rose-800 text-rose-850' : 'text-[var(--theme-text-subtle)]'}`} />
        <span>Not Helpful</span>
      </Button>
    </div>
  );
};

export default FeedbackButtons;
