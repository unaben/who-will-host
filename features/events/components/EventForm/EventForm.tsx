import classNames from "classnames";
import { MAX_ATTENDEES } from "@/constants";
import ChipPicker from "../ChipPicker/ChipPicker";
import useEventForm from "./hooks/useEventForm";
import type { EventFormProps } from "./EventForm.types";
import styles from "./EventForm.module.css";

export default function EventForm(props: EventFormProps) {
  const { groupId, contacts, isSaving, event, onSubmit, onSaved, onCancel } =
    props;

  const {
    formData,
    setFormData,
    handleInputChange,
    isEditing,
    errors,
    formMessage,
    attendeeCount,
    atLimit,
    toggle,
    addGuest,
    handleSubmit,
  } = useEventForm({ groupId, event, onSubmit, onSaved });

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className={styles.field}>
        <span className={styles.label}>Title</span>
        <input
          name="title"
          className={classNames(styles.input, {
            [styles.inputError]: errors.title,
          })}
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Friday dinner"
          maxLength={80}
        />
        {errors.title && <span className={styles.error}>{errors.title}</span>}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Location</span>
        <input
          name="location"
          className={styles.input}
          value={formData.location}
          onChange={handleInputChange}
          placeholder="Optional"
        />
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Starts</span>
          <input
            name="startsAt"
            type="datetime-local"
            className={classNames(styles.input, {
              [styles.inputError]: errors.startsAt,
            })}
            value={formData.startsAt}
            onChange={handleInputChange}
          />
          {errors.startsAt && (
            <span className={styles.error}>{errors.startsAt}</span>
          )}
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Ends</span>
          <input
            name="endsAt"
            type="datetime-local"
            className={classNames(styles.input, {
              [styles.inputError]: errors.endsAt,
            })}
            value={formData.endsAt}
            onChange={handleInputChange}
          />
          {errors.endsAt && (
            <span className={styles.error}>{errors.endsAt}</span>
          )}
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Description</span>
        <textarea
          name="description"
          className={styles.input}
          rows={2}
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Optional"
        />
      </label>

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>
          Hosts <span className={styles.hint}>first one picked leads</span>
        </legend>
        <ChipPicker
          contacts={contacts}
          selected={formData.hostIds}
          onToggle={(id) => toggle("hostIds", id)}
        />
        {errors.hosts && <span className={styles.error}>{errors.hosts}</span>}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>
          Attendees{" "}
          <span
            className={classNames(styles.counter, {
              [styles.counterFull]: atLimit,
            })}
          >
            {attendeeCount}/{MAX_ATTENDEES}
          </span>
        </legend>
        <ChipPicker
          contacts={contacts}
          selected={formData.attendeeIds}
          onToggle={(id) => toggle("attendeeIds", id)}
          lockUnselected={atLimit}
        />

        {formData.guests.length > 0 && (
          <ul className={styles.guestList}>
            {formData.guests.map((guest, index) => (
              <li key={`${guest.name}-${index}`} className={styles.guestChip}>
                {guest.name}
                <button
                  type="button"
                  className={styles.chipRemove}
                  aria-label={`Remove ${guest.name}`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      guests: prev.guests.filter((_, i) => i !== index),
                    }))
                  }
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.guestForm}>
          <input
            name="guestName"
            className={styles.input}
            value={formData.guestName}
            onChange={handleInputChange}
            placeholder="Add a guest"
            disabled={atLimit}
            aria-label="Guest name"
          />
          <input
            name="guestEmail"
            className={styles.input}
            type="email"
            value={formData.guestEmail}
            onChange={handleInputChange}
            placeholder="Email (optional)"
            disabled={atLimit}
            aria-label="Guest email"
          />
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={addGuest}
            disabled={atLimit || !formData.guestName.trim()}
          >
            Add
          </button>
        </div>
        {errors.attendees && (
          <span className={styles.error}>{errors.attendees}</span>
        )}
      </fieldset>

      <label className={styles.field}>
        <span className={styles.label}>Status</span>
        <select
          name="status"
          className={styles.input}
          value={formData.status}
          onChange={handleInputChange}
        >
          <option value="scheduled">Scheduled</option>
          <option value="draft">Draft</option>
        </select>
      </label>

      {formMessage && (
        <p
          role="status"
          className={classNames(styles.message, {
            [styles.messageError]: formMessage.kind === "error",
            [styles.messageSuccess]: formMessage.kind === "success",
          })}
        >
          {formMessage.text}
        </p>
      )}

      <button
        type="submit"
        className={classNames(styles.primaryButton, {
          [styles.buttonBusy]: isSaving,
        })}
        disabled={isSaving}
      >
        {isSaving
          ? isEditing
            ? "Saving…"
            : "Creating…"
          : isEditing
            ? "Save changes"
            : "Create event"}
      </button>

      {onCancel && (
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
      )}
    </form>
  );
}
