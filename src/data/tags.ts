/**
 * Centralized Tag Management System
 * 
 * Tags are stored in localStorage for admin CRUD operations.
 * Default tags seed the system on first load.
 * Used across blog posts and podcast episodes.
 */

export interface Tag {
  name: string;
  slug: string;
  color: string; // HSL color string for badge display
}

const DEFAULT_TAGS: Tag[] = [
  { name: "Leadership", slug: "leadership", color: "199 62% 28%" },
  { name: "Career Growth", slug: "career-growth", color: "160 60% 35%" },
  { name: "Communication", slug: "communication", color: "25 85% 55%" },
  { name: "Technology", slug: "technology", color: "250 55% 50%" },
  { name: "Admin Life", slug: "admin-life", color: "340 65% 50%" },
  { name: "Wellness", slug: "wellness", color: "140 50% 40%" },
  { name: "Team Building", slug: "team-building", color: "210 60% 45%" },
  { name: "Humor & Human Moments", slug: "humor-human-moments", color: "45 80% 50%" },
];

const STORAGE_KEY = "taam_tags";

/** Load tags from localStorage, falling back to defaults */
export function getAllTags(): Tag[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // Seed defaults
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TAGS));
  return [...DEFAULT_TAGS];
}

/** Get tag names as a string array (backward compatible with SHARED_TOPICS) */
export function getTagNames(): string[] {
  return getAllTags().map((t) => t.name);
}

/** Find a tag by name (case-insensitive) */
export function getTagByName(name: string): Tag | undefined {
  return getAllTags().find((t) => t.name.toLowerCase() === name.toLowerCase());
}

/** Find a tag by slug */
export function getTagBySlug(slug: string): Tag | undefined {
  return getAllTags().find((t) => t.slug === slug);
}

/** Generate a URL-safe slug from a tag name */
export function generateTagSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Save a new tag */
export function addTag(tag: Tag): Tag[] {
  const tags = getAllTags();
  if (tags.some((t) => t.slug === tag.slug)) return tags;
  const updated = [...tags, tag];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/** Update an existing tag by slug */
export function updateTag(slug: string, updates: Partial<Omit<Tag, "slug">> & { slug?: string }): Tag[] {
  let tags = getAllTags();
  tags = tags.map((t) =>
    t.slug === slug ? { ...t, ...updates } : t
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  return tags;
}

/** Delete a tag by slug */
export function deleteTag(slug: string): Tag[] {
  const tags = getAllTags().filter((t) => t.slug !== slug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  return tags;
}

/** Suggest tags based on content text */
export function suggestTags(text: string): Tag[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const tags = getAllTags();
  return tags.filter((tag) => {
    const keywords = tag.name.toLowerCase().split(/\s+/);
    return keywords.some((kw) => kw.length > 3 && lower.includes(kw));
  });
}
