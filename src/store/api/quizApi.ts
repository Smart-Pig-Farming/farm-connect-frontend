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
  tags?: { id: number; name: string }[]; // additional categories (many-to-many)
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
  // Backend may provide prompt alias (we normalize)
  prompt?: string;
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
    status?: string;
  };
  quiz: {
    id: number;
    title: string;
    description: string;
    passing_score: number;
  };
  questions: QuizQuestion[];
  requested_question_count?: number;
  served_question_count?: number;
  partial_set?: boolean;
  shortfall?: number;
  reused?: boolean;
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
    total_questions?: number;
    status?: string;
  };
  // Returned by backend for immediate review (optional)
  breakdown?: AttemptBreakdownEntry[];
  // Scoring metadata (present when quiz completion awarded points)
  scoring?: {
    points_delta: number; // points awarded for this completion
    user_points: number | null; // new total user points (unscaled)
    user_level: number | null; // new user level (post-award)
    level_label?: string | null; // human label for level
    next_level_at?: number | null; // threshold for next level
    awarded_event_type?: string; // QUIZ_COMPLETED_PASS | QUIZ_COMPLETED_FAIL
  } | null;
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
export interface AttemptBreakdownEntry {
  question_id: number;
  prompt: string;
  type: string;
  difficulty?: string;
  explanation?: string | null;
  selected_option_ids: number[];
  correct_option_ids: number[];
  correct: boolean;
  partial?: boolean;
}
// Review endpoint adds options per question (including correctness)
export interface AttemptReviewBreakdownEntry extends AttemptBreakdownEntry {
  options: { id: number; text: string; is_correct: boolean }[];
}
export interface AttemptReviewResponse {
  attempt: {
    id: number;
    quiz_id: number;
    submitted_at: string;
    score_percent: number;
    score_raw: number;
    total_questions: number;
    passed: boolean;
    status: string;
  };
  breakdown: AttemptReviewBreakdownEntry[];
}
export interface AttemptDetailResponse {
  attempt: AttemptDetail;
  questions?: QuizQuestion[]; // served questions when resuming
  answers?: Record<string, number[]>; // map question_id -> selected option ids
  breakdown?: AttemptBreakdownEntry[];
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
        tag_id?: number; // legacy primary-only filter
        any_tag_id?: number; // new inclusive filter
        search?: string;
        active?: boolean;
      } | void
    >({
      query: (args) => {
        if (!args) return { url: "/quizzes" };
        const { any_tag_id, tag_id, ...rest } = args;
        const params: Record<string, unknown> = { ...rest };
        // any_tag_id supersedes legacy tag_id
        if (any_tag_id != null) params.any_tag_id = any_tag_id;
        else if (tag_id != null) params.tag_id = tag_id;
        // Normalize active boolean to string for consistency (backend accepts both now)
        if (typeof params.active === "boolean") {
          params.active = params.active ? "true" : "false";
        }
        // Drop undefined/null
        for (const k of Object.keys(params)) {
          if (params[k] == null) delete params[k];
        }
        return { url: "/quizzes", params };
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
          await queryFulfilled; // success - no toast (UI handles state)
        } catch (e: unknown) {
          // Best-effort extraction without widening types globally
          let root: unknown = e;
          if (
            root &&
            typeof root === "object" &&
            "error" in (root as Record<string, unknown>)
          ) {
            root = (root as Record<string, unknown>).error;
          }
          // @ts-expect-error dynamic error shape from server
          const code = root?.data?.code;
          const msg = getErrorMessage(root as unknown as Error);
          if (code === "NO_QUESTIONS") {
            toast.info("Quiz has no active questions yet.");
          } else if (code === "INSUFFICIENT_QUESTIONS") {
            toast.error(
              "Quiz needs more active questions before it can start."
            );
          } else if (msg && !/Failed to start attempt/i.test(msg)) {
            toast.error(msg);
          }
        }
      },
    }),
    startAttemptByTag: builder.mutation<
      StartAttemptResponse & {
        aggregated?: boolean;
        aggregated_tag_id?: number;
        aggregated_quiz_ids?: number[];
      },
      {
        tag_id?: number;
        any_tag_id?: number;
        question_count?: number;
        shuffle?: boolean;
      }
    >({
      query: ({ tag_id, any_tag_id, question_count, shuffle }) => {
        const params: Record<string, unknown> = {};
        if (any_tag_id != null) params.any_tag_id = any_tag_id;
        else if (tag_id != null) params.tag_id = tag_id;
        return {
          url: "/quizzes/attempts/by-tag",
          method: "POST",
          params,
          body: { question_count, shuffle },
        };
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (e: unknown) {
          // @ts-expect-error dynamic
          const msg = getErrorMessage(e?.error || e);
          if (msg) toast.error(msg);
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
    saveAttemptAnswer: builder.mutation<
      void,
      {
        quizId: number | string;
        attemptId: number | string;
        question_id: number;
        option_ids: number[];
      }
    >({
      query: ({ quizId, attemptId, question_id, option_ids }) => ({
        url: `/quizzes/${quizId}/attempts/${attemptId}/answers`,
        method: "PATCH",
        body: { question_id, option_ids },
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (e) {
          // @ts-expect-error dynamic error shape
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
    getAttemptReview: builder.query<
      AttemptReviewResponse,
      { quizId: number | string; attemptId: number | string }
    >({
      query: ({ quizId, attemptId }) =>
        `/quizzes/${quizId}/attempts/${attemptId}/review`,
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
    // Aggregate questions across all quizzes that contain a given tag (inclusive)
    listQuestionsByTag: builder.query<
      QuizQuestionsListResponse,
      {
        tag_id?: number; // primary-only
        any_tag_id?: number; // inclusive many-to-many
        limit?: number;
        offset?: number;
        search?: string;
        difficulty?: string;
        type?: string;
      }
    >({
      query: ({
        tag_id,
        any_tag_id,
        limit = 20,
        offset = 0,
        search,
        difficulty,
        type,
      }) => {
        const params: Record<string, unknown> = {
          limit,
          offset,
          search,
          difficulty,
          type,
        };
        if (any_tag_id != null) params.any_tag_id = any_tag_id;
        else if (tag_id != null) params.tag_id = tag_id;
        for (const k of Object.keys(params))
          if (params[k] == null) delete params[k];
        return { url: "/quizzes/questions/by-tag", params };
      },
      serializeQueryArgs: ({ queryArgs }) =>
        JSON.stringify({
          tag_id: queryArgs.tag_id,
          any_tag_id: queryArgs.any_tag_id,
          limit: queryArgs.limit,
          search: queryArgs.search || "",
          difficulty: queryArgs.difficulty || "",
          type: queryArgs.type || "",
        }),
      merge: (_c, i) => i,
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
        best_practice_tag_id?: number; // legacy optional
        is_active?: boolean;
        tag_ids: number[]; // full set including primary
        primary_tag_id?: number; // optional explicit primary (falls back to first tag_ids[0])
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
    updateQuiz: builder.mutation<
      { quiz: QuizListItem },
      {
        id: number | string;
        title?: string;
        description?: string;
        passing_score?: number;
        duration?: number;
        is_active?: boolean;
        best_practice_tag_id?: number; // legacy
        tag_ids?: number[]; // replace full set
        primary_tag_id?: number;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/quizzes/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, a) => [
        { type: "Quiz", id: a.id },
        { type: "Quiz", id: "LIST" },
        { type: "Quiz", id: "TAG_STATS" },
      ],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Quiz updated");
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
  useStartAttemptByTagMutation,
  useSubmitAttemptMutation,
  useSaveAttemptAnswerMutation,
  useGetAttemptQuery,
  useGetQuizStatsQuery,
  useGetQuizTagStatsQuery,
  useGetAttemptReviewQuery,
  useListQuizQuestionsQuery,
  useListQuestionsByTagQuery,
  useCreateQuizQuestionMutation,
  useUpdateQuizQuestionMutation,
  useDeleteQuizQuestionMutation,
  useCreateQuizMutation,
  useUpdateQuizMutation,
} = quizApi;
