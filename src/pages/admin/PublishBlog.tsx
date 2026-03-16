import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Wand2,
  Download,
  Save,
  Sparkles,
  Mail,
  Plus,
  Lightbulb,
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
} from "@/lib/file-export";
import { saveBlog } from "@/lib/content-manager";

const AUTHOR_OPTIONS = [
  { key: "sarah", label: "Sarah Mitchell" },
  { key: "marcus", label: "Marcus Chen" },
];

const PublishBlog = () => {
  const { toast } = useToast();

  const [tags, setTags] = useState<Tag[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("sarah");
  const [publishDate, setPublishDate] = useState(formatDateISO(new Date()));
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);

  // Auto-generated
  const [excerpt, setExcerpt] = useState("");
  const [readingTime, setReadingTime] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([]);
  const [showGenerated, setShowGenerated] = useState(false);

  useEffect(() => {
    setTags(getAllTags());
  }, []);

  // Newsletter
  const [generatedNewsletter, setGeneratedNewsletter] = useState<{
    subject: string;
    body: string;
  } | null>(null);

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

  const handleAutoGenerate = () => {
    if (!content) {
      toast({ title: "Write or paste content first", variant: "destructive" });
      return;
    }

    const autoExcerpt = generateExcerpt(content);
    const autoTime = calculateReadingTime(content);
    const autoSeo = generateSEODescription(title, autoExcerpt);
    const autoTakeaways = generateKeyTakeaways(content);

    setExcerpt(autoExcerpt);
    setReadingTime(autoTime);
    setSeoDescription(autoSeo);
    setKeyTakeaways(autoTakeaways);
    setShowGenerated(true);

    // Auto-suggest tags based on content
    setSuggestedTags(suggestTags(content + " " + title));

    // Auto-generate newsletter
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
    if (!title || !content) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }

    const slug = generateSlug(title);
    exportBlogMarkdown({
      title,
      slug,
      author,
      publish_date: publishDate,
      tags: selectedTopics,
      excerpt: excerpt || generateExcerpt(content),
      featured_image: featuredImage || undefined,
      key_takeaways: keyTakeaways,
      content,
    });
    saveToHistory("blog", { title, slug, date: publishDate, author });
    toast({ title: "Blog Markdown exported! Place it in src/content/blog/" });
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
      title, author, publishDate, selectedTopics, content,
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
            Publish Blog Post
          </h1>
          <p className="text-muted-foreground mt-1">
            Write or paste your blog content and auto-generate supporting fields.
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
            {/* Add new tag inline */}
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
            {/* Suggested tags */}
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

      {/* Content Editor */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Content (Markdown)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={20}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"Write your blog post here using Markdown...\n\n## Introduction\n\nYour introduction here...\n\n## Main Section\n\nYour content...\n\n## Conclusion\n\nWrap it up..."}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {content ? `${content.split(/\s+/).filter(Boolean).length} words • ${calculateReadingTime(content)}` : "0 words"}
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleAutoGenerate} className="gap-2">
          <Wand2 className="h-4 w-4" />
          Auto-Generate Fields
        </Button>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Blog .md
        </Button>
      </div>

      {/* Generated Fields */}
      {showGenerated && (
        <div className="space-y-4">
          <Card className="bg-card border-teal/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-teal" />
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

          {/* Newsletter */}
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
