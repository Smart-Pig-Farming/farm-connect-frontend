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
  is_correct?: boolean; // only present for managers
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
    user_average_percent?: number | null;
    best_attempt?: UserBestAttempt | null;
  };
}
// Quiz questions list (offset pagination)
export interface QuizQuestionsListResponse {
  items: QuizQuestion[];
  pageInfo: {
    total: number;
    limit: number;
    offset: number;
    hasNextPage: boolean;
    nextOffset: number | null;
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
    listQuizQuestions: builder.query<
      QuizQuestionsListResponse,
      {
        quizId: number | string;
        limit?: number;
        offset?: number;
        search?: string;
        difficulty?: string; // comma-separated list allowed
        type?: string; // comma-separated list allowed
      }
    >({
      query: ({
        quizId,
        limit = 20,
        offset = 0,
        search,
        difficulty,
        type,
      }) => ({
        url: `/quizzes/${quizId}/questions`,
        params: { limit, offset, search, difficulty, type },
      }),
      providesTags: (_r, _e, a) => [
        { type: "Quiz" as const, id: a.quizId },
        { type: "Quiz" as const, id: `QUESTIONS-${a.quizId}` },
      ],
      serializeQueryArgs: ({ queryArgs }) =>
        JSON.stringify({
          quizId: queryArgs.quizId,
          limit: queryArgs.limit,
          search: queryArgs.search || "",
          difficulty: queryArgs.difficulty || "",
          type: queryArgs.type || "",
        }),
      merge: (_current, incoming) => incoming, // offset pages handled externally (we refetch per page)
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.offset !== previousArg?.offset ||
          currentArg?.limit !== previousArg?.limit ||
          currentArg?.search !== previousArg?.search ||
          currentArg?.difficulty !== previousArg?.difficulty ||
          currentArg?.type !== previousArg?.type
        );
      },
    }),
    createQuizQuestion: builder.mutation<
      { question: QuizQuestion },
      {
        quizId: number | string;
        text: string;
        explanation?: string;
        order_index?: number;
        options: { text: string; is_correct?: boolean; order_index?: number }[];
      }
    >({
      query: ({ quizId, ...body }) => ({
        url: `/quizzes/${quizId}/questions`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, a) => [
        { type: "Quiz", id: a.quizId },
        { type: "Quiz", id: `QUESTIONS-${a.quizId}` },
        { type: "Quiz", id: "TAG_STATS" },
      ],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Question created");
        } catch (e) {
          // @ts-expect-error dynamic error shape from baseQuery
          toast.error(getErrorMessage(e?.error || e));
        }
      },
    }),
    updateQuizQuestion: builder.mutation<
      { question: QuizQuestion },
      {
        id: number | string;
        quizId?: number | string; // for invalidation
        text?: string;
        explanation?: string;
        order_index?: number;
        type?: string;
        difficulty?: string;
        options?: {
          text: string;
          is_correct?: boolean;
          order_index?: number;
        }[];
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/quizzes/question/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, a) =>
        [
          { type: "Quiz", id: `QUESTION-${a.id}` },
          a.quizId ? { type: "Quiz", id: a.quizId } : undefined,
          a.quizId ? { type: "Quiz", id: `QUESTIONS-${a.quizId}` } : undefined,
          { type: "Quiz", id: "TAG_STATS" },
        ].filter((t): t is { type: "Quiz"; id: string | number } => !!t),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Question updated");
        } catch (e) {
          // @ts-expect-error dynamic error shape from baseQuery
          toast.error(getErrorMessage(e?.error || e));
        }
      },
    }),
    deleteQuizQuestion: builder.mutation<
      void,
      { id: number | string; quizId?: number | string }
    >({
      query: ({ id }) => ({
        url: `/quizzes/question/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, a) => [
        { type: "Quiz", id: a.quizId || "LIST" },
        { type: "Quiz", id: `QUESTIONS-${a.quizId}` },
        { type: "Quiz", id: "TAG_STATS" },
      ],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Question deleted");
        } catch (e) {
          // @ts-expect-error dynamic error shape from baseQuery
          toast.error(getErrorMessage(e?.error || e));
        }
      },
    }),
    createQuiz: builder.mutation<
      { quiz: QuizListItem },
      {
        title: string;
        description?: string;
        passing_score: number;
        duration: number;
        best_practice_tag_id: number;
        is_active?: boolean;
      }
    >({
      query: (body) => ({ url: "/quizzes", method: "POST", body }),
      invalidatesTags: () => [
        { type: "Quiz", id: "LIST" },
        { type: "Quiz", id: "TAG_STATS" },
      ],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Quiz created");
        } catch (e) {
          // @ts-expect-error dynamic error shape
          toast.error(getErrorMessage(e?.error || e));
        }
      },
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
  useListQuizQuestionsQuery,
  useCreateQuizQuestionMutation,
  useUpdateQuizQuestionMutation,
  useDeleteQuizQuestionMutation,
  useCreateQuizMutation,
} = quizApi;
