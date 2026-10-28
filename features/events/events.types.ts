// Shared by the client (UI, RTK Query) and the server (API routes, JSON store).
// These mirror the shapes in data/db.json.

import { RSVP_VALUES } from "@/constants";

export type EventStatus = "draft" | "scheduled";
export type Rsvp = (typeof RSVP_VALUES)[number];
export type HostRole = "lead" | "co-host";
export type AttendeeSource = "contact" | "guest";

/* ---------- Stored records (one per table in db.json) ---------- */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface Host {
  id: string;
  userId: string;
  contactId: string;
  displayName: string;
}

export interface EventGroup {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
}

export interface EventRecord {
  id: string;
  groupId: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string;
  maxAttendees: number;
  status: EventStatus;
  createdAt: string;
}

export interface EventHost {
  eventId: string;
  hostId: string;
  role: HostRole;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  source: AttendeeSource;
  contactId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  rsvp: Rsvp;
}

/* ---------- Shapes the API returns (joined, ready to render) ---------- */

export interface GroupView extends EventGroup {
  eventCount: number;
}

export interface HostView {
  id: string;
  contactId: string;
  name: string;
  role: HostRole;
}

export interface AttendeeView {
  id: string;
  contactId: string | null;
  name: string;
  email: string | null;
  source: AttendeeSource;
  rsvp: Rsvp;
}

export interface EventView extends EventRecord {
  hosts: HostView[];
  attendees: AttendeeView[];
}

export interface Lookups {
  contacts: Contact[];
  hosts: Host[];
}

/* ---------- Write payloads ---------- */

export type AttendeeInput =
  | { source: "contact"; contactId: string }
  | { source: "guest"; guestName: string; guestEmail?: string };

export interface CreateEventInput {
  groupId: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string; // ISO string
  endsAt: string; // ISO string
  status: EventStatus;
  hostContactIds: string[];
  attendees: AttendeeInput[];
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  color?: string;
}

/* ---------- Validation + results ---------- */

export type EventFormErrors = Partial<
  Record<"title" | "startsAt" | "endsAt" | "hosts" | "attendees", string>
>;

export interface ApiErrorBody {
  message: string;
  errors?: EventFormErrors;
}

// Used for both creating and updating an event.
export type CreateEventResult =
  | { ok: true; event: EventView }
  | { ok: false; message: string; errors: EventFormErrors };

export interface DeleteResult {
  id: string;
}

export type ActionResult = { ok: true } | { ok: false; message: string };
