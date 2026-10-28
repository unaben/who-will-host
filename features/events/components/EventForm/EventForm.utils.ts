import type { EventView } from "../../events.types";
import { seatedAttendees, toLocalInputValue } from "../../events.utils";
import { type EventFormData } from "./EventForm.types";

export const emptyFormData: EventFormData = {
  title: "",
  description: "",
  location: "",
  startsAt: "",
  endsAt: "",
  status: "scheduled",
  hostIds: [],
  attendeeIds: [],
  guests: [],
  guestName: "",
  guestEmail: "",
};

/** Blank for a new event, or filled in from an existing one when editing. */
export function getInitialFormData(event?: EventView): EventFormData {
  if (!event) return emptyFormData;

  // People who declined let go of their seat, so they aren't loaded into the form.
  // The API keeps them on the event (see updateEvent) unless you add them again.
  const attendees = seatedAttendees(event.attendees);

  return {
    title: event.title,
    description: event.description ?? "",
    location: event.location ?? "",
    startsAt: toLocalInputValue(event.startsAt),
    endsAt: toLocalInputValue(event.endsAt),
    status: event.status,
    hostIds: event.hosts.map((host) => host.contactId),
    attendeeIds: attendees.flatMap((a) =>
      a.source === "contact" && a.contactId ? [a.contactId] : [],
    ),
    guests: attendees
      .filter((a) => a.source === "guest")
      .map((a) => ({ name: a.name, email: a.email ?? "" })),
    guestName: "",
    guestEmail: "",
  };
}
