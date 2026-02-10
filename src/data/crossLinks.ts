import { allBlogs, type BlogPost } from "./blogData";
import { allEpisodes, type Episode } from "./episodeData";
import type { SharedTopic } from "./topics";

/**
 * Find podcast episodes related to a blog post by shared topic tags.
 */
export function getRelatedEpisodesForBlog(
  blogSlug: string,
  count = 3
): Episode[] {
  const blog = allBlogs.find((b) => b.slug === blogSlug);
  if (!blog) return [];

  return allEpisodes
    .map((ep) => ({
      ep,
      score: ep.topics.filter((t) =>
        (blog.topics as readonly string[]).includes(t)
      ).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ ep }) => ep);
}

/**
 * Find blog posts related to a podcast episode by shared topic tags.
 */
export function getRelatedBlogsForEpisode(
  episodeSlug: string,
  count = 3
): BlogPost[] {
  const episode = allEpisodes.find((ep) => ep.slug === episodeSlug);
  if (!episode) return [];

  return allBlogs
    .map((blog) => ({
      blog,
      score: blog.topics.filter((t) =>
        (episode.topics as readonly string[]).includes(t)
      ).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ blog }) => blog);
}

/**
 * Get all content (blogs + episodes) for a given topic tag.
 */
export function getContentByTopic(topic: SharedTopic) {
  const blogs = allBlogs.filter((b) =>
    (b.topics as readonly string[]).includes(topic)
  );
  const episodes = allEpisodes.filter((ep) =>
    (ep.topics as readonly string[]).includes(topic)
  );
  return { blogs, episodes };
}
