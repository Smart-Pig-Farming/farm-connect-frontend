import { useEffect, useState } from "react";
import { fetchMyScore } from "../lib/api/score";
import type { MyScoreResponse } from "../lib/api/score";

export function useMyScore() {
  const [data, setData] = useState<MyScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const d = await fetchMyScore();
        if (mounted) setData(d);
      } catch (e) {
        if (mounted) setError(e as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
