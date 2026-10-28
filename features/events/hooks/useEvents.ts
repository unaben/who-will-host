"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type {
  ActionResult,
  CreateEventInput,
  CreateEventResult,
  EventView,
  Rsvp,
} from "../events.types";
import { readApiError } from "../events.utils";
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useUpdateRsvpMutation,
} from "@/store/eventApi";
import { useGetGroupsQuery } from "@/store/groupApi";
import { useGetLookupsQuery } from "@/store/lookupApi";

/** Everything the events screen needs for one group: data, loading state, and the create/update/delete actions. */
export function useEvents(groupId: string) {
  const groups = useGetGroupsQuery();
  const events = useGetEventsQuery(groupId);
  const lookups = useGetLookupsQuery();
  // The form on the right is for creating, unless an event has been picked to edit.
  const [editingId, setEditingId] = useState<string | null>(null);
  const formSection = useRef<HTMLElement>(null);
  const [createEventMutation, createState] = useCreateEventMutation();
  const [updateEventMutation, updateState] = useUpdateEventMutation();
  const [deleteEventMutation] = useDeleteEventMutation();
  const [updateRsvpMutation] = useUpdateRsvpMutation();

  console.log("Inside useEvents: ", events);

  const group = useMemo(
    () => groups.data?.find((g) => g.id === groupId),
    [groups.data, groupId],
  );

  const createEvent = useCallback(
    async (input: CreateEventInput): Promise<CreateEventResult> => {
      try {
        const event = await createEventMutation(input).unwrap();
        return { ok: true, event };
      } catch (error) {
        const { message, errors } = readApiError(error);
        return { ok: false, message, errors: errors ?? {} };
      }
    },
    [createEventMutation],
  );

  const updateEvent = useCallback(
    async (id: string, input: CreateEventInput): Promise<CreateEventResult> => {
      try {
        const event = await updateEventMutation({ id, input }).unwrap();
        return { ok: true, event };
      } catch (error) {
        const { message, errors } = readApiError(error);
        return { ok: false, message, errors: errors ?? {} };
      }
    },
    [updateEventMutation],
  );

  const deleteEvent = useCallback(
    async (id: string): Promise<ActionResult> => {
      try {
        await deleteEventMutation({ id, groupId }).unwrap();
        return { ok: true };
      } catch (error) {
        return { ok: false, message: readApiError(error).message };
      }
    },
    [deleteEventMutation, groupId],
  );

  const updateRsvp = useCallback(
    async (
      eventId: string,
      attendeeId: string,
      rsvp: Rsvp,
    ): Promise<ActionResult> => {
      try {
        await updateRsvpMutation({
          eventId,
          attendeeId,
          rsvp,
          groupId,
        }).unwrap();
        return { ok: true };
      } catch (error) {
        return { ok: false, message: readApiError(error).message };
      }
    },
    [updateRsvpMutation, groupId],
  );

  const startEditing = (event: EventView) => {
    setEditingId(event.id);
    // On narrow screens the form sits below the list, so bring it into view.
    formSection.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const stopEditing = () => setEditingId(null);

  return {
    group,
    events: events.data ?? [],
    contacts: lookups.data?.contacts ?? [],
    isLoading: events.isLoading || groups.isLoading || lookups.isLoading,
    isNotFound:
      events.isError && (events.error as { status?: number })?.status === 404,
    isError: events.isError || groups.isError || lookups.isError,
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    updateRsvp,
    startEditing,
    stopEditing,
    formSection,
    editingId,
  };
}
