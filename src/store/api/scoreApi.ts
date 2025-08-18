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
        return resp.data.map((r: LeaderboardRowApi) => ({
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
        }));
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
          (r: LeaderboardRowApi) => ({
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
          })
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
        (resp.data || []).map((r: LeaderboardRowApi) => ({
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
        })),
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
