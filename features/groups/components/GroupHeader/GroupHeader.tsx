"use client";

import Link from "next/link";
import classNames from "classnames";
import useGroupHeader from "./hooks/useGroupHeader";
import { useGroupActions } from "../../hooks/useGroupActions";
import type { GroupView } from "@/features/events/events.types";
import styles from "./GroupHeader.module.css";
import ConfirmDelete from "@/features/ConfirmDelete/ConfirmDelete";
import EditGroupForm from "../EditGroupForm/EditGroupForm";

export default function GroupHeader({ group }: { group: GroupView }) {
  const { saveGroup, removeGroup, isSaving, isDeleting } = useGroupActions(
    group.id,
  );

  const {
    mode,
    setMode,
    name,
    setName,
    description,
    setDescription,
    error,
    setError,
    startEditing,
    handleSave,
    handleDelete,
  } = useGroupHeader(saveGroup, removeGroup, group);

  const eventsText =
    group.eventCount > 0
      ? ` and its ${group.eventCount} ${group.eventCount === 1 ? "event" : "events"}`
      : "";
  const confirmText = `Delete “${group.name}”${eventsText}? This can't be undone.`;

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.backLink}>
        ← All groups
      </Link>

      {mode === "edit" && (
        <EditGroupForm
          description={description}
          error={error}
          handleSave={handleSave}
          isSaving={isSaving}
          name={name}
          setDescription={setDescription}
          setMode={setMode}
          setName={setName}
        />
      )}
      <h1 className={styles.title}>{group.name}</h1>
      {group.description && (
        <p className={styles.subtitle}>{group.description}</p>
      )}
      {mode === "confirmDelete" && (
        <ConfirmDelete
          confirmText={confirmText}
          confirmLabel="Yes, delete group"
          error={error}
          handleDelete={handleDelete}
          isDeleting={isDeleting}
          onCancel={() => {
            setError("");
            setMode("view");
          }}
        />
      )}

      {mode !== "confirmDelete" && mode !== "edit" && (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.button}
            onClick={startEditing}
          >
            Edit group
          </button>
          <button
            type="button"
            className={classNames(styles.button, styles.buttonQuietDanger)}
            onClick={() => {
              setError("");
              setMode("confirmDelete");
            }}
          >
            Delete group
          </button>
        </div>
      )}
    </header>
  );
}
