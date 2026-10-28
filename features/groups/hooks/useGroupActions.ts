"use client";

import { useCallback } from "react";
import {
  useUpdateGroupMutation,
  useDeleteGroupMutation,
} from "@/store/groupApi";
import { CreateGroupInput, ActionResult } from "@/features/events/events.types";
import { readApiError } from "@/features/events/events.utils";

/** Rename/describe a group, or delete it (which also deletes its events). */
export function useGroupActions(groupId: string) {
  const [updateGroupMutation, updateState] = useUpdateGroupMutation();
  const [deleteGroupMutation, deleteState] = useDeleteGroupMutation();

  const saveGroup = useCallback(
    async (input: CreateGroupInput): Promise<ActionResult> => {
      try {
        await updateGroupMutation({ id: groupId, input }).unwrap();
        return { ok: true };
      } catch (error) {
        return { ok: false, message: readApiError(error).message };
      }
    },
    [groupId, updateGroupMutation],
  );

  const removeGroup = useCallback(async (): Promise<ActionResult> => {
    try {
      await deleteGroupMutation(groupId).unwrap();
      return { ok: true };
    } catch (error) {
      return { ok: false, message: readApiError(error).message };
    }
  }, [groupId, deleteGroupMutation]);

  return {
    saveGroup,
    removeGroup,
    isSaving: updateState.isLoading,
    isDeleting: deleteState.isLoading,
  };
}
