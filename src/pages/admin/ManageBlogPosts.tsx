import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { allBlogsUnfiltered } from "@/data/blogData";
import { getAllContentMeta, getEffectiveStatus, removeContentMeta, processScheduledContent, setContentStatus as setContentStatusFn, type ContentStatus } from "@/lib/content-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Copy, Trash2, FileText, RotateCcw, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusConfig: Record<ContentStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "Scheduled", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  published: { label: "Published", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  trashed: { label: "Trashed", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

type FilterStatus = "all" | ContentStatus;

const ManageBlogPosts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"trash" | "restore" | "permanent-delete" | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    processScheduledContent();
  }, []);

  const drafts = getAllContentMeta("blog").filter(
    (m) => m.status === "draft" && !allBlogsUnfiltered.some((b) => b.slug === m.id)
  );

  const trashedMeta = getAllContentMeta("blog").filter((m) => m.status === "trashed");

  const blogs = [
    ...allBlogsUnfiltered.map((b) => ({
      id: b.slug,
      title: b.title,
      author: b.author.name,
      date: b.date || "",
      topics: b.topics || [],
      status: getEffectiveStatus("blog", b.slug, true),
    })),
    ...drafts.map((d) => {
      const raw = localStorage.getItem(`draft_blog-${d.id}`);
      const data = raw ? JSON.parse(raw) : {};
      return {
        id: d.id,
        title: data.title || `Untitled Draft`,
        author: data.author || "Unknown",
        date: data.publishDate || d.createdAt?.split("T")[0] || "",
        topics: data.selectedTopics || [],
        status: "draft" as ContentStatus,
      };
    }),
    ...trashedMeta.map((d) => {
      const raw = localStorage.getItem(`draft_blog-${d.id}`);
      const data = raw ? JSON.parse(raw) : {};
      const existing = allBlogsUnfiltered.find((b) => b.slug === d.id);
      return {
        id: d.id,
        title: existing?.title || data.title || `Untitled`,
        author: existing?.author.name || data.author || "Unknown",
        date: existing?.date || data.publishDate || "",
        topics: existing?.topics || data.selectedTopics || [],
        status: "trashed" as ContentStatus,
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = filter === "all"
    ? blogs.filter((b) => b.status !== "trashed")
    : blogs.filter((b) => b.status === filter);

  const isTrashView = filter === "trashed";

  const handleMoveToTrash = (id: string) => {
    setContentStatusFn("blog", id, "trashed");
    setDeleteTarget(null);
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    toast({ title: "Blog post moved to trash" });
    forceUpdate((n) => n + 1);
  };

  const handleRestore = (id: string) => {
    setContentStatusFn("blog", id, "draft");
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    toast({ title: "Blog post restored as draft" });
    forceUpdate((n) => n + 1);
  };

  const handlePermanentDelete = (id: string) => {
    const existsInStatic = allBlogsUnfiltered.some((b) => b.slug === id);
    if (existsInStatic) {
      // Keep trashed status so it doesn't reappear as "published"
      setContentStatusFn("blog", id, "trashed");
    } else {
      removeContentMeta("blog", id);
    }
    localStorage.removeItem(`draft_blog-${id}`);
    setPermanentDeleteTarget(null);
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    toast({ title: "Blog post permanently deleted" });
    forceUpdate((n) => n + 1);
  };

  const handleBulkConfirm = () => {
    const ids = Array.from(selected);
    if (bulkAction === "trash") {
      ids.forEach((id) => setContentStatusFn("blog", id, "trashed"));
      toast({ title: `${ids.length} post(s) moved to trash` });
    } else if (bulkAction === "restore") {
      ids.forEach((id) => setContentStatusFn("blog", id, "draft"));
      toast({ title: `${ids.length} post(s) restored` });
    } else if (bulkAction === "permanent-delete") {
      ids.forEach((id) => {
        removeContentMeta("blog", id);
        localStorage.removeItem(`draft_blog-${id}`);
      });
      toast({ title: `${ids.length} post(s) permanently deleted` });
    }
    setSelected(new Set());
    setBulkAction(null);
    forceUpdate((n) => n + 1);
  };

  const handleDuplicate = (blog: typeof blogs[0]) => {
    const newSlug = `${blog.id}-copy-${Date.now()}`;
    const draftData = {
      title: `${blog.title} (Copy)`,
      publishDate: new Date().toISOString().split("T")[0],
      selectedTopics: blog.topics,
      author: blog.author,
    };
    localStorage.setItem(`draft_blog-${newSlug}`, JSON.stringify(draftData));
    setContentStatusFn("blog", newSlug, "draft");
    toast({ title: "Blog post duplicated as draft" });
    navigate(`/admin/publish-blog?edit=${newSlug}`);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((b) => b.id)));
    }
  };

  const filters: { label: string; value: FilterStatus }[] = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Published", value: "published" },
    { label: "Trash", value: "trashed" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            Blog Posts
          </h1>
          <p className="text-muted-foreground mt-1">Manage all blog articles</p>
        </div>
        <Button asChild>
          <Link to="/admin/publish-blog">
            <Plus className="h-4 w-4 mr-2" />
            Add Blog Post
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilter(f.value); setSelected(new Set()); }}
          >
            {f.label}
            {f.value === "trashed" && trashedMeta.length > 0 && (
              <span className="ml-1.5 text-xs bg-destructive/20 text-destructive rounded-full px-1.5">
                {trashedMeta.length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
          <span className="text-sm font-medium">{selected.size} selected</span>
          {isTrashView ? (
            <>
              <Button size="sm" variant="outline" onClick={() => setBulkAction("restore")}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Restore
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setBulkAction("permanent-delete")}>
                <XCircle className="h-3.5 w-3.5 mr-1.5" /> Delete Forever
              </Button>
            </>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => setBulkAction("trash")}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Move to Trash
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-36">Author</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-32">Publish Date</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  {isTrashView ? "Trash is empty." : "No blog posts found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((blog) => {
                const cfg = statusConfig[blog.status];
                return (
                  <TableRow key={blog.id} className={selected.has(blog.id) ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(blog.id)}
                        onCheckedChange={() => toggleSelect(blog.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{blog.title}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{blog.author}</TableCell>
                    <TableCell>
                      <Badge className={cfg.className}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{blog.date}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {blog.topics.slice(0, 3).map((t) => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {t}
                          </span>
                        ))}
                        {blog.topics.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{blog.topics.length - 3}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isTrashView ? (
                            <>
                              <DropdownMenuItem onClick={() => handleRestore(blog.id)}>
                                <RotateCcw className="h-4 w-4 mr-2" /> Restore
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setPermanentDeleteTarget(blog.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" /> Delete Forever
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem onClick={() => navigate(`/admin/publish-blog?edit=${blog.id}`)}>
                                <Pencil className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(blog)}>
                                <Copy className="h-4 w-4 mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteTarget(blog.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Move to Trash
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Move to Trash dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to trash?</AlertDialogTitle>
            <AlertDialogDescription>This blog post will be moved to trash. You can restore it later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && handleMoveToTrash(deleteTarget)}>
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete dialog */}
      <AlertDialog open={!!permanentDeleteTarget} onOpenChange={(o) => !o && setPermanentDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The blog post will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => permanentDeleteTarget && handlePermanentDelete(permanentDeleteTarget)}
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action dialog */}
      <AlertDialog open={!!bulkAction} onOpenChange={(o) => !o && setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === "trash" && `Move ${selected.size} post(s) to trash?`}
              {bulkAction === "restore" && `Restore ${selected.size} post(s)?`}
              {bulkAction === "permanent-delete" && `Permanently delete ${selected.size} post(s)?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === "permanent-delete"
                ? "This action cannot be undone."
                : bulkAction === "trash"
                  ? "You can restore them from trash later."
                  : "Items will be restored as drafts."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={bulkAction === "permanent-delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={handleBulkConfirm}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageBlogPosts;
