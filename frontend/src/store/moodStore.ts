
import { create } from "zustand";
import * as moodService from "../services/moodService";

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
  error: string | null;

  // Actions
  setSelectedMood: (mood: string | null) => void;
  addMoodLog: (log: MoodLog) => void;
  setMoodLogs: (logs: MoodLog[]) => void;
  clearSelectedMood: () => void;
  // Async helpers (use moodService internally)
  fetchMoodLogsAsync: () => Promise<void>;
  addMoodLogAsync: (payload: Omit<MoodLog, "id">) => Promise<void>;
}

export const useMoodStore = create<MoodState>((set) => ({
  selectedMood: null,
  moodLogs: [],
  isLoading: false,
  error: null,

  setSelectedMood: (mood) => set(() => ({ selectedMood: mood })),

  addMoodLog: (log) =>
    set((state) => ({
      // prepend newest first — simple local-only behavior for now
      moodLogs: [log, ...state.moodLogs],
    })),

  setMoodLogs: (logs) => set(() => ({ moodLogs: logs })),

  clearSelectedMood: () => set(() => ({ selectedMood: null })),

  // Async: fetch mood logs from the service (mocked for now)
  fetchMoodLogsAsync: async () => {
    set(() => ({ isLoading: true, error: null }));
    try {
      const logs = await moodService.fetchMoodLogs();
      set(() => ({ moodLogs: logs, isLoading: false }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set(() => ({ error: message, isLoading: false }));
    }
  },

  // Async: create a mood log via the service and add it to store
  addMoodLogAsync: async (payload) => {
    set(() => ({ isLoading: true, error: null }));
    try {
      const created = await moodService.createMoodLog(payload);
      set((state) => ({ moodLogs: [created, ...state.moodLogs], isLoading: false }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set(() => ({ error: message, isLoading: false }));
    }
  },
}));

export default useMoodStore;
