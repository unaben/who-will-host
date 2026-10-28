import { api } from "./api";
import type {
  CreateGroupInput,
  DeleteResult,
  GroupView,
} from "@/features/events/events.types";

export const groupApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGroups: build.query<GroupView[], void>({
      query: () => "groups",
      providesTags: (result) => [
        { type: "Group", id: "LIST" },
        ...(result ?? []).map(({ id }) => ({ type: "Group" as const, id })),
      ],
    }),

    createGroup: build.mutation<GroupView, CreateGroupInput>({
      query: (body) => ({ url: "groups", method: "POST", body }),
      invalidatesTags: [{ type: "Group", id: "LIST" }],
    }),

    updateGroup: build.mutation<
      GroupView,
      { id: string; input: CreateGroupInput }
    >({
      query: ({ id, input }) => ({
        url: `groups/${id}`,
        method: "PUT",
        body: input,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Group", id }],
    }),

    deleteGroup: build.mutation<DeleteResult, string>({
      query: (id) => ({ url: `groups/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Group", id: "LIST" },
        { type: "Group", id },
        { type: "Event", id: `LIST-${id}` },
      ],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
} = groupApi;