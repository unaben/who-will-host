import { useState } from "react";
import { EventView, ActionResult, Rsvp } from "@/features/events/events.types";
import { isFull, spotsLeft } from "@/features/events/events.utils";
import type { Mode } from "@/types";

const useEventCard = (
  event: EventView,
  onDelete: (id: string) => Promise<ActionResult>,
  onRsvp: (eventId: string, attendeeId: string, rsvp: Rsvp) => Promise<ActionResult>,
) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [savingRsvpId, setSavingRsvpId] = useState<string | null>(null);
  const [rsvpError, setRsvpError] = useState("");

  const full = isFull(event);
  const left = spotsLeft(event);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");
    const result = await onDelete(event.id);
    // On success the event leaves the list and this card goes with it,
    // so there is nothing left to update.
    if (!result.ok) {
      setDeleteError(result.message);
      setIsDeleting(false);
    }
  };

  const handleRsvp = async (attendeeId: string, rsvp: Rsvp) => {
    setSavingRsvpId(attendeeId);
    setRsvpError("");
    const result = await onRsvp(event.id, attendeeId, rsvp);
    if (!result.ok) setRsvpError(result.message);
    setSavingRsvpId(null);
  };

  return {
    isDeleting,
    setIsDeleting,
    deleteError,
    setDeleteError,
    full,
    left,
    handleDelete,
    confirmingDelete,
    setConfirmingDelete,
    savingRsvpId,
    rsvpError,
    handleRsvp,
  };
};

export default useEventCard;