
import { create } from "zustand";

// Simple typed mood store for UI state and future backend syncing

export interface MoodLog {
  id: string;
  mood: string; // e.g. "Great", "Good", or emoji string; kept generic for backend mapping
  note?: string;
  date: string; // ISO string
}

interface MoodState {
  selectedMood: string | null;
  moodLogs: MoodLog[];
  isLoading: boolean;

  // Actions
  setSelectedMood: (mood: string | null) => void;
  addMoodLog: (log: MoodLog) => void;
  setMoodLogs: (logs: MoodLog[]) => void;
  clearSelectedMood: () => void;
}

export const useMoodStore = create<MoodState>((set) => ({
  selectedMood: null,
  moodLogs: [],
  isLoading: false,

  setSelectedMood: (mood) => set(() => ({ selectedMood: mood })),

  addMoodLog: (log) =>
    set((state) => ({
      // prepend newest first — simple local-only behavior for now
      moodLogs: [log, ...state.moodLogs],
    })),

  setMoodLogs: (logs) => set(() => ({ moodLogs: logs })),

  clearSelectedMood: () => set(() => ({ selectedMood: null })),
}));

export default useMoodStore;
