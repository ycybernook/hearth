import { createClient } from "@/lib/supabase/client";

// Logs a finished round. Returns the new row's id (for a later mood_after
// update) or null when the visitor isn't signed in — the session UI works
// fully logged-out, it just doesn't persist.
export async function logSession({ userId, patternId, minutes, breaths, moodBefore }) {
  if (!userId) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hearth_sessions")
    .insert({
      user_id: userId,
      pattern_id: patternId,
      minutes,
      breaths,
      mood_before: moodBefore ?? null,
    })
    .select("id")
    .single();
  if (error) {
    console.error("Failed to log session:", error.message);
    return null;
  }
  return data.id;
}

export async function setMoodAfter(sessionId, moodAfter) {
  if (!sessionId) return;
  const supabase = createClient();
  const { error } = await supabase
    .from("hearth_sessions")
    .update({ mood_after: moodAfter })
    .eq("id", sessionId);
  if (error) console.error("Failed to save mood check-in:", error.message);
}

export async function getStreak(userId) {
  if (!userId) return 0;
  const supabase = createClient();
  const { data, error } = await supabase.rpc("hearth_current_streak", { p_user_id: userId });
  if (error) {
    console.error("Failed to load streak:", error.message);
    return 0;
  }
  return data ?? 0;
}
