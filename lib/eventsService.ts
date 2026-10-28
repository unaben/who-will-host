import { ApiError } from "./http";
import { CURRENT_USER_ID, nextId, readDb, updateDb, type Database } from "./db";
import {
  type AttendeeInput,
  type AttendeeView,
  type CreateEventInput,
  type CreateGroupInput,
  type DeleteResult,
  type EventAttendee,
  type EventGroup,
  type EventRecord,
  type EventView,
  type GroupView,
  type HostView,
  type Lookups,
  type Rsvp,
} from "@/features/events/events.types";
import {
  isRsvp,
  sortByStart,
  validateEventInput,
} from "@/features/events/events.utils";
import { GROUP_COLORS, HEX_COLOR, MAX_ATTENDEES } from "@/constants";



/* ---------- Reads ---------- */

export async function listGroups(): Promise<GroupView[]> {
  const db = await readDb();
  return db.eventGroups
    .filter((g) => g.userId === CURRENT_USER_ID)
    .map((g) => withCount(db, g));
}

export async function getLookups(): Promise<Lookups> {
  const db = await readDb();
  return {
    contacts: db.contacts.filter((c) => c.userId === CURRENT_USER_ID),
    hosts: db.hosts.filter((h) => h.userId === CURRENT_USER_ID),
  };
}

export async function listEvents(groupId: string): Promise<EventView[]> {
  const db = await readDb();
  findOwnedGroup(db, groupId);
  return sortByStart(db.events.filter((e) => e.groupId === groupId)).map((e) =>
    hydrate(db, e),
  );
}

/* ---------- Groups: create, update, delete ---------- */

export function createGroup(input: CreateGroupInput): Promise<GroupView> {
  const fields = parseGroupFields(input);

  return updateDb((db) => {
    const userGroups = db.eventGroups.filter(
      (g) => g.userId === CURRENT_USER_ID,
    );
    const group: EventGroup = {
      id: nextId(db.eventGroups, "grp"),
      userId: CURRENT_USER_ID,
      name: fields.name,
      description: fields.description,
      color:
        fields.color ?? GROUP_COLORS[userGroups.length % GROUP_COLORS.length]!,
      createdAt: new Date().toISOString(),
    };
    db.eventGroups.push(group);
    return withCount(db, group);
  });
}

export function updateGroup(
  groupId: string,
  input: CreateGroupInput,
): Promise<GroupView> {
  const fields = parseGroupFields(input);

  return updateDb((db) => {
    const group = findOwnedGroup(db, groupId);
    group.name = fields.name;
    group.description = fields.description;
    if (fields.color) group.color = fields.color;
    return withCount(db, group);
  });
}

/** Deleting a group also deletes its events, and their hosts and attendees. */
export function deleteGroup(groupId: string): Promise<DeleteResult> {
  return updateDb((db) => {
    findOwnedGroup(db, groupId);
    removeEvents(
      db,
      new Set(db.events.filter((e) => e.groupId === groupId).map((e) => e.id)),
    );
    db.eventGroups = db.eventGroups.filter((g) => g.id !== groupId);
    return { id: groupId };
  });
}

/* ---------- Events: create, update, delete ---------- */

export function createEvent(input: CreateEventInput): Promise<EventView> {
  return updateDb((db) => {
    findOwnedGroup(db, input.groupId);
    assertEventInput(db, input);

    const event: EventRecord = {
      id: nextId(db.events, "evt"),
      groupId: input.groupId,
      title: "",
      description: null,
      location: null,
      startsAt: "",
      endsAt: "",
      maxAttendees: MAX_ATTENDEES,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };
    applyEventFields(event, input);
    db.events.push(event);

    addHosts(db, event.id, input.hostContactIds);
    addAttendees(db, event.id, input.attendees ?? []);

    return hydrate(db, event);
  });
}

/**
 * Replaces an event's details, hosts and attendees with what the form sent.
 * An attendee who is still on the list keeps their RSVP.
 */
export function updateEvent(
  eventId: string,
  input: CreateEventInput,
): Promise<EventView> {
  return updateDb((db) => {
    const event = findOwnedEvent(db, eventId);
    assertEventInput(db, input); // everything is checked before anything is changed

    applyEventFields(event, input);

    db.eventHosts = db.eventHosts.filter((eh) => eh.eventId !== eventId);
    addHosts(db, eventId, input.hostContactIds);

    const previous = db.eventAttendees.filter((a) => a.eventId === eventId);
    db.eventAttendees = db.eventAttendees.filter((a) => a.eventId !== eventId);
    addAttendees(db, eventId, input.attendees ?? [], previous);

    return hydrate(db, event);
  });
}

export function deleteEvent(eventId: string): Promise<DeleteResult> {
  return updateDb((db) => {
    const event = findOwnedEvent(db, eventId);
    removeEvents(db, new Set([event.id]));
    return { id: eventId };
  });
}

/* ---------- RSVP ---------- */

/** Changes one attendee's answer. Nothing else on the event is touched. */
export function updateRsvp(
  eventId: string,
  attendeeId: string,
  rsvp: unknown,
): Promise<EventView> {
  if (!isRsvp(rsvp)) {
    throw new ApiError(
      400,
      "RSVP must be pending, accepted, declined or maybe.",
    );
  }
  return updateDb((db) => {
    const event = findOwnedEvent(db, eventId);
    const attendee = db.eventAttendees.find(
      (a) => a.id === attendeeId && a.eventId === eventId,
    );
    if (!attendee) throw new ApiError(404, "That attendee is not on this event.");
    // Coming back from "declined" takes a seat again, so there has to be one free.
    if (attendee.rsvp === "declined" && rsvp !== "declined") {
      const seated = db.eventAttendees.filter(
        (a) => a.eventId === eventId && a.rsvp !== "declined",
      ).length;
      if (seated >= event.maxAttendees) {
        throw new ApiError(
          400,
          `All ${event.maxAttendees} seats are taken. Free one up first.`,
        );
      }
    }
    attendee.rsvp = rsvp as Rsvp;
    return hydrate(db, event);
  });
}

/* ---------- Shared helpers ---------- */

function withCount(db: Database, group: EventGroup): GroupView {
  return {
    ...group,
    eventCount: db.events.filter((e) => e.groupId === group.id).length,
  };
}

function findOwnedGroup(db: Database, groupId: string): EventGroup {
  const group = db.eventGroups.find(
    (g) => g.id === groupId && g.userId === CURRENT_USER_ID,
  );
  if (!group) throw new ApiError(404, "That group does not exist.");
  return group;
}

function findOwnedEvent(db: Database, eventId: string): EventRecord {
  const event = db.events.find((e) => e.id === eventId);
  const ownedByMe =
    event &&
    db.eventGroups.some(
      (g) => g.id === event.groupId && g.userId === CURRENT_USER_ID,
    );
  if (!event || !ownedByMe)
    throw new ApiError(404, "That event does not exist.");
  return event;
}

function parseGroupFields(input: CreateGroupInput) {
  const name = input.name?.trim() ?? "";
  if (!name) throw new ApiError(400, "Give the group a name.");
  if (name.length > 60)
    throw new ApiError(400, "Keep the group name under 60 characters.");
  return {
    name,
    description: input.description?.trim() || null,
    color: input.color && HEX_COLOR.test(input.color) ? input.color : undefined,
  };
}

/** The same checks for create and update: field rules, then "are these people really your contacts?" */
function assertEventInput(db: Database, input: CreateEventInput): void {
  const errors = validateEventInput(input);
  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, "Some details need another look.", errors);
  }

  const myContactIds = new Set(
    db.contacts.filter((c) => c.userId === CURRENT_USER_ID).map((c) => c.id),
  );
  if (input.hostContactIds.some((id) => !myContactIds.has(id))) {
    throw new ApiError(400, "One of the hosts is not in your contacts.", {
      hosts: "Pick hosts from your saved contacts.",
    });
  }
  const unknownAttendee = (input.attendees ?? []).some(
    (a) => a.source === "contact" && !myContactIds.has(a.contactId),
  );
  if (unknownAttendee) {
    throw new ApiError(400, "One of the attendees is not in your contacts.", {
      attendees:
        "Pick attendees from your saved contacts or add them as guests.",
    });
  }
}

function applyEventFields(event: EventRecord, input: CreateEventInput): void {
  event.title = input.title.trim();
  event.description = input.description?.trim() || null;
  event.location = input.location?.trim() || null;
  event.startsAt = new Date(input.startsAt).toISOString();
  event.endsAt = new Date(input.endsAt).toISOString();
  event.status = input.status === "draft" ? "draft" : "scheduled";
}

/**
 * A host is a saved contact who has been asked to host. Reuse their host record
 * if they have one, otherwise create it. The first host leads.
 */
function addHosts(db: Database, eventId: string, contactIds: string[]): void {
  contactIds.forEach((contactId, index) => {
    let host = db.hosts.find(
      (h) => h.contactId === contactId && h.userId === CURRENT_USER_ID,
    );
    if (!host) {
      const contact = db.contacts.find((c) => c.id === contactId)!;
      host = {
        id: nextId(db.hosts, "host"),
        userId: CURRENT_USER_ID,
        contactId,
        displayName: contact.name,
      };
      db.hosts.push(host);
    }
    db.eventHosts.push({
      eventId,
      hostId: host.id,
      role: index === 0 ? "lead" : "co-host",
    });
  });
}

function isSameAttendee(
  existing: EventAttendee,
  incoming: AttendeeInput,
): boolean {
  if (incoming.source === "contact") {
    return (
      existing.source === "contact" && existing.contactId === incoming.contactId
    );
  }
  return (
    existing.source === "guest" &&
    existing.guestName?.toLowerCase() ===
      incoming.guestName.trim().toLowerCase() &&
    (existing.guestEmail ?? "") === (incoming.guestEmail?.trim() ?? "")
  );
}

/** `previous` is the event's old attendee list (when updating), so people who stay keep their id and RSVP. */
function addAttendees(
  db: Database,
  eventId: string,
  attendees: AttendeeInput[],
  previous: EventAttendee[] = [],
): void {
  const reused = new Set<string>();

  for (const attendee of attendees) {
    const match = previous.find(
      (p) => !reused.has(p.id) && isSameAttendee(p, attendee),
    );
    if (match) {
      reused.add(match.id);
      // Adding someone who had declined is a fresh invite.
      db.eventAttendees.push(
        match.rsvp === "declined" ? { ...match, rsvp: "pending" } : match,
      );
      continue;
    }
    db.eventAttendees.push({
      id: nextId([...db.eventAttendees, ...previous], "att"),
      eventId,
      source: attendee.source,
      contactId: attendee.source === "contact" ? attendee.contactId : null,
      guestName: attendee.source === "guest" ? attendee.guestName.trim() : null,
      guestEmail:
        attendee.source === "guest"
          ? attendee.guestEmail?.trim() || null
          : null,
      rsvp: "pending",
    });
  }

  // The form doesn't carry people who declined, so they stay on the event
  // (and don't use a seat) unless they were just added again above.
  for (const p of previous) {
    if (p.rsvp === "declined" && !reused.has(p.id)) db.eventAttendees.push(p);
  }
}

function removeEvents(db: Database, eventIds: Set<string>): void {
  db.events = db.events.filter((e) => !eventIds.has(e.id));
  db.eventHosts = db.eventHosts.filter((eh) => !eventIds.has(eh.eventId));
  db.eventAttendees = db.eventAttendees.filter((a) => !eventIds.has(a.eventId));
}

/* ---------- Joining the tables together ---------- */

function hydrate(db: Database, event: EventRecord): EventView {
  const hosts = db.eventHosts
    .filter((eh) => eh.eventId === event.id)
    .flatMap((eh): HostView[] => {
      const host = db.hosts.find((h) => h.id === eh.hostId);
      return host
        ? [
            {
              id: host.id,
              contactId: host.contactId,
              name: host.displayName,
              role: eh.role,
            },
          ]
        : [];
    });

  const attendees = db.eventAttendees
    .filter((a) => a.eventId === event.id)
    .map((a): AttendeeView => {
      const contact = a.contactId
        ? db.contacts.find((c) => c.id === a.contactId)
        : undefined;
      return {
        id: a.id,
        contactId: a.contactId,
        name: contact?.name ?? a.guestName ?? "Guest",
        email: contact?.email ?? a.guestEmail,
        source: a.source,
        rsvp: a.rsvp,
      };
    });

  return { ...event, hosts, attendees };
}