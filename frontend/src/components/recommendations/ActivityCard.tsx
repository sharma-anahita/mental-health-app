import React from 'react';
import type { ScoredActivity } from '../../types/recommendation';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import AddToGoalsButton from './AddToGoalsButton';
import FeedbackButtons from './FeedbackButtons';
import { Clock } from 'lucide-react';

interface ActivityCardProps {
  activity: ScoredActivity;
  onAddGoal: () => Promise<void> | void;
  onFeedback: (rating: 'helpful' | 'not_helpful') => Promise<void> | void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onAddGoal,
  onFeedback
}) => {
  const categoryLabels: Record<string, string> = {
    physical: 'Physical',
    cognitive: 'Cognitive',
    creative: 'Creative',
    social: 'Social',
    mindfulness: 'Mindfulness'
  };

  return (
    <Card className="flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="calm" className="capitalize text-[10px] font-semibold tracking-wide px-2 py-0.5">
            {categoryLabels[activity.category] || activity.category}
          </Badge>
          <div className="flex items-center gap-1 text-[11px] text-[var(--theme-text-subtle)] font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{activity.durationMinutes} min</span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-[var(--theme-text-primary)] mb-2">
          {activity.title}
        </h3>
        
        <p className="text-xs text-[var(--theme-text-secondary)] leading-relaxed flex-1">
          {activity.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--theme-card-ring)] mt-4">
        <FeedbackButtons rating={activity.feedbackGiven} onRating={onFeedback} />
        <AddToGoalsButton onAdd={onAddGoal} />
      </div>
    </Card>
  );
};

export default ActivityCard;
