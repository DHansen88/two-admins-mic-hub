/**
 * Author Management — client-side API layer.
 * Communicates with the PHP backend for CRUD, falls back to localStorage.
 */

import { canUseAdminFallback, getAdminApiBase, getAdminAuthHeaders, handleAuthFailure, isAdminAuthError } from "./admin-auth";

export interface AuthorProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  linkedin?: string;
  website?: string;
}

const API_BASE = getAdminApiBase();
const LOCAL_KEY = 'taam_authors';

function isPhpSourceResponse(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith('<?php') || trimmed.includes("require_once __DIR__ . '/config.php'");
}

// Default authors — empty; real authors come from the API or authors.json
const DEFAULT_AUTHORS: Record<string, AuthorProfile> = {};

function getLocal(): Record<string, AuthorProfile> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : { ...DEFAULT_AUTHORS };
  } catch {
    return { ...DEFAULT_AUTHORS };
  }
}

function setLocal(authors: Record<string, AuthorProfile>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(authors));
}

export function getCachedAuthors(): Record<string, AuthorProfile> {
  return getLocal();
}

async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders(options.headers || {}) },
      credentials: 'include',
    });

    const text = await res.text();
    let data: any = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        if (isPhpSourceResponse(text)) {
          return {
            success: false,
            error: 'Headshot upload only works on the live site after you log in there — the Lovable preview cannot run the PHP upload endpoint.',
          };
        }
        data = null;
      }
    }

    if (res.status === 401) {
      throw handleAuthFailure(data?.error || 'Not authenticated');
    }

    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) return null;
    throw error;
  }
}

/** Fetch all authors */
export async function fetchAuthors(): Promise<AuthorProfile[]> {
  try {
    const data = await apiCall('authors.php?action=list');
    if (data?.authors) {
      const authors = data.authors as Record<string, AuthorProfile>;
      setLocal(authors);
      return Object.values(authors);
    }
  } catch (error) {
    if (isAdminAuthError(error)) return [];
  }
  return canUseAdminFallback() ? Object.values(getLocal()) : [];
}

/** Fetch authors for the public site without requiring admin auth */
export async function fetchPublicAuthors(): Promise<Record<string, AuthorProfile>> {
  try {
    const res = await fetch(`${API_BASE}/authors.php?action=list-public`, {
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    if (data?.authors) {
      const authors = data.authors as Record<string, AuthorProfile>;
      setLocal(authors);
      return authors;
    }
  } catch {
    // Fall back to local cache
  }
  return getLocal();
}

/** Save (create or update) an author */
export async function saveAuthor(author: Partial<AuthorProfile> & { name: string }): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const data = await apiCall('authors.php?action=save', {
      method: 'POST',
      body: JSON.stringify(author),
    });
    if (data?.success) {
      const local = getLocal();
      local[data.id] = data.author || { ...author, id: data.id };
      setLocal(local);
      return { success: true, id: data.id };
    }
    return { success: false, error: data?.error || 'Save failed' };
  } catch (error: any) {
    if (isAdminAuthError(error)) {
      return { success: false, error: error.message };
    }

    if (!canUseAdminFallback()) {
      return { success: false, error: error?.message || 'Save failed' };
    }

    const id = author.id || author.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const local = getLocal();
    local[id] = { id, name: author.name, role: author.role || '', bio: author.bio || '', avatar: author.avatar || '', linkedin: author.linkedin || '', website: author.website || '' };
    setLocal(local);
    return { success: true, id };
  }
}

/** Delete an author */
export async function deleteAuthor(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await apiCall('authors.php?action=delete', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
    if (data?.success) {
      const local = getLocal();
      delete local[id];
      setLocal(local);
      return { success: true };
    }
    return { success: false, error: data?.error };
  } catch (error: any) {
    if (isAdminAuthError(error)) {
      return { success: false, error: error.message };
    }

    if (!canUseAdminFallback()) {
      return { success: false, error: error?.message || 'Delete failed' };
    }

    const local = getLocal();
    delete local[id];
    setLocal(local);
    return { success: true };
  }
}

/** Upload a headshot image */
export async function uploadHeadshot(file: File, authorId: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('headshot', file);
    formData.append('author_id', authorId);

    const res = await fetch(`${API_BASE}/authors.php?action=upload-headshot`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: formData,
    });

    const text = await res.text();
    let data: any = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    if (res.status === 401) {
      throw handleAuthFailure(data?.error || 'Not authenticated');
    }

    if (data?.success) return { success: true, url: data.url };
    return { success: false, error: data?.error || 'Upload failed' };
  } catch (error: any) {
    if (isAdminAuthError(error)) {
      if (canUseAdminFallback()) {
        const url = URL.createObjectURL(file);
        return { success: true, url };
      }

      return {
        success: false,
        error: error.message || 'Upload failed because the admin session is no longer valid. Please sign in again on the live site.',
      };
    }

    if (!canUseAdminFallback()) {
      return { success: false, error: error?.message || 'Upload failed' };
    }

    const url = URL.createObjectURL(file);
    return { success: true, url };
  }
}
