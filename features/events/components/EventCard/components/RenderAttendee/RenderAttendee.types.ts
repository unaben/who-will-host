import type { EventView } from "@/features/events/events.types";

export type RenderAttendeeProps = {
  attendee: EventView["attendees"][number];
  savingRsvpId: string | null;
  handleRsvp: (
    attendeeId: string,
    rsvp: "pending" | "accepted" | "declined" | "maybe",
  ) => Promise<void>;
  full: boolean
};
