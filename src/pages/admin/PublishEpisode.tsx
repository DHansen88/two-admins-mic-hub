import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import BlogBlockEditor from "@/components/BlogBlockEditor";
import { type ContentBlock } from "@/lib/block-types";
import { extractTocItems } from "@/components/TableOfContents";
import {
  Mic,
  Wand2,
  Download,
  FileText,
  Save,
  Sparkles,
  Plus,
  Lightbulb,
  List,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllTags, addTag, generateTagSlug, suggestTags, type Tag } from "@/data/tags";
import {
  generateSlug,
  generateKeyTakeaways,
  generateExcerpt,
  generateSEODescription,
  generateBlogFromTranscript,
  generateNewsletterDraft,
  formatDateISO,
} from "@/lib/content-generator";
import {
  exportEpisodeJson,
  exportBlogMarkdown,
  exportNewsletterDraft,
  saveDraft,
  saveToHistory,
} from "@/lib/file-export";
import { saveEpisode, saveBlog } from "@/lib/content-manager";
import { allEpisodesUnfiltered } from "@/data/episodeData";

const PublishEpisode = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);

  useEffect(() => {
    setTags(getAllTags());
  }, []);

  // Load existing episode for editing
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId) return;
    const ep = allEpisodesUnfiltered.find((e) => String(e.number) === editId);
    if (!ep) return;
    setEpisodeNumber(String(ep.number));
    setTitle(ep.title);
    setDescription(ep.description || "");
    setPublishDate(ep.date || formatDateISO(new Date()));
    setDuration(ep.duration || "");
    setSelectedTopics(ep.topics || []);
    setRiversideUrl(ep.riversideEmbedUrl || "");
    setSpotifyUrl(ep.platformLinks?.spotify || "");
    setAppleUrl(ep.platformLinks?.apple || "");
    setYoutubeUrl(ep.platformLinks?.youtube || "");
    setGuestName("");
    setThumbnailName(ep.thumbnailUrl || "");
    toast({ title: `Editing: Ep. ${ep.number} — ${ep.title}` });
  }, [searchParams]);

  const [episodeNumber, setEpisodeNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionBlocks, setDescriptionBlocks] = useState<ContentBlock[]>([]);
  const [useBlockEditor, setUseBlockEditor] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [publishDate, setPublishDate] = useState(formatDateISO(new Date()));
  const [duration, setDuration] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [riversideUrl, setRiversideUrl] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [appleUrl, setAppleUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [thumbnailName, setThumbnailName] = useState("");

  // Auto-generated content
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [showGenerated, setShowGenerated] = useState(false);

  // Blog generation
  const [generatedBlog, setGeneratedBlog] = useState<{
    title: string;
    content: string;
    excerpt: string;
    keyTakeaways: string[];
  } | null>(null);

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

  const handleTranscriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setTranscript(ev.target?.result as string);
        toast({ title: "Transcript loaded" });
      };
      reader.readAsText(file);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailName(`/assets/images/${file.name}`);
      toast({ title: `Thumbnail selected: ${file.name}. Remember to upload the image to /assets/images/ on your server.` });
    }
  };

  const handleAutoGenerate = () => {
    const sourceText = transcript || description;
    if (!sourceText) {
      toast({ title: "Add a description or transcript first", variant: "destructive" });
      return;
    }

    const takeaways = generateKeyTakeaways(sourceText);
    const excerptSummary = generateExcerpt(sourceText, 200);
    const seo = generateSEODescription(title, excerptSummary);

    setKeyTakeaways(takeaways);
    setSummary(excerptSummary);
    setSeoDescription(seo);
    setShowGenerated(true);

    // Auto-suggest tags
    setSuggestedTags(suggestTags(sourceText + " " + title));

    // Auto-generate blog from transcript
    if (transcript) {
      const blog = generateBlogFromTranscript(title, transcript);
      setGeneratedBlog(blog);
    }

    // Auto-generate newsletter
    const newsletter = generateNewsletterDraft({
      type: "episode",
      title,
      summary: excerptSummary,
      takeaways,
      url: `/episodes/${generateSlug(title)}`,
    });
    setGeneratedNewsletter(newsletter);

    toast({ title: "Content auto-generated successfully!" });
  };

  const buildEpisodeData = () => ({
    number: parseInt(episodeNumber) || 0,
    title,
    slug: `episode-${episodeNumber}-${generateSlug(title)}`,
    description: useBlockEditor
      ? descriptionBlocks.map(b => ('text' in b ? b.text : '')).filter(Boolean).join(' ')
      : description,
    descriptionBlocks: useBlockEditor && descriptionBlocks.length > 0 ? descriptionBlocks : undefined,
    duration,
    date: publishDate,
    topics: selectedTopics,
    guestName: guestName || undefined,
    riversideEmbedUrl: riversideUrl || undefined,
    thumbnailUrl: thumbnailName || "/placeholder.svg",
    platformLinks: {
      spotify: spotifyUrl || undefined,
      apple: appleUrl || undefined,
      youtube: youtubeUrl || undefined,
    },
    transcript: transcript || undefined,
    showNotes: keyTakeaways.length > 0 ? keyTakeaways : undefined,
  });

  const handleExportEpisode = () => {
    if (!title || !episodeNumber) {
      toast({ title: "Episode number and title are required", variant: "destructive" });
      return;
    }
    const data = buildEpisodeData();
    exportEpisodeJson(data);
    saveToHistory("episode", data);
    toast({ title: "Episode JSON exported! Place it in src/content/podcasts/" });
  };

  const handleExportBlog = () => {
    if (!generatedBlog) {
      toast({ title: "Generate content first", variant: "destructive" });
      return;
    }
    exportBlogMarkdown({
      title: generatedBlog.title,
      slug: generateSlug(generatedBlog.title),
      author: "sarah",
      publish_date: publishDate,
      tags: selectedTopics,
      excerpt: generatedBlog.excerpt,
      key_takeaways: generatedBlog.keyTakeaways,
      content: generatedBlog.content,
    });
    saveToHistory("blog", { title: generatedBlog.title, date: publishDate });
    toast({ title: "Blog Markdown exported! Place it in src/content/blog/" });
  };

  const handleExportNewsletter = () => {
    if (!generatedNewsletter) return;
    exportNewsletterDraft(generatedNewsletter, `newsletter-ep${episodeNumber}.txt`);
    saveToHistory("newsletter", { ...generatedNewsletter, episodeNumber, date: publishDate });
    toast({ title: "Newsletter draft exported!" });
  };

  const handleSaveDraft = () => {
    saveDraft(`episode-${episodeNumber || "new"}`, {
      episodeNumber, title, description, guestName, publishDate,
      duration, selectedTopics, riversideUrl, spotifyUrl, appleUrl,
      youtubeUrl, transcript, thumbnailName, keyTakeaways, summary,
      seoDescription, generatedBlog, generatedNewsletter,
    });
    toast({ title: "Draft saved locally" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <Mic className="h-7 w-7 text-primary" />
            {searchParams.get("edit") ? "Edit Podcast Episode" : "Publish Podcast Episode"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {searchParams.get("edit") ? "Update your existing podcast episode." : "Fill in the details and auto-generate supporting content."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSaveDraft}>
          <Save className="h-4 w-4 mr-1" /> Save Draft
        </Button>
      </div>

      {/* Episode Details */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Episode Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Episode Number *</label>
              <Input type="number" value={episodeNumber} onChange={(e) => setEpisodeNumber(e.target.value)} placeholder="13" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Duration</label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="42 min" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Episode Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Leading Through Change: Strategies for Modern Administrators" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Episode Description *</label>
              <div className="flex rounded-lg overflow-hidden border border-border">
                <button
                  type="button"
                  onClick={() => setUseBlockEditor(true)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${useBlockEditor ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  Block Editor
                </button>
                <button
                  type="button"
                  onClick={() => setUseBlockEditor(false)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${!useBlockEditor ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  Plain Text
                </button>
              </div>
            </div>
            {useBlockEditor ? (
              <BlogBlockEditor blocks={descriptionBlocks} onChange={setDescriptionBlocks} />
            ) : (
              <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Episode description..." />
            )}
          </div>

          {/* Auto-generated TOC Preview */}
          {useBlockEditor && descriptionBlocks.filter(b => b.type === "heading" && (b as any).level <= 3).length > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
                <List className="h-3.5 w-3.5" />
                Auto-Generated Table of Contents
              </p>
              <ul className="space-y-1">
                {extractTocItems(descriptionBlocks).map((item) => (
                  <li
                    key={item.id}
                    className={`text-sm text-foreground/70 border-l-2 border-border ${item.level === 3 ? "pl-5" : "pl-3"} py-1`}
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Guest Name</label>
              <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="(optional)" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Publish Date *</label>
              <Input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
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

      {/* Uploads */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Media & Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Thumbnail Image</label>
              <Input type="file" accept="image/*" onChange={handleThumbnailUpload} />
              {thumbnailName && <p className="text-xs text-muted-foreground">Path: {thumbnailName}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Transcript File</label>
              <Input type="file" accept=".txt,.md" onChange={handleTranscriptUpload} />
              {transcript && <p className="text-xs text-teal">✓ Transcript loaded ({transcript.split(/\s+/).length} words)</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Riverside Embed URL</label>
            <Input value={riversideUrl} onChange={(e) => setRiversideUrl(e.target.value)} placeholder="https://riverside.fm/embed/..." />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Spotify</label>
              <Input value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Apple Podcasts</label>
              <Input value={appleUrl} onChange={(e) => setAppleUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">YouTube</label>
              <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript preview */}
      {transcript && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Transcript Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto bg-muted/50 p-4 rounded-lg">
              {transcript.substring(0, 1000)}
              {transcript.length > 1000 && "..."}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Auto Generate */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleAutoGenerate} className="gap-2">
          <Wand2 className="h-4 w-4" />
          Auto-Generate Content
        </Button>
        <Button
          onClick={async () => {
            if (!title || !episodeNumber) {
              toast({ title: "Episode number and title are required", variant: "destructive" });
              return;
            }
            const data = buildEpisodeData();
            const result = await saveEpisode(data);
            if (result.success) {
              saveToHistory("episode", data);
              toast({ title: "Episode published to server!" });
            } else {
              toast({ title: result.error || "Publish failed", variant: "destructive" });
            }
          }}
          className="gap-2"
          variant="secondary"
        >
          <Save className="h-4 w-4" />
          {searchParams.get("edit") ? "Update Episode" : "Publish to Server"}
        </Button>
        <Button onClick={handleExportEpisode} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Episode JSON
        </Button>
      </div>

      {/* Generated Content */}
      {showGenerated && (
        <div className="space-y-4">
          <Card className="bg-card border-teal/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-teal" />
                Auto-Generated Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Summary</label>
                <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">SEO Description</label>
                <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} />
              </div>
              <div>
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

          {/* Generated Blog */}
          {generatedBlog && (
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Generated Blog Article</CardTitle>
                <Button size="sm" variant="outline" onClick={handleExportBlog} className="gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Export Blog .md
                </Button>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-foreground mb-2">{generatedBlog.title}</h3>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap max-h-64 overflow-y-auto bg-muted/50 p-4 rounded-lg">
                  {generatedBlog.content}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Generated Newsletter */}
          {generatedNewsletter && (
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Newsletter Draft</CardTitle>
                <Button size="sm" variant="outline" onClick={handleExportNewsletter} className="gap-1">
                  <Download className="h-3.5 w-3.5" />
                  Export for Beehiiv
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-foreground mb-2">
                  Subject: {generatedNewsletter.subject}
                </p>
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

export default PublishEpisode;
