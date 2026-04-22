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
import { getHostAuthorId, normalizeAuthorValue } from './author-utils';

// --------------- Authors ---------------

export interface Author {
  id?: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  linkedin?: string;
  website?: string;
}

const authors: Record<string, Author> = authorsData;

export function getAuthor(key: string): Author {
  const directMatch = authors[key];
  if (directMatch) return { ...directMatch, id: key };

  const normalizedKey = normalizeAuthorValue(key);
  const hostId = getHostAuthorId(key);
  const aliasedKey = Object.keys(authors).find((candidate) => {
    if (normalizeAuthorValue(candidate) === normalizedKey) return true;
    if (normalizeAuthorValue(authors[candidate].name) === normalizedKey) return true;
    return hostId !== null
      && (getHostAuthorId(candidate) === hostId || getHostAuthorId(authors[candidate].name) === hostId);
  });

  const a = aliasedKey ? authors[aliasedKey] : undefined;
  if (a) return { ...a, id: aliasedKey || key };
  return {
    id: key.toLowerCase(),
    name: key,
    role: '',
    bio: '',
    avatar: '',
  };
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
  /** Multiple authors support — first entry is always === author */
  authors: Author[];
  authorIds: string[];
  authorAvatarOverrides?: string[];
  tagStyles?: Record<string, { bgColor: string; textColor: string; borderColor?: string }>;
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

  // Support multiple authors: author can be a string or comma-separated, or authors can be an array
  const authorKeys = Array.isArray(data.authors)
    ? (data.authors as string[])
    : typeof data.author === 'string'
      ? data.author.split(',').map((k) => k.trim()).filter(Boolean)
      : [''];
  const allAuthors = authorKeys.map((k) => {
    const a = getAuthor(k);
    return { ...a };
  });
  const author = allAuthors[0] || getAuthor('');
  // Override role if specified in frontmatter
  if (data.author_role) {
    author.role = data.author_role as string;
    allAuthors[0] = author;
  }

  // Apply custom avatars if provided
  if (Array.isArray(data.author_avatars)) {
    (data.author_avatars as string[]).forEach((avatar, i) => {
      if (avatar && allAuthors[i]) allAuthors[i].avatar = avatar;
    });
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
    authors: allAuthors,
    authorIds: authorKeys,
    authorAvatarOverrides: Array.isArray(data.author_avatars) ? (data.author_avatars as string[]) : undefined,
    tagStyles: (data.tag_styles as unknown as Record<string, { bgColor: string; textColor: string; borderColor?: string }>) || undefined,
    featuredImage: (data.featured_image as string) || undefined,
    keyTakeaways,
    relatedEpisode: (data.related_episode as string) || undefined,
    showEpisodeCallout: String(data.show_episode_callout) !== 'false',
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

  // Support multiple authors
  const authorKeys = Array.isArray(data.authors)
    ? (data.authors as string[])
    : typeof data.author === 'string'
      ? (data.author as string).split(',').map((k) => k.trim()).filter(Boolean)
      : [''];
  const allAuthors = authorKeys.map((k) => ({ ...getAuthor(k) }));
  const author = allAuthors[0] || getAuthor('');
  if (data.author_role) {
    author.role = data.author_role as string;
    allAuthors[0] = author;
  }
  if (Array.isArray(data.author_avatars)) {
    (data.author_avatars as string[]).forEach((avatar, i) => {
      if (avatar && allAuthors[i]) allAuthors[i].avatar = avatar;
    });
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
    authors: allAuthors,
    authorIds: authorKeys,
    authorAvatarOverrides: Array.isArray(data.author_avatars) ? (data.author_avatars as string[]) : undefined,
    tagStyles: (data.tag_styles as Record<string, { bgColor: string; textColor: string; borderColor?: string }>) || undefined,
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
  iheart?: string;
  spreaker?: string;
  youtube?: string;
  iheart?: string;
  other?: { name: string; url: string }[];
}

export interface ShareableClip {
  title: string;
  duration: string;
  embedUrl?: string;
  mp4Url?: string;
}

export interface EpisodeGuest {
  name: string;
  title?: string;
  image?: string;
  bio?: string;
  quote?: string;
  featuredQuote?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  facebookUrl?: string;
}

export interface Episode {
  number: number;
  title: string;
  slug: string;
  description: string;
  duration: string;
  date: string;
  topics: SharedTopic[];
  explicit?: boolean;
  host?: string;
  riversideEmbedUrl?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  platformLinks?: PlatformLinks;
  clips?: ShareableClip[];
  transcript?: string;
  showNotes?: string[];
  guest?: EpisodeGuest;
}

// Load all .json files from src/content/podcasts/
const podcastModules = import.meta.glob('../content/podcasts/*.json', {
  eager: true,
}) as Record<string, { default?: Record<string, unknown> } & Record<string, unknown>>;

function parsePodcastJson(mod: Record<string, unknown>): Episode {
  const data = (mod.default ?? mod) as Record<string, unknown>;

  const rawGuest = data.guest as Record<string, unknown> | undefined;
  const quoteValue =
    rawGuest?.featuredQuote
      ? String(rawGuest.featuredQuote)
      : rawGuest?.quote
        ? String(rawGuest.quote)
        : rawGuest?.featured_quote
          ? String(rawGuest.featured_quote)
          : undefined;
  const guest: EpisodeGuest | undefined =
    rawGuest && typeof rawGuest === 'object' && rawGuest.name
      ? {
          name: String(rawGuest.name),
          title: rawGuest.title ? String(rawGuest.title) : undefined,
          image: rawGuest.image ? String(rawGuest.image) : undefined,
          bio: rawGuest.bio ? String(rawGuest.bio) : undefined,
          quote: quoteValue,
          featuredQuote: quoteValue,
          websiteUrl: rawGuest.websiteUrl ? String(rawGuest.websiteUrl) : undefined,
          linkedinUrl: rawGuest.linkedinUrl ? String(rawGuest.linkedinUrl) : undefined,
          instagramUrl: rawGuest.instagramUrl ? String(rawGuest.instagramUrl) : undefined,
          xUrl: rawGuest.xUrl ? String(rawGuest.xUrl) : undefined,
          facebookUrl: rawGuest.facebookUrl ? String(rawGuest.facebookUrl) : undefined,
        }
      : undefined;

  return {
    number: (data.number as number) || 0,
    title: (data.title as string) || 'Untitled',
    slug: (data.slug as string) || '',
    description: (data.description as string) || '',
    duration: (data.duration as string) || '',
    date: formatDate((data.date as string) || ''),
    topics: ((data.topics as string[]) || []) as SharedTopic[],
    explicit: Boolean(data.explicit ?? data.isExplicit ?? false),
    host: (data.host as string) || undefined,
    riversideEmbedUrl: data.riversideEmbedUrl as string | undefined,
    thumbnailUrl: (data.thumbnailUrl as string) || '/placeholder.svg',
    audioUrl: data.audioUrl as string | undefined,
    platformLinks: data.platformLinks as PlatformLinks | undefined,
    clips: data.clips as ShareableClip[] | undefined,
    transcript: data.transcript as string | undefined,
    showNotes: data.showNotes as string[] | undefined,
    guest,
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
