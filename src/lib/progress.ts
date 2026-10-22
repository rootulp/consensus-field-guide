// Which lessons this reader has finished. Stored per browser; the site works without it.

const KEY = 'cfg:read';

export function readLessons(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

export function setLessonRead(id: string, read: boolean): void {
  const ids = readLessons();
  if (read) ids.add(id);
  else ids.delete(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {
    // Storage can be unavailable (private windows, blocked site data); progress just won't persist.
  }
}
