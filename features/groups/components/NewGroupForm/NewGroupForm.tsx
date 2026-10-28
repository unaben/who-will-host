import classNames from "classnames";
import { paint } from "../../group.utils";
import { GROUP_COLORS } from "@/constants";
import useNewGroupForm from "./hooks/useNewGroupForm";
import styles from "./NewGroupForm.module.css";

export default function NewGroupForm() {
  const {
    name,
    setName,
    description,
    setDescription,
    color,
    setColor,
    error,
    handleSubmit,
    isLoading,
  } = useNewGroupForm();

  return (
    <form
      className={styles.form}
      style={paint(color)}
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className={styles.formTitle}>New group</h2>

      <label className={styles.field}>
        <span className={styles.label}>Name</span>
        <input
          className={classNames(styles.input, {
            [styles.inputError]: error && !name.trim(),
          })}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Birthday weekend"
          maxLength={60}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Description</span>
        <input
          className={styles.input}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
        />
      </label>

      <fieldset className={styles.field}>
        <legend className={styles.legend}>Colour</legend>
        <div className={styles.swatches}>
          {GROUP_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={classNames(styles.swatch, {
                [styles.swatchSelected]: c === color,
              })}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Colour ${c}`}
              aria-pressed={c === color}
            />
          ))}
        </div>
      </fieldset>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? "Creating…" : "Create group"}
      </button>
    </form>
  );
}
