import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminApiBase, getAdminAuthHeaders } from "@/lib/admin-auth";
import { fetchAuthors, type AuthorProfile } from "@/lib/author-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Copy, Trash2, FileText, RotateCcw, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API_BASE = getAdminApiBase();

type ContentStatus = "draft" | "scheduled" | "published" | "trashed" | "deleted";
type FilterStatus = "all" | ContentStatus;

const statusConfig: Record<ContentStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "Scheduled", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  published: { label: "Published", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  trashed: { label: "Trashed", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  deleted: { label: "Deleted", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

interface AdminBlog {
  id: string;
  title: string;
  author: string;
  date: string;
  topics: string[];
  status: ContentStatus;
}

async function adminApiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders(options.headers || {}) },
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

function resolveAuthorName(key: string, profiles: AuthorProfile[]): string {
  if (!key) return "Unknown";
  const profile = profiles.find((p) => p.id === key) ||
    profiles.find((p) => p.name.toLowerCase() === key.toLowerCase());
  return profile?.name || key;
}

async function fetchAdminBlogs(): Promise<AdminBlog[]> {
  const [data, profiles] = await Promise.all([
    adminApiCall('content.php?action=list-blogs'),
    fetchAuthors().catch(() => [] as AuthorProfile[]),
  ]);

  const blogs: any[] = data?.blogs ?? [];

  return blogs
    .filter((b: any) => b.slug || b.title)
    .map((b: any) => {
      const authorKey = Array.isArray(b.authors) && b.authors.length > 0
        ? b.authors[0]
        : b.author || "";

      return {
        id: b.slug || b.id || "",
        title: (b.title || "Untitled").trim(),
        author: resolveAuthorName(authorKey, profiles),
        date: b.publish_date || b.date || "",
        topics: Array.isArray(b.tags) ? b.tags : [],
        status: (b.status as ContentStatus) || "published",
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const ManageBlogPosts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<FilterStatus>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"trash" | "restore" | "permanent-delete" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { data: blogs = [], isLoading, error } = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: fetchAdminBlogs,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const refetchBlogs = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
  }, [queryClient]);

  const filtered = filter === "all"
    ? blogs.filter((b) => b.status !== "trashed" && b.status !== "deleted")
    : blogs.filter((b) => b.status === filter);

  const trashedCount = blogs.filter((b) => b.status === "trashed").length;
  const isTrashView = filter === "trashed";

  const handleMoveToTrash = async (id: string) => {
    setActionLoading(true);
    try {
      await adminApiCall('content.php?action=delete', {
        method: 'POST',
        body: JSON.stringify({ type: 'blog', id }),
      });
      toast({ title: "Blog post moved to trash" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setDeleteTarget(null);
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    setActionLoading(false);
    refetchBlogs();
  };

  const handleRestore = async (id: string) => {
    setActionLoading(true);
    try {
      await adminApiCall('content.php?action=restore', {
        method: 'POST',
        body: JSON.stringify({ type: 'blog', id }),
      });
      toast({ title: "Blog post restored" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    setActionLoading(false);
    refetchBlogs();
  };

  const handlePermanentDelete = async (id: string) => {
    setActionLoading(true);
    try {
      await adminApiCall('content.php?action=permanent-delete', {
        method: 'POST',
        body: JSON.stringify({ type: 'blog', id }),
      });
      toast({ title: "Blog post permanently deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setPermanentDeleteTarget(null);
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    setActionLoading(false);
    refetchBlogs();
  };

  const handleBulkConfirm = async () => {
    const ids = Array.from(selected);
    setActionLoading(true);
    try {
      const action = bulkAction === "trash" ? "delete"
        : bulkAction === "restore" ? "restore"
        : "permanent-delete";

      await Promise.all(
        ids.map((id) =>
          adminApiCall(`content.php?action=${action}`, {
            method: 'POST',
            body: JSON.stringify({ type: 'blog', id }),
          })
        )
      );

      const label = bulkAction === "trash" ? "moved to trash"
        : bulkAction === "restore" ? "restored"
        : "permanently deleted";
      toast({ title: `${ids.length} post(s) ${label}` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSelected(new Set());
    setBulkAction(null);
    setActionLoading(false);
    refetchBlogs();
  };

  const handleDuplicate = (blog: AdminBlog) => {
    const newSlug = `${blog.id}-copy-${Date.now()}`;
    const draftData = {
      title: `${blog.title} (Copy)`,
      publishDate: new Date().toISOString().split("T")[0],
      selectedTopics: blog.topics,
      author: blog.author,
    };
    localStorage.setItem(`draft_blog-${newSlug}`, JSON.stringify(draftData));
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
            {f.value === "trashed" && trashedCount > 0 && (
              <span className="ml-1.5 text-xs bg-destructive/20 text-destructive rounded-full px-1.5">
                {trashedCount}
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
              <Button size="sm" variant="outline" onClick={() => setBulkAction("restore")} disabled={actionLoading}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Restore
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setBulkAction("permanent-delete")} disabled={actionLoading}>
                <XCircle className="h-3.5 w-3.5 mr-1.5" /> Delete Forever
              </Button>
            </>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => setBulkAction("trash")} disabled={actionLoading}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Move to Trash
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading blog posts…
          </div>
        ) : error ? (
          <div className="text-center py-16 text-destructive">
            Failed to load blogs. <Button variant="link" onClick={refetchBlogs}>Retry</Button>
          </div>
        ) : (
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
                                <DropdownMenuItem onClick={() => handleRestore(blog.id)} disabled={actionLoading}>
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
        )}
      </div>

      {/* Move to Trash dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to trash?</AlertDialogTitle>
            <AlertDialogDescription>This blog post will be moved to trash. You can restore it later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && handleMoveToTrash(deleteTarget)} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => permanentDeleteTarget && handlePermanentDelete(permanentDeleteTarget)}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
                  : "Items will be restored."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={bulkAction === "permanent-delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={handleBulkConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageBlogPosts;
