import { scoreApi } from "@/store/api/scoreApi";
import type { AppDispatch } from "..";
import type { MyStats } from "@/store/api/scoreApi";

// Central utility to apply a delta to the daily stats cache and accumulate flash.
export function applyDailyPointsDelta(dispatch: AppDispatch, delta?: number) {
  if (typeof delta !== "number" || delta === 0) return;
  try {
    dispatch(
      scoreApi.util.updateQueryData(
        "getMyStats",
        { period: "daily" },
        (draft: (MyStats & { __pointsFlashDelta?: number }) | undefined) => {
          if (!draft) return;
          draft.points += delta;
          draft.__pointsFlashDelta = (draft.__pointsFlashDelta || 0) + delta;
        }
      )
    );
  } catch {
    // swallow – cache entry might not exist yet
  }
}

// Aggregate helper (sums provided deltas and applies once) to prevent multiple flashes.
export function applyAggregatedDailyPoints(
  dispatch: AppDispatch,
  deltas: Array<number | null | undefined>
) {
  const total = deltas.reduce<number>((sum, v) => {
    return typeof v === "number" && v !== 0 ? sum + v : sum;
  }, 0);
  if (total) applyDailyPointsDelta(dispatch, total);
  return total;
}

// ---------------------------------------------------------------------------
// Batching / Debounce Layer
// ---------------------------------------------------------------------------
let _queueTotal = 0;
let _queueTimer: number | null = null;
let _lastDispatch: AppDispatch | null = null;
const BATCH_WINDOW_MS = 160; // tune as needed

export function queueDailyPointsDelta(dispatch: AppDispatch, delta?: number) {
  if (typeof delta !== "number" || delta === 0) return;
  if (_lastDispatch && _lastDispatch !== dispatch && _queueTotal) {
    applyDailyPointsDelta(_lastDispatch, _queueTotal);
    _queueTotal = 0;
  }
  _lastDispatch = dispatch;
  _queueTotal += delta;
  if (_queueTimer !== null) window.clearTimeout(_queueTimer);
  _queueTimer = window.setTimeout(() => {
    if (_queueTotal && _lastDispatch) {
      applyDailyPointsDelta(_lastDispatch, _queueTotal);
    }
    _queueTotal = 0;
    _queueTimer = null;
  }, BATCH_WINDOW_MS);
}

export function queueAggregatedDailyPoints(
  dispatch: AppDispatch,
  deltas: Array<number | null | undefined>
) {
  const total = deltas.reduce<number>((sum, v) => {
    return typeof v === "number" && v !== 0 ? sum + v : sum;
  }, 0);
  if (total) queueDailyPointsDelta(dispatch, total);
  return total;
}

export function flushDailyPointsQueue() {
  if (_queueTimer !== null) {
    window.clearTimeout(_queueTimer);
    _queueTimer = null;
  }
  if (_queueTotal && _lastDispatch)
    applyDailyPointsDelta(_lastDispatch, _queueTotal);
  _queueTotal = 0;
}
