import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  type Tag,
} from "@/data/tags";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PRESET_COLORS = [
  "199 62% 28%",
  "160 60% 35%",
  "25 85% 55%",
  "250 55% 50%",
  "340 65% 50%",
  "140 50% 40%",
  "210 60% 45%",
  "45 80% 50%",
  "0 70% 50%",
  "280 60% 55%",
  "180 50% 40%",
  "30 90% 50%",
];

const ManageTags = () => {
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    setTags(getAllTags());
  }, []);

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
    const updated = addTag({ name, slug, color: newColor });
    setTags(updated);
    setNewName("");
    setNewColor(PRESET_COLORS[0]);
    setShowAddDialog(false);
    toast({ title: `Tag "${name}" created` });
  };

  const startEdit = (tag: Tag) => {
    setEditingSlug(tag.slug);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const saveEdit = () => {
    if (!editingSlug || !editName.trim()) return;
    const newSlug = generateTagSlug(editName.trim());
    const updated = updateTag(editingSlug, {
      name: editName.trim(),
      slug: newSlug,
      color: editColor,
    });
    setTags(updated);
    setEditingSlug(null);
    toast({ title: "Tag updated" });
  };

  const handleDelete = (slug: string) => {
    const updated = deleteTag(slug);
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Tag Name</label>
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
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Color</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        newColor === color
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: `hsl(${color})` }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Preview:</span>
                <span
                  className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `hsl(${newColor} / 0.15)`,
                    color: `hsl(${newColor})`,
                  }}
                >
                  {newName.trim() || "Tag Name"}
                </span>
              </div>
              <Button onClick={handleAdd} className="w-full">
                Create Tag
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tags count */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" />
          {tags.length} tag{tags.length !== 1 ? "s" : ""} total
        </span>
      </div>

      {/* Tags grid */}
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
                /* Edit mode */
                <div className="space-y-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-sm"
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setEditColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          editColor === color
                            ? "border-foreground scale-110"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: `hsl(${color})` }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit} className="gap-1">
                      <Check className="h-3.5 w-3.5" /> Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingSlug(null)}
                      className="gap-1"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: `hsl(${tag.color})` }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {tag.name}
                      </p>
                      <p className="text-xs text-muted-foreground">/{tag.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full mr-2"
                      style={{
                        backgroundColor: `hsl(${tag.color} / 0.15)`,
                        color: `hsl(${tag.color})`,
                      }}
                    >
                      {tag.name}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => startEdit(tag)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {deleteConfirm === tag.slug ? (
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8"
                          onClick={() => handleDelete(tag.slug)}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setDeleteConfirm(null)}
                        >
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
