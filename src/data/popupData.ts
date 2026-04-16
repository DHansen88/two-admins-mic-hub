import { type PopupContentBlock } from "./popupBlockTypes";
import { getAdminApiBase, getAdminAuthHeaders } from "@/lib/admin-auth";

export interface PopupConfig {
  id: string;
  title: string;
  active: boolean;
  delaySeconds: number;
  content: string; // legacy HTML / embed code
  contentBlocks?: PopupContentBlock[]; // rich block-based content (preferred)
  displayPages: "homepage" | "all" | string;
  cooldownDays: number;
}

const LS_KEY = "tam_popups";

const SEED: PopupConfig[] = [
  {
    id: "popup-001",
    title: "Newsletter Signup",
    active: true,
    delaySeconds: 2,
    content: "",
    contentBlocks: [
      {
        type: "newsletter" as const,
        id: "pb-seed-newsletter",
        heading: "Two Admins And A Mic",
        description: "The podcast celebrating the power, creativity, and leadership of administrative professionals. One real story at a time.",
        buttonText: "Subscribe",
        showConantLeadership: true,
        conantLeadershipLabel: "Subscribe to the ConantLeadership Newsletter.",
      },
    ],
    displayPages: "homepage",
    cooldownDays: 7,
  },
];

/* ── Reactive store ── */
type Listener = () => void;
const listeners: Set<Listener> = new Set();
function notify() { listeners.forEach((fn) => fn()); }

export function subscribePopups(fn: Listener) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function loadLocal(): PopupConfig[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return SEED;
}

function saveLocal(data: PopupConfig[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

let _popups = loadLocal();
let _apiLoaded = false;

/* ── API helpers ── */
const apiBase = getAdminApiBase();

async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    const res = await fetch(`${apiBase}/${endpoint}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...getAdminAuthHeaders(), ...options.headers },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fetch popups from API — used by admin and public frontend */
export async function fetchPopupsFromApi(requireAuth = false): Promise<PopupConfig[] | null> {
  const action = requireAuth ? "list" : "public-list";
  const data = await apiCall(`popups.php?action=${action}`);
  if (data?.popups && Array.isArray(data.popups)) {
    return data.popups;
  }
  return null;
}

/** Load popups from API and update local cache */
export async function loadPopupsFromApi(requireAuth = false): Promise<void> {
  const apiPopups = await fetchPopupsFromApi(requireAuth);
  if (apiPopups) {
    _popups = apiPopups;
    saveLocal(apiPopups);
    _apiLoaded = true;
    notify();
  }
}

export function getPopups(): PopupConfig[] { return _popups; }

export function getActivePopupForPath(path: string): PopupConfig | undefined {
  return _popups.find((p) => {
    if (!p.active) return false;
    if (p.displayPages === "all") return true;
    if (p.displayPages === "homepage") return path === "/";
    return path === p.displayPages;
  });
}

export async function addPopup(popup: Omit<PopupConfig, "id">) {
  const newP: PopupConfig = { ...popup, id: `popup-${Date.now()}` };
  _popups = [..._popups, newP];
  saveLocal(_popups);
  notify();

  // Sync to API
  await apiCall("popups.php?action=save", {
    method: "POST",
    body: JSON.stringify(newP),
  });

  return newP;
}

export async function updatePopup(id: string, updates: Partial<PopupConfig>) {
  _popups = _popups.map((p) => (p.id === id ? { ...p, ...updates } : p));
  saveLocal(_popups);
  notify();

  // Sync to API
  const updated = _popups.find((p) => p.id === id);
  if (updated) {
    await apiCall("popups.php?action=save", {
      method: "POST",
      body: JSON.stringify(updated),
    });
  }
}

export async function deletePopup(id: string) {
  _popups = _popups.filter((p) => p.id !== id);
  saveLocal(_popups);
  notify();

  // Sync to API
  await apiCall("popups.php?action=delete", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
}

/* ── Cooldown helpers ── */
const SEEN_KEY = "tam_popup_seen";

function getSeenMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function hasSeenPopup(id: string, cooldownDays: number): boolean {
  if (cooldownDays === 0) {
    return sessionStorage.getItem(`popup_seen_${id}`) === "1";
  }
  const seen = getSeenMap();
  const lastSeen = seen[id];
  if (!lastSeen) return false;
  const daysSince = (Date.now() - lastSeen) / (1000 * 60 * 60 * 24);
  return daysSince < cooldownDays;
}

export function markPopupSeen(id: string, cooldownDays: number) {
  if (cooldownDays === 0) {
    sessionStorage.setItem(`popup_seen_${id}`, "1");
    return;
  }
  const seen = getSeenMap();
  seen[id] = Date.now();
  localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
}

// Auto-load from API on startup (public, no auth required)
loadPopupsFromApi(false);
