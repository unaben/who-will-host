import type { EventView } from "../../events.types";
import type { EventCardProps } from "../EventCard/EventCard.types";
 
export interface EventListProps extends Pick<EventCardProps, "onEdit" | "onDelete" | "onRsvp"> {
  events: EventView[];
  /** The id of the event currently loaded into the form, if any. */
  editingId?: string;
}