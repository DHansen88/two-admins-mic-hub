/**
 * Unified Topic/Tag system shared across Blog posts and Podcast episodes.
 * Now powered by the centralized tag management system.
 */
import { getTagNames, type Tag } from './tags';

// Dynamic: always reflects current tags from the tag manager
export const SHARED_TOPICS = getTagNames();

export type SharedTopic = string;

export type { Tag };
export { getTagNames, getAllTags, getTagByName, getTagBySlug } from './tags';
