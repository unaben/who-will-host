"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import { useEvents } from "./hooks/useEvents";
import EventList from "./components/EventList/EventList";
import EventForm from "./components/EventForm/EventForm";
import { GroupHeader } from "../groups/components";
import { paint } from "../groups/group.utils";
import type { EventView } from "./events.types";
import styles from "./events.module.css";

export function EventsScreen({ groupId }: { groupId: string }) {
  const {
    group,
    events,
    contacts,
    isLoading,
    isNotFound,
    isError,
    isCreating,
    isUpdating,
    createEvent,
    updateEvent,
    deleteEvent,
    updateRsvp,
    startEditing,
    stopEditing,
    formSection,
    editingId,
  } = useEvents(groupId);

  if (isLoading) return <p className={styles.state}>Loading events…</p>;

  if (isError && !isNotFound) {
    return (
      <p className={classNames(styles.state, styles.stateError)}>
        Something went wrong loading this group.
      </p>
    );
  }

  if (isNotFound || !group) {
    return (
      <div className={styles.state}>
        <p>We couldn&apos;t find that group.</p>
        <Link href="/" className={styles.backLink}>
          Back to groups
        </Link>
      </div>
    );
  }

  // Looked up by id so the form falls back to "create" if the event disappears.
  const editingEvent = events.find((e) => e.id === editingId);

  return (
    <div className={styles.screen} style={paint(group.color)}>
      <GroupHeader group={group} />

      <div className={styles.columns}>
        <section aria-labelledby="events-heading">
          <h2 id="events-heading" className={styles.sectionTitle}>
            Events <span className={styles.count}>{events.length}</span>
          </h2>

          <EventList
            events={events}
            editingId={editingEvent?.id}
            onEdit={startEditing}
            onDelete={deleteEvent}
            onRsvp={updateRsvp}
          />
        </section>

        <section
          ref={formSection}
          aria-labelledby="event-form-heading"
          className={styles.formSection}
        >
          <h2 id="event-form-heading" className={styles.sectionTitle}>
            {editingEvent ? "Edit event" : "New event"}
          </h2>
          {/* The key remounts the form, so it refills when you pick a different event. */}
          <EventForm
            key={editingEvent?.id ?? "new"}
            groupId={groupId}
            contacts={contacts}
            event={editingEvent}
            isSaving={editingEvent ? isUpdating : isCreating}
            onSubmit={
              editingEvent
                ? (input) => updateEvent(editingEvent.id, input)
                : createEvent
            }
            onSaved={stopEditing}
            onCancel={editingEvent ? stopEditing : undefined}
          />
        </section>
      </div>
    </div>
  );
}
