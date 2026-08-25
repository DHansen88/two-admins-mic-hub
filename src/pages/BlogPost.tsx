import { useParams, Link, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { marked } from "marked";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import RelatedContentCarousel, { buildRelatedItems } from "@/components/RelatedContentCarousel";
import TopicTag from "@/components/TopicTag";
import BlogBlockRenderer from "@/components/BlogBlockRenderer";
import EpisodeCallout from "@/components/EpisodeCallout";
import { useVisibleBlogBySlug, useVisibleRelatedPosts, useVisibleRelatedEpisodesForBlog, useVisibleEpisodes } from "@/hooks/useVisibleContent";
import { ArrowLeft, Lightbulb, Linkedin, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BlogPost as BlogPostData } from "@/lib/content-loader";

type RichBlogPost = BlogPostData & {
  html_content?: string;
  coverImage?: string;
  heroImage?: string;
};

function normalizeArticleHtml(html: string): string {
  return html
    .replace(/<br\s+class=["']ProseMirror-trailingBreak["']\s*\/?>/gi, "")
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/<p>\s*(?:<br\s*\/?>\s*)+/gi, "<p>")
    .replace(/(?:<br\s*\/?>\s*(?:&nbsp;|\s)*)+<\/p>/gi, "</p>")
    .replace(/(?:<div class="article-blank-line" aria-hidden="true"><\/div>\s*)+/gi, "");
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { post, isLoading } = useVisibleBlogBySlug(slug || "");
  const relatedPosts = useVisibleRelatedPosts(slug || "", 3);
  const relatedEpisodes = useVisibleRelatedEpisodesForBlog(slug || "", 3);
  const allEpisodes = useVisibleEpisodes();

  const calloutEpisode = useMemo(() => {
    if (!post || post.showEpisodeCallout === false) return null;
    if (!post.relatedEpisode) return null;
    return allEpisodes.find(
      (ep) => ep.slug === post.relatedEpisode || `episode-${ep.number}` === post.relatedEpisode
    ) || null;
  }, [post, allEpisodes]);

  const renderedHtml = useMemo(() => {
    if (!post) return "";
    const richPost = post as RichBlogPost;
    if (richPost.html_content) return normalizeArticleHtml(richPost.html_content);
    if (post.blocks && post.blocks.length > 0) return "";
    if (post.content) return normalizeArticleHtml(marked.parse(post.content, { async: false, breaks: true }) as string);
    return "";
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

  if (!post) return <Navigate to="/blog" replace />;

  const richPost = post as RichBlogPost;
  const hasAuthorData = post.authors.some((a) => a.bio || a.avatar);

  return (
    <div className="min-h-screen">
      <SEO
        title={`${post.title} — Two Admins & a Mic™`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        image={richPost.coverImage || richPost.heroImage || post.featuredImage}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          author: post.authors.map((a) => ({ "@type": "Person", name: a.name })),
          publisher: { "@type": "Organization", name: "Two Admins & a Mic™" },
          url: `https://twoadminsandamic.com/blog/${post.slug}`,
        }}
      />
      <Header />
      <main className="pt-20">
        <article className="max-w-[720px] mx-auto px-5 py-14 md:py-20">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          {/* Title */}
          <h1 className="text-3xl md:text-[42px] font-display font-bold text-foreground leading-tight mb-6 text-left">
            {post.title}
          </h1>

          {/* Author Meta */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex -space-x-2">
              {post.authors.map((a, i) => (
                <Avatar key={i} className="h-10 w-10 border-2 border-background">
                  <AvatarImage src={a.avatar} alt={a.name} />
                  <AvatarFallback className="bg-teal text-background text-xs">
                    {a.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                {post.authors.map((a) => a.name).join(" & ")}
              </p>
              <p className="text-sm text-muted-foreground">
                {post.date} • {post.readTime}
              </p>
            </div>
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full rounded-xl mb-10 shadow-md"
            />
          )}

          {/* Episode Callout */}
          {calloutEpisode && <EpisodeCallout episode={calloutEpisode} />}

          {/* Article Content */}
          {post.blocks && post.blocks.length > 0 ? (
            <BlogBlockRenderer blocks={post.blocks} />
          ) : renderedHtml ? (
            <div
              className="article-content animate-fade-in"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          ) : null}

          {/* Tags */}
          {post.topics.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {post.topics.map((topic) => (
                  <TopicTag key={topic} topic={topic} styleOverride={post.tagStyles?.[topic]} />
                ))}
              </div>
            </div>
          )}

          {/* Key Takeaways */}
          {post.keyTakeaways && post.keyTakeaways.length > 0 && (
            <div className="mt-10 p-6 rounded-xl bg-muted/50 border border-border">
              <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-accent" />
                Key Takeaways
              </h2>
              <ul className="space-y-3">
                {post.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground/80">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />
                    <span className="leading-relaxed">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Author Box */}
          {hasAuthorData && (
            <div className="mt-12">
              {post.authors.map((a, i) => (
                a.bio || a.avatar ? (
                  <div key={i} className="flex gap-5 p-6 rounded-xl bg-muted/40 border border-border mb-4">
                    <Avatar className="h-[60px] w-[60px] shrink-0">
                      <AvatarImage src={a.avatar} alt={a.name} />
                      <AvatarFallback className="bg-teal text-background">
                        {a.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-display font-semibold text-foreground text-sm mb-1">About the Author</h3>
                      <p className="font-semibold text-foreground">{a.name}</p>
                      {a.bio && <p className="text-sm text-muted-foreground leading-relaxed mt-1">{a.bio}</p>}
                      {(a.linkedin || a.website) && (
                        <div className="flex items-center gap-3 mt-3">
                          {a.linkedin && (
                            <a href={a.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                          {a.website && (
                            <a href={a.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                              <Globe className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          )}
        </article>

        {/* Related Content */}
        <RelatedContentCarousel
          items={buildRelatedItems(relatedPosts, relatedEpisodes)}
        />
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
