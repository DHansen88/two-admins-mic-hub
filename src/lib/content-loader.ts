/**
 * File-based content loader for blogs and podcasts.
 * Uses Vite's import.meta.glob to load content at build time.
 * Works on any static hosting (Hostinger, Netlify, etc.) — no backend required.
 *
 * TO ADD A NEW BLOG POST:
 *   1. Create a .md file in src/content/blog/
 *   2. Add frontmatter (title, slug, author, publish_date, tags, excerpt, key_takeaways)
 *   3. Write content below the --- separator
 *   4. Rebuild & deploy
 *
 * TO ADD A NEW PODCAST EPISODE:
 *   1. Create a .json file in src/content/podcasts/
 *   2. Follow the Episode interface schema
 *   3. Rebuild & deploy
 */

import { parseFrontMatter } from './frontmatter';
import { blocksToMarkdown } from './block-types';
import authorsData from '@/content/authors.json';
import type { SharedTopic } from '@/data/topics';

// --------------- Authors ---------------

export interface Author {
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

const authors: Record<string, Author> = authorsData;

export function getAuthor(key: string): Author {
  return (
    authors[key] ?? {
      name: key,
      role: '',
      bio: '',
      avatar: '',
    }
  );
}

// --------------- Blog Posts ---------------

export interface BlogPost {
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  topics: SharedTopic[];
  slug: string;
  author: Author;
  featuredImage?: string;
  keyTakeaways?: string[];
  blocks?: import('@/lib/block-types').ContentBlock[];
  relatedEpisode?: string;
  showEpisodeCallout?: boolean;
}

/** Calculate reading time from word count */
function calculateReadingTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

/** Auto-generate excerpt from content if not provided */
function generateExcerpt(content: string, maxLength = 150): string {
  const plain = content
    .replace(/^#{1,6}\s+.*/gm, '') // remove headings
    .replace(/[*_~`>\-\[\]()!]/g, '') // remove markdown syntax
    .replace(/\n+/g, ' ')
    .trim();
  if (plain.length <= maxLength) return plain;
  return plain.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/** Format a date string into a readable format */
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Load all .md files from src/content/blog/ at build time
const blogMdModules = import.meta.glob('../content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

// Load all .json files from src/content/blog/ at build time
const blogJsonModules = import.meta.glob('../content/blog/*.json', {
  eager: true,
}) as Record<string, { default?: Record<string, unknown> } & Record<string, unknown>>;

function parseBlogMd(raw: string, filename: string): BlogPost {
  const { data, content } = parseFrontMatter(raw);

  const slug =
    (data.slug as string) ||
    filename
      .replace(/^.*\//, '')
      .replace(/\.md$/, '');

  const tags: SharedTopic[] = Array.isArray(data.tags)
    ? (data.tags as SharedTopic[])
    : typeof data.tags === 'string'
      ? (data.tags.split(',').map((t) => t.trim()) as SharedTopic[])
      : [];

  const keyTakeaways = Array.isArray(data.key_takeaways)
    ? data.key_takeaways
    : undefined;

  const authorKey = (data.author as string) || '';
  const author = getAuthor(authorKey);
  // Override role if specified in frontmatter
  if (data.author_role) {
    author.role = data.author_role as string;
  }

  const excerpt =
    (data.excerpt as string) || generateExcerpt(content);

  return {
    title: (data.title as string) || 'Untitled',
    slug,
    content,
    excerpt,
    date: formatDate((data.publish_date as string) || ''),
    readTime: calculateReadingTime(content),
    topics: tags,
    author,
    featuredImage: (data.featured_image as string) || undefined,
    keyTakeaways,
    relatedEpisode: (data.related_episode as string) || undefined,
    showEpisodeCallout: data.show_episode_callout !== false,
  };
}

function parseBlogJson(mod: Record<string, unknown>, filename: string): BlogPost {
  const data = (mod.default ?? mod) as Record<string, unknown>;

  const slug =
    (data.slug as string) ||
    filename
      .replace(/^.*\//, '')
      .replace(/\.json$/, '');

  const tags: SharedTopic[] = Array.isArray(data.tags)
    ? (data.tags as SharedTopic[])
    : typeof data.tags === 'string'
      ? (data.tags.split(',').map((t) => t.trim()) as SharedTopic[])
      : [];

  const keyTakeaways = Array.isArray(data.key_takeaways)
    ? (data.key_takeaways as string[])
    : undefined;

  // Support blocks-based content
  const blocks = Array.isArray(data.blocks) ? data.blocks as import('@/lib/block-types').ContentBlock[] : undefined;
  
  let content = (data.content as string) || '';
  if (!content && blocks) {
    content = blocksToMarkdown(blocks);
  }

  const authorKey = (data.author as string) || '';
  const author = getAuthor(authorKey);
  if (data.author_role) {
    author.role = data.author_role as string;
  }

  return {
    title: (data.title as string) || 'Untitled',
    slug,
    content,
    excerpt: (data.excerpt as string) || generateExcerpt(content),
    date: formatDate((data.publish_date as string) || ''),
    readTime: calculateReadingTime(content),
    topics: tags,
    author,
    featuredImage: (data.featured_image as string) || undefined,
    keyTakeaways,
    blocks,
    relatedEpisode: (data.related_episode as string) || undefined,
    showEpisodeCallout: data.show_episode_callout !== false,
  };
}

/** All blog posts loaded from src/content/blog/, sorted newest first */
export function loadAllBlogs(): BlogPost[] {
  const posts: BlogPost[] = [];

  // Process .md files
  for (const [path, raw] of Object.entries(blogMdModules)) {
    posts.push(parseBlogMd(raw, path));
  }

  // Process .json files
  for (const [path, mod] of Object.entries(blogJsonModules)) {
    // Skip authors.json or any non-blog JSON
    if (path.includes('authors.json')) continue;
    posts.push(parseBlogJson(mod as Record<string, unknown>, path));
  }

  // Sort by date, newest first
  posts.sort((a, b) => {
    const da = new Date(a.date).getTime() || 0;
    const db = new Date(b.date).getTime() || 0;
    return db - da;
  });

  return posts;
}

// --------------- Podcast Episodes ---------------

export interface PlatformLinks {
  apple?: string;
  spotify?: string;
  youtube?: string;
  other?: { name: string; url: string }[];
}

export interface ShareableClip {
  title: string;
  duration: string;
  embedUrl?: string;
  mp4Url?: string;
}

export interface Episode {
  number: number;
  title: string;
  slug: string;
  description: string;
  duration: string;
  date: string;
  topics: SharedTopic[];
  riversideEmbedUrl?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  platformLinks?: PlatformLinks;
  clips?: ShareableClip[];
  transcript?: string;
  showNotes?: string[];
}

// Load all .json files from src/content/podcasts/
const podcastModules = import.meta.glob('../content/podcasts/*.json', {
  eager: true,
}) as Record<string, { default?: Record<string, unknown> } & Record<string, unknown>>;

function parsePodcastJson(mod: Record<string, unknown>): Episode {
  const data = (mod.default ?? mod) as Record<string, unknown>;

  return {
    number: (data.number as number) || 0,
    title: (data.title as string) || 'Untitled',
    slug: (data.slug as string) || '',
    description: (data.description as string) || '',
    duration: (data.duration as string) || '',
    date: formatDate((data.date as string) || ''),
    topics: ((data.topics as string[]) || []) as SharedTopic[],
    riversideEmbedUrl: data.riversideEmbedUrl as string | undefined,
    thumbnailUrl: (data.thumbnailUrl as string) || '/placeholder.svg',
    audioUrl: data.audioUrl as string | undefined,
    platformLinks: data.platformLinks as PlatformLinks | undefined,
    clips: data.clips as ShareableClip[] | undefined,
    transcript: data.transcript as string | undefined,
    showNotes: data.showNotes as string[] | undefined,
  };
}

/** All podcast episodes loaded from src/content/podcasts/, sorted by episode number desc */
export function loadAllEpisodes(): Episode[] {
  const episodes: Episode[] = [];

  for (const [, mod] of Object.entries(podcastModules)) {
    episodes.push(parsePodcastJson(mod as Record<string, unknown>));
  }

  episodes.sort((a, b) => b.number - a.number);
  return episodes;
}
