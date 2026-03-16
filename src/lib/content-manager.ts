/**
 * Content Management System
 * 
 * Communicates with the PHP backend API for content CRUD operations.
 * Falls back to localStorage for the preview environment.
 */

export type ContentType = "blog" | "episode";
export type ContentStatus = "published" | "unpublished" | "trashed";

export interface ContentState {
  id: string;
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

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || '/api';
const CONTENT_STATE_KEY = "taam_content_state";
const ACTIVITY_LOG_KEY = "taam_activity_log";
const MAX_LOG_ENTRIES = 100;

// ─── API Communication ───

async function contentApiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) return null;
    throw error;
  }
}

// ─── Content CRUD (API with localStorage fallback) ───

export async function saveEpisode(episodeData: Record<string, unknown>): Promise<{ success: boolean; error?: string; slug?: string }> {
  try {
    const result = await contentApiCall('content.php?action=save-episode', {
      method: 'POST',
      body: JSON.stringify(episodeData),
    });
    if (result?.success) return { success: true, slug: result.slug };
    if (result) return { success: false, error: result.error };
  } catch (e: any) {
    if (e.message) return { success: false, error: e.message };
  }
  // Fallback: use file export
  return { success: true, slug: episodeData.slug as string };
}

export async function saveBlog(blogData: Record<string, unknown>): Promise<{ success: boolean; error?: string; slug?: string }> {
  try {
    const result = await contentApiCall('content.php?action=save-blog', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
    if (result?.success) return { success: true, slug: result.slug };
    if (result) return { success: false, error: result.error };
  } catch (e: any) {
    if (e.message) return { success: false, error: e.message };
  }
  return { success: true, slug: blogData.slug as string };
}

export async function softDeleteContent(type: ContentType, id: string): Promise<{ success: boolean }> {
  try {
    const result = await contentApiCall('content.php?action=delete', {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    });
    if (result?.success) return { success: true };
  } catch {}
  // Fallback
  setContentStatus(type, id, "trashed");
  return { success: true };
}

export async function restoreContentApi(type: ContentType, id: string): Promise<{ success: boolean }> {
  try {
    const result = await contentApiCall('content.php?action=restore', {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    });
    if (result?.success) return { success: true };
  } catch {}
  restoreContent(type, id);
  return { success: true };
}

export async function permanentlyDeleteApi(type: ContentType, id: string): Promise<{ success: boolean }> {
  try {
    const result = await contentApiCall('content.php?action=permanent-delete', {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    });
    if (result?.success) return { success: true };
  } catch {}
  permanentlyDelete(type, id);
  return { success: true };
}

export async function unpublishContentApi(type: ContentType, id: string): Promise<{ success: boolean }> {
  try {
    const result = await contentApiCall('content.php?action=unpublish', {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    });
    if (result?.success) return { success: true };
  } catch {}
  setContentStatus(type, id, "unpublished");
  return { success: true };
}

export async function publishContentApi(type: ContentType, id: string): Promise<{ success: boolean }> {
  try {
    const result = await contentApiCall('content.php?action=publish', {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    });
    if (result?.success) return { success: true };
  } catch {}
  setContentStatus(type, id, "published");
  return { success: true };
}

export async function fetchTrash(): Promise<{ type: ContentType; id: string; title: string; trashedAt: string }[]> {
  try {
    const result = await contentApiCall('content.php?action=list-trash');
    if (result?.items) return result.items;
  } catch {}
  return getTrashedContent().map(s => ({ type: s.type, id: s.id, title: s.id, trashedAt: s.trashedAt || '' }));
}

export async function fetchActivityLog(): Promise<ActivityLogEntry[]> {
  try {
    const result = await contentApiCall('content.php?action=activity-log');
    if (result?.log) {
      return result.log.map((entry: any) => ({
        id: String(entry.id),
        action: entry.action.replace('content_', '') as ActivityLogEntry['action'],
        contentType: 'blog' as ContentType,
        contentId: '',
        contentTitle: entry.details || '',
        timestamp: entry.created_at || '',
      }));
    }
  } catch {}
  return getRecentActivity(30);
}

// ─── Content Generation (API with client fallback) ───

export async function generateFromEpisode(data: {
  title: string;
  description: string;
  transcript?: string;
}): Promise<{
  takeaways: string[];
  summary: string;
  seoDescription: string;
  blog?: { title: string; content: string; excerpt: string; keyTakeaways: string[] };
  newsletter?: { subject: string; body: string };
} | null> {
  try {
    const result = await contentApiCall('generate.php?action=full-episode', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result?.generated) return result.generated;
  } catch {}
  return null; // Caller should fall back to client-side generation
}

// ─── RSS Regeneration ───

export async function regenerateRSS(): Promise<{ success: boolean }> {
  try {
    const result = await contentApiCall('rss.php?action=generate');
    if (result?.success) return { success: true };
  } catch {}
  return { success: false };
}

// ─── localStorage Fallback (for preview environment) ───

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

// ─── Activity Log (localStorage fallback) ───

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
