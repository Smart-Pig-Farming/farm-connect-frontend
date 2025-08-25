import { baseApi } from "./baseApi";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";

// Types matching backend responses
export interface QuizListItem {
  id: number;
  title: string;
  description: string;
  duration: number;
  passing_score: number;
  is_active: boolean;
  best_practice_tag_id: number;
  created_at: string;
  creator?: { id: number; firstname?: string; lastname?: string };
  bestPracticeTag?: { id: number; name: string };
}
export interface QuizListResponse {
  items: QuizListItem[];
  pageInfo: { hasNextPage: boolean; nextCursor: string | null };
}
export interface QuizQuestionOption {
  id: number;
  text: string;
  order_index: number /* is_correct masked unless manager */;
}
export interface QuizQuestion {
  id: number;
  text: string;
  explanation?: string | null;
  order_index: number;
  type: string;
  difficulty: string;
  options: QuizQuestionOption[];
}
export interface QuizDetail {
  quiz: QuizListItem & { questions?: QuizQuestion[] };
}

export interface StartAttemptResponse {
  attempt: {
    id: number;
    quiz_id: number;
    started_at: string;
    expires_at: string;
    duration_seconds: number;
  };
  quiz: {
    id: number;
    title: string;
    description: string;
    passing_score: number;
  };
  questions: QuizQuestion[];
}
export interface SubmitAttemptResponse {
  attempt: {
    id: number;
    quiz_id: number;
    score_raw: number;
    score_percent: number;
    score_points?: number;
    passed: boolean;
    submitted_at: string;
    time_exceeded: boolean;
  };
}
export interface AttemptAnswer {
  id: number;
  question_id: number;
  option_id: number;
  is_correct_snapshot: boolean;
}
export interface AttemptDetail {
  id: number;
  quiz_id: number;
  user_id: number;
  score_raw?: number;
  score_percent?: number;
  score_points?: string;
  passed?: boolean;
  submitted_at?: string;
  answers?: AttemptAnswer[];
}
export interface AttemptDetailResponse {
  attempt: AttemptDetail;
}
export interface UserBestAttempt {
  id: number;
  score_raw: number | null;
  score_percent: number | null;
  score_points?: string | null;
  passed: boolean | null;
  submitted_at: string;
}
export interface QuizStatsResponse {
  stats: {
    attempts: number;
    average_percent: number;
    success_rate: number;
    best_attempt?: UserBestAttempt | null;
  };
}
// Tag stats (aggregated across quizzes) shape
export interface QuizTagStatsRow {
  tag_id: number;
  tag_name: string;
  quiz_count: number;
  question_count: number;
}
export interface QuizTagStatsResponse {
  tags: QuizTagStatsRow[];
}

export interface StartAttemptPayload {
  id: number | string;
  question_count?: number;
  shuffle?: boolean;
}
export interface SubmitAttemptPayload {
  quizId: number | string;
  attemptId: number | string;
  answers: { question_id: number; option_ids: number[] }[];
}

export const quizApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listQuizzes: builder.query<
      QuizListResponse,
      {
        limit?: number;
        cursor?: string;
        tag_id?: number;
        search?: string;
        active?: boolean;
      } | void
    >({
      query: (args) => {
        if (args) {
          return { url: "/quizzes", params: args };
        }
        return { url: "/quizzes" };
      },
      providesTags: (r) =>
        r
          ? [
              ...r.items.map((q) => ({ type: "Quiz" as const, id: q.id })),
              { type: "Quiz" as const, id: "LIST" },
            ]
          : [{ type: "Quiz" as const, id: "LIST" }],
      serializeQueryArgs: ({ queryArgs }) =>
        JSON.stringify({ ...(queryArgs || {}), cursor: undefined }),
      merge: (current, incoming, { arg }) => {
        if (!arg || !arg.cursor) return incoming;
        if (!current) return incoming;
        return { ...incoming, items: [...current.items, ...incoming.items] };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.cursor !== previousArg?.cursor;
      },
    }),
    getQuiz: builder.query<QuizDetail, number | string>({
      query: (id) => `/quizzes/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Quiz", id }],
    }),
    startAttempt: builder.mutation<StartAttemptResponse, StartAttemptPayload>({
      query: ({ id, question_count, shuffle }) => ({
        url: `/quizzes/${id}/attempts`,
        method: "POST",
        body: { question_count, shuffle },
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: "Quiz", id: arg.id }],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (e) {
          // error shape unknown; best-effort extraction
          // @ts-expect-error dynamic error object
          toast.error(getErrorMessage(e?.error || e));
        }
      },
    }),
    submitAttempt: builder.mutation<
      SubmitAttemptResponse,
      SubmitAttemptPayload
    >({
      query: ({ quizId, attemptId, answers }) => ({
        url: `/quizzes/${quizId}/attempts/${attemptId}/submit`,
        method: "POST",
        body: { answers },
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.attempt.passed) toast.success("Quiz passed!");
          else toast.info("Quiz submitted");
        } catch (e) {
          // @ts-expect-error dynamic error object
          toast.error(getErrorMessage(e?.error || e));
        }
      },
    }),
    getAttempt: builder.query<
      AttemptDetailResponse,
      { quizId: number | string; attemptId: number | string }
    >({
      query: ({ quizId, attemptId }) =>
        `/quizzes/${quizId}/attempts/${attemptId}`,
    }),
    getQuizStats: builder.query<QuizStatsResponse, { id: number | string }>({
      query: ({ id }) => `/quizzes/${id}/stats`,
      providesTags: (_r, _e, a) => [{ type: "Quiz", id: a.id }],
    }),
    getQuizTagStats: builder.query<QuizTagStatsResponse, void>({
      query: () => "/quizzes/stats",
      providesTags: () => [{ type: "Quiz", id: "TAG_STATS" }],
    }),
  }),
});

export const {
  useListQuizzesQuery,
  useGetQuizQuery,
  useStartAttemptMutation,
  useSubmitAttemptMutation,
  useGetAttemptQuery,
  useGetQuizStatsQuery,
  useGetQuizTagStatsQuery,
} = quizApi;
