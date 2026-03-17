/**
 * Author Management — client-side API layer.
 * Communicates with the PHP backend for CRUD, falls back to localStorage.
 */

export interface AuthorProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  linkedin?: string;
  website?: string;
}

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || '/api';
const LOCAL_KEY = 'taam_authors';

// Default authors (used when API is unavailable)
const DEFAULT_AUTHORS: Record<string, AuthorProfile> = {
  sarah: {
    id: 'sarah',
    name: 'Sarah Mitchell',
    role: 'Co-Host & Leadership Coach',
    bio: 'Sarah brings 15 years of administrative leadership experience and is passionate about empowering others to reach their full potential.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    linkedin: '',
    website: '',
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus Chen',
    role: 'Co-Host & Operations Expert',
    bio: 'Marcus has spent two decades in administrative roles across Fortune 500 companies and loves sharing practical strategies that work.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    linkedin: '',
    website: '',
  },
};

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

async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
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
  } catch {
    // Fall back to local
  }
  return Object.values(getLocal());
}

/** Save (create or update) an author */
export async function saveAuthor(author: Partial<AuthorProfile> & { name: string }): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const data = await apiCall('authors.php?action=save', {
      method: 'POST',
      body: JSON.stringify(author),
    });
    if (data?.success) {
      // Update local cache
      const local = getLocal();
      local[data.id] = data.author || { ...author, id: data.id };
      setLocal(local);
      return { success: true, id: data.id };
    }
    return { success: false, error: data?.error || 'Save failed' };
  } catch {
    // Fallback: save locally
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
  } catch {
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
      credentials: 'include',
      body: formData,
    });
    const data = await res.json();
    if (data?.success) return { success: true, url: data.url };
    return { success: false, error: data?.error };
  } catch {
    // Fallback: create object URL (won't persist)
    const url = URL.createObjectURL(file);
    return { success: true, url };
  }
}
