export interface RawSeedQuestion {
  key: string;
  text: string;
  targetMoods: string[];
  targetEnergyLevels: ('low' | 'medium' | 'high')[];
  targetTrends: ('declining' | 'stable' | 'improving')[];
  tags: string[];
  active: boolean;
}

export const SEED_QUESTIONS: RawSeedQuestion[] = [
  {
    key: 'energy-drain-question',
    text: 'What has been draining your energy lately, and is there one boundary you can set?',
    targetMoods: ['Very low', 'Low', 'Neutral'],
    targetEnergyLevels: ['low', 'medium'],
    targetTrends: ['declining', 'stable'],
    tags: ['energy', 'boundaries'],
    active: true,
  },
  {
    key: 'mood-lift-question',
    text: 'What small thing brought a smile to your face or felt comforting today?',
    targetMoods: ['Neutral', 'Good', 'Great'],
    targetEnergyLevels: ['medium', 'high'],
    targetTrends: ['improving', 'stable'],
    tags: ['positivity', 'gratitude'],
    active: true,
  },
  {
    key: 'self-care-question',
    text: 'How can you show yourself kindness and be gentle with your body and mind today?',
    targetMoods: ['Very low', 'Low'],
    targetEnergyLevels: ['low', 'medium', 'high'],
    targetTrends: ['declining', 'stable'],
    tags: ['self-care', 'compassion'],
    active: true,
  },
  {
    key: 'connection-question',
    text: 'Who is someone you felt connected to recently, and what made that interaction meaningful?',
    targetMoods: ['Neutral', 'Good', 'Great'],
    targetEnergyLevels: ['medium', 'high'],
    targetTrends: ['stable', 'improving'],
    tags: ['social', 'connection'],
    active: true,
  },
  {
    key: 'daily-accomplishment-question',
    text: 'What is one thing you did today that you are proud of, no matter how small?',
    targetMoods: ['Low', 'Neutral', 'Good'],
    targetEnergyLevels: ['low', 'medium', 'high'],
    targetTrends: ['stable', 'declining'],
    tags: ['pride', 'accomplishment'],
    active: true,
  }
];
