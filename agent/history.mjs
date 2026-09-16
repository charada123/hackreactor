// Post history: a small JSON log of everything the agent has written and
// posted. It serves two purposes:
//   1. An audit trail of what went out and when.
//   2. Context fed back to Claude so it doesn't repeat topics or phrasing.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const HISTORY_PATH = join(here, "data", "history.json");

export async function loadHistory() {
  try {
    const raw = await readFile(HISTORY_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

export async function appendHistory(entry) {
  const history = await loadHistory();
  history.push(entry);
  await mkdir(dirname(HISTORY_PATH), { recursive: true });
  await writeFile(HISTORY_PATH, JSON.stringify(history, null, 2) + "\n");
  return history;
}

// The most recent `n` entries, newest last — used both for dedupe context and
// for rotation.
export function recent(history, n) {
  return history.slice(-n);
}
