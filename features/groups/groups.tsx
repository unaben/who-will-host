"use client";

import Link from "next/link";
import classNames from "classnames";
import { paint } from "./group.utils";
import { useGetGroupsQuery } from "@/store/groupApi";
import { NewGroupForm } from "./components";
import styles from "./groups.module.css";

export function Groups() {
  const { data: groups = [], isLoading, isError } = useGetGroupsQuery();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Who will host?</h1>
        <p className={styles.lead}>
          Pick a group to see its events, or start a new one.
        </p>
      </header>

      <div className={styles.columns}>
        <section aria-labelledby="groups-heading">
          <h2 id="groups-heading" className="visually-hidden">
            Your groups
          </h2>

          {isLoading && <p className={styles.state}>Loading groups…</p>}
          {isError && (
            <p className={classNames(styles.state, styles.stateError)}>
              We couldn&apos;t load your groups.
            </p>
          )}

          {!isLoading && !isError && groups.length === 0 && (
            <div className={styles.empty}>
              No groups yet. Create your first one with the form.
            </div>
          )}

          {groups.length > 0 && (
            <ul className={styles.grid}>
              {groups.map((group) => (
                <li key={group.id}>
                  <Link
                    href={`/groups/${group.id}`}
                    className={classNames(styles.card, {
                      [styles.cardEmpty]: group.eventCount === 0,
                    })}
                    style={paint(group.color)}
                  >
                    <h3 className={styles.cardName}>{group.name}</h3>
                    {group.description && (
                      <p className={styles.cardDescription}>
                        {group.description}
                      </p>
                    )}
                    <p className={styles.cardMeta}>
                      {group.eventCount === 0
                        ? "No events yet"
                        : `${group.eventCount} ${group.eventCount === 1 ? "event" : "events"}`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <NewGroupForm />
      </div>
    </div>
  );
}
