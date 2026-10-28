import { promises as fs } from "node:fs";
import path from "node:path";
import { Database } from "@/types";

export const CURRENT_USER_ID = "usr_1";

const DB_PATH =
  process.env.EVENTS_DB_PATH ?? path.join(process.cwd(), "data", "db.json");

export async function readDb(): Promise<Database> {
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw) as Database;
}

async function writeDb(db: Database): Promise<void> {
  const tmp = `${DB_PATH}.${process.pid}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(db, null, 2)}\n`, "utf8");
  await fs.rename(tmp, DB_PATH);
}

let queue: Promise<unknown> = Promise.resolve();

export function updateDb<T>(
  change: (db: Database) => T | Promise<T>,
): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDb();
    const result = await change(db);
    await writeDb(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export function nextId(items: { id: string }[], prefix: string): string {
  const highest = items.reduce((max, item) => {
    const n = Number.parseInt(item.id.slice(item.id.lastIndexOf("_") + 1), 10);
    return Number.isNaN(n) ? max : Math.max(max, n);
  }, 0);
  return `${prefix}_${highest + 1}`;
}
