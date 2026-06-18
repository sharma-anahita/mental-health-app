import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import useRecommendationStore from '../../store/recommendationStore';
import Card from '../ui/Card';
import { CardTitle, SubtleText } from '../ui/Typography';
import ActivityCard from './ActivityCard';
import QuestionCard from './QuestionCard';
import LoadingState from '../ui/LoadingState';

interface RecommendationWidgetProps {
  onUseQuestion: (text: string) => void;
}

export const RecommendationWidget: React.FC<RecommendationWidgetProps> = ({
  onUseQuestion
}) => {
  const {
    recommendations,
    isLoading,
    error,
    fetchRecommendationsAsync,
    submitFeedbackAsync,
    addGoalFromRecommendationAsync
  } = useRecommendationStore();

  useEffect(() => {
    fetchRecommendationsAsync();
  }, [fetchRecommendationsAsync]);

  if (isLoading && !recommendations) {
    return (
      <Card className="p-6">
        <LoadingState message="Finding the best suggestions for you…" />
      </Card>
    );
  }

  if (error && !recommendations) {
    return null; // Return empty space instead of crashing dashboard
  }

  if (!recommendations || (recommendations.activities.length === 0 && recommendations.questions.length === 0)) {
    return null;
  }

  const topActivity = recommendations.activities[0];
  const topQuestion = recommendations.questions[0];

  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--theme-accent)]" />
            <CardTitle>Recommended For You</CardTitle>
          </div>
          <Link
            to="/recommendations"
            className="flex items-center gap-1 text-xs font-semibold text-[var(--theme-accent)] hover:text-[var(--theme-accent-hover)] hover:underline"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topActivity && (
          <div className="flex flex-col">
            <SubtleText className="mb-2 block text-[10px] font-bold uppercase tracking-wider">
              Suggested Activity
            </SubtleText>
            <div className="flex-1">
              <ActivityCard
                activity={topActivity}
                onAddGoal={() => addGoalFromRecommendationAsync(topActivity.id, topActivity.title)}
                onFeedback={(rating) => submitFeedbackAsync('activity', topActivity.id, rating)}
              />
            </div>
          </div>
        )}

        {topQuestion && (
          <div className="flex flex-col">
            <SubtleText className="mb-2 block text-[10px] font-bold uppercase tracking-wider">
              Reflection Prompt
            </SubtleText>
            <div className="flex-1">
              <QuestionCard
                question={topQuestion}
                onUseQuestion={() => onUseQuestion(topQuestion.text)}
                onFeedback={(rating) => submitFeedbackAsync('question', topQuestion.id, rating)}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecommendationWidget;
