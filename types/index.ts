import type {
  User,
  Contact,
  Host,
  EventGroup,
  EventRecord,
  EventHost,
  EventAttendee,
} from "@/features/events/events.types";

export type Mode = "view" | "edit" | "confirmDelete";

export interface Database {
  users: User[];
  contacts: Contact[];
  hosts: Host[];
  eventGroups: EventGroup[];
  events: EventRecord[];
  eventHosts: EventHost[];
  eventAttendees: EventAttendee[];
  [extra: string]: unknown;
}
