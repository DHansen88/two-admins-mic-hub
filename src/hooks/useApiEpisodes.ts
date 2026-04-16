import { useQuery } from "@tanstack/react-query";
import { getAdminApiBase, getAdminAuthHeaders } from "@/lib/admin-auth";
import type { Episode } from "@/data/episodeData";

const API_BASE = getAdminApiBase();

interface ApiEpisodeRaw {
  number?: number | string;
  title?: string;
  slug?: string;
  description?: string;
  duration?: string;
  date?: string;
  topics?: string[];
  host?: string;
  riversideEmbedUrl?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  platformLinks?: Episode["platformLinks"];
  clips?: Episode["clips"];
  transcript?: string;
  showNotes?: string[];
  guest?: Episode["guest"];
  status?: string;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function rawToEpisode(raw: ApiEpisodeRaw): Episode {
  const platformLinks =
    raw.platformLinks && !Array.isArray(raw.platformLinks) && Object.keys(raw.platformLinks).length > 0
      ? raw.platformLinks
      : undefined;

  const guest =
    raw.guest && typeof raw.guest === "object" && raw.guest.name
      ? {
          name: raw.guest.name,
          title: raw.guest.title || undefined,
          image: raw.guest.image || undefined,
          bio: raw.guest.bio || undefined,
          websiteUrl: raw.guest.websiteUrl || undefined,
          linkedinUrl: raw.guest.linkedinUrl || undefined,
          instagramUrl: raw.guest.instagramUrl || undefined,
          xUrl: raw.guest.xUrl || undefined,
          facebookUrl: raw.guest.facebookUrl || undefined,
        }
      : undefined;

  return {
    number: Number(raw.number) || 0,
    title: raw.title?.trim() || "Untitled",
    slug: raw.slug?.trim() || "",
    description: raw.description || "",
    duration: raw.duration || "",
    date: formatDate(raw.date || ""),
    topics: Array.isArray(raw.topics) ? raw.topics : [],
    host: raw.host || undefined,
    riversideEmbedUrl: raw.riversideEmbedUrl || undefined,
    thumbnailUrl: raw.thumbnailUrl || "/placeholder.svg",
    audioUrl: raw.audioUrl || undefined,
    platformLinks,
    clips: raw.clips || undefined,
    transcript: raw.transcript || undefined,
    showNotes: raw.showNotes || undefined,
    guest,
  };
}

async function fetchPublicEpisodes(): Promise<Episode[]> {
  try {
    const res = await fetch(`${API_BASE}/content.php?action=public-list-episodes`);
    if (!res.ok) return [];

    const data = await res.json();
    const episodes: ApiEpisodeRaw[] = data.episodes ?? [];

    return Array.from(
      new Map(
        episodes
          .filter((ep) => (ep.slug || "").trim() && (ep.title || "").trim())
          .map((ep) => [String(ep.slug).trim(), ep]),
      ).values(),
    )
      .map(rawToEpisode)
      .sort((a, b) => b.number - a.number);
  } catch {
    return [];
  }
}

async function fetchPublicEpisode(slug: string): Promise<Episode | null> {
  try {
    const res = await fetch(`${API_BASE}/content.php?action=public-get-episode&slug=${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.episode) return null;
    return rawToEpisode(data.episode as ApiEpisodeRaw);
  } catch {
    return null;
  }
}

async function fetchAdminEpisodes(): Promise<(Episode & { status?: string })[]> {
  try {
    const res = await fetch(`${API_BASE}/content.php?action=list-episodes`, {
      credentials: "include",
      headers: getAdminAuthHeaders(),
    });
    if (!res.ok) return [];

    const data = await res.json();
    const episodes: ApiEpisodeRaw[] = data.episodes ?? [];

    return Array.from(
      new Map(
        episodes
          .filter((ep) => (ep.title || "").trim())
          .map((ep) => [String(ep.number || ep.slug || ""), ep]),
      ).values(),
    )
      .map((ep) => ({ ...rawToEpisode(ep), status: ep.status }))
      .sort((a, b) => b.number - a.number);
  } catch {
    return [];
  }
}

export function useApiEpisodes() {
  return useQuery({
    queryKey: ["public-episodes"],
    queryFn: fetchPublicEpisodes,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useApiEpisodeBySlug(slug: string) {
  return useQuery({
    queryKey: ["public-episode", slug],
    queryFn: () => fetchPublicEpisode(slug),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: !!slug,
  });
}

export function useAdminEpisodes() {
  return useQuery({
    queryKey: ["admin-episodes"],
    queryFn: fetchAdminEpisodes,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
