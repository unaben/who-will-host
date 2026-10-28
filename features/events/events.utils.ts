import { MAX_ATTENDEES, RSVP_VALUES } from "@/constants";
import {
  type ApiErrorBody,
  type CreateEventInput,
  type EventFormErrors,
  type EventView,
  type Rsvp,
} from "./events.types";

export const RSVP_LABELS: Record<Rsvp, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  maybe: "Maybe",
};

export function isRsvp(value: unknown): value is Rsvp {
  return RSVP_VALUES.some((rsvp) => rsvp === value);
}

/** "2 accepted · 1 maybe · 3 pending" (empty when nobody is attending). Zero counts are left out. */
export function rsvpSummary(event: Pick<EventView, "attendees">): string {
  const order: Rsvp[] = ["accepted", "maybe", "declined", "pending"];
  return order
    .map((rsvp) => ({
      rsvp,
      count: event.attendees.filter((a) => a.rsvp === rsvp).length,
    }))
    .filter(({ count }) => count > 0)
    .map(({ rsvp, count }) => `${count} ${RSVP_LABELS[rsvp].toLowerCase()}`)
    .join(" · ");
}

/** Attendees who hold a seat. Someone who declined has let their seat go. */
export function seatedAttendees<T extends { rsvp: Rsvp }>(attendees: T[]): T[] {
  return attendees.filter((a) => a.rsvp !== "declined");
}

export function declinedAttendees<T extends { rsvp: Rsvp }>(
  attendees: T[],
): T[] {
  return attendees.filter((a) => a.rsvp === "declined");
}

/** How many seats are still open on an event (declined invites don't count). */
export function spotsLeft(
  event: Pick<EventView, "attendees" | "maxAttendees">,
): number {
  return Math.max(
    0,
    event.maxAttendees - seatedAttendees(event.attendees).length,
  );
}

export function isFull(
  event: Pick<EventView, "attendees" | "maxAttendees">,
): boolean {
  return spotsLeft(event) === 0;
}

export function sortByStart<T extends { startsAt: string }>(events: T[]): T[] {
  return [...events].sort(
    (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt),
  );
}

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "Fri 6 Nov, 19:00–22:00" or, across midnight, "Fri 6 Nov, 22:00 – Sat 7 Nov, 01:00". */
export function formatEventRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";

  const sameDay = start.toDateString() === end.toDateString();
  const startPart = `${dayFormat.format(start)}, ${timeFormat.format(start)}`;
  return sameDay
    ? `${startPart}–${timeFormat.format(end)}`
    : `${startPart} – ${dayFormat.format(end)}, ${timeFormat.format(end)}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/** Turns a <input type="datetime-local"> value into an ISO string ('' if empty/invalid). */
export function toIsoFromLocalInput(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

/** The reverse of the above: an ISO string -> the value a <input type="datetime-local"> expects. */
export function toLocalInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Pulls the server's message (and per-field errors) out of an RTK Query error. */
export function readApiError(error: unknown): ApiErrorBody {
  const e = error as
    | { data?: Partial<ApiErrorBody>; status?: number | string }
    | undefined;
  if (e?.data?.message)
    return { message: e.data.message, errors: e.data.errors };

  // No message from our API: say what actually went wrong instead of blaming the network.
  console.error("API call failed:", error);
  if (typeof e?.status === "number") {
    return {
      message: `The server replied with ${e.status}. Try again in a moment.`,
    };
  }
  if (e?.status === "PARSING_ERROR") {
    return { message: "The server's reply could not be read." };
  }
  if (e?.status === "FETCH_ERROR") {
    return { message: "We could not reach the server. Try again in a moment." };
  }
  return {
    message: "Something unexpected went wrong. Check the browser console.",
  };
}

/**
 * One set of rules used by both the form (instant feedback) and the API
 * (the real gatekeeper), so they can never disagree.
 */
export function validateEventInput(
  input: Pick<
    CreateEventInput,
    "title" | "startsAt" | "endsAt" | "hostContactIds" | "attendees"
  >,
): EventFormErrors {
  const errors: EventFormErrors = {};

  const title = input.title?.trim() ?? "";
  if (!title) errors.title = "Give the event a title.";
  else if (title.length > 80)
    errors.title = "Keep the title under 80 characters.";

  const start = Date.parse(input.startsAt);
  const end = Date.parse(input.endsAt);
  if (Number.isNaN(start)) errors.startsAt = "Pick a start time.";
  if (Number.isNaN(end)) errors.endsAt = "Pick an end time.";
  else if (!Number.isNaN(start) && end <= start)
    errors.endsAt = "The event has to end after it starts.";

  if (!input.hostContactIds?.length) errors.hosts = "Assign at least one host.";

  const attendees = input.attendees ?? [];
  if (attendees.length > MAX_ATTENDEES) {
    errors.attendees = `An event can have at most ${MAX_ATTENDEES} attendees.`;
  } else {
    const contactIds = attendees.flatMap((a) =>
      a.source === "contact" ? [a.contactId] : [],
    );
    if (new Set(contactIds).size !== contactIds.length) {
      errors.attendees = "The same person is added twice.";
    } else if (
      attendees.some((a) => a.source === "guest" && !a.guestName?.trim())
    ) {
      errors.attendees = "Every guest needs a name.";
    }
  }

  return errors;
}
