// Small deterministic mood helper utilities.
// Designed to be replaced by ML-driven logic later.

export type MoodLabel = string | null | undefined;

export function getMoodMessage(mood: MoodLabel): string {
  const m = (mood ?? "").toString().toLowerCase();

  if (!m) return "How are you feeling today? It's okay to start small.";

  // emoji checks
  if (m.includes("😞") || m.includes("very low") || m.includes("very")) {
    return "I'm sorry today feels hard — small, kind actions can help (a walk, a drink of water, or a short breath).";
  }

  if (m.includes("😕") || m.includes("low") || m.includes("down")) {
    return "That sounds tough. You're doing something important by noticing — consider a gentle routine to ground yourself.";
  }

  if (m.includes("🙂") || m.includes("okay") || m.includes("fine")) {
    return "A steady day — small moments of care can make it even better. What went alright today?";
  }

  if (m.includes("😊") || m.includes("good") || m.includes("better")) {
    return "Nice — you're having some good moments. Notice what helped and consider keeping it in your routine.";
  }

  if (m.includes("😄") || m.includes("great") || m.includes("excellent")) {
    return "That's wonderful to hear. Celebrate the wins — even small ones — and savor what felt good.";
  }

  // fallback
  return "Thanks for sharing — it's useful to notice how you're feeling. A brief pause to reflect can be helpful.";
}

export function getGreetingByTime(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getDailyPrompt(mood: MoodLabel): string {
  const m = (mood ?? "").toString().toLowerCase();

  if (!m) return "What's one small thing you'd like to notice about today?";

  if (m.includes("very low") || m.includes("😞") || m.includes("low")) {
    return "What is one gentle thing you can do for yourself in the next hour?";
  }

  if (m.includes("😕") || m.includes("okay")) {
    return "Name one thing that felt even a little better today.";
  }

  if (m.includes("😊") || m.includes("good") || m.includes("😄") || m.includes("great")) {
    return "What helped create this positive moment? Could you do it again?";
  }

  return "Write one short sentence about how you feel and why — no pressure to be perfect.";
}

export default { getMoodMessage, getGreetingByTime, getDailyPrompt };
