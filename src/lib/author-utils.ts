import type { Author } from "./content-loader";
import type { AuthorProfile } from "./author-manager";

export type HostAuthorId = "mel" | "diana";

const HOST_ALIAS_WORDS: Record<HostAuthorId, string[]> = {
  mel: ["mel", "melida", "melinda", "goodnight"],
  diana: ["diana", "hansen"],
};

export function normalizeAuthorValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getHostAuthorId(value: string): HostAuthorId | null {
  const normalized = normalizeAuthorValue(value);
  if (!normalized) return null;

  const words = normalized.split(/\s+/);

  for (const [hostId, aliases] of Object.entries(HOST_ALIAS_WORDS) as Array<[HostAuthorId, string[]]>) {
    if (words.some((word) => aliases.includes(word))) {
      return hostId;
    }
  }

  return null;
}

export function findAuthorProfile(key: string, profiles: AuthorProfile[]): AuthorProfile | undefined {
  const normalizedKey = normalizeAuthorValue(key);
  const hostId = getHostAuthorId(key);

  return profiles.find((profile) => normalizeAuthorValue(profile.id) === normalizedKey)
    || profiles.find((profile) => normalizeAuthorValue(profile.name) === normalizedKey)
    || (hostId
      ? profiles.find(
          (profile) => getHostAuthorId(profile.id) === hostId || getHostAuthorId(profile.name) === hostId
        )
      : undefined);
}

export function authorMatchesHost(
  author: Pick<Author, "id" | "name"> | undefined,
  selectedHost: string
): boolean {
  const hostId = getHostAuthorId(selectedHost);
  if (!hostId || !author) return false;

  return getHostAuthorId(author.id || "") === hostId || getHostAuthorId(author.name || "") === hostId;
}
