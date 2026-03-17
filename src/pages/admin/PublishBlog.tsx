import { useState, useEffect, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
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
  Blocks,
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
import BlockEditor from "@/components/BlogBlockEditor";
import { extractTocItems } from "@/components/TableOfContents";
import { allEpisodesUnfiltered } from "@/data/episodeData";
import { allBlogsUnfiltered } from "@/data/blogData";
import {
  type ContentBlock,
  blocksToMarkdown,
  markdownToBlocks,
} from "@/lib/block-types";
import authorsData from "@/content/authors.json";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AUTHOR_OPTIONS = Object.entries(authorsData).map(([key, val]) => ({
  key,
  label: (val as { name: string }).name,
  avatar: (val as { avatar: string }).avatar,
}));

const PublishBlog = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [tags, setTags] = useState<Tag[]>([]);
  const [title, setTitle] = useState("");
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(["sarah"]);
  const [authorAvatars, setAuthorAvatars] = useState<Record<string, string>>({});
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorRole, setNewAuthorRole] = useState("");
  const [newAuthorAvatar, setNewAuthorAvatar] = useState("");
  const [publishDate, setPublishDate] = useState(formatDateISO(new Date()));
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);
  const [editorMode, setEditorMode] = useState<"blocks" | "markdown">("blocks");
  const [relatedEpisode, setRelatedEpisode] = useState("");
  const [showEpisodeCallout, setShowEpisodeCallout] = useState(true);

  // Block editor state
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  // Markdown editor state (legacy)
  const [markdownContent, setMarkdownContent] = useState("");

  // Auto-generated
  const [excerpt, setExcerpt] = useState("");
  const [readingTime, setReadingTime] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([]);
  const [showGenerated, setShowGenerated] = useState(false);
  const [generatedNewsletter, setGeneratedNewsletter] = useState<{ subject: string; body: string } | null>(null);

  useEffect(() => {
    setTags(getAllTags());
  }, []);

  // Load existing blog for editing
  useEffect(() => {
    const editSlug = searchParams.get("edit");
    if (!editSlug) return;
    const blog = allBlogsUnfiltered.find((b) => b.slug === editSlug);
    if (!blog) return;
    setTitle(blog.title);
    // Load authors
    const keys = blog.authors.map((a) => {
      const found = AUTHOR_OPTIONS.find((opt) => opt.label === a.name);
      return found?.key || a.name.toLowerCase().replace(/\s+/g, '-');
    });
    setSelectedAuthors(keys.length > 0 ? keys : ["sarah"]);
    // Load custom avatars
    const avatarMap: Record<string, string> = {};
    blog.authors.forEach((a, i) => {
      if (a.avatar && keys[i]) avatarMap[keys[i]] = a.avatar;
    });
    setAuthorAvatars(avatarMap);
    setPublishDate(blog.date || formatDateISO(new Date()));
    setSelectedTopics(blog.topics || []);
    setFeaturedImage(blog.featuredImage || "");
    setExcerpt(blog.excerpt || "");
    setKeyTakeaways(blog.keyTakeaways || []);
    if (blog.relatedEpisode) {
      setRelatedEpisode(blog.relatedEpisode);
      setShowEpisodeCallout(true);
    }
    if (blog.blocks && blog.blocks.length > 0) {
      setBlocks(blog.blocks);
      setEditorMode("blocks");
    } else if (blog.content) {
      setMarkdownContent(blog.content);
      setEditorMode("markdown");
    }
    toast({ title: `Editing: ${blog.title}` });
  }, [searchParams]);

  // Derive content from current editor mode
  const currentContent = useMemo(() => {
    if (editorMode === "blocks") return blocksToMarkdown(blocks);
    return markdownContent;
  }, [editorMode, blocks, markdownContent]);

  const wordCount = useMemo(() => {
    return currentContent.split(/\s+/).filter(Boolean).length;
  }, [currentContent]);

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

  const handleSwitchMode = (mode: "blocks" | "markdown") => {
    if (mode === "markdown" && editorMode === "blocks") {
      setMarkdownContent(blocksToMarkdown(blocks));
    } else if (mode === "blocks" && editorMode === "markdown") {
      setBlocks(markdownToBlocks(markdownContent));
    }
    setEditorMode(mode);
  };

  const handleAutoGenerate = () => {
    if (!currentContent) {
      toast({ title: "Write content first", variant: "destructive" });
      return;
    }

    const autoExcerpt = generateExcerpt(currentContent);
    const autoTime = calculateReadingTime(currentContent);
    const autoSeo = generateSEODescription(title, autoExcerpt);
    const autoTakeaways = generateKeyTakeaways(currentContent);

    setExcerpt(autoExcerpt);
    setReadingTime(autoTime);
    setSeoDescription(autoSeo);
    setKeyTakeaways(autoTakeaways);
    setShowGenerated(true);
    setSuggestedTags(suggestTags(currentContent + " " + title));

    const newsletter = generateNewsletterDraft({
      type: "blog",
      title,
      summary: autoExcerpt,
      takeaways: autoTakeaways,
      url: `/blog/${generateSlug(title)}`,
    });
    setGeneratedNewsletter(newsletter);
    toast({ title: "Content auto-generated!" });
  };

  const handleExport = () => {
    if (!title || !currentContent) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    const slug = generateSlug(title);

    if (editorMode === "blocks") {
      // Export as JSON with blocks
      const data = {
        title,
        slug,
        author,
        publish_date: publishDate,
        tags: selectedTopics,
        excerpt: excerpt || generateExcerpt(currentContent),
        featured_image: featuredImage || undefined,
        key_takeaways: keyTakeaways,
        related_episode: relatedEpisode || undefined,
        show_episode_callout: showEpisodeCallout,
        blocks,
      };
      downloadFile(JSON.stringify(data, null, 2), `${slug}.json`, "application/json");
      toast({ title: "Blog JSON exported with blocks! Place it in content/blog/" });
    } else {
      exportBlogMarkdown({
        title,
        slug,
        author,
        publish_date: publishDate,
        tags: selectedTopics,
        excerpt: excerpt || generateExcerpt(currentContent),
        featured_image: featuredImage || undefined,
        key_takeaways: keyTakeaways,
        content: markdownContent,
      });
      toast({ title: "Blog Markdown exported!" });
    }
    saveToHistory("blog", { title, slug, date: publishDate, author });
  };

  const handlePublishToServer = async () => {
    if (!title || !currentContent) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    const slug = generateSlug(title);
    const result = await saveBlog({
      title,
      slug,
      author: selectedAuthors[0] || "sarah",
      authors: selectedAuthors,
      author_avatars: selectedAuthors.map((k) => authorAvatars[k] || "").filter(Boolean).length > 0
        ? selectedAuthors.map((k) => authorAvatars[k] || "")
        : undefined,
      publish_date: publishDate,
      tags: selectedTopics,
      excerpt: excerpt || generateExcerpt(currentContent),
      featured_image: featuredImage || undefined,
      key_takeaways: keyTakeaways,
      related_episode: relatedEpisode || undefined,
      show_episode_callout: showEpisodeCallout,
      content: currentContent,
      blocks: editorMode === "blocks" ? blocks : undefined,
      format: editorMode === "blocks" ? "json" : "md",
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
    saveDraft(`blog-${generateSlug(title) || "new"}`, {
      title, author, publishDate, selectedTopics, editorMode,
      blocks, markdownContent: editorMode === "markdown" ? markdownContent : blocksToMarkdown(blocks),
      featuredImage, excerpt, readingTime, seoDescription,
      keyTakeaways, generatedNewsletter,
    });
    toast({ title: "Draft saved locally" });
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
            {searchParams.get("edit") ? "Update your existing blog post." : "Build your blog post with structured blocks or raw Markdown."}
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
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Author</label>
              <select
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {AUTHOR_OPTIONS.map((a) => (
                  <option key={a.key} value={a.key}>{a.label}</option>
                ))}
              </select>
            </div>
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

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label key={tag.slug} className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <Checkbox checked={selectedTopics.includes(tag.name)} onCheckedChange={() => toggleTopic(tag.name)} />
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `hsl(${tag.color} / 0.15)`,
                      color: `hsl(${tag.color})`,
                    }}
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
                      const newTag: Tag = { name: newTagName.trim(), slug, color: "199 62% 28%" };
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
                      const newTag: Tag = { name: newTagName.trim(), slug, color: "199 62% 28%" };
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
              Select an episode to display a "Listen to the Episode" callout in the article. Choose "None" to hide the callout.
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
              variant={editorMode === "blocks" ? "default" : "ghost"}
              className="h-7 text-xs gap-1.5"
              onClick={() => handleSwitchMode("blocks")}
            >
              <Blocks className="h-3.5 w-3.5" />
              Block Editor
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
          {editorMode === "blocks" ? (
            <BlockEditor blocks={blocks} onChange={setBlocks} />
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
              ? `${wordCount} words • ${calculateReadingTime(currentContent)}`
              : "0 words"
            }
            {editorMode === "blocks" && ` • ${blocks.length} blocks`}
          </p>
        </CardContent>
      </Card>

      {/* Auto-generated TOC Preview */}
      {editorMode === "blocks" && blocks.filter(b => b.type === "heading" && (b as any).level <= 3).length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <List className="h-4 w-4" />
              Auto-Generated Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">This TOC will appear automatically on the published article. No manual setup needed.</p>
            <ul className="space-y-1">
              {extractTocItems(blocks).map((item) => (
                <li
                  key={item.id}
                  className={`text-sm text-foreground/70 border-l-2 border-border ${item.level === 3 ? "pl-5" : "pl-3"} py-1`}
                >
                  {item.text}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleAutoGenerate} className="gap-2">
          <Wand2 className="h-4 w-4" />
          Auto-Generate Fields
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="gap-2" variant="secondary">
              <Save className="h-4 w-4" />
              {searchParams.get("edit") ? "Update Post" : "Publish to Server"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {searchParams.get("edit") ? "Update this post?" : "Publish this post?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {searchParams.get("edit")
                  ? "This will overwrite the existing blog post with your changes."
                  : "This will publish the blog post and make it publicly visible."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handlePublishToServer}>
                {searchParams.get("edit") ? "Update" : "Publish"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export {editorMode === "blocks" ? "JSON" : "Markdown"}
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
                  <Input value={generateSlug(title)} readOnly className="bg-muted/50" />
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
        </div>
      )}
    </div>
  );
};

export default PublishBlog;
