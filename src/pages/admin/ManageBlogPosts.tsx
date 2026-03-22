import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { allBlogsUnfiltered } from "@/data/blogData";
import { getAllContentMeta, getEffectiveStatus, removeContentMeta, processScheduledContent, type ContentStatus } from "@/lib/content-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Copy, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/lib/content-generator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusConfig: Record<ContentStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "Scheduled", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  published: { label: "Published", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

type FilterStatus = "all" | ContentStatus;

const ManageBlogPosts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    processScheduledContent();
  }, []);

  // Build blog list with statuses
  const drafts = getAllContentMeta("blog").filter(
    (m) => m.status === "draft" && !allBlogsUnfiltered.some((b) => b.slug === m.id)
  );

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
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = filter === "all" ? blogs : blogs.filter((b) => b.status === filter);

  const handleDelete = (id: string) => {
    removeContentMeta("blog", id);
    localStorage.removeItem(`draft_blog-${id}`);
    setDeleteTarget(null);
    toast({ title: "Blog post removed" });
    window.location.reload();
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

  const filters: { label: string; value: FilterStatus }[] = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Published", value: "published" },
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
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  No blog posts found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((blog) => {
                const cfg = statusConfig[blog.status];
                return (
                  <TableRow key={blog.id}>
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
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
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

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this blog post?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageBlogPosts;
