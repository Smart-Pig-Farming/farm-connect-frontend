import { queueDailyPointsDelta } from "./dailyPoints";
import type { AppDispatch } from "..";
import type { ScoreEventWs } from "@/hooks/useWebSocket";

// Simple in-memory dedupe of processed event IDs for session.
const seen = new Set<string>();

export interface ProcessScoreEventsOptions {
  dispatch: AppDispatch;
  currentUserId?: number | null;
  applyDaily?: boolean; // default true
}

export function processScoreEvents(
  events: ScoreEventWs[] = [],
  opts: ProcessScoreEventsOptions
) {
  const { dispatch, currentUserId, applyDaily = true } = opts;
  if (!events.length || !dispatch) return;
  let dailyDelta = 0;
  for (const ev of events) {
    if (!ev?.id || seen.has(ev.id)) continue;
    seen.add(ev.id);
    if (applyDaily && currentUserId && ev.userId === currentUserId) {
      // For now all event types impact daily total equally; if future scope filter needed add here.
      if (typeof ev.delta === "number" && ev.delta !== 0) {
        dailyDelta += ev.delta;
      }
    }
  }
  if (dailyDelta) queueDailyPointsDelta(dispatch, dailyDelta);
}

export function resetScoreEventDedupe() {
  seen.clear();
}
