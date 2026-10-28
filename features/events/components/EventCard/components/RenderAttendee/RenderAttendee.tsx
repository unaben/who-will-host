import classNames from "classnames";
import type { RenderAttendeeProps } from "./RenderAttendee.types";
import { RSVP_VALUES } from "@/constants";
import type { Rsvp } from "@/features/events/events.types";
import { initials, RSVP_LABELS } from "@/features/events/events.utils";
import styles from "./RenderAttendee.module.css";

const RenderAttendee = (props: RenderAttendeeProps) => {
  const { attendee, handleRsvp, savingRsvpId, full } = props;
  return (
    <span
      key={attendee.id}
      className={classNames(styles.person, {
        [styles.personGuest]: attendee.source === "guest",
        [styles.rsvpAccepted]: attendee.rsvp === "accepted",
        [styles.rsvpMaybe]: attendee.rsvp === "maybe",
        [styles.rsvpDeclined]: attendee.rsvp === "declined",
      })}
      title={attendee.source === "guest" ? "Guest" : "Saved contact"}
    >
      <span className={styles.avatar}>{initials(attendee.name)}</span>
      {attendee.name}
      <select
        className={styles.rsvpSelect}
        value={attendee.rsvp}
        aria-label={`RSVP for ${attendee.name}`}
        disabled={savingRsvpId === attendee.id}
        onChange={(e) => handleRsvp(attendee.id, e.target.value as Rsvp)}
      >
        {RSVP_VALUES.map((value) => (
          <option
            key={value}
            value={value}
            disabled={
              attendee.rsvp === "declined" && value !== "declined" && full
            }
          >
            {RSVP_LABELS[value]}
          </option>
        ))}
      </select>
    </span>
  );
};

export default RenderAttendee;
