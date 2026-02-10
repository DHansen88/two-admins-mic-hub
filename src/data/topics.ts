/**
 * Unified Topic/Tag system shared across Blog posts and Podcast episodes.
 * Tags are defined once here and reused everywhere.
 */
export const SHARED_TOPICS = [
  "Leadership",
  "Career Growth",
  "Communication",
  "Technology",
  "Admin Life",
  "Wellness",
  "Team Building",
  "Humor & Human Moments",
] as const;

export type SharedTopic = (typeof SHARED_TOPICS)[number];
