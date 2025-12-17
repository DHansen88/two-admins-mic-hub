import { useParams, Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { getBlogBySlug, getRelatedPosts } from "@/data/blogData";
import { Calendar, Clock, ArrowLeft, Share2, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogBySlug(slug) : undefined;
  const relatedPosts = slug ? getRelatedPosts(slug, 3) : [];

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-slate to-navy">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto animate-fade-in">
              <Link 
                to="/blog" 
                className="inline-flex items-center space-x-2 text-background/70 hover:text-background transition-colors mb-8"
              >
                <ArrowLeft size={18} />
                <span>Back to Blog</span>
              </Link>
              
              <span className="inline-block text-sm font-semibold uppercase tracking-wider text-teal mb-4">
                {post.category}
              </span>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-background mb-6">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-background/70">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback className="bg-teal text-background">
                      {post.author.name.split(' ').map(n => n[0]).join('')}
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
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-[1fr_auto] gap-12">
                {/* Main Content */}
                <article className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-ul:my-4 prose-li:my-1">
                  <div 
                    className="animate-fade-in"
                    dangerouslySetInnerHTML={{ 
                      __html: post.content
                        .replace(/## (.*)/g, '<h2>$1</h2>')
                        .replace(/### (.*)/g, '<h3>$1</h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/- (.*)/g, '<li>$1</li>')
                        .replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>')
                        .split('\n\n')
                        .map(p => p.startsWith('<') ? p : `<p>${p}</p>`)
                        .join('')
                    }} 
                  />
                </article>

                {/* Sidebar */}
                <aside className="lg:w-64 space-y-8">
                  {/* Share */}
                  <div className="sticky top-24 space-y-6">
                    <div className="p-6 bg-card rounded-xl border border-border">
                      <h3 className="font-display font-semibold text-foreground mb-4 flex items-center space-x-2">
                        <Share2 size={18} />
                        <span>Share</span>
                      </h3>
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, '_blank')}
                        >
                          <Twitter size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
                        >
                          <Linkedin size={18} />
                        </Button>
                      </div>
                    </div>

                    {/* Author Card */}
                    <div className="p-6 bg-card rounded-xl border border-border">
                      <h3 className="font-display font-semibold text-foreground mb-4">About the Author</h3>
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={post.author.avatar} alt={post.author.name} />
                          <AvatarFallback className="bg-teal text-background">
                            {post.author.name.split(' ').map(n => n[0]).join('')}
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
              </div>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-display font-bold text-foreground mb-8">
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
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
