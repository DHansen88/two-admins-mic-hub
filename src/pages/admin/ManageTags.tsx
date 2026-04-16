import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllTags,
  addTag,
  updateTag,
  deleteTag,
  generateTagSlug,
  getContrastTextColor,
  type Tag,
} from "@/data/tags";
import { getAdminAuthHeaders } from "@/lib/admin-auth";

const API_BASE = (import.meta.env.VITE_ADMIN_API_URL || '').trim() || '/api';

async function syncTagToApi(method: 'POST' | 'PUT' | 'DELETE', tag: Partial<Tag> & { slug: string }) {
  try {
    const url = method === 'POST'
      ? `${API_BASE}/tags.php`
      : `${API_BASE}/tags.php?slug=${encodeURIComponent(tag.slug)}`;
    await fetch(url, {
      method,
      credentials: 'include',
      headers: {
        ...Object.fromEntries(new Headers(getAdminAuthHeaders({ 'Content-Type': 'application/json' })).entries()),
      },
      body: method !== 'DELETE' ? JSON.stringify(tag) : undefined,
    });
  } catch {
    // API sync failed silently — localStorage is primary in admin
  }
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PRESET_BG_COLORS = [
  "#2FBF71", "#FF3B7A", "#FF8A00", "#5A7DFF",
  "#7C5AFF", "#00A6A6", "#E6A817", "#3A8FD6",
  "#33A66E", "#D94F70", "#8B5CF6", "#EC4899",
];

/** Live tag preview pill matching the TopicTag component */
const TagPreview = ({ name, bgColor, textColor, borderColor }: { name: string; bgColor: string; textColor: string; borderColor?: string }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">On light:</span>
      <div className="bg-white rounded-lg px-4 py-3 border border-border">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: bgColor,
            color: textColor,
            padding: "6px 12px",
            borderRadius: "999px",
            border: borderColor ? `1.5px solid ${borderColor}` : "none",
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
            fontWeight: 600,
          }}
        >
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: textColor, opacity: 0.7 }} />
          {name || "Tag Name"}
        </span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">On dark:</span>
      <div className="bg-[#1a3a3a] rounded-lg px-4 py-3">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: bgColor,
            color: textColor,
            padding: "6px 12px",
            borderRadius: "999px",
            border: borderColor ? `1.5px solid ${borderColor}` : "none",
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
            fontWeight: 600,
          }}
        >
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: textColor, opacity: 0.7 }} />
          {name || "Tag Name"}
        </span>
      </div>
    </div>
  </div>
);

/** Color picker row with presets + custom hex input */
const ColorField = ({
  label,
  value,
  onChange,
  presets,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  presets?: string[];
}) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-28 text-sm font-mono"
        placeholder="#2FBF71"
      />
    </div>
    {presets && (
      <div className="flex flex-wrap gap-1.5 pt-1">
        {presets.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`w-6 h-6 rounded-full border-2 transition-transform ${
              value === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    )}
  </div>
);

const ManageTags = () => {
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState("");
  const [newBgColor, setNewBgColor] = useState(PRESET_BG_COLORS[0]);
  const [newTextColor, setNewTextColor] = useState("#ffffff");
  const [newBorderColor, setNewBorderColor] = useState("");
  const [autoText, setAutoText] = useState(true);

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editBgColor, setEditBgColor] = useState("");
  const [editTextColor, setEditTextColor] = useState("");
  const [editBorderColor, setEditBorderColor] = useState("");
  const [editAutoText, setEditAutoText] = useState(true);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    setTags(getAllTags());
  }, []);

  // Auto-contrast for new tag
  useEffect(() => {
    if (autoText) setNewTextColor(getContrastTextColor(newBgColor));
  }, [newBgColor, autoText]);

  // Auto-contrast for editing tag
  useEffect(() => {
    if (editAutoText) setEditTextColor(getContrastTextColor(editBgColor));
  }, [editBgColor, editAutoText]);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) {
      toast({ title: "Tag name is required", variant: "destructive" });
      return;
    }
    const slug = generateTagSlug(name);
    if (tags.some((t) => t.slug === slug)) {
      toast({ title: "A tag with this name already exists", variant: "destructive" });
      return;
    }
    const newTag: Tag = {
      name,
      slug,
      color: "0 0% 0%", // legacy field
      bgColor: newBgColor,
      textColor: newTextColor,
      borderColor: newBorderColor || undefined,
    };
    const updated = addTag(newTag);
    syncTagToApi('POST', newTag);
    setTags(updated);
    setNewName("");
    setNewBgColor(PRESET_BG_COLORS[0]);
    setNewTextColor("#ffffff");
    setNewBorderColor("");
    setAutoText(true);
    setShowAddDialog(false);
    toast({ title: `Tag "${name}" created` });
  };

  const startEdit = (tag: Tag) => {
    setEditingSlug(tag.slug);
    setEditName(tag.name);
    setEditBgColor(tag.bgColor);
    setEditTextColor(tag.textColor);
    setEditBorderColor(tag.borderColor || "");
    setEditAutoText(false);
  };

  const saveEdit = () => {
    if (!editingSlug || !editName.trim()) return;
    const newSlug = generateTagSlug(editName.trim());
    const updatedFields = {
      name: editName.trim(),
      slug: newSlug,
      bgColor: editBgColor,
      textColor: editTextColor,
      borderColor: editBorderColor || undefined,
    };
    const updated = updateTag(editingSlug, updatedFields);
    syncTagToApi('PUT', { ...updatedFields, slug: editingSlug });
    setTags(updated);
    setEditingSlug(null);
    toast({ title: "Tag updated" });
  };

  const handleDelete = (slug: string) => {
    const updated = deleteTag(slug);
    syncTagToApi('DELETE', { slug });
    setTags(updated);
    setDeleteConfirm(null);
    toast({ title: "Tag deleted" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <Tags className="h-7 w-7 text-primary" />
            Tag Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage tags used across blog posts and podcast episodes.
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Tag Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Project Management"
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                {newName.trim() && (
                  <p className="text-xs text-muted-foreground">
                    Slug: {generateTagSlug(newName.trim())}
                  </p>
                )}
              </div>

              <ColorField label="Background Color" value={newBgColor} onChange={setNewBgColor} presets={PRESET_BG_COLORS} />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Text Color</Label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={autoText} onChange={(e) => setAutoText(e.target.checked)} className="rounded" />
                    Auto contrast
                  </label>
                </div>
                {!autoText && <ColorField label="" value={newTextColor} onChange={setNewTextColor} />}
                {autoText && (
                  <p className="text-xs text-muted-foreground">Text color auto-set to {newTextColor} for readability.</p>
                )}
              </div>

              <ColorField label="Border Color (optional)" value={newBorderColor || "#cccccc"} onChange={setNewBorderColor} />

              <div className="space-y-1.5">
                <Label>Preview</Label>
                <TagPreview name={newName.trim()} bgColor={newBgColor} textColor={newTextColor} borderColor={newBorderColor || undefined} />
              </div>

              <Button onClick={handleAdd} className="w-full">Create Tag</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" />
          {tags.length} tag{tags.length !== 1 ? "s" : ""} total
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {tags.map((tag) => (
          <Card
            key={tag.slug}
            className={`bg-card border-border transition-all ${
              editingSlug === tag.slug ? "ring-2 ring-accent" : ""
            }`}
          >
            <CardContent className="p-4">
              {editingSlug === tag.slug ? (
                <div className="space-y-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-sm"
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  />
                  <ColorField label="Background" value={editBgColor} onChange={setEditBgColor} presets={PRESET_BG_COLORS} />
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Text Color</Label>
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                        <input type="checkbox" checked={editAutoText} onChange={(e) => setEditAutoText(e.target.checked)} className="rounded" />
                        Auto
                      </label>
                    </div>
                    {!editAutoText && <ColorField label="" value={editTextColor} onChange={setEditTextColor} />}
                  </div>
                  <ColorField label="Border (optional)" value={editBorderColor || "#cccccc"} onChange={setEditBorderColor} />
                  <TagPreview name={editName} bgColor={editBgColor} textColor={editTextColor} borderColor={editBorderColor || undefined} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit} className="gap-1">
                      <Check className="h-3.5 w-3.5" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingSlug(null)} className="gap-1">
                      <X className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: tag.bgColor }} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{tag.name}</p>
                      <p className="text-xs text-muted-foreground">/{tag.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mr-2"
                      style={{
                        backgroundColor: tag.bgColor,
                        color: tag.textColor,
                        padding: "6px 12px",
                        borderRadius: "999px",
                        border: tag.borderColor ? `1.5px solid ${tag.borderColor}` : "none",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                        fontWeight: 600,
                      }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: tag.textColor, opacity: 0.7 }} />
                      {tag.name}
                    </span>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(tag)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {deleteConfirm === tag.slug ? (
                      <div className="flex gap-1">
                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(tag.slug)}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDeleteConfirm(null)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteConfirm(tag.slug)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {tags.length === 0 && (
        <Card className="bg-card border-dashed border-border">
          <CardContent className="py-12 text-center">
            <Tags className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No tags yet. Create your first tag above.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManageTags;
