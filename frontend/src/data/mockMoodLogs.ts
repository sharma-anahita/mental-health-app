// Mock mood log entries (typed) for UI development and future backend mapping

export interface MoodLogEntry {
  id: string;
  mood: number; // 0 (very low) .. 4 (great)
  note: string;
  date: string; // ISO date string
}

export const mockMoodLogs: MoodLogEntry[] = [
  {
    id: "ml-001",
    mood: 3,
    note: "Had a pleasant walk and felt more focused afterward.",
    date: "2026-02-16T18:30:00Z",
  },
  {
    id: "ml-002",
    mood: 2,
    note: "A bit tired today but managed small tasks.",
    date: "2026-02-15T20:10:00Z",
  },
  {
    id: "ml-003",
    mood: 4,
    note: "Great day — met a friend and enjoyed coffee.",
    date: "2026-02-14T16:45:00Z",
  },
  {
    id: "ml-004",
    mood: 1,
    note: "Felt low in the morning but rested in the afternoon.",
    date: "2026-02-13T09:30:00Z",
  },
  {
    id: "ml-005",
    mood: 2,
    note: "Work was busy; took a short break to breathe.",
    date: "2026-02-12T13:20:00Z",
  },
  {
    id: "ml-006",
    mood: 3,
    note: "Calmer evening after finishing a small side project.",
    date: "2026-02-11T21:05:00Z",
  },
];

export default mockMoodLogs;
