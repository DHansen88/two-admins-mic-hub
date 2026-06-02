import { getAdminApiBase, getAdminAuthHeaders, canUseAdminFallback } from "@/lib/admin-auth";

export interface BeehiivStatus {
  slug: string;
  sent: boolean;
  beehiiv_post_id: string | null;
  beehiiv_url: string | null;
  sent_at: string | null;
}

export interface BeehiivSendResult {
  ok: true;
  beehiiv_post_id: string | null;
  beehiiv_url: string | null;
  sent_at: string;
}

export class BeehiivPreviewUnavailable extends Error {
  constructor() {
    super("Beehiiv send is only available on the live site (PHP backend required).");
    this.name = "BeehiivPreviewUnavailable";
  }
}

async function beehiivCall(path: string, options: RequestInit = {}): Promise<any> {
  const base = getAdminApiBase();
  const res = await fetch(`${base}/beehiiv-publish.php${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAdminAuthHeaders(options.headers || {}),
    },
    credentials: "include",
  });

  const text = await res.text();
  // PHP source returned (preview env without PHP execution)
  if (text.trim().startsWith("<?php")) {
    throw new BeehiivPreviewUnavailable();
  }

  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

export async function getBeehiivStatus(slug: string): Promise<BeehiivStatus | null> {
  if (canUseAdminFallback()) return null;
  try {
    return await beehiivCall(`?action=status&slug=${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof BeehiivPreviewUnavailable) return null;
    throw e;
  }
}

export async function sendBlogToBeehiiv(slug: string): Promise<BeehiivSendResult> {
  if (canUseAdminFallback()) {
    throw new BeehiivPreviewUnavailable();
  }
  return beehiivCall(`?action=send`, {
    method: "POST",
    body: JSON.stringify({ slug }),
  });
}