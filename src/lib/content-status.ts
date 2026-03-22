/**
 * Content status management using localStorage.
 * Tracks draft/scheduled/published status for episodes and blog posts.
 */

export type ContentStatus = "draft" | "scheduled" | "published";

export interface ContentMeta {
  id: string;
  type: "episode" | "blog";
  status: ContentStatus;
  scheduledDate?: string; // ISO string
  scheduledTime?: string; // HH:mm
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "cms_content_status";

function loadAll(): ContentMeta[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAll(items: ContentMeta[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getContentMeta(type: "episode" | "blog", id: string): ContentMeta | undefined {
  return loadAll().find((m) => m.type === type && m.id === id);
}

export function getAllContentMeta(type: "episode" | "blog"): ContentMeta[] {
  return loadAll().filter((m) => m.type === type);
}

export function setContentStatus(
  type: "episode" | "blog",
  id: string,
  status: ContentStatus,
  scheduledDate?: string,
  scheduledTime?: string
): void {
  const items = loadAll();
  const idx = items.findIndex((m) => m.type === type && m.id === id);
  const now = new Date().toISOString();

  if (idx >= 0) {
    items[idx] = { ...items[idx], status, scheduledDate, scheduledTime, updatedAt: now };
  } else {
    items.push({ id, type, status, scheduledDate, scheduledTime, createdAt: now, updatedAt: now });
  }
  saveAll(items);
}

export function removeContentMeta(type: "episode" | "blog", id: string): void {
  saveAll(loadAll().filter((m) => !(m.type === type && m.id === id)));
}

/** Check scheduled items and auto-publish if time has passed */
export function processScheduledContent(): void {
  const items = loadAll();
  const now = new Date();
  let changed = false;

  items.forEach((item) => {
    if (item.status === "scheduled" && item.scheduledDate) {
      const scheduledAt = new Date(`${item.scheduledDate}T${item.scheduledTime || "00:00"}`);
      if (scheduledAt <= now) {
        item.status = "published";
        item.updatedAt = now.toISOString();
        changed = true;
      }
    }
  });

  if (changed) saveAll(items);
}

export function getEffectiveStatus(type: "episode" | "blog", id: string, hasFile: boolean): ContentStatus {
  const meta = getContentMeta(type, id);
  if (meta) return meta.status;
  // If there's a content file but no status record, it's published
  if (hasFile) return "published";
  return "draft";
}
