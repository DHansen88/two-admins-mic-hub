import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { marked } from "marked";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedContentCarousel, { buildRelatedItems } from "@/components/RelatedContentCarousel";
import TopicTag from "@/components/TopicTag";
import BlogBlockRenderer from "@/components/BlogBlockRenderer";
import TableOfContents, { extractTocItems } from "@/components/TableOfContents";
import EpisodeCallout from "@/components/EpisodeCallout";
import { useVisibleBlogBySlug, useVisibleRelatedPosts, useVisibleRelatedEpisodesForBlog, useVisibleEpisodes } from "@/hooks/useVisibleContent";
import { Calendar, Clock, ArrowLeft, Share2, Linkedin, Link as LinkIcon, Mail, Lightbulb, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { post, isLoading } = useVisibleBlogBySlug(slug || "");
  const relatedPosts = useVisibleRelatedPosts(slug || "", 3);
  const relatedEpisodes = useVisibleRelatedEpisodesForBlog(slug || "", 3);
  const allEpisodes = useVisibleEpisodes();
  const { toast } = useToast();
  const tocItems = useMemo(() => (post?.blocks ? extractTocItems(post.blocks) : []), [post]);

  // Find related episode for callout — only when explicitly set
  const calloutEpisode = useMemo(() => {
    if (!post || post.showEpisodeCallout === false) return null;
    if (!post.relatedEpisode) return null;
    return allEpisodes.find(
      (ep) => ep.slug === post.relatedEpisode || `episode-${ep.number}` === post.relatedEpisode
    ) || null;
  }, [post]);

  // Render HTML content from the rich text editor
  const renderedHtml = useMemo(() => {
    if (!post) return "";
    // If post has html_content, use it directly
    if ((post as any).html_content) return (post as any).html_content;
    // If post has blocks, BlogBlockRenderer handles it
    if (post.blocks && post.blocks.length > 0) return "";
    // Fall back to markdown parsing
    if (post.content) return marked.parse(post.content, { async: false }) as string;
    return "";
  }, [post]);

  // SEO meta tags
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Two Admins and a Mic`;
      const setMeta = (name: string, content: string) => {
        let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };
      setMeta('description', post.excerpt);
      setMeta('og:title', post.title);
      setMeta('og:description', post.excerpt);
      setMeta('og:type', 'article');

      // JSON-LD structured data
      const jsonLd = document.createElement('script');
      jsonLd.type = 'application/ld+json';
      jsonLd.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        author: post.authors.map((a) => ({ '@type': 'Person', name: a.name })),
        publisher: { '@type': 'Organization', name: 'Two Admins and a Mic' },
      });
      document.head.appendChild(jsonLd);
      return () => { jsonLd.remove(); };
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied to clipboard!" });
  };

  // Check if authors have real data (name not just a key)
  const hasAuthorData = post.authors.some((a) => a.bio || a.avatar);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 md:py-24 bg-gradient-to-b from-slate to-navy relative overflow-hidden">
          {/* Manuscript lines */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-white/[0.07]"
              style={{
                top: `${18 + i * 6.5}%`,
                width: `${60 + (i % 4) * 10}%`,
                left: `${-10 + (i % 3) * 5}%`,
                animation: `manuscriptSlide ${14 + i * 1.5}s linear infinite`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-[800px] mx-auto animate-fade-in">
              <Link
                to="/blog"
                className="inline-flex items-center space-x-2 text-background/70 hover:text-background transition-colors mb-10"
              >
                <ArrowLeft size={18} />
                <span>Back to Blog</span>
              </Link>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-display font-bold text-background mb-8 leading-tight">
                {post.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-6 text-background/70">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {post.authors.map((a, i) => (
                      <Avatar key={i} className="h-10 w-10 border-2 border-background">
                        <AvatarImage src={a.avatar} alt={a.name} />
                        <AvatarFallback className="bg-teal text-background">
                          {a.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div>
                    <p className="text-background font-medium">
                      {post.authors.map((a) => a.name).join(" & ")}
                    </p>
                    {post.authors[0]?.role && (
                      <p className="text-sm">{post.authors[0].role}</p>
                    )}
                  </div>
                </div>
                <span className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>{post.date}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{post.readTime}</span>
                </span>
              </div>

              {/* Share Actions */}
              <div className="flex items-center gap-2 mt-8">
                <span className="text-background/60 text-sm flex items-center gap-1.5">
                  <Share2 size={14} /> Share
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-background/70 hover:text-background hover:bg-background/10 rounded-full h-9 w-9"
                  onClick={copyLink}
                  title="Copy link"
                >
                  <LinkIcon size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-background/70 hover:text-background hover:bg-background/10 rounded-full h-9 w-9"
                  onClick={() =>
                    window.open(
                      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                      "_blank"
                    )
                  }
                  title="Share on LinkedIn"
                >
                  <Linkedin size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-background/70 hover:text-background hover:bg-background/10 rounded-full h-9 w-9"
                  onClick={() =>
                    window.open(
                      `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareUrl)}`,
                      "_blank"
                    )
                  }
                  title="Share via email"
                >
                  <Mail size={16} />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-14 md:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-[1200px] mx-auto">
              {/* Episode Callout — full container width, above the grid */}
              {calloutEpisode && <EpisodeCallout episode={calloutEpisode} />}

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-16">
                {/* Main Content */}
                <article className="min-w-0">
                  {/* Mobile TOC */}
                  {tocItems.length > 0 && (
                    <div className="lg:hidden mb-10">
                      <TableOfContents items={tocItems} />
                    </div>
                  )}
                  {/* Desktop TOC — inline above content on large screens */}
                  {tocItems.length > 0 && (
                    <div className="hidden lg:block mb-12">
                      <TableOfContents items={tocItems} />
                    </div>
                  )}
                  {post.blocks && post.blocks.length > 0 ? (
                    <BlogBlockRenderer blocks={post.blocks} />
                  ) : renderedHtml ? (
                    <div
                      className="prose prose-lg max-w-[720px]
                        prose-headings:font-display prose-headings:text-foreground
                        prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-14 prose-h2:mb-6
                        prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-12 prose-h3:mb-5
                        prose-p:text-muted-foreground prose-p:text-base prose-p:md:text-lg prose-p:leading-relaxed prose-p:mb-6 prose-p:text-left
                        prose-strong:text-foreground prose-strong:font-semibold
                        prose-li:text-muted-foreground prose-li:leading-relaxed prose-li:my-1.5
                        prose-ul:my-6 prose-ul:pl-6 prose-ol:my-6 prose-ol:pl-6
                        prose-blockquote:border-l-4 prose-blockquote:border-accent/40 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-foreground/80
                        prose-img:rounded-lg prose-img:w-full prose-img:my-8
                        prose-hr:my-10 prose-hr:border-border
                        prose-a:text-accent prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-accent/80
                        animate-fade-in"
                      dangerouslySetInnerHTML={{ __html: renderedHtml }}
                    />
                  ) : null}
                </article>

                {/* Author Sidebar (right) — hidden below lg */}
                {hasAuthorData && (
                  <aside className="hidden lg:block">
                    <div className="sticky top-24 space-y-6">
                      <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                        <h3 className="font-display font-semibold text-foreground mb-5 text-lg">
                          {post.authors.length > 1 ? "About the Authors" : "About the Author"}
                        </h3>
                        <div className="space-y-5">
                          {post.authors.map((a, i) => (
                            <div key={i}>
                              <div className="flex items-center space-x-3 mb-3">
                                <Avatar className="h-14 w-14">
                                  <AvatarImage src={a.avatar} alt={a.name} />
                                  <AvatarFallback className="bg-teal text-background text-sm">
                                    {a.name.split(" ").map((n) => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-foreground">{a.name}</p>
                                  {a.role && <p className="text-sm text-muted-foreground">{a.role}</p>}
                                </div>
                              </div>
                              {a.bio && <p className="text-sm text-muted-foreground leading-relaxed">{a.bio}</p>}
                              {(a.linkedin || a.website) && (
                                <div className="flex items-center gap-3 mt-3">
                                  {a.linkedin && (
                                    <a href={a.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                      <Linkedin className="h-4 w-4" />
                                    </a>
                                  )}
                                  {a.website && (
                                    <a href={a.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                      <Globe className="h-4 w-4" />
                                    </a>
                                  )}
                                </div>
                              )}
                              {i < post.authors.length - 1 && <hr className="my-5 border-border" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </aside>
                )}

                {/* Mobile Author Card — shown below lg */}
                {hasAuthorData && (
                  <div className="lg:hidden">
                    <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                      <h3 className="font-display font-semibold text-foreground mb-5 text-lg">
                        {post.authors.length > 1 ? "About the Authors" : "About the Author"}
                      </h3>
                      <div className="space-y-5">
                        {post.authors.map((a, i) => (
                          <div key={i}>
                            <div className="flex items-center space-x-3 mb-3">
                              <Avatar className="h-14 w-14">
                                <AvatarImage src={a.avatar} alt={a.name} />
                                <AvatarFallback className="bg-teal text-background text-sm">
                                  {a.name.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-foreground">{a.name}</p>
                                {a.role && <p className="text-sm text-muted-foreground">{a.role}</p>}
                              </div>
                            </div>
                            {a.bio && <p className="text-sm text-muted-foreground leading-relaxed">{a.bio}</p>}
                            {(a.linkedin || a.website) && (
                              <div className="flex items-center gap-3 mt-3">
                                {a.linkedin && (
                                  <a href={a.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                    <Linkedin className="h-4 w-4" />
                                  </a>
                                )}
                                {a.website && (
                                  <a href={a.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                    <Globe className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            )}
                            {i < post.authors.length - 1 && <hr className="my-5 border-border" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Unified Article Footer */}
        <section className="pt-4 pb-12 md:pt-6 md:pb-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-[1200px] mx-auto">
              <div className="max-w-[720px] rounded-2xl bg-muted/40 border border-border p-6 md:p-8 space-y-8">
                {/* Key Takeaways */}
                {post.keyTakeaways && post.keyTakeaways.length > 0 && (
                  <div>
                    <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-accent" />
                      Key Takeaways
                    </h2>
                    <ul className="space-y-4">
                      {post.keyTakeaways.map((takeaway, i) => (
                        <li key={i} className="flex items-start gap-3 text-foreground/80">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />
                          <span className="leading-relaxed">{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Divider if takeaways exist */}
                {post.keyTakeaways && post.keyTakeaways.length > 0 && (
                  <hr className="border-none h-px bg-border" />
                )}

                {/* Topics */}
                <div>
                  <h3 className="text-sm font-display font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.topics.map((topic) => (
                      <TopicTag key={topic} topic={topic} />
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Related Content Carousel */}
        <RelatedContentCarousel
          items={buildRelatedItems(relatedPosts, relatedEpisodes)}
        />
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
