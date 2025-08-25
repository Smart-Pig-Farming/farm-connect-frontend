import { baseApi } from "./baseApi";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";

// Types
export interface BestPracticeListItem {
  id: number;
  title: string;
  excerpt: string;
  categories: string[];
  is_published: boolean;
  created_at: string;
  read: boolean;
  last_read_at: string | null;
  read_count: number;
  steps_count?: number;
  benefits_count?: number;
}
export interface BestPracticeDetail extends BestPracticeListItem {
  description: string;
  steps_json?: unknown[]; // server returns steps_json (alias steps)
  benefits_json?: string[];
  media?: {
    kind: "image" | "video";
    url: string;
    thumbnail_url?: string | null;
    originalName?: string;
    storageKey?: string;
  } | null;
  language: string;
  is_deleted?: boolean;
  created_by?: number;
}
export interface CursorPageInfo {
  hasNextPage: boolean;
  nextCursor: string | null;
}
export interface ListResponse {
  items: BestPracticeListItem[];
  pageInfo: CursorPageInfo;
}
export interface CategoriesResponse {
  categories: { key: string; label: string; count: number }[];
  total: number;
}

export interface ListQueryParams {
  limit?: number;
  cursor?: string; // ISO date string or empty string for first page
  search?: string;
  category?: string;
  published?: boolean;
  created_by?: number;
}

// Helpers: build FormData for create/update
function buildBestPracticeForm(data: Record<string, unknown>) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (k === "categories" && Array.isArray(v)) {
      // Send as single JSON string for robust backend parsing
      fd.append("categories", JSON.stringify(v));
    } else if ((k === "steps" || k === "benefits") && Array.isArray(v)) {
      fd.append(k, JSON.stringify(v));
    } else if (k === "mediaFile" && v instanceof File) {
      fd.append("media", v);
    } else {
      fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
    }
  });
  return fd;
}

export const bestPracticesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBestPracticeCategories: builder.query<CategoriesResponse, void>({
      query: () => ({ url: "/best-practices/categories" }),
      providesTags: ["BestPractice"],
      transformResponse: (resp: unknown) => resp as CategoriesResponse,
    }),
    listBestPractices: builder.query<ListResponse, ListQueryParams>({
      query: (params) => ({
        url: "/best-practices",
        params: { ...params, cursor: params.cursor ?? "" },
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        const params = { ...queryArgs } as Record<string, unknown>;
        delete (params as Record<string, unknown>)["cursor"]; // exclude cursor from cache key
        return params;
      },
      merge: (current, incoming, { arg }) => {
        if (!arg.cursor) return incoming; // first page replace
        if (!current) return incoming;
        return {
          ...incoming,
          items: [...(current as ListResponse).items, ...incoming.items],
        } as ListResponse;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.cursor !== previousArg?.cursor;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((p) => ({
                type: "BestPractice" as const,
                id: p.id,
              })),
              { type: "BestPractice" as const, id: "LIST" },
            ]
          : [{ type: "BestPractice" as const, id: "LIST" }],
    }),
    getBestPractice: builder.query<
      {
        practice: BestPracticeDetail;
        navigation: { prevId: number | null; nextId: number | null };
      },
      number | string
    >({
      query: (id) => `/best-practices/${id}`,
      providesTags: (_res, _err, id) => [{ type: "BestPractice", id }],
    }),
    createBestPractice: builder.mutation<
      unknown,
      { data: Record<string, unknown> }
    >({
      query: ({ data }) => ({
        url: "/best-practices",
        method: "POST",
        body: buildBestPracticeForm(data),
      }),
      invalidatesTags: ["BestPractice"],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Best practice created");
        } catch (e) {
          // e is { error }
          // @ts-expect-error runtime shape
          toast.error(getErrorMessage(e?.error || e));
        }
      },
    }),
    updateBestPractice: builder.mutation<
      unknown,
      { id: number | string; data: Record<string, unknown> }
    >({
      query: ({ id, data }) => ({
        url: `/best-practices/${id}`,
        method: "PATCH",
        body: buildBestPracticeForm(data),
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "BestPractice", id: arg.id },
      ],
      async onQueryStarted(_vars, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Best practice updated");
        } catch (e) {
          // @ts-expect-error runtime shape
          toast.error(getErrorMessage(e?.error || e));
        }
      },
    }),
    deleteBestPractice: builder.mutation<void, number | string>({
      query: (id) => ({ url: `/best-practices/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "BestPractice", id },
        { type: "BestPractice", id: "LIST" },
      ],
      async onQueryStarted(_id, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Best practice deleted");
        } catch (e) {
          // @ts-expect-error runtime shape
          toast.error(getErrorMessage(e?.error || e));
        }
      },
    }),
  }),
});

export const {
  useGetBestPracticeCategoriesQuery,
  useListBestPracticesQuery,
  useGetBestPracticeQuery,
  useCreateBestPracticeMutation,
  useUpdateBestPracticeMutation,
  useDeleteBestPracticeMutation,
} = bestPracticesApi;
