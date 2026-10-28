import type { Contact } from "../../events.types";

export interface ChipPickerProps {
  contacts: Contact[];
  selected: string[];
  onToggle: (id: string) => void;
  /** When true, people who aren't already selected can't be added. */
  lockUnselected?: boolean;
}

