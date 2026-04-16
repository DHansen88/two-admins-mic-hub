import { useState, useEffect } from "react";
import { type Tag, getAllTags as getLocalTags } from "@/data/tags";

const API_BASE = (import.meta.env.VITE_ADMIN_API_URL || '').trim() || '/api';

let cachedTags: Tag[] | null = null;
let fetchPromise: Promise<Tag[]> | null = null;

async function fetchTagsFromApi(): Promise<Tag[]> {
  try {
    const res = await fetch(`${API_BASE}/tags.php`, { credentials: 'include' });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (Array.isArray(data.tags) && data.tags.length > 0) {
      cachedTags = data.tags;
      // Sync to localStorage so other code stays compatible
      localStorage.setItem('taam_tags', JSON.stringify(data.tags));
      return data.tags;
    }
  } catch {
    // API unavailable — fall back to localStorage
  }
  return getLocalTags();
}

export function getApiTagNames(): string[] {
  return cachedTags ? cachedTags.map(t => t.name) : getLocalTags().map(t => t.name);
}

export function useApiTags() {
  const [tags, setTags] = useState<Tag[]>(cachedTags || getLocalTags());
  const [loading, setLoading] = useState(!cachedTags);

  useEffect(() => {
    if (cachedTags) {
      setTags(cachedTags);
      setLoading(false);
      return;
    }
    if (!fetchPromise) {
      fetchPromise = fetchTagsFromApi().finally(() => { fetchPromise = null; });
    }
    fetchPromise.then(result => {
      setTags(result);
      setLoading(false);
    });
  }, []);

  return { tags, loading, tagNames: tags.map(t => t.name) };
}
