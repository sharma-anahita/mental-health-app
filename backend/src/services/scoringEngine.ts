import { UserContext } from './userContextService';

export interface ScoredActivity {
  activityId: string;
  key: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  score: number;
  rank: number;
}

export interface ScoredQuestion {
  questionId: string;
  key: string;
  text: string;
  score: number;
  rank: number;
}

const MOOD_ORDER = ['Very low', 'Low', 'Neutral', 'Good', 'Great'];
const ENERGY_ORDER = ['low', 'medium', 'high'];

/**
 * Checks if two mood strings are mathematically adjacent.
 */
function areMoodsAdjacent(moodA: string, moodB: string): boolean {
  const idxA = MOOD_ORDER.indexOf(moodA);
  const idxB = MOOD_ORDER.indexOf(moodB);
  if (idxA === -1 || idxB === -1) return false;
  return Math.abs(idxA - idxB) === 1;
}

/**
 * Computes energy matching score.
 * Full match: +25
 * Partial match (adjacent energy level): +10
 */
function calculateEnergyMatch(targetEnergyLevels: string[], userEnergy: string): number {
  if (targetEnergyLevels.includes(userEnergy)) return 25;

  const userIdx = ENERGY_ORDER.indexOf(userEnergy);
  if (userIdx === -1) return 0;

  for (const targetEnergy of targetEnergyLevels) {
    const targetIdx = ENERGY_ORDER.indexOf(targetEnergy);
    if (targetIdx !== -1 && Math.abs(userIdx - targetIdx) === 1) {
      return 10;
    }
  }
  return 0;
}

/**
 * Scores a single Activity against the current user context.
 */
export function scoreActivity(context: UserContext, activity: any): number {
  let score = 0;

  const tags = activity.tags || [];
  const contraindicated = activity.contraindicated || [];
  const targetMoods = activity.targetMoods || [];
  const targetEnergyLevels = activity.targetEnergyLevels || [];

  // 1. MOOD MATCH (0–40 pts)
  if (contraindicated.includes(context.dominantMood)) {
    return 0; // Skip entirely if contraindicated
  }

  if (targetMoods.includes(context.dominantMood)) {
    score += 40;
  } else if (targetMoods.some((m: string) => areMoodsAdjacent(m, context.dominantMood))) {
    score += 20;
  }

  // 2. ENERGY MATCH (0–25 pts)
  score += calculateEnergyMatch(targetEnergyLevels, context.energyLevel);

  // 3. TREND BONUS (0–15 pts)
  if (context.trend === 'declining') {
    if (tags.includes('grounding')) score += 15;
    else if (tags.includes('gentle')) score += 10;
  } else if (context.trend === 'improving') {
    const isGoalOriented = activity.category === 'goal-oriented' || tags.includes('goal-oriented');
    if (isGoalOriented) score += 10;
  }

  // 4. TIME OF DAY BONUS (0–10 pts)
  if (context.timeOfDay === 'morning' && tags.includes('energizing')) {
    score += 10;
  } else if (context.timeOfDay === 'evening' && tags.includes('winding-down')) {
    score += 10;
  }

  // 5. STREAK BONUS (0–5 pts)
  const isGoalOriented = activity.category === 'goal-oriented' || tags.includes('goal-oriented');
  if (context.streakDays >= 7 && isGoalOriented) {
    score += 5;
  }
  if (context.consecutiveLowDays >= 3 && tags.includes('grounding')) {
    score += 5;
  }

  // 6. FEEDBACK PENALTY/BONUS (-20 to +5 pts)
  const feedback = context.recentFeedback[activity.key];
  if (feedback === 'helpful') {
    score += 5;
  } else if (feedback === 'not_helpful') {
    score -= 20;
  }

  // Clamp final score between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Scores a single ReflectionQuestion against the current user context.
 */
export function scoreQuestion(context: UserContext, question: any): number {
  let score = 0;

  const tags = question.tags || [];
  const targetMoods = question.targetMoods || [];
  const targetEnergyLevels = question.targetEnergyLevels || [];
  const targetTrends = question.targetTrends || [];

  // 1. MOOD MATCH (0–40 pts)
  if (targetMoods.includes(context.dominantMood)) {
    score += 40;
  } else if (targetMoods.some((m: string) => areMoodsAdjacent(m, context.dominantMood))) {
    score += 20;
  }

  // 2. ENERGY MATCH (0–25 pts)
  score += calculateEnergyMatch(targetEnergyLevels, context.energyLevel);

  // 3. TREND MATCH (0–15 pts)
  if (targetTrends.includes(context.trend)) {
    score += 15;
  }

  // 4. TIME OF DAY BONUS (0–10 pts)
  if (context.timeOfDay === 'morning' && tags.includes('energizing')) {
    score += 10;
  } else if (context.timeOfDay === 'evening' && tags.includes('winding-down')) {
    score += 10;
  }

  // 5. STREAK BONUS (0–5 pts)
  if (context.streakDays >= 7 && tags.includes('goal-oriented')) {
    score += 5;
  }
  if (context.consecutiveLowDays >= 3 && tags.includes('grounding')) {
    score += 5;
  }

  // 6. FEEDBACK PENALTY/BONUS (-20 to +5 pts)
  const feedback = context.recentFeedback[question.key];
  if (feedback === 'helpful') {
    score += 5;
  } else if (feedback === 'not_helpful') {
    score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Pure scoring function scoring all activities and questions against UserContext,
 * returning ranked, sorted results.
 */
export const score = (
  context: UserContext,
  activities: any[],
  questions: any[]
): { scoredActivities: ScoredActivity[]; scoredQuestions: ScoredQuestion[] } => {
  // Score and sort activities
  const scoredActivities: ScoredActivity[] = activities
    .map((act) => ({
      activityId: String(act._id),
      key: act.key,
      title: act.title,
      description: act.description,
      category: act.category,
      durationMinutes: act.durationMinutes,
      score: scoreActivity(context, act),
      rank: 0 // Will populate after sorting
    }))
    // Sort descending by score, and category diversity/duration as ties
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  // Assign ranks
  scoredActivities.forEach((act, idx) => {
    act.rank = idx + 1;
  });

  // Score and sort questions
  const scoredQuestions: ScoredQuestion[] = questions
    .map((q) => ({
      questionId: String(q._id),
      key: q.key,
      text: q.text,
      score: scoreQuestion(context, q),
      rank: 0
    }))
    .sort((a, b) => b.score - a.score || a.text.localeCompare(b.text));

  scoredQuestions.forEach((q, idx) => {
    q.rank = idx + 1;
  });

  return { scoredActivities, scoredQuestions };
};

export default { score, scoreActivity, scoreQuestion };
