import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { allEpisodesUnfiltered } from "@/data/episodeData";
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
import { Plus, MoreHorizontal, Pencil, Copy, Trash2, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

const ManageEpisodes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    processScheduledContent();
  }, []);

  // Build episode list with statuses
  const drafts = getAllContentMeta("episode").filter(
    (m) => m.status === "draft" && !allEpisodesUnfiltered.some((ep) => String(ep.number) === m.id)
  );

  const episodes = [
    ...allEpisodesUnfiltered.map((ep) => ({
      id: String(ep.number),
      number: ep.number,
      title: ep.title,
      date: ep.date || "",
      duration: ep.duration || "",
      topics: ep.topics || [],
      status: getEffectiveStatus("episode", String(ep.number), true),
    })),
    ...drafts.map((d) => {
      // Try to load draft data from localStorage
      const raw = localStorage.getItem(`draft_episode-${d.id}`);
      const data = raw ? JSON.parse(raw) : {};
      return {
        id: d.id,
        number: parseInt(d.id) || 0,
        title: data.title || `Episode ${d.id} (Draft)`,
        date: data.publishDate || d.createdAt?.split("T")[0] || "",
        duration: data.duration || "",
        topics: data.selectedTopics || [],
        status: "draft" as ContentStatus,
      };
    }),
  ].sort((a, b) => b.number - a.number);

  const filtered = filter === "all" ? episodes : episodes.filter((ep) => ep.status === filter);

  const handleDelete = (id: string) => {
    removeContentMeta("episode", id);
    localStorage.removeItem(`draft_episode-${id}`);
    setDeleteTarget(null);
    toast({ title: "Episode removed" });
    // Force re-render
    window.location.reload();
  };

  const handleDuplicate = (ep: typeof episodes[0]) => {
    const newNum = String(Math.max(...episodes.map((e) => e.number), 0) + 1);
    const draftData = {
      episodeNumber: newNum,
      title: `${ep.title} (Copy)`,
      publishDate: new Date().toISOString().split("T")[0],
      duration: ep.duration,
      selectedTopics: ep.topics,
      description: "",
    };
    localStorage.setItem(`draft_episode-${newNum}`, JSON.stringify(draftData));
    // Mark as draft
    setContentStatusFn("episode", newNum, "draft");
    toast({ title: `Episode duplicated as draft #${newNum}` });
    navigate(`/admin/publish-episode?edit=${newNum}`);
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
            <Mic className="h-7 w-7 text-primary" />
            Episodes
          </h1>
          <p className="text-muted-foreground mt-1">Manage all podcast episodes</p>
        </div>
        <Button asChild>
          <Link to="/admin/publish-episode">
            <Plus className="h-4 w-4 mr-2" />
            Add Episode
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
              <TableHead className="w-20">Ep #</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-32">Publish Date</TableHead>
              <TableHead className="w-24">Duration</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  No episodes found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ep) => {
                const cfg = statusConfig[ep.status];
                return (
                  <TableRow key={ep.id}>
                    <TableCell className="font-medium">{ep.number}</TableCell>
                    <TableCell className="font-medium">{ep.title}</TableCell>
                    <TableCell>
                      <Badge className={cfg.className}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{ep.date}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{ep.duration}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {ep.topics.slice(0, 3).map((t) => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {t}
                          </span>
                        ))}
                        {ep.topics.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{ep.topics.length - 3}</span>
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
                          <DropdownMenuItem onClick={() => navigate(`/admin/publish-episode?edit=${ep.id}`)}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(ep)}>
                            <Copy className="h-4 w-4 mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTarget(ep.id)}
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
            <AlertDialogTitle>Delete this episode?</AlertDialogTitle>
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

export default ManageEpisodes;
