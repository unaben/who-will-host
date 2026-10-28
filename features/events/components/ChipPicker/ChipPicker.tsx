import classNames from "classnames";
import type { ChipPickerProps } from "./ChipPicker.types";
import styles from "./ChipPicker.module.css";

export default function ChipPicker(props: ChipPickerProps) {
  const { contacts, selected, onToggle, lockUnselected = false } = props;
  
  if (contacts.length === 0) {
    return <p className={styles.muted}>No saved contacts yet.</p>;
  }
  return (
    <div className={styles.chips}>
      {contacts.map((contact) => {
        const isSelected = selected.includes(contact.id);
        const isLocked = lockUnselected && !isSelected;
        return (
          <label
            key={contact.id}
            className={classNames(styles.chip, {
              [styles.chipSelected]: isSelected,
              [styles.chipLocked]: isLocked,
            })}
          >
            <input
              type="checkbox"
              className={styles.visuallyHidden}
              checked={isSelected}
              disabled={isLocked}
              onChange={() => onToggle(contact.id)}
            />
            {contact.name}
          </label>
        );
      })}
    </div>
  );
}
