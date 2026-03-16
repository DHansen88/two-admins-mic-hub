/**
 * Episode data layer — now powered by file-based content from src/content/podcasts/.
 *
 * TO ADD A NEW EPISODE:
 *   1. Create a .json file in src/content/podcasts/
 *   2. Include: number, title, slug, description, duration, date, topics
 *   3. Optionally include: thumbnailUrl, platformLinks, clips, transcript, showNotes
 *   4. Rebuild & deploy — the episode appears automatically
 */

import { SHARED_TOPICS, type SharedTopic } from './topics';
import {
  loadAllEpisodes,
  type Episode as LoadedEpisode,
  type PlatformLinks,
  type ShareableClip,
} from '@/lib/content-loader';

/** @deprecated Use SharedTopic from topics.ts */
export const TOPICS = SHARED_TOPICS;
export type Topic = SharedTopic;

export type { PlatformLinks, ShareableClip };
export type Episode = LoadedEpisode;

/** All episodes, loaded from src/content/podcasts/ files */
export const allEpisodes: Episode[] = loadAllEpisodes();

export function getEpisodeBySlug(slug: string): Episode | undefined {
  return allEpisodes.find((ep) => ep.slug === slug);
}

export function getRelatedEpisodes(episode: Episode, count = 4): Episode[] {
  return allEpisodes
    .filter((ep) => ep.number !== episode.number)
    .map((ep) => ({
      ep,
      score: ep.topics.filter((t) => episode.topics.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ ep }) => ep);
}
