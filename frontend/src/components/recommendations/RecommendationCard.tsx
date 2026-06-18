import React from 'react';
import type { ScoredActivity, ScoredQuestion } from '../../types/recommendation';
import ActivityCard from './ActivityCard';
import QuestionCard from './QuestionCard';

type RecommendationCardProps =
  | {
      type: 'activity';
      item: ScoredActivity;
      onAddGoal: () => Promise<void> | void;
      onFeedback: (rating: 'helpful' | 'not_helpful') => Promise<void> | void;
      onUseQuestion?: never;
    }
  | {
      type: 'question';
      item: ScoredQuestion;
      onUseQuestion: () => void;
      onFeedback: (rating: 'helpful' | 'not_helpful') => Promise<void> | void;
      onAddGoal?: never;
    };

export const RecommendationCard: React.FC<RecommendationCardProps> = (props) => {
  if (props.type === 'activity') {
    return (
      <ActivityCard
        activity={props.item}
        onAddGoal={props.onAddGoal}
        onFeedback={props.onFeedback}
      />
    );
  }
  return (
    <QuestionCard
      question={props.item}
      onUseQuestion={props.onUseQuestion}
      onFeedback={props.onFeedback}
    />
  );
};

export default RecommendationCard;
