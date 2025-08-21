import { useMemo } from "react";

/**
 * Derive the current user's vote for a post or reply given:
 * 1. An explicit userVote field returned from backend or optimistic cache
 * 2. Local optimistic override (e.g. just clicked, before server round‑trip)
 * 3. Fallback membership in upvoterIds / downvoterIds arrays
 */
export function useDerivedUserVote(
  entity: {
    userVote?: "up" | "down" | "upvote" | "downvote" | null;
    upvoterIds?: number[];
    downvoterIds?: number[];
  },
  currentUserId?: string | number,
  localOverride?: "up" | "down" | null
) {
  const currentVote = useMemo(() => {
    if (localOverride !== undefined && localOverride !== null)
      return localOverride;
    const raw = entity.userVote;
    if (raw === "up" || raw === "upvote") return "up" as const;
    if (raw === "down" || raw === "downvote") return "down" as const;
    if (currentUserId != null) {
      const uid = Number(currentUserId);
      if (Array.isArray(entity.upvoterIds) && entity.upvoterIds.includes(uid))
        return "up" as const;
      if (
        Array.isArray(entity.downvoterIds) &&
        entity.downvoterIds.includes(uid)
      )
        return "down" as const;
    }
    return null;
  }, [
    entity.userVote,
    entity.upvoterIds,
    entity.downvoterIds,
    currentUserId,
    localOverride,
  ]);

  return {
    currentVote,
    isUpSelected: currentVote === "up",
    isDownSelected: currentVote === "down",
  } as const;
}
