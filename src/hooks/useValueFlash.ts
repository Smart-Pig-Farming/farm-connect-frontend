import { useEffect, useRef, useState } from "react";

// Hook to add a transient flash effect when a numeric value changes (positive/negative)
export function useValueFlash<T extends number | string>(
  value: T,
  opts?: { durationMs?: number }
) {
  const { durationMs = 650 } = opts || {};
  const prev = useRef<T | null>(null);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (prev.current === null) {
      prev.current = value;
      return;
    }
    if (prev.current !== value) {
      const numericPrev = Number(prev.current);
      const numericCurr = Number(value);
      if (!Number.isNaN(numericPrev) && !Number.isNaN(numericCurr)) {
        setFlash(numericCurr > numericPrev ? "up" : "down");
        const to = setTimeout(() => setFlash(null), durationMs);
        return () => clearTimeout(to);
      }
    }
    prev.current = value;
  }, [value, durationMs]);

  return flash; // null | 'up' | 'down'
}

export default useValueFlash;
