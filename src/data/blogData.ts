/**
 * Blog data layer — now powered by file-based content from src/content/blog/.
 *
 * TO ADD A NEW BLOG POST:
 *   1. Create a .md or .json file in src/content/blog/
 *   2. Add frontmatter with: title, slug, author, publish_date, tags, excerpt, key_takeaways
 *   3. Write your content in markdown below the --- separator
 *   4. Rebuild & deploy — the post appears automatically
 */

import { SHARED_TOPICS, type SharedTopic } from './topics';
import {
  loadAllBlogs,
  type BlogPost,
  type Author,
} from '@/lib/content-loader';
import { isContentVisible } from '@/lib/content-manager';

// Re-export types for backward compatibility
export { SHARED_TOPICS as BLOG_TOPICS };
export type BlogTopic = SharedTopic;
export type { Author, BlogPost };

/** All blog posts, loaded from src/content/blog/ files */
const _allBlogs: BlogPost[] = loadAllBlogs();

/** Published blog posts (filtered by content manager) */
export const allBlogs: BlogPost[] = _allBlogs.filter((b) =>
  isContentVisible("blog", b.slug)
);

/** All blogs including unpublished (for admin) */
export const allBlogsUnfiltered: BlogPost[] = _allBlogs;

export const getBlogBySlug = (slug: string): BlogPost | undefined => {
  return allBlogs.find((blog) => blog.slug === slug);
};

export const getRelatedPosts = (
  currentSlug: string,
  limit: number = 3
): BlogPost[] => {
  const currentPost = getBlogBySlug(currentSlug);
  if (!currentPost) return allBlogs.slice(0, limit);

  const scored = allBlogs
    .filter((blog) => blog.slug !== currentSlug)
    .map((blog) => ({
      blog,
      score: blog.topics.filter((t) => currentPost.topics.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.blog);
};
