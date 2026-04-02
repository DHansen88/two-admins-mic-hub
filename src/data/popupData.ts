import { type PopupContentBlock } from "./popupBlockTypes";

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
    content: `<iframe src="https://subscribe-forms.beehiiv.com/c5ba8b8c-515d-45fc-87c1-fb21106b1e0a" class="beehiiv-embed" frameborder="0" scrolling="no" style="width:100%;max-width:959px;height:508px;margin:0;border-radius:0;background-color:transparent;"></iframe>`,
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

function load(): PopupConfig[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return SEED;
}

function save(data: PopupConfig[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

let _popups = load();

export function getPopups(): PopupConfig[] { return _popups; }

export function getActivePopupForPath(path: string): PopupConfig | undefined {
  return _popups.find((p) => {
    if (!p.active) return false;
    if (p.displayPages === "all") return true;
    if (p.displayPages === "homepage") return path === "/";
    return path === p.displayPages;
  });
}

export function addPopup(popup: Omit<PopupConfig, "id">) {
  const newP: PopupConfig = { ...popup, id: `popup-${Date.now()}` };
  _popups = [..._popups, newP];
  save(_popups);
  notify();
  return newP;
}

export function updatePopup(id: string, updates: Partial<PopupConfig>) {
  _popups = _popups.map((p) => (p.id === id ? { ...p, ...updates } : p));
  save(_popups);
  notify();
}

export function deletePopup(id: string) {
  _popups = _popups.filter((p) => p.id !== id);
  save(_popups);
  notify();
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
    // session-only: use sessionStorage
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
