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
  color: string; // Legacy HSL color string (kept for backward compat)
  bgColor: string; // Hex background color
  textColor: string; // Hex text color
  borderColor?: string; // Optional hex border color
}

/** Returns white or black hex depending on background luminance */
export function getContrastTextColor(hexBg: string): string {
  const hex = hexBg.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#1a1a1a" : "#ffffff";
}

/** Convert HSL string "H S% L%" to hex (for migration) */
function hslToHex(hslStr: string): string {
  const parts = hslStr.trim().split(/\s+/);
  const h = parseFloat(parts[0]) || 0;
  const s = (parseFloat(parts[1]) || 50) / 100;
  const l = (parseFloat(parts[2]) || 50) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const DEFAULT_TAGS: Tag[] = [
  { name: "Leadership", slug: "leadership", color: "199 62% 28%", bgColor: "#2FBF71", textColor: "#ffffff" },
  { name: "Career Growth", slug: "career-growth", color: "160 60% 35%", bgColor: "#5A7DFF", textColor: "#ffffff" },
  { name: "Communication", slug: "communication", color: "25 85% 55%", bgColor: "#FF8A00", textColor: "#ffffff" },
  { name: "Technology", slug: "technology", color: "250 55% 50%", bgColor: "#7C5AFF", textColor: "#ffffff" },
  { name: "Admin Life", slug: "admin-life", color: "340 65% 50%", bgColor: "#FF3B7A", textColor: "#ffffff" },
  { name: "Wellness", slug: "wellness", color: "140 50% 40%", bgColor: "#33A66E", textColor: "#ffffff" },
  { name: "Team Building", slug: "team-building", color: "210 60% 45%", bgColor: "#3A8FD6", textColor: "#ffffff" },
  { name: "Humor & Human Moments", slug: "humor-human-moments", color: "45 80% 50%", bgColor: "#E6A817", textColor: "#1a1a1a" },
];

const STORAGE_KEY = "taam_tags";

/** Migrate old tags that lack bgColor/textColor */
function migrateTag(tag: any): Tag {
  if (!tag.bgColor) {
    tag.bgColor = hslToHex(tag.color || "200 50% 50%");
  }
  if (!tag.textColor) {
    tag.textColor = getContrastTextColor(tag.bgColor);
  }
  return tag as Tag;
}

const TAG_VERSION_KEY = "taam_tags_version";
const CURRENT_TAG_VERSION = "2"; // Bump to force re-seed with new vibrant colors

/** Load tags from localStorage, falling back to defaults */
export function getAllTags(): Tag[] {
  const version = localStorage.getItem(TAG_VERSION_KEY);
  if (version !== CURRENT_TAG_VERSION) {
    // Force re-seed with new vibrant default colors
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TAGS));
    localStorage.setItem(TAG_VERSION_KEY, CURRENT_TAG_VERSION);
    return [...DEFAULT_TAGS];
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(migrateTag);
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
