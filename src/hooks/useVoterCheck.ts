import { useState, useEffect } from "react";
import {
  useGetPostVotersQuery,
  useGetReplyVotersQuery,
} from "../store/api/discussionsApi";
import { useAppSelector } from "../store/hooks";

interface UseVoterCheckOptions {
  postId?: string;
  replyId?: string;
  voteType: "upvote" | "downvote";
  enabled?: boolean;
}

interface VoterCheckResult {
  isCurrentUserVoter: boolean;
  votersList: Array<{
    userId: number;
    voteType: "upvote" | "downvote";
    votedAt: string;
    username?: string;
    firstname?: string;
    lastname?: string;
  }>;
  isLoading: boolean;
  error: unknown;
}

/**
 * Hook to check if current user is among voters and get voter list for tooltips
 * Useful for showing "You and 12 others" style tooltips
 */
export const useVoterCheck = (
  options: UseVoterCheckOptions
): VoterCheckResult => {
  const { postId, replyId, voteType, enabled = false } = options;
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  // Only fetch when enabled (e.g., on hover)
  const postVotersQuery = useGetPostVotersQuery(
    { postId: postId!, type: voteType, limit: 20 },
    { skip: !enabled || !postId }
  );

  const replyVotersQuery = useGetReplyVotersQuery(
    { replyId: replyId!, type: voteType, limit: 20 },
    { skip: !enabled || !replyId }
  );

  const activeQuery = postId ? postVotersQuery : replyVotersQuery;
  const { data, isLoading, error } = activeQuery;

  const [isCurrentUserVoter, setIsCurrentUserVoter] = useState(false);

  useEffect(() => {
    if (data?.data && currentUserId) {
      const userInList = data.data.some(
        (voter) => voter.userId === currentUserId
      );
      setIsCurrentUserVoter(userInList);
    } else {
      setIsCurrentUserVoter(false);
    }
  }, [data, currentUserId]);

  return {
    isCurrentUserVoter,
    votersList: data?.data || [],
    isLoading,
    error,
  };
};

/**
 * Simple hook to get voter count with "You and X others" formatting
 */
export const useVoterTooltip = (
  count: number,
  isCurrentUserVoter: boolean,
  votersList: Array<{ firstname?: string; lastname?: string }> = []
): string => {
  if (count === 0) return "";

  if (isCurrentUserVoter) {
    if (count === 1) return "You";
    const others = count - 1;
    const names = votersList
      .filter((_, index) => index < 3) // Show up to 3 names
      .map((voter) => `${voter.firstname} ${voter.lastname}`.trim())
      .filter((name) => name.length > 0);

    if (names.length > 0 && others <= 3) {
      return `You, ${names.join(", ")}`;
    }
    return `You and ${others} other${others !== 1 ? "s" : ""}`;
  }

  // Not current user
  const names = votersList
    .slice(0, 3)
    .map((voter) => `${voter.firstname} ${voter.lastname}`.trim())
    .filter((name) => name.length > 0);

  if (names.length > 0 && count <= 3) {
    return names.join(", ");
  }

  return `${count} user${count !== 1 ? "s" : ""}`;
};
