import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import EpisodeCard from "@/components/EpisodeCard";
import TopicTag from "@/components/TopicTag";
import { getTagNames } from "@/data/tags";
import { getContentByTopic } from "@/data/crossLinks";
import { ArrowLeft } from "lucide-react";

const TopicResults = () => {
  const { topic } = useParams<{ topic: string }>();
  const decodedTopic = decodeURIComponent(topic || "") as SharedTopic;
  const isValid = SHARED_TOPICS.includes(decodedTopic);

  if (!isValid) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-32 text-center">
            <h1 className="text-4xl font-display font-bold text-foreground mb-4">
              Topic Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              The topic "{decodedTopic}" doesn't exist.
            </p>
            <Link to="/blog" className="text-accent hover:underline">
              Browse Blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { blogs, episodes } = getContentByTopic(decodedTopic);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-slate to-navy relative overflow-hidden">
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
                <span>Back</span>
              </Link>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-background mb-4">
                {decodedTopic}
              </h1>
              <p className="text-lg text-background/70">
                {blogs.length} article{blogs.length !== 1 ? "s" : ""} and{" "}
                {episodes.length} episode{episodes.length !== 1 ? "s" : ""} on
                this topic
              </p>

              {/* Other topic tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                {SHARED_TOPICS.filter((t) => t !== decodedTopic).map((t) => (
                  <TopicTag key={t} topic={t} variant="light" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        {blogs.length > 0 && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-display font-bold text-foreground mb-8">
                  Blog Posts
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map((blog) => (
                    <BlogCard key={blog.slug} {...blog} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Podcast Episodes */}
        {episodes.length > 0 && (
          <section className="py-16 bg-muted/40 border-t border-border">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-display font-bold text-foreground mb-8">
                  Podcast Episodes
                </h2>
                <div className="space-y-5">
                  {episodes.map((ep) => (
                    <EpisodeCard key={ep.number} {...ep} />
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

export default TopicResults;
