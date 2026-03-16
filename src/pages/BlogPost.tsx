import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { marked } from "marked";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import EpisodeCard from "@/components/EpisodeCard";
import TopicTag from "@/components/TopicTag";
import BlogBlockRenderer from "@/components/BlogBlockRenderer";
import TableOfContents, { extractTocItems } from "@/components/TableOfContents";
import EpisodeCallout from "@/components/EpisodeCallout";
import { getBlogBySlug, getRelatedPosts } from "@/data/blogData";
import { getRelatedEpisodesForBlog } from "@/data/crossLinks";
import { allEpisodes } from "@/data/episodeData";
import { Calendar, Clock, ArrowLeft, Share2, Linkedin, Link as LinkIcon, Mail, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogBySlug(slug) : undefined;
  const relatedPosts = slug ? getRelatedPosts(slug, 3) : [];
  const relatedEpisodes = slug ? getRelatedEpisodesForBlog(slug, 3) : [];
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
        author: { '@type': 'Person', name: post.author.name },
        publisher: { '@type': 'Organization', name: 'Two Admins and a Mic' },
      });
      document.head.appendChild(jsonLd);
      return () => { jsonLd.remove(); };
    }
  }, [post]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied to clipboard!" });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-slate to-navy relative overflow-hidden">
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
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto animate-fade-in">
              <Link
                to="/blog"
                className="inline-flex items-center space-x-2 text-background/70 hover:text-background transition-colors mb-8"
              >
                <ArrowLeft size={18} />
                <span>Back to Blog</span>
              </Link>

              {/* Topic Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.topics.map((topic) => (
                  <TopicTag key={topic} topic={topic} variant="light" />
                ))}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-display font-bold text-background mb-4">
                {post.title}
              </h1>

              {/* Intro/Summary */}
              <p className="text-lg text-background/70 mb-6">{post.excerpt}</p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-6 text-background/70">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback className="bg-teal text-background">
                      {post.author.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-background font-medium">{post.author.name}</p>
                    <p className="text-sm">{post.author.role}</p>
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
              <div className="flex items-center gap-2 mt-6">
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
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-[1200px] mx-auto">
              {/* Episode Callout — full container width, above the grid */}
              {calloutEpisode && <EpisodeCallout episode={calloutEpisode} />}

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-12">
                {/* Main Content */}
                <article className="min-w-0">
                  {/* Mobile TOC */}
                  {tocItems.length > 0 && (
                    <div className="lg:hidden mb-8">
                      <TableOfContents items={tocItems} />
                    </div>
                  )}
                  {/* Desktop TOC — inline above content on large screens */}
                  {tocItems.length > 0 && (
                    <div className="hidden lg:block mb-10">
                      <TableOfContents items={tocItems} />
                    </div>
                  )}
                  {post.blocks && post.blocks.length > 0 ? (
                    <BlogBlockRenderer blocks={post.blocks} />
                  ) : (
                    <div
                      className="prose prose-lg max-w-[760px] prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-[1.75] prose-p:text-justify prose-p:mb-6 prose-strong:text-foreground prose-li:text-muted-foreground prose-li:leading-[1.75] prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-12 prose-h2:mb-5 prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-ul:my-5 prose-li:my-1 prose-img:rounded-lg prose-img:w-full animate-fade-in"
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(post.content, { async: false }) as string,
                      }}
                    />
                  )}
                </article>

                {/* Author Sidebar (right) — hidden below lg */}
                <aside className="hidden lg:block">
                  <div className="sticky top-24 space-y-6">
                    <div className="p-6 bg-card rounded-xl border border-border">
                      <h3 className="font-display font-semibold text-foreground mb-4">
                        About the Author
                      </h3>
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={post.author.avatar} alt={post.author.name} />
                          <AvatarFallback className="bg-teal text-background">
                            {post.author.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{post.author.name}</p>
                          <p className="text-sm text-muted-foreground">{post.author.role}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{post.author.bio}</p>
                    </div>
                  </div>
                </aside>

                {/* Mobile Author Card — shown below lg */}
                <div className="lg:hidden">
                  <div className="p-6 bg-card rounded-xl border border-border">
                    <h3 className="font-display font-semibold text-foreground mb-4">
                      About the Author
                    </h3>
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback className="bg-teal text-background">
                          {post.author.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{post.author.name}</p>
                        <p className="text-sm text-muted-foreground">{post.author.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{post.author.bio}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Takeaways */}
        {post.keyTakeaways && post.keyTakeaways.length > 0 && (
          <section className="py-12 bg-muted/40 border-t border-border">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-accent" />
                  Key Takeaways
                </h2>
                <ul className="space-y-3">
                  {post.keyTakeaways.map((takeaway, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-foreground/80"
                    >
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />
                      <span className="text-sm leading-relaxed">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Topic Tags at bottom */}
        <div className="bg-background py-8 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">
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

        {/* Back to Blog */}
        <div className="bg-background pb-4">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link
                to="/blog"
                className="inline-flex items-center space-x-2 text-accent hover:text-accent/80 transition-colors font-medium"
              >
                <ArrowLeft size={18} />
                <span>Back to Blog</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Related Podcast Episodes */}
        {relatedEpisodes.length > 0 && (
          <section className="py-16 bg-muted/40 border-t border-border">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-display font-bold text-foreground mb-8">
                  Related Podcast Episodes
                </h2>
                <div className="space-y-5">
                  {relatedEpisodes.map((ep) => (
                    <EpisodeCard key={ep.number} {...ep} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-muted">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-display font-bold text-foreground mb-8">
                  Related Articles
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map((blog) => (
                    <BlogCard key={blog.slug} {...blog} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
