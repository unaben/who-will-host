import classNames from "classnames";
import type { ConfirmDeleteProps } from "./ConfirmDelete.type";
import styles from "./ConfirmDelete.module.css";

function ConfirmDelete(props: ConfirmDeleteProps) {
  const { confirmText, confirmLabel, error, handleDelete, isDeleting, onCancel } =
    props;

  return (
    <div className={styles.confirm} role="alertdialog">
      <p className={styles.confirmText}>{confirmText}</p>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button
          type="button"
          className={classNames(styles.button, styles.buttonDanger)}
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting…" : confirmLabel}
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={onCancel}
          disabled={isDeleting}
        >
          Keep it
        </button>
      </div>
    </div>
  );
}

export default ConfirmDelete;