import { ChangeEvent, SubmitEvent, useState } from "react";
import {
  type EventFormErrors,
  AttendeeInput,
} from "@/features/events/events.types";
import {
  toIsoFromLocalInput,
  validateEventInput,
} from "@/features/events/events.utils";
import type { UseEventFormOptions, EventFormData } from "../EventForm.types";
import { emptyFormData, getInitialFormData } from "../EventForm.utils";
import { MAX_ATTENDEES } from "@/constants";

const useEventForm = (options: UseEventFormOptions) => {
  const { groupId, event, onSubmit, onSaved } = options;
  const isEditing = Boolean(event);
  const [formData, setFormData] = useState<EventFormData>(() =>
    getInitialFormData(event),
  );
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [formMessage, setFormMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);

  const attendeeCount = formData.attendeeIds.length + formData.guests.length;
  const atLimit = attendeeCount >= MAX_ATTENDEES;

  // Each input has a `name` that matches a key in formData, so one handler covers them all.
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggle = (field: "hostIds" | "attendeeIds", id: string) =>
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((x) => x !== id)
        : [...prev[field], id],
    }));

  const addGuest = () => {
    const name = formData.guestName.trim();
    if (!name || atLimit) return;
    setFormData((prev) => ({
      ...prev,
      guests: [...prev.guests, { name, email: prev.guestEmail.trim() }],
      guestName: "",
      guestEmail: "",
    }));
  };

  const reset = () => {
    setFormData(emptyFormData);
    setErrors({});
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setFormMessage(null);

    const attendees: AttendeeInput[] = [
      ...formData.attendeeIds.map(
        (contactId): AttendeeInput => ({ source: "contact", contactId }),
      ),
      ...formData.guests.map(
        (g): AttendeeInput => ({
          source: "guest",
          guestName: g.name,
          guestEmail: g.email || undefined,
        }),
      ),
    ];

    const input = {
      groupId,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      startsAt: toIsoFromLocalInput(formData.startsAt),
      endsAt: toIsoFromLocalInput(formData.endsAt),
      status: formData.status,
      hostContactIds: formData.hostIds,
      attendees,
    };

    const found = validateEventInput(input);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const result = await onSubmit(input);
    if (!result.ok) {
      setErrors(result.errors);
      setFormMessage({ kind: "error", text: result.message });
      return;
    }

    if (isEditing) {
      onSaved?.(); // the parent closes the editor
      return;
    }
    reset();
    setFormMessage({
      kind: "success",
      text: `“${result.event.title}” was created.`,
    });
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    isEditing,
    errors,
    formMessage,
    attendeeCount,
    atLimit,
    toggle,
    addGuest,
    reset,
    handleSubmit,
  };
};

export default useEventForm;
