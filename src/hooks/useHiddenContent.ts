/**
 * Fetches hidden (non-published) content IDs from the PHP API
 * so the public website can filter them out at runtime.
 */

import { useQuery } from "@tanstack/react-query";
import { getAdminApiBase } from "@/lib/admin-auth";

interface HiddenContentIds {
  blogs: string[];
  episodes: string[];
}

async function fetchHiddenIds(): Promise<HiddenContentIds> {
  const base = getAdminApiBase();
  try {
    const res = await fetch(`${base}/content.php?action=hidden-ids`);
    if (!res.ok) return { blogs: [], episodes: [] };
    const data = await res.json();
    return {
      blogs: data.blogs ?? [],
      episodes: data.episodes ?? [],
    };
  } catch {
    // API unreachable (preview env) — fall back to empty
    return { blogs: [], episodes: [] };
  }
}

export function useHiddenContent() {
  return useQuery({
    queryKey: ["hidden-content-ids"],
    queryFn: fetchHiddenIds,
    staleTime: 60_000, // refresh every 60s
    refetchOnWindowFocus: true,
  });
}
