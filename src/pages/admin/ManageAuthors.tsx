import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  UserPlus,
  Pencil,
  Trash2,
  Save,
  X,
  Upload,
  Linkedin,
  Globe,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAuthors,
  saveAuthor,
  deleteAuthor,
  uploadHeadshot,
  type AuthorProfile,
} from "@/lib/author-manager";

const emptyAuthor: Omit<AuthorProfile, "id"> & { id?: string } = {
  name: "",
  role: "",
  bio: "",
  avatar: "",
  linkedin: "",
  website: "",
};

const ManageAuthors = () => {
  const { toast } = useToast();
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(Partial<AuthorProfile> & { name: string }) | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await fetchAuthors();
    setAuthors(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStartNew = () => {
    setEditing({ ...emptyAuthor, name: "" });
    setIsNew(true);
  };

  const handleStartEdit = (author: AuthorProfile) => {
    setEditing({ ...author });
    setIsNew(false);
  };

  const handleCancel = () => {
    setEditing(null);
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!editing || !editing.name.trim()) {
      toast({ title: "Author name is required", variant: "destructive" });
      return;
    }
    const result = await saveAuthor(editing);
    if (result.success) {
      toast({ title: isNew ? "Author created!" : "Author updated!" });
      setEditing(null);
      setIsNew(false);
      await load();
    } else {
      toast({ title: result.error || "Save failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteAuthor(id);
    if (result.success) {
      toast({ title: "Author deleted" });
      await load();
    } else {
      toast({ title: result.error || "Delete failed", variant: "destructive" });
    }
  };

  const handleHeadshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setUploading(true);
    const authorId = editing.id || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const result = await uploadHeadshot(file, authorId);
    setUploading(false);

    if (result.success && result.url) {
      setEditing({ ...editing, avatar: result.url });
      toast({ title: "Headshot uploaded!" });
    } else {
      toast({ title: result.error || "Upload failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Author Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage author profiles used across blog posts.
          </p>
        </div>
        {!editing && (
          <Button onClick={handleStartNew} className="gap-2">
            <UserPlus className="h-4 w-4" /> Add Author
          </Button>
        )}
      </div>

      {/* Editor Form */}
      {editing && (
        <Card className="bg-card border-primary/30 border-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {isNew ? "Create New Author" : `Edit: ${editing.name}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Headshot Upload */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <Avatar className="h-28 w-28 border-2 border-border">
                  <AvatarImage src={editing.avatar} alt={editing.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {editing.name ? editing.name.split(" ").map((n) => n[0]).join("") : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={uploading}
                    onClick={() => document.getElementById('headshot-upload')?.click()}
                    type="button"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? "Uploading…" : "Upload Headshot"}
                  </Button>
                  <input
                    id="headshot-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleHeadshotUpload}
                    disabled={uploading}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground text-center max-w-[140px]">
                  JPG, PNG or WebP. Max 5 MB.
                </p>
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Name *</label>
                    <Input
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Title / Role</label>
                    <Input
                      value={editing.role || ""}
                      onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                      placeholder="Co-Host & Leadership Coach"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Short Bio</label>
                  <Textarea
                    value={editing.bio || ""}
                    onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                    placeholder="A brief biography that will appear on blog posts…"
                    rows={3}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Headshot URL (or use upload)</label>
                  <Input
                    value={editing.avatar || ""}
                    onChange={(e) => setEditing({ ...editing, avatar: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn (optional)
                    </label>
                    <Input
                      value={editing.linkedin || ""}
                      onChange={(e) => setEditing({ ...editing, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Website (optional)
                    </label>
                    <Input
                      value={editing.website || ""}
                      onChange={(e) => setEditing({ ...editing, website: e.target.value })}
                      placeholder="https://yoursite.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <Button onClick={handleSave} className="gap-1.5">
                <Save className="h-4 w-4" /> {isNew ? "Create Author" : "Save Changes"}
              </Button>
              <Button variant="ghost" onClick={handleCancel} className="gap-1.5">
                <X className="h-4 w-4" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Authors Grid */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading authors…</p>
      ) : authors.length === 0 ? (
        <Card className="bg-card border-border p-8 text-center">
          <p className="text-muted-foreground">No authors yet. Click "Add Author" to get started.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {authors.map((author) => (
            <Card key={author.id} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 shrink-0 border border-border">
                    <AvatarImage src={author.avatar} alt={author.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {author.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground truncate">
                      {author.name}
                    </h3>
                    {author.role && (
                      <p className="text-sm text-primary truncate">{author.role}</p>
                    )}
                    {author.bio && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{author.bio}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {author.linkedin && (
                        <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <Linkedin className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {author.website && (
                        <a href={author.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <Globe className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-4 pt-3 border-t border-border">
                  <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => handleStartEdit(author)}>
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {author.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the author profile. Blog posts referencing this author will show a fallback.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(author.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageAuthors;
