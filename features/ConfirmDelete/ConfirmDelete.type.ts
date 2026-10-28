export type ConfirmDeleteProps = {
  confirmText: React.ReactNode;
  /** The text on the red button, e.g. "Yes, delete" or "Yes, delete group". */
  confirmLabel: string;
  error: string;
  isDeleting: boolean;
  handleDelete: () => Promise<void>;
  /** Called when the person picks "Keep it". The parent closes the box and clears any error. */
  onCancel: () => void;
};