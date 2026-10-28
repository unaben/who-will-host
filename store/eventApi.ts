import { api } from "./api";
import type {
  CreateEventInput,
  DeleteResult,
  EventView,
  Rsvp,
} from "@/features/events/events.types";

export const eventApi = api.injectEndpoints({
  endpoints: (build) => ({
    getEvents: build.query<EventView[], string>({
      query: (groupId) => `events?groupId=${encodeURIComponent(groupId)}`,
      providesTags: (result, _error, groupId) => [
        { type: "Event", id: `LIST-${groupId}` },
        ...(result ?? []).map(({ id }) => ({ type: "Event" as const, id })),
      ],
    }),

    createEvent: build.mutation<EventView, CreateEventInput>({
      query: (body) => ({ url: "events", method: "POST", body }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "Event", id: `LIST-${groupId}` },
        { type: "Group", id: groupId },
      ],
    }),

    updateEvent: build.mutation<
      EventView,
      { id: string; input: CreateEventInput; previousGroupId?: string }
    >({
      query: ({ id, input }) => ({
        url: `events/${id}`,
        method: "PUT",
        body: input,
      }),
      invalidatesTags: (_result, _error, { id, input, previousGroupId }) => {
        const groupIds = new Set([
          input.groupId,
          previousGroupId ?? input.groupId,
        ]);
        return [
          { type: "Event", id },
          ...[...groupIds].flatMap((groupId) => [
            { type: "Event" as const, id: `LIST-${groupId}` },
            { type: "Group" as const, id: groupId },
          ]),
        ];
      },
    }),

    deleteEvent: build.mutation<DeleteResult, { id: string; groupId: string }>({
      query: ({ id }) => ({ url: `events/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { id, groupId }) => [
        { type: "Event", id },
        { type: "Event", id: `LIST-${groupId}` },
        { type: "Group", id: groupId },
      ],
    }),

    updateRsvp: build.mutation<
      EventView,
      { eventId: string; attendeeId: string; rsvp: Rsvp; groupId: string }
    >({
      query: ({ eventId, attendeeId, rsvp }) => ({
        url: `events/${eventId}/attendees/${attendeeId}`,
        method: "PATCH",
        body: { rsvp },
      }),
      async onQueryStarted({ groupId }, { dispatch, queryFulfilled }) {
        try {
          const { data: updated } = await queryFulfilled;
          dispatch(
            eventApi.util.updateQueryData("getEvents", groupId, (draft) => {
              const index = draft.findIndex((e) => e.id === updated.id);
              if (index !== -1) draft[index] = updated;
            }),
          );
        } catch {
          // Request failed: nothing was patched, so nothing to roll back.
        }
      },
    }),
  }),
});

export const {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useUpdateRsvpMutation,
} = eventApi;
