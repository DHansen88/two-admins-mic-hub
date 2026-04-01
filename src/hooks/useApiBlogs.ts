/**
 * Hooks that fetch blog data from the live PHP API
 * so admin-published content appears without a redeploy.
 */

import { useQuery } from "@tanstack/react-query";
import { getAdminApiBase } from "@/lib/admin-auth";
import type { BlogPost, Author } from "@/lib/content-loader";
import { fetchAuthors, type AuthorProfile } from "@/lib/author-manager";
import authorsJson from "@/content/authors.json";

const API_BASE = getAdminApiBase();

interface ApiBlogRaw {
  title?: string;
  slug?: string;
  author?: string;
  authors?: string[];
  author_role?: string;
  author_avatars?: string[];
  publish_date?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  featured_image?: string;
  key_takeaways?: string[];
  content?: string;
  _content?: string;
  html_content?: string;
  related_episode?: string;
  show_episode_callout?: boolean | string;
  status?: string;
}

function calculateReadingTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/** Local author profiles from authors.json — always available as fallback */
const localAuthorProfiles: AuthorProfile[] = Object.entries(
  authorsJson as Record<string, { name: string; role?: string; bio?: string; avatar?: string; linkedin?: string; website?: string }>
).map(([id, a]) => ({ id, name: a.name, role: a.role || "", bio: a.bio || "", avatar: a.avatar || "", linkedin: a.linkedin, website: a.website }));

/** Cache for author profiles so we don't re-fetch per blog */
let cachedAuthorProfiles: AuthorProfile[] | null = null;

async function loadAuthorProfiles(): Promise<AuthorProfile[]> {
  if (cachedAuthorProfiles) return cachedAuthorProfiles;
  try {
    const fetched = await fetchAuthors();
    // Merge: API profiles take precedence, then fill in from local JSON
    const byId = new Map(localAuthorProfiles.map((p) => [p.id, p]));
    for (const p of fetched) byId.set(p.id, p);
    cachedAuthorProfiles = Array.from(byId.values());
  } catch {
    cachedAuthorProfiles = [...localAuthorProfiles];
  }
  return cachedAuthorProfiles;
}

function resolveAuthor(key: string, profiles: AuthorProfile[]): Author {
  // Try exact id match
  const profile = profiles.find((p) => p.id === key) ||
    profiles.find((p) => p.name.toLowerCase() === key.toLowerCase());
  if (profile) {
    return {
      name: profile.name,
      role: profile.role || "",
      bio: profile.bio || "",
      avatar: profile.avatar || "",
      linkedin: profile.linkedin,
      website: profile.website,
    };
  }
  return { name: key, role: "", bio: "", avatar: "" };
}

function rawToBlogPost(raw: ApiBlogRaw, profiles: AuthorProfile[]): BlogPost {
  const content = raw._content || raw.content || "";
  const slug = raw.slug || "";
  const tags = Array.isArray(raw.tags) ? raw.tags : [];

  const authorKeys = Array.isArray(raw.authors) && raw.authors.length > 0
    ? raw.authors
    : [raw.author || ""];

  const authors: Author[] = authorKeys.map((key) => resolveAuthor(key, profiles));

  // Override avatars if explicitly provided
  if (raw.author_avatars) {
    raw.author_avatars.forEach((av, i) => {
      if (av && authors[i]) authors[i].avatar = av;
    });
  }

  const post: BlogPost & { html_content?: string } = {
    title: raw.title?.trim() || "",
    slug,
    content,
    excerpt: raw.excerpt || "",
    date: formatDate(raw.publish_date || raw.date || ""),
    readTime: calculateReadingTime(content),
    topics: tags as any,
    author: authors[0],
    authors,
    featuredImage: raw.featured_image || undefined,
    keyTakeaways: raw.key_takeaways || undefined,
    relatedEpisode: raw.related_episode || undefined,
    showEpisodeCallout: String(raw.show_episode_callout) !== "false",
  };

  if (raw.html_content) {
    (post as any).html_content = raw.html_content;
  }

  return post;
}

async function fetchPublicBlogs(): Promise<BlogPost[]> {
  try {
    const [res, profiles] = await Promise.all([
      fetch(`${API_BASE}/content.php?action=public-list-blogs`),
      loadAuthorProfiles(),
    ]);
    if (!res.ok) return [];

    const data = await res.json();
    const blogs: ApiBlogRaw[] = data.blogs ?? [];

    const cleaned = Array.from(
      new Map(
        blogs
          .filter((b) => (b.slug || "").trim() && (b.title || "").trim())
          .map((b) => [b.slug!.trim(), b])
      ).values()
    );

    return cleaned.map((b) => rawToBlogPost(b, profiles));
  } catch {
    return [];
  }
}

async function fetchPublicBlog(slug: string): Promise<BlogPost | null> {
  try {
    const [res, profiles] = await Promise.all([
      fetch(`${API_BASE}/content.php?action=public-get-blog&slug=${encodeURIComponent(slug)}`),
      loadAuthorProfiles(),
    ]);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.blog) return null;
    return rawToBlogPost(data.blog, profiles);
  } catch {
    return null;
  }
}

export function useApiBlogs() {
  return useQuery({
    queryKey: ["public-blogs"],
    queryFn: fetchPublicBlogs,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useApiBlogBySlug(slug: string) {
  return useQuery({
    queryKey: ["public-blog", slug],
    queryFn: () => fetchPublicBlog(slug),
    staleTime: 60_000,
    enabled: !!slug,
  });
}
