import { baseApi } from "./baseApi";

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string; // legacy
  firstname?: string;
  lastname?: string;
  level_id?: number;
  district?: string | null;
  province?: string | null;
  sector?: string | null;
  location?: string; // derived client-side convenience
  points: number; // normalized
  // Optional dynamic movement fields (computed if backend supplies previous rank or delta)
  rankChange?: "up" | "down" | "same" | "new";
  rankChangeAmount?: number;
}

export interface MyScore {
  totalPoints: number;
  level: number;
  levelLabel: string;
  nextLevelAt: number | null;
  prestige: string | null;
  prestigeProgress?: {
    current: number;
    required: number;
    label?: string;
  };
  modApprovals: number;
  streak: { current: number; best: number; lastDay?: string };
}

export interface MyStats {
  period: string;
  rank: number;
  points: number; // points for period (e.g., today when daily)
  postsToday: number;
  marketOpportunities: number;
}

function normalizePoints(raw: number): number {
  // Backend now returns human-scale (unscaled) points; keep identity mapping.
  return raw;
}

interface LeaderboardRowApi {
  rank: number;
  user_id: number;
  username: string;
  firstname?: string;
  lastname?: string;
  level_id?: number;
  district?: string | null;
  province?: string | null;
  sector?: string | null;
  points: number;
  // Optional backend fields for movement; any may be present
  previous_rank?: number;
  prev_rank?: number;
  rank_change?: number; // positive or negative delta
  rankChange?: number; // camelCase variant
}

interface LeaderboardApiResponse {
  success: boolean;
  data: LeaderboardRowApi[];
}

interface GenericApiResponse<T> {
  success: boolean;
  data: T;
}

interface LeaderboardPaginatedApiResponse {
  success: boolean;
  data: LeaderboardRowApi[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    totalPeriodUsers: number;
  };
}

interface LeaderboardAroundApiResponse {
  success: boolean;
  data: LeaderboardRowApi[];
  meta?: { mode?: string };
}

export const scoreApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getLeaderboard: build.query<
      LeaderboardEntry[],
      { period: "daily" | "weekly" | "monthly" | "all" }
    >({
      query: ({ period }) => `/score/leaderboard?period=${period}`,
      transformResponse: (resp: LeaderboardApiResponse) => {
        if (!resp || !resp.success) return [];
        return resp.data.map((r: LeaderboardRowApi) => {
          const prevRank =
            (r.previous_rank ?? r.prev_rank) !== undefined
              ? Number(r.previous_rank ?? r.prev_rank)
              : undefined;
          // rank_change may be defined directly (positive = positions gained? we infer direction relative to sign)
          // If we have previous rank we compute delta = prevRank - currentRank (positive means moved up)
          let delta: number | undefined = undefined;
          if (prevRank !== undefined) delta = prevRank - Number(r.rank);
          else if (r.rank_change !== undefined) delta = Number(r.rank_change);
          else {
            const dyn = r as unknown as Record<string, unknown>;
            if (dyn.rankChange !== undefined) delta = Number(dyn.rankChange);
          }
          let rankChange: LeaderboardEntry["rankChange"] = "same";
          let rankChangeAmount: number | undefined;
          if (delta !== undefined && delta !== 0) {
            rankChange = delta > 0 ? "up" : "down";
            rankChangeAmount = Math.abs(delta);
          }
          return {
            rank: r.rank,
            user_id: r.user_id,
            username: r.username,
            firstname: r.firstname,
            lastname: r.lastname,
            level_id: r.level_id,
            district: r.district,
            province: r.province,
            sector: r.sector,
            location:
              [r.sector, r.district, r.province].filter(Boolean).join(", ") ||
              undefined,
            points: normalizePoints(r.points),
            rankChange,
            rankChangeAmount,
          } as LeaderboardEntry;
        });
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: "User" as const, id: r.user_id })),
              { type: "User", id: "LEADERBOARD" },
            ]
          : [{ type: "User", id: "LEADERBOARD" }],
    }),
    getLeaderboardPaginated: build.query<
      {
        rows: LeaderboardEntry[];
        meta: {
          page: number;
          totalPages: number;
          total: number;
          totalPeriodUsers: number;
        };
      },
      {
        period: "daily" | "weekly" | "monthly" | "all";
        page?: number;
        limit?: number;
        search?: string;
      }
    >({
      query: ({ period, page = 1, limit = 20, search }) =>
        `/score/leaderboard?period=${period}&page=${page}&limit=${limit}${
          search ? `&search=${encodeURIComponent(search)}` : ""
        }`,
      transformResponse: (resp: LeaderboardPaginatedApiResponse) => {
        const rows: LeaderboardEntry[] = (resp.data || []).map(
          (r: LeaderboardRowApi) => {
            const prevRank =
              (r.previous_rank ?? r.prev_rank) !== undefined
                ? Number(r.previous_rank ?? r.prev_rank)
                : undefined;
            let delta: number | undefined = undefined;
            if (prevRank !== undefined) delta = prevRank - Number(r.rank);
            else if (r.rank_change !== undefined) delta = Number(r.rank_change);
            else {
              const dyn = r as unknown as Record<string, unknown>;
              if (dyn.rankChange !== undefined) delta = Number(dyn.rankChange);
            }
            let rankChange: LeaderboardEntry["rankChange"] = "same";
            let rankChangeAmount: number | undefined;
            if (delta !== undefined && delta !== 0) {
              rankChange = delta > 0 ? "up" : "down";
              rankChangeAmount = Math.abs(delta);
            }
            return {
              rank: Number(r.rank),
              user_id: Number(r.user_id),
              username: r.username,
              firstname: r.firstname,
              lastname: r.lastname,
              level_id: r.level_id,
              district: r.district,
              province: r.province,
              sector: r.sector,
              location:
                [r.sector, r.district, r.province].filter(Boolean).join(", ") ||
                undefined,
              points: normalizePoints(Number(r.points)),
              rankChange,
              rankChangeAmount,
            } as LeaderboardEntry;
          }
        );
        return { rows, meta: resp.meta };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.rows.map((r) => ({
                type: "User" as const,
                id: r.user_id,
              })),
              { type: "User", id: "LEADERBOARD" },
            ]
          : [{ type: "User", id: "LEADERBOARD" }],
    }),
    getLeaderboardAround: build.query<
      LeaderboardEntry[],
      {
        period: "daily" | "weekly" | "monthly" | "all";
        userId: number;
        radius?: number;
      }
    >({
      query: ({ period, userId, radius = 3 }) =>
        `/score/leaderboard?period=${period}&aroundUserId=${userId}&radius=${radius}`,
      transformResponse: (resp: LeaderboardAroundApiResponse) =>
        (resp.data || []).map((r: LeaderboardRowApi) => {
          const prevRank =
            (r.previous_rank ?? r.prev_rank) !== undefined
              ? Number(r.previous_rank ?? r.prev_rank)
              : undefined;
          let delta: number | undefined = undefined;
          if (prevRank !== undefined) delta = prevRank - Number(r.rank);
          else if (r.rank_change !== undefined) delta = Number(r.rank_change);
          else {
            const dyn = r as unknown as Record<string, unknown>;
            if (dyn.rankChange !== undefined) delta = Number(dyn.rankChange);
          }
          let rankChange: LeaderboardEntry["rankChange"] = "same";
          let rankChangeAmount: number | undefined;
          if (delta !== undefined && delta !== 0) {
            rankChange = delta > 0 ? "up" : "down";
            rankChangeAmount = Math.abs(delta);
          }
          return {
            rank: Number(r.rank),
            user_id: Number(r.user_id),
            username: r.username,
            firstname: r.firstname,
            lastname: r.lastname,
            level_id: r.level_id,
            district: r.district,
            province: r.province,
            sector: r.sector,
            location:
              [r.sector, r.district, r.province].filter(Boolean).join(", ") ||
              undefined,
            points: normalizePoints(Number(r.points)),
            rankChange,
            rankChangeAmount,
          } as LeaderboardEntry;
        }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: "User" as const, id: r.user_id })),
              { type: "User", id: "LEADERBOARD" },
            ]
          : [{ type: "User", id: "LEADERBOARD" }],
    }),
    getMyScore: build.query<MyScore, void>({
      query: () => "/score/me",
      transformResponse: (resp: GenericApiResponse<MyScore>) => resp.data,
      providesTags: [{ type: "User", id: "ME_SCORE" }],
    }),
    getMyStats: build.query<MyStats, { period?: string } | void>({
      query: (arg) =>
        `/score/me/stats${arg && arg.period ? `?period=${arg.period}` : ""}`,
      transformResponse: (resp: GenericApiResponse<MyStats>) => resp.data,
      providesTags: [{ type: "User", id: "ME_STATS" }],
    }),
    adminAdjust: build.mutation<
      { success: boolean },
      { userId: number; delta: number; reason?: string }
    >({
      query: (body) => ({
        url: "/score/admin/adjust",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "User", id: arg.userId },
        { type: "User", id: "LEADERBOARD" },
        { type: "User", id: "ME_SCORE" },
      ],
    }),
    promoteModerator: build.mutation<{ success: boolean }, { userId: number }>({
      query: (body) => ({
        url: "/score/admin/promote-moderator",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "User", id: arg.userId },
        { type: "User", id: "ME_SCORE" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLeaderboardQuery,
  useGetLeaderboardPaginatedQuery,
  useGetLeaderboardAroundQuery,
  useGetMyScoreQuery,
  useGetMyStatsQuery,
  useAdminAdjustMutation,
  usePromoteModeratorMutation,
} = scoreApi;
