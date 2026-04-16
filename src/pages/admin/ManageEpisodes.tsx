import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { allEpisodesUnfiltered } from "@/data/episodeData";
import { getAllContentMeta, getEffectiveStatus, removeContentMeta, processScheduledContent, setContentStatus as setContentStatusFn, type ContentStatus } from "@/lib/content-status";
import { getAdminApiBase, getAdminAuthHeaders } from "@/lib/admin-auth";
import { useAdminEpisodes } from "@/hooks/useApiEpisodes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Copy, Trash2, Mic, RotateCcw, XCircle } from "lucide-react";
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
  deleted: { label: "Deleted", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

type FilterStatus = "all" | ContentStatus;

const ManageEpisodes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"trash" | "restore" | "permanent-delete" | null>(null);
  const [, forceUpdate] = useState(0);
  const { data: adminEpisodes } = useAdminEpisodes();

  useEffect(() => {
    processScheduledContent();
  }, []);

  const baseEpisodes = (adminEpisodes && adminEpisodes.length > 0)
    ? adminEpisodes
    : allEpisodesUnfiltered.map((ep) => ({
        ...ep,
        status: getEffectiveStatus("episode", String(ep.number), true),
      }));

  const drafts = getAllContentMeta("episode").filter(
    (m) => m.status === "draft" && !baseEpisodes.some((ep) => String(ep.number) === m.id)
  );

  const trashedMeta = getAllContentMeta("episode").filter((m) => m.status === "trashed");

  const episodes = [
    ...baseEpisodes.map((ep) => ({
      id: String(ep.number),
      number: ep.number,
      title: ep.title,
      date: ep.date || "",
      duration: ep.duration || "",
      topics: ep.topics || [],
      status: (ep.status as ContentStatus | undefined) || getEffectiveStatus("episode", String(ep.number), true),
    })),
    ...drafts.map((d) => {
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
    ...trashedMeta.map((d) => {
      const raw = localStorage.getItem(`draft_episode-${d.id}`);
      const data = raw ? JSON.parse(raw) : {};
      const existing = baseEpisodes.find((ep) => String(ep.number) === d.id);
      return {
        id: d.id,
        number: existing?.number || parseInt(d.id) || 0,
        title: existing?.title || data.title || `Episode ${d.id}`,
        date: existing?.date || data.publishDate || "",
        duration: existing?.duration || data.duration || "",
        topics: existing?.topics || data.selectedTopics || [],
        status: "trashed" as ContentStatus,
      };
    }),
  ].sort((a, b) => b.number - a.number);

  const filtered = filter === "all"
    ? episodes.filter((ep) => ep.status !== "trashed" && ep.status !== "deleted")
    : episodes.filter((ep) => ep.status === filter);

  const isTrashView = filter === "trashed";

  const apiBase = getAdminApiBase();

  const apiCall = async (endpoint: string, body: Record<string, unknown>) => {
    try {
      const res = await fetch(`${apiBase}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAdminAuthHeaders() },
        body: JSON.stringify(body),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleMoveToTrash = async (id: string) => {
    await apiCall("content.php?action=delete", { type: "episode", id });
    setContentStatusFn("episode", id, "trashed");
    setDeleteTarget(null);
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    toast({ title: "Episode moved to trash" });
    forceUpdate((n) => n + 1);
  };

  const handleRestore = async (id: string) => {
    await apiCall("content.php?action=restore", { type: "episode", id });
    setContentStatusFn("episode", id, "draft");
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    toast({ title: "Episode restored as draft" });
    forceUpdate((n) => n + 1);
  };

  const handlePermanentDelete = async (id: string) => {
    await apiCall("content.php?action=permanent-delete", { type: "episode", id });
    const existsInStatic = baseEpisodes.some((ep) => String(ep.number) === id);
    if (existsInStatic) {
      setContentStatusFn("episode", id, "deleted");
    } else {
      removeContentMeta("episode", id);
    }
    localStorage.removeItem(`draft_episode-${id}`);
    setPermanentDeleteTarget(null);
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    toast({ title: "Episode permanently deleted" });
    forceUpdate((n) => n + 1);
  };

  const handleBulkConfirm = async () => {
    const ids = Array.from(selected);
    if (bulkAction === "trash") {
      for (const id of ids) {
        await apiCall("content.php?action=delete", { type: "episode", id });
        setContentStatusFn("episode", id, "trashed");
      }
      toast({ title: `${ids.length} episode(s) moved to trash` });
    } else if (bulkAction === "restore") {
      for (const id of ids) {
        await apiCall("content.php?action=restore", { type: "episode", id });
        setContentStatusFn("episode", id, "draft");
      }
      toast({ title: `${ids.length} episode(s) restored` });
    } else if (bulkAction === "permanent-delete") {
      for (const id of ids) {
        await apiCall("content.php?action=permanent-delete", { type: "episode", id });
        const existsInStatic = baseEpisodes.some((ep) => String(ep.number) === id);
        if (existsInStatic) {
          setContentStatusFn("episode", id, "deleted");
        } else {
          removeContentMeta("episode", id);
        }
        localStorage.removeItem(`draft_episode-${id}`);
      }
      toast({ title: `${ids.length} episode(s) permanently deleted` });
    }
    setSelected(new Set());
    setBulkAction(null);
    forceUpdate((n) => n + 1);
  };

  const handleDuplicate = async (ep: typeof episodes[0]) => {
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
    await apiCall("content.php?action=set-status", { type: "episode", id: newNum, status: "draft" });
    setContentStatusFn("episode", newNum, "draft");
    toast({ title: `Episode duplicated as draft #${newNum}` });
    navigate(`/admin/publish-episode?edit=${newNum}`);
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
      setSelected(new Set(filtered.map((ep) => ep.id)));
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
                <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                  {isTrashView ? "Trash is empty." : "No episodes found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ep) => {
                const cfg = statusConfig[ep.status];
                return (
                  <TableRow key={ep.id} className={selected.has(ep.id) ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(ep.id)}
                        onCheckedChange={() => toggleSelect(ep.id)}
                      />
                    </TableCell>
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
                          {isTrashView ? (
                            <>
                              <DropdownMenuItem onClick={() => handleRestore(ep.id)}>
                                <RotateCcw className="h-4 w-4 mr-2" /> Restore
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setPermanentDeleteTarget(ep.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" /> Delete Forever
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
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
            <AlertDialogDescription>This episode will be moved to trash. You can restore it later.</AlertDialogDescription>
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
            <AlertDialogDescription>This action cannot be undone. The episode will be permanently removed.</AlertDialogDescription>
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
              {bulkAction === "trash" && `Move ${selected.size} episode(s) to trash?`}
              {bulkAction === "restore" && `Restore ${selected.size} episode(s)?`}
              {bulkAction === "permanent-delete" && `Permanently delete ${selected.size} episode(s)?`}
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

export default ManageEpisodes;
