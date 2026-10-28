import EventCard from "../EventCard/EventCard";
import type { EventListProps } from "./EventList.types";
import styles from "./EventList.module.css";

export default function EventList(props: EventListProps) {
  const { events, editingId, onEdit, onDelete, onRsvp } = props;

  if (events.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No events in this group yet.</p>
        <p>Create the first one with the form.</p>
      </div>
    );
  }
  return (
    <ul className={styles.eventList}>
      {events.map((event) => (
        <li key={event.id}>
          <EventCard
            event={event}
            isEditing={event.id === editingId}
            onEdit={onEdit}
            onDelete={onDelete}
            onRsvp={onRsvp}
          />
        </li>
      ))}
    </ul>
  );
}