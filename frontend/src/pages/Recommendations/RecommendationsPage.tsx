import React, { useEffect, useState } from 'react';
import PageTransition from '../../components/ui/PageTransition';
import { PageTitle, SubtleText } from '../../components/ui/Typography';
import Button from '../../components/ui/Button';
import useRecommendationStore from '../../store/recommendationStore';
import useUserStore from '../../store/userStore';
import ActivityCard from '../../components/recommendations/ActivityCard';
import QuestionCard from '../../components/recommendations/QuestionCard';
import ReflectionModal from '../../components/dashboard/mood/ReflectionModal';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const {
    recommendations,
    isLoading,
    error,
    fetchRecommendationsAsync,
    submitFeedbackAsync,
    addGoalFromRecommendationAsync
  } = useRecommendationStore();

  const [activeTab, setActiveTab] = useState<'activities' | 'questions'>('activities');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reflection Modal local state
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [selectedQuestionText, setSelectedQuestionText] = useState('');

  useEffect(() => {
    fetchRecommendationsAsync();
  }, [fetchRecommendationsAsync]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchRecommendationsAsync(true);
    } catch (err) {
      // Ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUseQuestion = (text: string) => {
    setSelectedQuestionText(text);
    setShowReflectionModal(true);
  };

  const handleReflectionSubmitted = (newReflection: any, stats: any) => {
    if (stats?.xp !== undefined) {
      const nextProgress: Record<string, number> = { xp: stats.xp };
      if (stats.coins !== undefined) nextProgress.coins = stats.coins;
      if (stats.level !== undefined) nextProgress.level = stats.level;
      if (stats.streak !== undefined) nextProgress.streak = stats.streak;
      useUserStore.setState(nextProgress);
    }
    setShowReflectionModal(false);
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'physical', label: 'Physical' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'cognitive', label: 'Cognitive' },
    { value: 'social', label: 'Social' },
    { value: 'creative', label: 'Creative' }
  ];

  if (isLoading && !recommendations) {
    return (
      <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingState message="Generating personalized suggestions based on your mood history…" />
      </PageTransition>
    );
  }

  if (error && !recommendations) {
    return (
      <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState message={error} onRetry={() => fetchRecommendationsAsync(true)} />
      </PageTransition>
    );
  }

  const activities = recommendations?.activities || [];
  const questions = recommendations?.questions || [];
  const context = recommendations?.context;

  const filteredActivities = categoryFilter === 'all'
    ? activities
    : activities.filter((act) => act.category === categoryFilter);

  // Helper text describing why these recommendations are made
  const getContextMessage = () => {
    if (!context) return '';
    if (context.source === 'onboarding') {
      return 'Welcome to MindTrack! Here are some starter suggestions to support your wellbeing as you begin logging your mood.';
    }
    const moodDesc = context.dominantMood ? `${context.dominantMood} mood` : 'your logs';
    const trendDesc = context.trend && context.trend !== 'stable' ? `with an ${context.trend} trend` : '';
    return `Suggestions calibrated for your dominant ${moodDesc} ${trendDesc} this week.`;
  };

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* ── Page Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[var(--theme-accent)]" />
            <PageTitle>Recommendations</PageTitle>
          </div>
          {context && (
            <SubtleText className="block mt-1 font-medium text-sm text-[var(--theme-text-secondary)]">
              {getContextMessage()}
            </SubtleText>
          )}
        </div>
        <Button
          variant="secondary"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2 self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Re-scoring...' : 'Force Re-score'}</span>
        </Button>
      </header>

      {/* ── Tab Navigation ── */}
      <div className="flex border-b border-[var(--theme-card-ring)] mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'activities'
              ? 'border-[var(--theme-accent)] text-[var(--theme-text-primary)]'
              : 'border-transparent text-[var(--theme-text-subtle)] hover:text-[var(--theme-text-secondary)]'
          }`}
        >
          Activities ({activities.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'questions'
              ? 'border-[var(--theme-accent)] text-[var(--theme-text-primary)]'
              : 'border-transparent text-[var(--theme-text-subtle)] hover:text-[var(--theme-text-secondary)]'
          }`}
        >
          Reflection Prompts ({questions.length})
        </button>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'activities' ? (
        <section aria-label="Recommended Activities">
          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCategoryFilter(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  categoryFilter === opt.value
                    ? 'bg-[var(--theme-accent)] text-white'
                    : 'bg-[var(--theme-card-bg)] text-[var(--theme-text-secondary)] ring-1 ring-[var(--theme-card-ring)] hover:bg-[var(--theme-accent-subtle)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 bg-[var(--theme-card-bg)] rounded-2xl ring-1 ring-[var(--theme-card-ring)]">
              <AlertCircle className="w-8 h-8 text-[var(--theme-text-subtle)] mx-auto mb-2" />
              <p className="text-sm text-[var(--theme-text-secondary)]">No recommended activities match this category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((act) => (
                <div key={act.id} className="h-full">
                  <ActivityCard
                    activity={act}
                    onAddGoal={() => addGoalFromRecommendationAsync(act.id, act.title)}
                    onFeedback={(rating) => submitFeedbackAsync('activity', act.id, rating)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section aria-label="Reflection Prompts" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {questions.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-[var(--theme-card-bg)] rounded-2xl ring-1 ring-[var(--theme-card-ring)]">
              <AlertCircle className="w-8 h-8 text-[var(--theme-text-subtle)] mx-auto mb-2" />
              <p className="text-sm text-[var(--theme-text-secondary)]">No reflection prompts found.</p>
            </div>
          ) : (
            questions.map((q) => (
              <div key={q.id}>
                <QuestionCard
                  question={q}
                  onUseQuestion={() => handleUseQuestion(q.text)}
                  onFeedback={(rating) => submitFeedbackAsync('question', q.id, rating)}
                />
              </div>
            ))
          )}
        </section>
      )}

      {/* ── Reflection Modal ── */}
      <ReflectionModal
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        onSubmitted={handleReflectionSubmitted}
        initialText={selectedQuestionText ? `Prompt: ${selectedQuestionText}\n\n` : ''}
        isEditing={false}
      />
    </PageTransition>
  );
};

export default RecommendationsPage;
