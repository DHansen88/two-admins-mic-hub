import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Wand2,
  Download,
  Save,
  Sparkles,
  Mail,
  Plus,
  Lightbulb,
  Code,
  List,
  Mic,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllTags, addTag, generateTagSlug, suggestTags, type Tag } from "@/data/tags";
import {
  generateSlug,
  generateExcerpt,
  generateKeyTakeaways,
  generateSEODescription,
  calculateReadingTime,
  generateNewsletterDraft,
  formatDateISO,
} from "@/lib/content-generator";
import {
  exportBlogMarkdown,
  exportNewsletterDraft,
  saveDraft,
  saveToHistory,
  downloadFile,
} from "@/lib/file-export";
import { saveBlog } from "@/lib/content-manager";
import { setContentStatus } from "@/lib/content-status";
import PublishModal from "@/components/PublishModal";
import RichTextEditor from "@/components/RichTextEditor";
import { allEpisodesUnfiltered } from "@/data/episodeData";

import { blocksToMarkdown, markdownToBlocks } from "@/lib/block-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchAuthors, type AuthorProfile } from "@/lib/author-manager";

/** Strip HTML tags to get plain text for word count etc. */
function htmlToPlainText(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

/** Convert HTML to markdown (basic) for export */
function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i>(.*?)<\/i>/gi, "*$1*")
    .replace(/<u>(.*?)<\/u>/gi, "$1")
    .replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)")
    .replace(/<img[^>]+src="([^"]*)"[^>]*\/?>/gi, "![]($1)")
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_, c) =>
      c.replace(/<p[^>]*>(.*?)<\/p>/gi, "> $1\n").trim()
    )
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<\/?[uo]l[^>]*>/gi, "\n")
    .replace(/<hr\s*\/?>/gi, "\n---\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const PublishBlog = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [authorOptions, setAuthorOptions] = useState<AuthorProfile[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [title, setTitle] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [authorAvatars, setAuthorAvatars] = useState<Record<string, string>>({});
  const [publishDate, setPublishDate] = useState(formatDateISO(new Date()));
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);
  const [editorMode, setEditorMode] = useState<"rich" | "markdown">("rich");
  const [relatedEpisode, setRelatedEpisode] = useState("");
  const [showEpisodeCallout, setShowEpisodeCallout] = useState(true);

  // Rich text editor state (HTML)
  const [htmlContent, setHtmlContent] = useState("");

  // Markdown editor state (legacy)
  const [markdownContent, setMarkdownContent] = useState("");

  // Auto-generated
  const [excerpt, setExcerpt] = useState("");
  const [readingTime, setReadingTime] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([]);
  const [showGenerated, setShowGenerated] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [generatedNewsletter, setGeneratedNewsletter] = useState<{ subject: string; body: string } | null>(null);

  useEffect(() => {
    setTags(getAllTags());
    fetchAuthors().then(setAuthorOptions);
  }, []);

  // Load existing blog for editing from the live PHP API
  useEffect(() => {
    const editSlug = searchParams.get("edit");
    if (!editSlug || authorOptions.length === 0) return;

    const loadBlog = async () => {
      try {
        const { getAdminApiBase, getAdminAuthHeaders } = await import("@/lib/admin-auth");
        const base = getAdminApiBase();
        const res = await fetch(`${base}/content.php?action=get-blog&slug=${encodeURIComponent(editSlug)}`, {
          headers: getAdminAuthHeaders(),
          credentials: "include",
        });
        if (!res.ok) {
          toast({ title: "Blog not found on server", variant: "destructive" });
          return;
        }
        const data = await res.json();
        const blog = data.blog;
        if (!blog) {
          toast({ title: "Blog not found", variant: "destructive" });
          return;
        }

        setTitle(blog.title || "");
        setCustomSlug(blog.slug || editSlug);

        // Resolve authors from the API data — only keep IDs that exist in author system
        const rawAuthorKeys: string[] = Array.isArray(blog.authors) && blog.authors.length > 0
          ? blog.authors
          : blog.author
            ? [blog.author]
            : [];
        // Filter to only real authors that exist in the loaded author options
        const validAuthorKeys = rawAuthorKeys.filter(
          (k) => authorOptions.some((a) => a.id.toLowerCase() === k.toLowerCase() || a.name.toLowerCase() === k.toLowerCase())
        );
        setSelectedAuthors(validAuthorKeys);

        const avatarMap: Record<string, string> = {};
        if (Array.isArray(blog.author_avatars)) {
          blog.author_avatars.forEach((av: string, i: number) => {
            if (av && validAuthorKeys[i]) avatarMap[validAuthorKeys[i]] = av;
          });
        }
        setAuthorAvatars(avatarMap);

        // Parse date — handle both publish_date and date fields
        const rawDate = blog.publish_date || blog.date || "";
        if (rawDate) {
          // Ensure it's in YYYY-MM-DD format for the date input
          const parsed = new Date(rawDate);
          if (!isNaN(parsed.getTime())) {
            setPublishDate(parsed.toISOString().split("T")[0]);
          } else {
            setPublishDate(rawDate);
          }
        }

        setSelectedTopics(Array.isArray(blog.tags) ? blog.tags : []);
        setFeaturedImage(blog.featured_image || "");
        setExcerpt(blog.excerpt || "");
        setKeyTakeaways(Array.isArray(blog.key_takeaways) ? blog.key_takeaways : []);

        if (blog.related_episode) {
          setRelatedEpisode(blog.related_episode);
          setShowEpisodeCallout(blog.show_episode_callout !== "false" && blog.show_episode_callout !== false);
        }

        // Load HTML content first (from companion .html.json), fall back to markdown
        const contentBody = blog._content || blog.content || "";
        if (blog.html_content) {
          setHtmlContent(blog.html_content);
          setMarkdownContent(contentBody);
          setEditorMode("rich");
        } else if (contentBody) {
          const md = contentBody;
          const basicHtml = md
            .replace(/^### (.+)$/gm, "<h3>$1</h3>")
            .replace(/^## (.+)$/gm, "<h2>$1</h2>")
            .replace(/^# (.+)$/gm, "<h1>$1</h1>")
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.+?)\*/g, "<em>$1</em>")
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            .replace(/^- (.+)$/gm, "<li>$1</li>")
            .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
            .replace(/^(?!<[hulo])((?!<).+)$/gm, "<p>$1</p>")
            .replace(/\n{2,}/g, "");
          setHtmlContent(basicHtml);
          setMarkdownContent(md);
          setEditorMode("rich");
        }

        toast({ title: `Editing: ${blog.title || editSlug}` });
      } catch (err) {
        console.error("Failed to load blog for editing:", err);
        toast({ title: "Failed to load blog data", variant: "destructive" });
      }
    };

    loadBlog();
  }, [searchParams, authorOptions]);

  // Derive plain text content for word count, auto-gen etc.
  const currentPlainText = useMemo(() => {
    if (editorMode === "rich") return htmlToPlainText(htmlContent);
    return markdownContent;
  }, [editorMode, htmlContent, markdownContent]);

  const currentMarkdown = useMemo(() => {
    if (editorMode === "rich") return htmlToMarkdown(htmlContent);
    return markdownContent;
  }, [editorMode, htmlContent, markdownContent]);

  const wordCount = useMemo(() => {
    return currentPlainText.split(/\s+/).filter(Boolean).length;
  }, [currentPlainText]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(`/assets/images/${file.name}`);
      toast({ title: `Image selected: ${file.name}. Upload the file to /assets/images/ on your server.` });
    }
  };

  const handleSwitchMode = (mode: "rich" | "markdown") => {
    if (mode === "markdown" && editorMode === "rich") {
      setMarkdownContent(htmlToMarkdown(htmlContent));
    } else if (mode === "rich" && editorMode === "markdown") {
      // Convert markdown to basic HTML for the rich editor
      const basicHtml = markdownContent
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^# (.+)$/gm, "<h1>$1</h1>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/^- (.+)$/gm, "<li>$1</li>")
        .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
        .replace(/^(?!<[hulo])((?!<).+)$/gm, "<p>$1</p>");
      setHtmlContent(basicHtml);
    }
    setEditorMode(mode);
  };

  const handleAutoGenerate = () => {
    if (!currentPlainText) {
      toast({ title: "Write content first", variant: "destructive" });
      return;
    }

    const autoExcerpt = generateExcerpt(currentPlainText);
    const autoTime = calculateReadingTime(currentPlainText);
    const autoSeo = generateSEODescription(title, autoExcerpt);
    const autoTakeaways = generateKeyTakeaways(currentMarkdown);

    setExcerpt(autoExcerpt);
    setReadingTime(autoTime);
    setSeoDescription(autoSeo);
    setKeyTakeaways(autoTakeaways);
    setShowGenerated(true);
    setSuggestedTags(suggestTags(currentPlainText + " " + title));

    const newsletter = generateNewsletterDraft({
      type: "blog",
      title,
      summary: autoExcerpt,
      takeaways: autoTakeaways,
      url: `/blog/${customSlug || generateSlug(title)}`,
    });
    setGeneratedNewsletter(newsletter);
    toast({ title: "Content auto-generated!" });
  };

  const handleExport = () => {
    if (!title || !currentPlainText) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    const slug = customSlug || generateSlug(title);

    exportBlogMarkdown({
      title,
      slug,
      author: selectedAuthors.join(", "),
      publish_date: publishDate,
      tags: selectedTopics,
      excerpt: excerpt || generateExcerpt(currentPlainText),
      featured_image: featuredImage || undefined,
      key_takeaways: keyTakeaways,
      content: currentMarkdown,
    });
    toast({ title: "Blog Markdown exported!" });
    saveToHistory("blog", { title, slug, date: publishDate, author: selectedAuthors.join(",") });
  };

  const handlePublishToServer = async () => {
    if (!title || !currentPlainText) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    const slug = customSlug || generateSlug(title);
    const validAuthors = selectedAuthors.filter(Boolean);
    const result = await saveBlog({
      title,
      slug,
      author: "",
      authors: validAuthors,
      author_avatars: selectedAuthors.map((k) => authorAvatars[k] || "").filter(Boolean).length > 0
        ? selectedAuthors.map((k) => authorAvatars[k] || "")
        : undefined,
      publish_date: publishDate,
      tags: selectedTopics,
      excerpt: excerpt || generateExcerpt(currentPlainText),
      featured_image: featuredImage || undefined,
      key_takeaways: keyTakeaways,
      related_episode: relatedEpisode || undefined,
      show_episode_callout: showEpisodeCallout,
      content: currentMarkdown,
      html_content: editorMode === "rich" ? htmlContent : undefined,
      format: "md",
    });
    if (result.success) {
      saveToHistory("blog", { title, slug, date: publishDate, author: selectedAuthors.join(",") });
      toast({ title: "Blog published to server!" });
    } else {
      toast({ title: result.error || "Publish failed", variant: "destructive" });
    }
  };

  const handleExportNewsletter = () => {
    if (!generatedNewsletter) return;
    const slug = generateSlug(title);
    exportNewsletterDraft(generatedNewsletter, `newsletter-${slug}.txt`);
    saveToHistory("newsletter", { ...generatedNewsletter, blogTitle: title, date: publishDate });
    toast({ title: "Newsletter draft exported!" });
  };

  const handleSaveDraft = () => {
    const slug = customSlug || generateSlug(title) || "new";
    saveDraft(`blog-${slug}`, {
      title, author: selectedAuthors.join(","), publishDate, selectedTopics, editorMode,
      htmlContent, markdownContent: editorMode === "markdown" ? markdownContent : currentMarkdown,
      featuredImage, excerpt, readingTime, seoDescription,
      keyTakeaways, generatedNewsletter,
    });
    setContentStatus("blog", slug, "draft");
    toast({ title: "Draft saved" });
    navigate("/admin/blog-posts");
  };

  const handlePublishNow = async () => {
    if (!title || !currentPlainText) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    await handlePublishToServer();
    const slug = customSlug || generateSlug(title);
    setContentStatus("blog", slug, "published");
    navigate("/admin/blog-posts");
  };

  const handleSchedulePublish = (date: string, time: string) => {
    if (!title || !currentPlainText) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    const slug = customSlug || generateSlug(title);
    handleSaveDraftSilent();
    setContentStatus("blog", slug, "scheduled", date, time);
    toast({ title: `Blog scheduled for ${date} at ${time}` });
    navigate("/admin/blog-posts");
  };

  const handleSaveDraftSilent = () => {
    const slug = customSlug || generateSlug(title) || "new";
    saveDraft(`blog-${slug}`, {
      title, author: selectedAuthors.join(","), publishDate, selectedTopics, editorMode,
      htmlContent, markdownContent: editorMode === "markdown" ? markdownContent : currentMarkdown,
      featuredImage, excerpt, readingTime, seoDescription,
      keyTakeaways, generatedNewsletter,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            {searchParams.get("edit") ? "Edit Blog Post" : "Publish Blog Post"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {searchParams.get("edit") ? "Update your existing blog post." : "Write your blog post with the rich text editor."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSaveDraft}>
          <Save className="h-4 w-4 mr-1" /> Save Draft
        </Button>
      </div>

      {/* Post Details */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Post Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="5 Essential Leadership Skills Every Administrator Needs" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">URL Slug</label>
            <Input
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '-').replace(/-{2,}/g, '-'))}
              onBlur={() => setCustomSlug((s) => s.replace(/^-+|-+$/g, ''))}
              placeholder={generateSlug(title) || "auto-generated-from-title"}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to auto-generate. URL: /blog/{customSlug || generateSlug(title) || "..."}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Publish Date</label>
              <Input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Featured Image</label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {featuredImage && <p className="text-xs text-muted-foreground">{featuredImage}</p>}
            </div>
          </div>

          {/* Authors Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Authors</label>
            <div className="grid sm:grid-cols-2 gap-3">
              {authorOptions.map((a) => {
                const isSelected = selectedAuthors.includes(a.id);
                return (
                  <div
                    key={a.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                    onClick={() => {
                      setSelectedAuthors((prev) =>
                        prev.includes(a.id)
                          ? prev.filter((k) => k !== a.id)
                          : [...prev, a.id]
                      );
                    }}
                  >
                    <Checkbox checked={isSelected} />
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={authorAvatars[a.id] || a.avatar} alt={a.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {a.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground block truncate">{a.name}</span>
                      {a.role && <span className="text-xs text-muted-foreground truncate block">{a.role}</span>}
                    </div>
                  </div>
                );
              })}
            </div>


            {selectedAuthors.length === 0 && (
              <p className="text-xs text-destructive">Please select at least one author.</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label key={tag.slug} className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <Checkbox checked={selectedTopics.includes(tag.name)} onCheckedChange={() => toggleTopic(tag.name)} />
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: tag.bgColor, color: tag.textColor }}
                  >
                    {tag.name}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Add new tag..."
                className="max-w-[200px] h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTagName.trim()) {
                    const slug = generateTagSlug(newTagName.trim());
                    if (!tags.some((t) => t.slug === slug)) {
                      const TAG_PALETTE = ["#9CCC66", "#4ABC94", "#49C2F2", "#0086BF", "#00628C", "#124459", "#F26D7D", "#8B5CF6", "#F59E0B"];
                      const bgColor = TAG_PALETTE[tags.length % TAG_PALETTE.length];
                      const textColor = ["#9CCC66", "#49C2F2", "#F59E0B"].includes(bgColor) ? "#000000" : "#ffffff";
                      const newTag: Tag = { name: newTagName.trim(), slug, color: "199 62% 28%", bgColor, textColor };
                      const updated = addTag(newTag);
                      setTags(updated);
                      setSelectedTopics((prev) => [...prev, newTag.name]);
                      toast({ title: `Tag "${newTag.name}" created and selected` });
                    }
                    setNewTagName("");
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1"
                onClick={() => {
                  if (newTagName.trim()) {
                    const slug = generateTagSlug(newTagName.trim());
                    if (!tags.some((t) => t.slug === slug)) {
                      const TAG_PALETTE = ["#9CCC66", "#4ABC94", "#49C2F2", "#0086BF", "#00628C", "#124459", "#F26D7D", "#8B5CF6", "#F59E0B"];
                      const bgColor = TAG_PALETTE[tags.length % TAG_PALETTE.length];
                      const textColor = ["#9CCC66", "#49C2F2", "#F59E0B"].includes(bgColor) ? "#000000" : "#ffffff";
                      const newTag: Tag = { name: newTagName.trim(), slug, color: "199 62% 28%", bgColor, textColor };
                      const updated = addTag(newTag);
                      setTags(updated);
                      setSelectedTopics((prev) => [...prev, newTag.name]);
                      toast({ title: `Tag "${newTag.name}" created and selected` });
                    }
                    setNewTagName("");
                  }
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
            {suggestedTags.length > 0 && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Lightbulb className="h-4 w-4 text-accent shrink-0" />
                <span className="text-xs text-muted-foreground">Suggested:</span>
                {suggestedTags.filter((s) => !selectedTopics.includes(s.name)).map((tag) => (
                  <button
                    key={tag.slug}
                    type="button"
                    onClick={() => toggleTopic(tag.name)}
                    className="text-xs px-2 py-0.5 rounded-full border border-accent/30 text-accent hover:bg-accent/10 transition-colors"
                  >
                    + {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Episode Callout Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mic className="h-4 w-4 text-primary" />
            Episode Callout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Related Podcast Episode</label>
            <select
              value={relatedEpisode}
              onChange={(e) => {
                setRelatedEpisode(e.target.value);
                if (!e.target.value) setShowEpisodeCallout(false);
                else setShowEpisodeCallout(true);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">None</option>
              {allEpisodesUnfiltered.map((ep) => (
                <option key={ep.slug} value={ep.slug}>
                  Ep. {ep.number}: {ep.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Select an episode to display a "Listen to the Episode" callout in the article.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Content Editor with Mode Toggle */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Content</CardTitle>
          <div className="flex gap-1 bg-muted rounded-lg p-0.5">
            <Button
              type="button"
              size="sm"
              variant={editorMode === "rich" ? "default" : "ghost"}
              className="h-7 text-xs gap-1.5"
              onClick={() => handleSwitchMode("rich")}
            >
              <FileText className="h-3.5 w-3.5" />
              Rich Editor
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editorMode === "markdown" ? "default" : "ghost"}
              className="h-7 text-xs gap-1.5"
              onClick={() => handleSwitchMode("markdown")}
            >
              <Code className="h-3.5 w-3.5" />
              Markdown
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editorMode === "rich" ? (
            <RichTextEditor content={htmlContent} onChange={setHtmlContent} />
          ) : (
            <div>
              <Textarea
                rows={20}
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                placeholder={"Write your blog post here using Markdown...\n\n## Introduction\n\nYour introduction here...\n\n## Main Section\n\nYour content...\n\n## Conclusion\n\nWrap it up..."}
                className="font-mono text-sm"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {wordCount > 0
              ? `${wordCount} words • ${calculateReadingTime(currentPlainText)}`
              : "0 words"
            }
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleAutoGenerate} className="gap-2">
          <Wand2 className="h-4 w-4" />
          Auto-Generate Fields
        </Button>
        <Button className="gap-2" variant="secondary" onClick={() => setShowPublishModal(true)}>
          <Save className="h-4 w-4" />
          {searchParams.get("edit") ? "Update Post" : "Publish"}
        </Button>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Markdown
        </Button>
      </div>

      {/* Generated Fields */}
      {showGenerated && (
        <div className="space-y-4">
          <Card className="bg-card border-accent/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Auto-Generated Fields
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Reading Time</label>
                  <Input value={readingTime} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Slug</label>
                  <Input value={customSlug || generateSlug(title)} readOnly className="bg-muted/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Excerpt</label>
                <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">SEO Description</label>
                <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} />
                <p className="text-xs text-muted-foreground">{seoDescription.length}/160 characters</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Key Takeaways</label>
                {keyTakeaways.map((t, i) => (
                  <div key={i} className="flex gap-2 mt-1">
                    <span className="text-xs text-muted-foreground mt-2.5">{i + 1}.</span>
                    <Input
                      value={t}
                      onChange={(e) => {
                        const updated = [...keyTakeaways];
                        updated[i] = e.target.value;
                        setKeyTakeaways(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {generatedNewsletter && (
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Newsletter Draft
                </CardTitle>
                <Button size="sm" variant="outline" onClick={handleExportNewsletter} className="gap-1">
                  <Download className="h-3.5 w-3.5" />
                  Export for Beehiiv
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-foreground mb-2">Subject: {generatedNewsletter.subject}</p>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                  {generatedNewsletter.body}
                </pre>
              </CardContent>
            </Card>
          )}

          <PublishModal
            open={showPublishModal}
            onOpenChange={setShowPublishModal}
            onPublishNow={handlePublishNow}
            onSchedule={handleSchedulePublish}
            title={title}
          />
        </div>
      )}

      {/* Publish modal when generated fields not shown */}
      {!showGenerated && (
        <PublishModal
          open={showPublishModal}
          onOpenChange={setShowPublishModal}
          onPublishNow={handlePublishNow}
          onSchedule={handleSchedulePublish}
          title={title}
        />
      )}
    </div>
  );
};

export default PublishBlog;
