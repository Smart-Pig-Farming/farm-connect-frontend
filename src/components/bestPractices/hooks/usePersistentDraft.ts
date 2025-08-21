import { useEffect, useRef, useState } from "react";

interface Options<T> {
  key: string;
  initial: () => T;
  debounceMs?: number;
  version?: number;
}
interface Stored<T> {
  v: number;
  data: T;
  updated: number;
}

export function usePersistentDraft<T>({
  key,
  initial,
  debounceMs = 600,
  version = 1,
}: Options<T>) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return initial();
      const parsed: Stored<T> = JSON.parse(raw);
      if (parsed.v !== version) return initial();
      return parsed.data;
    } catch {
      return initial();
    }
  });
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        const payload: Stored<T> = {
          v: version,
          data: state,
          updated: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(payload));
      } catch {
        /* ignore quota errors */
      }
    }, debounceMs);
    return () => window.clearTimeout(timer.current);
  }, [state, key, debounceMs, version]);
  const clear = () => {
    localStorage.removeItem(key);
    setState(initial());
  };
  return { state, setState, clear } as const;
}
