/**
 * Content Management System
 * 
 * Manages content state (published, unpublished, soft-deleted) using localStorage.
 * Since this is a static site, actual files can't be deleted at runtime.
 * Instead, we track content status and filter accordingly.
 */

export type ContentType = "blog" | "episode";
export type ContentStatus = "published" | "unpublished" | "trashed";

export interface ContentState {
  id: string; // slug for blogs, episode number for episodes
  type: ContentType;
  status: ContentStatus;
  trashedAt?: string;
  unpublishedAt?: string;
}

export interface ActivityLogEntry {
  id: string;
  action: "deleted" | "restored" | "unpublished" | "published" | "permanently_deleted";
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  timestamp: string;
}

const CONTENT_STATE_KEY = "taam_content_state";
const ACTIVITY_LOG_KEY = "taam_activity_log";
const MAX_LOG_ENTRIES = 100;

// ─── Content State ───

function getContentStates(): ContentState[] {
  try {
    const stored = localStorage.getItem(CONTENT_STATE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveContentStates(states: ContentState[]) {
  localStorage.setItem(CONTENT_STATE_KEY, JSON.stringify(states));
}

function getContentKey(type: ContentType, id: string): string {
  return `${type}:${id}`;
}

export function getContentStatus(type: ContentType, id: string): ContentStatus {
  const states = getContentStates();
  const state = states.find((s) => s.type === type && s.id === id);
  return state?.status || "published";
}

export function isContentVisible(type: ContentType, id: string): boolean {
  return getContentStatus(type, id) === "published";
}

export function setContentStatus(
  type: ContentType,
  id: string,
  status: ContentStatus
): void {
  const states = getContentStates();
  const existingIdx = states.findIndex((s) => s.type === type && s.id === id);

  const newState: ContentState = {
    id,
    type,
    status,
    ...(status === "trashed" ? { trashedAt: new Date().toISOString() } : {}),
    ...(status === "unpublished" ? { unpublishedAt: new Date().toISOString() } : {}),
  };

  if (existingIdx >= 0) {
    states[existingIdx] = newState;
  } else {
    states.push(newState);
  }

  saveContentStates(states);
}

export function restoreContent(type: ContentType, id: string): void {
  setContentStatus(type, id, "published");
}

export function permanentlyDelete(type: ContentType, id: string): void {
  // Mark as permanently deleted (filtered out everywhere)
  const states = getContentStates();
  const existingIdx = states.findIndex((s) => s.type === type && s.id === id);
  const newState: ContentState = {
    id,
    type,
    status: "trashed",
    trashedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    states[existingIdx] = { ...newState, status: "trashed" };
  } else {
    states.push(newState);
  }

  // Store permanent deletion separately
  const permKey = "taam_permanently_deleted";
  try {
    const perm = JSON.parse(localStorage.getItem(permKey) || "[]");
    perm.push(getContentKey(type, id));
    localStorage.setItem(permKey, JSON.stringify(perm));
  } catch {
    localStorage.setItem(permKey, JSON.stringify([getContentKey(type, id)]));
  }

  saveContentStates(states);
}

export function isPermanentlyDeleted(type: ContentType, id: string): boolean {
  try {
    const perm = JSON.parse(localStorage.getItem("taam_permanently_deleted") || "[]");
    return perm.includes(getContentKey(type, id));
  } catch {
    return false;
  }
}

export function getTrashedContent(): ContentState[] {
  return getContentStates().filter(
    (s) => s.status === "trashed" && !isPermanentlyDeleted(s.type, s.id)
  );
}

export function getUnpublishedContent(): ContentState[] {
  return getContentStates().filter((s) => s.status === "unpublished");
}

// ─── Activity Log ───

function getActivityLog(): ActivityLogEntry[] {
  try {
    const stored = localStorage.getItem(ACTIVITY_LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveActivityLog(entries: ActivityLogEntry[]) {
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(entries.slice(0, MAX_LOG_ENTRIES)));
}

export function logActivity(
  action: ActivityLogEntry["action"],
  contentType: ContentType,
  contentId: string,
  contentTitle: string
): void {
  const log = getActivityLog();
  log.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    contentType,
    contentId,
    contentTitle,
    timestamp: new Date().toISOString(),
  });
  saveActivityLog(log);
}

export function getRecentActivity(limit = 20): ActivityLogEntry[] {
  return getActivityLog().slice(0, limit);
}

export function clearActivityLog(): void {
  localStorage.removeItem(ACTIVITY_LOG_KEY);
}
