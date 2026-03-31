/**
 * Hooks that return only visible (non-hidden) blogs and episodes.
 * Blogs: fetched live from the PHP API so admin changes apply instantly.
 * Episodes: still use static data + hidden-IDs filter.
 */

import { useMemo } from "react";
import { useHiddenContent } from "./useHiddenContent";
import { useApiBlogs, useApiBlogBySlug } from "./useApiBlogs";
import { allBlogs as staticBlogs, getRelatedPosts as staticGetRelatedPosts } from "@/data/blogData";
import { allEpisodes as staticEpisodes, getEpisodeBySlug as staticGetEpisodeBySlug } from "@/data/episodeData";
import type { BlogPost } from "@/lib/content-loader";
import type { Episode } from "@/data/episodeData";

export function useVisibleBlogs() {
  const { data: apiBlogs, isError } = useApiBlogs();
  // Fall back to static data filtered by hidden-ids if API fails
  const { data: hidden } = useHiddenContent();

  return useMemo(() => {
    // If API returned data, use it (already filtered server-side)
    if (apiBlogs && apiBlogs.length > 0) return apiBlogs;
    // Fallback: static data minus hidden
    if (!hidden || hidden.blogs.length === 0) return staticBlogs;
    return staticBlogs.filter((b) => !hidden.blogs.includes(b.slug));
  }, [apiBlogs, hidden]);
}

export function useVisibleEpisodes() {
  const { data: hidden } = useHiddenContent();
  return useMemo(() => {
    if (!hidden || hidden.episodes.length === 0) return staticEpisodes;
    return staticEpisodes.filter(
      (ep) => !hidden.episodes.includes(String(ep.number)) && !hidden.episodes.includes(ep.slug)
    );
  }, [hidden]);
}

export function useVisibleBlogBySlug(slug: string): { post: BlogPost | undefined; isLoading: boolean } {
  const { data: apiBlog, isLoading } = useApiBlogBySlug(slug);
  const { data: hidden } = useHiddenContent();

  const post = useMemo(() => {
    // Prefer API data
    if (apiBlog) return apiBlog;
    // Fallback to static
    const staticPost = staticBlogs.find((b) => b.slug === slug);
    if (!staticPost) return undefined;
    if (hidden?.blogs.includes(slug)) return undefined;
    return staticPost;
  }, [apiBlog, hidden, slug]);

  return { post, isLoading };
}

export function useVisibleEpisodeBySlug(slug: string): Episode | undefined {
  const { data: hidden } = useHiddenContent();
  const ep = staticGetEpisodeBySlug(slug);
  if (!ep) return undefined;
  if (hidden?.episodes.includes(String(ep.number)) || hidden?.episodes.includes(ep.slug)) return undefined;
  return ep;
}

export function useVisibleRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const blogs = useVisibleBlogs();
  return useMemo(() => {
    const current = blogs.find((b) => b.slug === slug);
    if (!current) return blogs.slice(0, limit);
    return blogs
      .filter((b) => b.slug !== slug)
      .map((b) => ({
        blog: b,
        score: b.topics.filter((t) => current.topics.includes(t)).length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.blog);
  }, [blogs, slug, limit]);
}

export function useVisibleRelatedEpisodes(episode: Episode | undefined, count = 4): Episode[] {
  const episodes = useVisibleEpisodes();
  return useMemo(() => {
    if (!episode) return [];
    return episodes
      .filter((ep) => ep.number !== episode.number)
      .map((ep) => ({
        ep,
        score: ep.topics.filter((t) => episode.topics.includes(t)).length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(({ ep }) => ep);
  }, [episodes, episode, count]);
}

export function useVisibleContentByTopic(topic: string) {
  const blogs = useVisibleBlogs();
  const episodes = useVisibleEpisodes();
  return useMemo(() => ({
    blogs: blogs.filter((b) => (b.topics as readonly string[]).includes(topic)),
    episodes: episodes.filter((ep) => (ep.topics as readonly string[]).includes(topic)),
  }), [blogs, episodes, topic]);
}

export function useVisibleRelatedEpisodesForBlog(blogSlug: string, count = 3): Episode[] {
  const blogs = useVisibleBlogs();
  const episodes = useVisibleEpisodes();
  return useMemo(() => {
    const blog = blogs.find((b) => b.slug === blogSlug);
    if (!blog) return [];
    return episodes
      .map((ep) => ({
        ep,
        score: ep.topics.filter((t) => (blog.topics as readonly string[]).includes(t)).length,
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(({ ep }) => ep);
  }, [blogs, episodes, blogSlug, count]);
}

export function useVisibleRelatedBlogsForEpisode(episodeSlug: string, count = 3): BlogPost[] {
  const blogs = useVisibleBlogs();
  const episodes = useVisibleEpisodes();
  return useMemo(() => {
    const episode = episodes.find((ep) => ep.slug === episodeSlug);
    if (!episode) return [];
    return blogs
      .map((blog) => ({
        blog,
        score: blog.topics.filter((t) => (episode.topics as readonly string[]).includes(t)).length,
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(({ blog }) => blog);
  }, [blogs, episodes, episodeSlug, count]);
}
