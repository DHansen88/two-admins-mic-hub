/**
 * Hooks that fetch blog data from the live PHP API
 * so admin-published content appears without a redeploy.
 */

import { useQuery } from "@tanstack/react-query";
import { getAdminApiBase } from "@/lib/admin-auth";
import type { BlogPost, Author } from "@/lib/content-loader";

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
  related_episode?: string;
  show_episode_callout?: boolean | string;
  status?: string;
  // Author objects resolved server-side or client-side
  _resolved_authors?: Author[];
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

function rawToBlogPost(raw: ApiBlogRaw): BlogPost {
  const content = raw._content || raw.content || "";
  const slug = raw.slug || "";
  const tags = Array.isArray(raw.tags) ? raw.tags : [];

  // Build a minimal author from the key string
  const authorName = Array.isArray(raw.authors)
    ? raw.authors[0] || raw.author || ""
    : raw.author || "";

  const author: Author = {
    name: authorName,
    role: raw.author_role || "",
    bio: "",
    avatar: "",
  };

  const authors: Author[] = Array.isArray(raw.authors)
    ? raw.authors.map((name) => ({ name, role: "", bio: "", avatar: "" }))
    : [author];

  if (raw.author_avatars) {
    raw.author_avatars.forEach((av, i) => {
      if (av && authors[i]) authors[i].avatar = av;
    });
  }

  return {
    title: raw.title || "Untitled",
    slug,
    content,
    excerpt: raw.excerpt || "",
    date: formatDate(raw.publish_date || raw.date || ""),
    readTime: calculateReadingTime(content),
    topics: tags as any,
    author: authors[0] || author,
    authors,
    featuredImage: raw.featured_image || undefined,
    keyTakeaways: raw.key_takeaways || undefined,
    relatedEpisode: raw.related_episode || undefined,
    showEpisodeCallout: String(raw.show_episode_callout) !== "false",
  };
}

async function fetchPublicBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE}/content.php?action=public-list-blogs`);
    if (!res.ok) return [];
    const data = await res.json();
    const blogs: ApiBlogRaw[] = data.blogs ?? [];
    return blogs.map(rawToBlogPost);
  } catch {
    return [];
  }
}

async function fetchPublicBlog(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(
      `${API_BASE}/content.php?action=public-get-blog&slug=${encodeURIComponent(slug)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.blog) return null;
    return rawToBlogPost(data.blog);
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
