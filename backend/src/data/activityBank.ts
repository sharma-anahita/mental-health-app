export interface RawSeedActivity {
  key: string;
  title: string;
  description: string;
  category: 'physical' | 'cognitive' | 'creative' | 'social' | 'mindfulness';
  durationMinutes: number;
  targetMoods: string[];
  targetEnergyLevels: ('low' | 'medium' | 'high')[];
  contraindicated: string[];
  tags: string[];
  active: boolean;
}

export const SEED_ACTIVITIES: RawSeedActivity[] = [
  {
    key: '10-min-walk',
    title: '10-minute walk',
    description: 'A short walk outdoors to clear your head and shift your physical state.',
    category: 'physical',
    durationMinutes: 10,
    targetMoods: ['Very low', 'Low', 'Neutral'],
    targetEnergyLevels: ['low', 'medium'],
    contraindicated: [],
    tags: ['grounding', 'gentle', 'outdoors'],
    active: true,
  },
  {
    key: 'morning-stretch',
    title: 'Energizing morning stretch',
    description: 'A 5-minute full body stretch to awaken your muscles and mind.',
    category: 'physical',
    durationMinutes: 5,
    targetMoods: ['Neutral', 'Good', 'Great'],
    targetEnergyLevels: ['medium', 'high'],
    contraindicated: ['Very low'],
    tags: ['energizing', 'physical', 'morning'],
    active: true,
  },
  {
    key: '5-min-breathing',
    title: '5-minute deep breathing',
    description: 'Focus on your breath: inhale for 4 seconds, hold for 4, exhale for 4, hold for 4.',
    category: 'mindfulness',
    durationMinutes: 5,
    targetMoods: ['Very low', 'Low', 'Neutral'],
    targetEnergyLevels: ['low', 'medium', 'high'],
    contraindicated: [],
    tags: ['grounding', 'gentle', 'winding-down'],
    active: true,
  },
  {
    key: 'body-scan-meditation',
    title: 'Body scan meditation',
    description: 'Bring awareness slowly to each part of your body from head to toe to release tension.',
    category: 'mindfulness',
    durationMinutes: 15,
    targetMoods: ['Very low', 'Low', 'Neutral'],
    targetEnergyLevels: ['low', 'medium'],
    contraindicated: [],
    tags: ['grounding', 'gentle', 'winding-down'],
    active: true,
  },
  {
    key: 'gratitude-list',
    title: 'Three points of gratitude',
    description: 'Write down 3 specific things you are grateful for today and why.',
    category: 'cognitive',
    durationMinutes: 5,
    targetMoods: ['Low', 'Neutral', 'Good'],
    targetEnergyLevels: ['low', 'medium', 'high'],
    contraindicated: [],
    tags: ['positivity', 'reflective'],
    active: true,
  },
  {
    key: 'short-puzzle',
    title: 'Solve a short puzzle',
    description: 'Engage your cognitive skills with a quick Sudoku, crossword, or logic puzzle.',
    category: 'cognitive',
    durationMinutes: 10,
    targetMoods: ['Neutral', 'Good', 'Great'],
    targetEnergyLevels: ['medium', 'high'],
    contraindicated: ['Very low'],
    tags: ['focus', 'cognitive'],
    active: true,
  },
  {
    key: 'doodle-5-min',
    title: 'Doodle for 5 minutes',
    description: 'Let your hand move freely on paper without judging the output.',
    category: 'creative',
    durationMinutes: 5,
    targetMoods: ['Low', 'Neutral', 'Good'],
    targetEnergyLevels: ['low', 'medium', 'high'],
    contraindicated: [],
    tags: ['creative', 'gentle'],
    active: true,
  },
  {
    key: 'text-friend',
    title: 'Text a friend to say hello',
    description: 'Reach out to someone in your network with a low-pressure message just to check in.',
    category: 'social',
    durationMinutes: 3,
    targetMoods: ['Low', 'Neutral', 'Good'],
    targetEnergyLevels: ['low', 'medium', 'high'],
    contraindicated: ['Very low'],
    tags: ['social', 'gentle'],
    active: true,
  },
  {
    key: 'call-loved-one',
    title: 'Call a loved one',
    description: 'Connect voice-to-voice with a family member or close friend to catch up.',
    category: 'social',
    durationMinutes: 20,
    targetMoods: ['Neutral', 'Good', 'Great'],
    targetEnergyLevels: ['medium', 'high'],
    contraindicated: ['Very low'],
    tags: ['social', 'interactive'],
    active: true,
  }
];
