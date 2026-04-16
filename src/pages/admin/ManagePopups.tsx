import { useState, useEffect, useSyncExternalStore } from "react";
import {
  getPopups,
  subscribePopups,
  addPopup,
  updatePopup,
  deletePopup,
  loadPopupsFromApi,
  type PopupConfig,
} from "@/data/popupData";
import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Megaphone, Eye, X } from "lucide-react";

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
  displayPages: "homepage",
  cooldownDays: 7,
  buttonConfig: undefined,
  newsletterConfig: {
    enabled: true,
    heading: "Join our Community",
    description: "",
    buttonText: "Subscribe",
    showConantLeadership: true,
    conantLeadershipLabel: "Subscribe to the ConantLeadership Newsletter.",
  },
});

const ManagePopups = () => {
  const popups = usePopups();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(blankPopup());
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadPopupsFromApi(true);
  }, []);

  const startNew = () => {
    setForm(blankPopup());
    setEditing("new");
  };

  const startEdit = (p: PopupConfig) => {
    // Migrate old block-based popups to rich text content
    let content = p.content || "";
    if (!content && p.contentBlocks && p.contentBlocks.length > 0) {
      // Convert old blocks to HTML
      content = p.contentBlocks
        .map((b: any) => {
          if (b.type === "richtext") return b.html || "";
          if (b.type === "newsletter") return ""; // handled by newsletterConfig
          return "";
        })
        .filter(Boolean)
        .join("");
    }

    // Extract newsletter config from old blocks if present
    let newsletterConfig = p.newsletterConfig;
    if (!newsletterConfig && p.contentBlocks) {
      const nlBlock = p.contentBlocks.find((b: any) => b.type === "newsletter") as any;
      if (nlBlock) {
        newsletterConfig = {
          enabled: true,
          heading: nlBlock.heading || "Join our Community",
          description: nlBlock.description || "",
          buttonText: nlBlock.buttonText || "Subscribe",
          showConantLeadership: nlBlock.showConantLeadership ?? true,
          conantLeadershipLabel: nlBlock.conantLeadershipLabel || "",
        };
      }
    }

    setForm({
      title: p.title,
      active: p.active,
      delaySeconds: p.delaySeconds,
      content,
      displayPages: p.displayPages,
      cooldownDays: p.cooldownDays,
      buttonConfig: p.buttonConfig,
      newsletterConfig,
    });
    setEditing(p.id);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    // Strip contentBlocks — we now use content (HTML) directly
    const payload = { ...form, contentBlocks: undefined };
    if (editing === "new") {
      addPopup(payload);
    } else if (editing) {
      updatePopup(editing, payload);
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

      {/* Editor Form */}
      {editing && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6 animate-fade-in">
          <h2 className="font-display font-bold text-lg">
            {editing === "new" ? "New Popup" : "Edit Popup"}
          </h2>

          {/* Row 1: Title + Delay */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-primary">Popup Title *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Newsletter Signup"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-primary">Delay (seconds)</label>
              <Input
                type="number"
                min={0}
                value={form.delaySeconds}
                onChange={(e) => setForm({ ...form, delaySeconds: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Row 2: Display On + Cooldown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-primary">Display On</label>
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
              <label className="text-sm font-medium text-primary">Cooldown (days)</label>
              <Input
                type="number"
                min={0}
                value={form.cooldownDays}
                onChange={(e) => setForm({ ...form, cooldownDays: Number(e.target.value) })}
              />
              <p className="text-xs text-primary/70">0 = once per session</p>
            </div>
          </div>

          {/* Rich Text Content Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">Popup Content</label>
            <p className="text-xs text-primary/70">
              Write your popup content below. Use the toolbar for headings, lists, links, images, and formatting.
            </p>
            <RichTextEditor
              content={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
            />
          </div>

          {/* Newsletter: ConantLeadership toggle + label inline */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={!!form.newsletterConfig?.enabled}
                onCheckedChange={(v) =>
                  setForm({
                    ...form,
                    newsletterConfig: v
                      ? {
                          enabled: true,
                          heading: form.newsletterConfig?.heading || "Join our Community",
                          description: form.newsletterConfig?.description || "",
                          buttonText: form.newsletterConfig?.buttonText || "Subscribe",
                          showConantLeadership: form.newsletterConfig?.showConantLeadership ?? true,
                          conantLeadershipLabel:
                            form.newsletterConfig?.conantLeadershipLabel || "Subscribe to the ConantLeadership Newsletter.",
                        }
                      : undefined,
                  })
                }
              />
              Show newsletter signup form
            </label>

            {form.newsletterConfig?.enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-primary">Newsletter Heading</label>
                    <Input
                      value={form.newsletterConfig.heading}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          newsletterConfig: { ...form.newsletterConfig!, heading: e.target.value },
                        })
                      }
                      placeholder="Join our Community"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-primary">Button Text</label>
                    <Input
                      value={form.newsletterConfig.buttonText}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          newsletterConfig: { ...form.newsletterConfig!, buttonText: e.target.value },
                        })
                      }
                      placeholder="Subscribe"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-primary">Newsletter Description</label>
                  <RichTextEditor
                    minHeight="200px"
                    content={form.newsletterConfig.description}
                    onChange={(html) =>
                      setForm({
                        ...form,
                        newsletterConfig: { ...form.newsletterConfig!, description: html },
                      })
                    }
                  />
                  <p className="text-xs text-primary/70">
                    Leave this blank if you only want the heading above the signup form.
                  </p>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={form.newsletterConfig.showConantLeadership}
                    onCheckedChange={(v) =>
                      setForm({
                        ...form,
                        newsletterConfig: { ...form.newsletterConfig!, showConantLeadership: v },
                      })
                    }
                  />
                  Show ConantLeadership checkbox
                </label>

                {form.newsletterConfig.showConantLeadership && (
                  <div className="space-y-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-medium text-primary">Checkbox Label</label>
                    <Input
                      value={form.newsletterConfig.conantLeadershipLabel}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          newsletterConfig: { ...form.newsletterConfig!, conantLeadershipLabel: e.target.value },
                        })
                      }
                      placeholder="Subscribe to the ConantLeadership Newsletter."
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* CTA Button toggle */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Switch
                checked={!!form.buttonConfig?.enabled}
                onCheckedChange={(v) =>
                  setForm({
                    ...form,
                    buttonConfig: {
                      enabled: v,
                      text: form.buttonConfig?.text || "Click Here",
                      url: form.buttonConfig?.url || "",
                      openNewTab: form.buttonConfig?.openNewTab ?? true,
                      style: form.buttonConfig?.style || "primary",
                    },
                  })
                }
              />
              Add CTA Button
            </label>
            {form.buttonConfig?.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Button Text</label>
                  <Input
                    value={form.buttonConfig.text}
                    onChange={(e) =>
                      setForm({ ...form, buttonConfig: { ...form.buttonConfig!, text: e.target.value } })
                    }
                    placeholder="Shop Now"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Button Style</label>
                  <select
                    value={form.buttonConfig.style}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        buttonConfig: { ...form.buttonConfig!, style: e.target.value as "primary" | "secondary" },
                      })
                    }
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                  </select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium">Destination URL / API Endpoint</label>
                  <Input
                    value={form.buttonConfig.url}
                    onChange={(e) =>
                      setForm({ ...form, buttonConfig: { ...form.buttonConfig!, url: e.target.value } })
                    }
                    placeholder="https://... or /merch or /api/endpoint"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <Switch
                    checked={form.buttonConfig.openNewTab}
                    onCheckedChange={(v) =>
                      setForm({ ...form, buttonConfig: { ...form.buttonConfig!, openNewTab: v } })
                    }
                  />
                  Open in new tab
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons — right-aligned */}
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={handleSave}>Save Popup</Button>
            <Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2">
              <Eye className="h-4 w-4" /> Preview
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowPreview(false)}
              className="sticky top-2 right-2 z-20 rounded-full bg-muted/80 hover:bg-muted p-1.5 transition-colors ml-auto mr-2 mt-2"
              aria-label="Close preview"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>

            {form.title && (
              <h2 className="text-xl leading-tight font-display font-bold text-foreground text-center max-w-[340px] mx-auto pt-4 pb-3 px-[10px] font-sans sm:text-2xl">
                {form.title}
              </h2>
            )}

            {/* Rich text content */}
            {form.content && (
              <div
                className="popup-prose px-6 py-4"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            )}

            {/* Button preview */}
            {form.buttonConfig?.enabled && form.buttonConfig.text && (
              <div className="flex justify-center px-6 pb-4">
                <span
                  className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm w-full sm:w-auto ${
                    form.buttonConfig.style === "primary"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-secondary text-secondary-foreground"
                  }`}
                >
                  {form.buttonConfig.text}
                </span>
              </div>
            )}

            {/* Newsletter preview */}
            {form.newsletterConfig?.enabled && (
              <div className="px-6 pb-6 text-center">
                {form.newsletterConfig.heading && (
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate mb-3">
                    {form.newsletterConfig.heading}
                  </h2>
                )}
                {form.newsletterConfig.description && (
                  <div
                    className="popup-description text-muted-foreground mb-4 text-sm max-w-md mx-auto"
                    dangerouslySetInnerHTML={{ __html: form.newsletterConfig.description }}
                  />
                )}
                <div className="max-w-sm mx-auto border border-border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 text-muted-foreground/50 text-sm text-left border-b border-border">First Name</div>
                  <div className="px-4 py-3 text-muted-foreground/50 text-sm text-left border-b border-border">Last Name</div>
                  <div className="px-4 py-3 text-muted-foreground/50 text-sm text-left">Email</div>
                  <div className="h-12 bg-coral flex items-center justify-center text-white font-semibold">
                    {form.newsletterConfig.buttonText}
                  </div>
                </div>
                {form.newsletterConfig.showConantLeadership && (
                  <label className="flex items-center gap-2 mt-4 text-sm text-muted-foreground justify-center cursor-pointer">
                    <input type="checkbox" disabled className="h-4 w-4 rounded border-border" />
                    <span>{form.newsletterConfig.conantLeadershipLabel}</span>
                  </label>
                )}
              </div>
            )}

            {!form.content && !form.buttonConfig?.enabled && !form.newsletterConfig?.enabled && (
              <div className="px-6 py-12 text-center text-muted-foreground text-sm italic">
                No content to preview. Add some text, a button, or newsletter signup.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Popup List */}
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
                    p.active ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"
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
