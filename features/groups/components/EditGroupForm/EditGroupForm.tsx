import classNames from "classnames";
import type { EditGroupFormProps } from "./EditGroupForm.types";
import styles from "./EditGroupForm.module.css";

function EditGroupForm(props: EditGroupFormProps) {
  const {
    description,
    error,
    handleSave,
    isSaving,
    name,
    setDescription,
    setMode,
    setName,
  } = props;
  
  return (
    <form className={styles.form} onSubmit={handleSave} noValidate>
      <input
        className={classNames(styles.input, {
          [styles.inputError]: error && !name.trim(),
        })}
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
        aria-label="Group name"
      />
      <input
        className={styles.input}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        aria-label="Group description"
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button
          type="submit"
          className={classNames(styles.button, styles.buttonPrimary)}
          disabled={isSaving}
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => setMode("view")}
          disabled={isSaving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default EditGroupForm;
