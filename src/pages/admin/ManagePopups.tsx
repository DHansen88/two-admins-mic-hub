import { useState, useSyncExternalStore } from "react";
import {
  getPopups,
  subscribePopups,
  addPopup,
  updatePopup,
  deletePopup,
  type PopupConfig,
} from "@/data/popupData";
import { type PopupContentBlock } from "@/data/popupBlockTypes";
import PopupBlockEditor from "@/components/PopupBlockEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";

function usePopups() {
  return useSyncExternalStore(subscribePopups, getPopups, getPopups);
}

const DISPLAY_OPTIONS: { value: PopupConfig["displayPages"]; label: string }[] = [
  { value: "homepage", label: "Homepage Only" },
  { value: "all", label: "All Pages" },
  { value: "/merch", label: "Merch Page" },
  { value: "/blog", label: "Blog Page" },
  { value: "/episodes", label: "Episodes Page" },
  { value: "/contact", label: "Contact Page" },
];

const blankPopup = (): Omit<PopupConfig, "id"> => ({
  title: "",
  active: true,
  delaySeconds: 2,
  content: "",
  contentBlocks: [],
  displayPages: "homepage",
  cooldownDays: 7,
});

const ManagePopups = () => {
  const popups = usePopups();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(blankPopup());

  const startNew = () => {
    setForm(blankPopup());
    setEditing("new");
  };

  const startEdit = (p: PopupConfig) => {
    setForm({
      title: p.title,
      active: p.active,
      delaySeconds: p.delaySeconds,
      content: p.content,
      contentBlocks: p.contentBlocks || [],
      displayPages: p.displayPages,
      cooldownDays: p.cooldownDays,
    });
    setEditing(p.id);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editing === "new") {
      addPopup(form);
    } else if (editing) {
      updatePopup(editing, form);
    }
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this popup?")) {
      deletePopup(id);
      if (editing === id) setEditing(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Popups</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {popups.length} popup{popups.length !== 1 && "s"} configured
          </p>
        </div>
        <Button onClick={startNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add Popup
        </Button>
      </div>

      {/* Form */}
      {editing && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5 animate-fade-in">
          <h2 className="font-display font-bold text-lg">
            {editing === "new" ? "New Popup" : "Edit Popup"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Popup Title *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Newsletter Signup"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Delay (seconds)</label>
              <Input
                type="number"
                min={0}
                value={form.delaySeconds}
                onChange={(e) => setForm({ ...form, delaySeconds: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Display On</label>
              <select
                value={form.displayPages}
                onChange={(e) => setForm({ ...form, displayPages: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
              >
                {DISPLAY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Cooldown (days)</label>
              <Input
                type="number"
                min={0}
                value={form.cooldownDays}
                onChange={(e) => setForm({ ...form, cooldownDays: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">0 = once per session</p>
            </div>
          </div>

          <PopupBlockEditor
            blocks={form.contentBlocks || []}
            onChange={(blocks) => setForm({ ...form, contentBlocks: blocks })}
          />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave}>Save Popup</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {popups.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
              <Megaphone className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{p.title}</h3>
                <span
                  className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    p.active
                      ? "bg-accent/15 text-accent"
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {p.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {p.delaySeconds}s delay · {p.displayPages === "homepage" ? "Homepage" : p.displayPages === "all" ? "All Pages" : p.displayPages} · Every {p.cooldownDays} day{p.cooldownDays !== 1 && "s"}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(p)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagePopups;
