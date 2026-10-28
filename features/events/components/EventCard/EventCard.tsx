"use client";

import classNames from "classnames";
import {
  formatEventRange,
  initials,
  declinedAttendees,
  rsvpSummary,
  seatedAttendees,
} from "../../events.utils";
import ConfirmDelete from "@/features/ConfirmDelete/ConfirmDelete";
import { RenderAttendee } from "./components";
import useEventCard from "./hooks/useEventCard";
import type { EventCardProps } from "./EventCard.types";
import styles from "./EventCard.module.css";

export default function EventCard(props: EventCardProps) {
  const { event, isEditing, onEdit, onDelete, onRsvp } = props;

  const {
    isDeleting,
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
  } = useEventCard(event, onDelete, onRsvp);

  const seated = seatedAttendees(event.attendees);
  const declined = declinedAttendees(event.attendees);

  return (
    <article
      className={classNames(styles.card, {
        [styles.cardDraft]: event.status === "draft",
        [styles.cardFull]: full,
        [styles.cardEditing]: isEditing,
      })}
    >
      <div className={styles.cardTop}>
        <h3 className={styles.cardTitle}>{event.title}</h3>
        <span
          className={classNames(styles.badge, {
            [styles.badgeDraft]: event.status === "draft",
            [styles.badgeScheduled]: event.status === "scheduled",
          })}
        >
          {event.status}
        </span>
      </div>

      <p className={styles.when}>
        {formatEventRange(event.startsAt, event.endsAt)}
      </p>
      {event.location && <p className={styles.where}>{event.location}</p>}
      {event.description && (
        <p className={styles.description}>{event.description}</p>
      )}

      <dl className={styles.people}>
        <div>
          <dt>{event.hosts.length === 1 ? "Host" : "Hosts"}</dt>
          <dd>
            {event.hosts.map((host) => (
              <span
                key={host.id}
                className={classNames(styles.person, {
                  [styles.personLead]: host.role === "lead",
                })}
                title={host.role}
              >
                <span className={styles.avatar}>{initials(host.name)}</span>
                {host.name}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt>Attending</dt>
          <dd>
            {seated.length === 0 && (
              <span className={styles.muted}>Nobody yet</span>
            )}
            {seated.map((attendee) => (
              <RenderAttendee
                {...{ attendee, handleRsvp, savingRsvpId, full }}
              />
            ))}
          </dd>
        </div>
        {declined.length > 0 && (
          <div>
            <dt>Declined</dt>
            <dd>
              {declined.map((attendee) => (
                <RenderAttendee
                  {...{ attendee, handleRsvp, savingRsvpId, full }}
                />
              ))}
            </dd>
          </div>
        )}
      </dl>

      <p className={classNames(styles.spots, { [styles.spotsFull]: full })}>
        {full ? "Full" : `${left} ${left === 1 ? "spot" : "spots"} left`} ·{" "}
        {seated.length}/{event.maxAttendees}
      </p>
      {event.attendees.length > 0 && (
        <p className={styles.rsvpSummary}>{rsvpSummary(event)}</p>
      )}
      {rsvpError && (
        <p className={styles.error} role="alert">
          {rsvpError}
        </p>
      )}

      {confirmingDelete ? (
        <ConfirmDelete
          confirmText={`Delete “${event.title}”? This can't be undone.`}
          confirmLabel="Yes, delete"
          error={deleteError}
          handleDelete={handleDelete}
          isDeleting={isDeleting}
          onCancel={() => {
            setConfirmingDelete(false);
            setDeleteError("");
          }}
        />
      ) : (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.button}
            onClick={() => onEdit(event)}
            disabled={isEditing}
          >
            {isEditing ? "Editing…" : "Edit"}
          </button>
          <button
            type="button"
            className={classNames(styles.button, styles.buttonQuietDanger)}
            onClick={() => setConfirmingDelete(true)}
            disabled={isEditing}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
