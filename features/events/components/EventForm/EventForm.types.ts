import type {
  Contact,
  CreateEventInput,
  CreateEventResult,
  EventStatus,
  EventView,
} from "../../events.types";

export interface Guest {
  name: string;
  email: string;
}

export interface EventFormProps {
  groupId: string;
  contacts: Contact[];
  isSaving: boolean;
  /** Called with the form values. The parent decides whether that means create or update. */
  onSubmit: (input: CreateEventInput) => Promise<CreateEventResult>;
  /** Pass an event to edit it. Leave it out to create a new one. */
  event?: EventView;
  /** Edit mode only: called after a successful save. */
  onSaved?: () => void;
  /** Edit mode only: shows a Cancel button. */
  onCancel?: () => void;
}

export type UseEventFormOptions = Pick<
  EventFormProps,
  "groupId" | "event" | "onSubmit" | "onSaved"
>;

export interface EventFormData {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  status: EventStatus;
  hostIds: string[];
  attendeeIds: string[];
  guests: Guest[];
  guestName: string;
  guestEmail: string;
}

