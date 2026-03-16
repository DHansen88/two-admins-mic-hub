import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Library,
  Mic,
  FileText,
  Search,
  ExternalLink,
  Trash2,
  EyeOff,
  Eye,
  RotateCcw,
  AlertTriangle,
  Clock,
  Archive,
  Activity,
  RefreshCw,
  Rss,
  Pencil,
} from "lucide-react";
import { allBlogsUnfiltered } from "@/data/blogData";
import { allEpisodesUnfiltered } from "@/data/episodeData";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  getContentStatus,
  isPermanentlyDeleted,
  logActivity,
  getRecentActivity,
  softDeleteContent,
  restoreContentApi,
  permanentlyDeleteApi,
  unpublishContentApi,
  publishContentApi,
  regenerateRSS,
  type ContentType,
  type ContentStatus,
  type ActivityLogEntry,
} from "@/lib/content-manager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type ViewTab = "all" | "episodes" | "blogs" | "trash" | "activity";

interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  subtitle: string;
  viewUrl: string;
  status: ContentStatus;
}

const ACTION_LABELS: Record<ActivityLogEntry["action"], string> = {
  deleted: "Moved to trash",
  restored: "Restored",
  unpublished: "Unpublished",
  published: "Published",
  permanently_deleted: "Permanently deleted",
};

const ACTION_ICONS: Record<ActivityLogEntry["action"], typeof Trash2> = {
  deleted: Trash2,
  restored: RotateCcw,
  unpublished: EyeOff,
  published: Eye,
  permanently_deleted: AlertTriangle,
};

const ContentLibrary = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<ViewTab>("all");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [rssLoading, setRssLoading] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
    variant: "destructive" | "default";
    actionLabel: string;
  }>({
    open: false,
    title: "",
    description: "",
    action: () => {},
    variant: "default",
    actionLabel: "",
  });

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const allContent = useMemo(() => {
    void refreshKey;
    const items: ContentItem[] = [];

    allEpisodesUnfiltered.forEach((ep) => {
      const id = String(ep.number);
      if (isPermanentlyDeleted("episode", id)) return;
      items.push({
        id,
        type: "episode",
        title: `Ep. ${ep.number}: ${ep.title}`,
        subtitle: `${ep.date} • ${ep.duration} • ${ep.topics.join(", ")}`,
        viewUrl: `/episodes/${ep.slug}`,
        status: getContentStatus("episode", id),
      });
    });

    allBlogsUnfiltered.forEach((blog) => {
      if (isPermanentlyDeleted("blog", blog.slug)) return;
      items.push({
        id: blog.slug,
        type: "blog",
        title: blog.title,
        subtitle: `${blog.date} • ${blog.readTime} • ${blog.topics.join(", ")}`,
        viewUrl: `/blog/${blog.slug}`,
        status: getContentStatus("blog", blog.slug),
      });
    });

    return items;
  }, [refreshKey]);

  const query = search.toLowerCase().trim();

  const filteredContent = useMemo(() => {
    let items = allContent;

    if (tab === "episodes") items = items.filter((i) => i.type === "episode" && i.status !== "trashed");
    else if (tab === "blogs") items = items.filter((i) => i.type === "blog" && i.status !== "trashed");
    else if (tab === "trash") items = items.filter((i) => i.status === "trashed");
    else if (tab === "all") items = items.filter((i) => i.status !== "trashed");

    if (query) {
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          i.subtitle.toLowerCase().includes(query)
      );
    }

    return items;
  }, [allContent, tab, query]);

  const activityLog = useMemo(() => {
    void refreshKey;
    return getRecentActivity(30);
  }, [refreshKey]);

  const counts = useMemo(() => ({
    all: allContent.filter((i) => i.status !== "trashed").length,
    episodes: allContent.filter((i) => i.type === "episode" && i.status !== "trashed").length,
    blogs: allContent.filter((i) => i.type === "blog" && i.status !== "trashed").length,
    trash: allContent.filter((i) => i.status === "trashed").length,
  }), [allContent]);

  const tabs: { key: ViewTab; label: string; count?: number; icon: typeof Library }[] = [
    { key: "all", label: "All", count: counts.all, icon: Library },
    { key: "episodes", label: "Episodes", count: counts.episodes, icon: Mic },
    { key: "blogs", label: "Blogs", count: counts.blogs, icon: FileText },
    { key: "trash", label: "Trash", count: counts.trash, icon: Archive },
    { key: "activity", label: "Activity", icon: Activity },
  ];

  // ── Actions (now API-backed) ──

  const handleUnpublish = async (item: ContentItem) => {
    await unpublishContentApi(item.type, item.id);
    logActivity("unpublished", item.type, item.id, item.title);
    refresh();
    toast({ title: `"${item.title}" unpublished` });
  };

  const handlePublish = async (item: ContentItem) => {
    await publishContentApi(item.type, item.id);
    logActivity("published", item.type, item.id, item.title);
    refresh();
    toast({ title: `"${item.title}" published` });
  };

  const handleSoftDelete = (item: ContentItem) => {
    setConfirmDialog({
      open: true,
      title: "Move to trash?",
      description: `Are you sure you want to move "${item.title}" to trash? You can restore it later.`,
      variant: "destructive",
      actionLabel: "Move to Trash",
      action: async () => {
        await softDeleteContent(item.type, item.id);
        logActivity("deleted", item.type, item.id, item.title);
        refresh();
        toast({ title: `"${item.title}" moved to trash` });
        setConfirmDialog((d) => ({ ...d, open: false }));
      },
    });
  };

  const handleRestore = async (item: ContentItem) => {
    await restoreContentApi(item.type, item.id);
    logActivity("restored", item.type, item.id, item.title);
    refresh();
    toast({ title: `"${item.title}" restored` });
  };

  const handlePermanentDelete = (item: ContentItem) => {
    setConfirmDialog({
      open: true,
      title: "Permanently delete?",
      description: `Are you sure you want to permanently delete "${item.title}"? This action cannot be undone.`,
      variant: "destructive",
      actionLabel: "Delete Permanently",
      action: async () => {
        await permanentlyDeleteApi(item.type, item.id);
        logActivity("permanently_deleted", item.type, item.id, item.title);
        refresh();
        toast({ title: `"${item.title}" permanently deleted`, variant: "destructive" });
        setConfirmDialog((d) => ({ ...d, open: false }));
      },
    });
  };

  const handleRegenerateRSS = async () => {
    setRssLoading(true);
    const result = await regenerateRSS();
    setRssLoading(false);
    toast({
      title: result.success
        ? "RSS feed regenerated successfully"
        : "RSS regeneration failed — will update at next build",
    });
  };

  const getStatusBadge = (status: ContentStatus) => {
    if (status === "published") return null;
    const styles = {
      unpublished: "bg-amber-500/15 text-amber-600",
      trashed: "bg-destructive/15 text-destructive",
    };
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
        {status === "unpublished" ? "Unpublished" : "Trashed"}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <Library className="h-7 w-7 text-primary" />
            Content Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all published content — edit, unpublish, or delete posts and episodes.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleRegenerateRSS}
          disabled={rssLoading}
        >
          <Rss className="h-3.5 w-3.5" />
          {rssLoading ? "Regenerating..." : "Regenerate RSS"}
        </Button>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        {tab !== "activity" && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search content..."
              className="pl-10"
            />
          </div>
        )}
        <div className="flex gap-1 bg-muted rounded-lg p-1 flex-wrap">
          {tabs.map((t) => (
            <Button
              key={t.key}
              variant={tab === t.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab(t.key)}
              className="text-xs gap-1.5"
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {t.count !== undefined && ` (${t.count})`}
            </Button>
          ))}
        </div>
      </div>

      {/* Activity Log View */}
      {tab === "activity" ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </h2>
          {activityLog.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-1.5">
              {activityLog.map((entry) => {
                const IconComp = ACTION_ICONS[entry.action];
                return (
                  <Card key={entry.id} className="bg-card border-border">
                    <CardContent className="flex items-center gap-3 py-2.5 px-4">
                      <div className={`p-1.5 rounded-full shrink-0 ${
                        entry.action === "permanently_deleted" || entry.action === "deleted"
                          ? "bg-destructive/10 text-destructive"
                          : entry.action === "restored" || entry.action === "published"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                      }`}>
                        <IconComp className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">
                          <span className="font-medium">{ACTION_LABELS[entry.action]}</span>
                          {" — "}
                          <span className="text-muted-foreground">{entry.contentTitle}</span>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(entry.timestamp).toLocaleString()}
                          <span className="ml-2 capitalize">{entry.contentType}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Content List */
        <div className="space-y-2">
          {filteredContent.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-16 text-center">
                {tab === "trash" ? (
                  <>
                    <Archive className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Trash is empty.</p>
                  </>
                ) : (
                  <p className="text-muted-foreground">No content matches your search.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredContent.map((item) => (
              <Card key={`${item.type}-${item.id}`} className="bg-card border-border hover:border-accent/30 transition-colors">
                <CardContent className="flex items-center gap-3 py-3 px-4">
                  <div className="p-1.5 rounded bg-muted shrink-0">
                    {item.type === "episode" ? (
                      <Mic className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.title}
                      </p>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === "trashed" ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(item)}
                          className="gap-1 text-xs h-8"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restore
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePermanentDelete(item)}
                          className="gap-1 text-xs h-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link to={item.viewUrl} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View on site">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>

                        <Link to={item.type === "episode" ? `/admin/publish-episode?edit=${item.id}` : `/admin/publish-blog?edit=${item.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>

                        {item.status === "published" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUnpublish(item)}
                            title="Unpublish"
                          >
                            <EyeOff className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600"
                            onClick={() => handlePublish(item)}
                            title="Publish"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleSoftDelete(item)}
                          title="Move to trash"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog((d) => ({ ...d, open: false }))}
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.variant}
              onClick={confirmDialog.action}
            >
              {confirmDialog.actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentLibrary;
