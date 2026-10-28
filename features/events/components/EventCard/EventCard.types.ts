import type { EventView, ActionResult, Rsvp } from "../../events.types";

export interface EventCardProps {
  event: EventView;
  /** True while this event is loaded into the form for editing. */
  isEditing: boolean;
  onEdit: (event: EventView) => void;
  onDelete: (id: string) => Promise<ActionResult>;
  onRsvp: (eventId: string, attendeeId: string, rsvp: Rsvp) => Promise<ActionResult>;
}