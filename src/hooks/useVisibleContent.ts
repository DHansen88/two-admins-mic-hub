/**
 * Hooks that return only visible (non-hidden) blogs and episodes.
 * Blogs and episodes: fetched live from the PHP API so admin changes apply instantly.
 */

import { useMemo } from "react";
import { useHiddenContent } from "./useHiddenContent";
import { useApiBlogs, useApiBlogBySlug } from "./useApiBlogs";
import { useApiEpisodes, useApiEpisodeBySlug } from "./useApiEpisodes";
import { allEpisodes as staticEpisodes, getEpisodeBySlug as staticGetEpisodeBySlug } from "@/data/episodeData";
import type { BlogPost } from "@/lib/content-loader";
import type { Episode } from "@/data/episodeData";

export function useVisibleBlogs() {
  const { data: apiBlogs } = useApiBlogs();

  return useMemo(() => {
    return apiBlogs ?? [];
  }, [apiBlogs]);
}

export function useVisibleEpisodes() {
  const { data: hidden } = useHiddenContent();
  const { data: apiEpisodes } = useApiEpisodes();
  return useMemo(() => {
    const baseEpisodes = (apiEpisodes && apiEpisodes.length > 0) ? apiEpisodes : staticEpisodes;
    if (!hidden || hidden.episodes.length === 0) return baseEpisodes;
    return baseEpisodes.filter(
      (ep) => !hidden.episodes.includes(String(ep.number)) && !hidden.episodes.includes(ep.slug)
    );
  }, [apiEpisodes, hidden]);
}

export function useVisibleBlogBySlug(slug: string): { post: BlogPost | undefined; isLoading: boolean } {
  const { data: apiBlog, isLoading } = useApiBlogBySlug(slug);

  const post = useMemo(() => {
    return apiBlog ?? undefined;
  }, [apiBlog]);

  return { post, isLoading };
}

export function useVisibleEpisodeBySlug(slug: string): Episode | undefined {
  const { data: hidden } = useHiddenContent();
  const { data: apiEpisode } = useApiEpisodeBySlug(slug);
  const ep = apiEpisode ?? staticGetEpisodeBySlug(slug);
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
