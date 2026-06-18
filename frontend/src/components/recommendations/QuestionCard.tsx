import React from 'react';
import type { ScoredQuestion } from '../../types/recommendation';
import Card from '../ui/Card';
import FeedbackButtons from './FeedbackButtons';
import Button from '../ui/Button';
import { BookOpen } from 'lucide-react';

interface QuestionCardProps {
  question: ScoredQuestion;
  onUseQuestion: () => void;
  onFeedback: (rating: 'helpful' | 'not_helpful') => Promise<void> | void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onUseQuestion,
  onFeedback
}) => {
  return (
    <Card className="flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex flex-col flex-1 justify-center min-h-[70px]">
        <blockquote className="text-[13px] font-medium italic text-[var(--theme-text-primary)] leading-relaxed pl-3 border-l-2 border-[var(--theme-accent)]">
          "{question.text}"
        </blockquote>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--theme-card-ring)] mt-5">
        <FeedbackButtons rating={question.feedbackGiven} onRating={onFeedback} />
        <Button
          variant="secondary"
          type="button"
          onClick={onUseQuestion}
          className="px-3 py-1.5 flex items-center gap-1.5 text-xs rounded-xl transition-all shadow-none hover:bg-[var(--theme-accent-subtle)] hover:text-[var(--theme-accent-text)]"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Use in Reflection</span>
        </Button>
      </div>
    </Card>
  );
};

export default QuestionCard;
