import { Link } from "react-router-dom";
import { allEpisodes } from "@/data/episodeData";
import { allBlogs } from "@/data/blogData";
import { Headphones, FileText, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const LatestFromTheShow = () => {
  const latestEpisode = allEpisodes[0];
  const latestBlog = allBlogs[0];

  if (!latestEpisode && !latestBlog) return null;

  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Latest From the Show
            </h2>
            <p className="text-muted-foreground">Fresh content from the podcast and blog</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Latest Episode */}
            {latestEpisode && (
              <Link
                to={`/episodes/${latestEpisode.slug}`}
                onClick={() => window.scrollTo(0, 0)}
                className="group rounded-xl border border-border bg-card p-6 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Headphones className="h-4 w-4 text-sky-blue" />
                  <span className="font-medium uppercase tracking-wide">Podcast</span>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-deep-blue transition-colors line-clamp-2">
                  {latestEpisode.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${latestEpisode.host === 'diana' ? 'bg-teal' : 'bg-coral-accent'}`}>
                    {latestEpisode.host === 'diana' ? 'D' : 'M'}
                  </span>
                  <span>{latestEpisode.date}</span>
                  <span>·</span>
                  <span>{latestEpisode.duration}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {latestEpisode.topics.slice(0, 3).map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-[10px] px-2 py-0.5">
                      {topic}
                    </Badge>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-deep-blue group-hover:gap-2 transition-all">
                  Listen Now <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            )}

            {/* Latest Blog */}
            {latestBlog && (
              <Link
                to={`/blog/${latestBlog.slug}`}
                onClick={() => window.scrollTo(0, 0)}
                className="group rounded-xl border border-border bg-card p-6 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-4 w-4 text-teal" />
                  <span className="font-medium uppercase tracking-wide">Blog</span>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-deep-blue transition-colors line-clamp-2">
                  {latestBlog.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${latestBlog.author.name.startsWith('D') ? 'bg-teal' : 'bg-coral-accent'}`}>
                    {latestBlog.author.name[0]}
                  </span>
                  <span>{latestBlog.date}</span>
                  <span>·</span>
                  <span>{latestBlog.readTime}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {latestBlog.topics.slice(0, 3).map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-[10px] px-2 py-0.5">
                      {topic}
                    </Badge>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-deep-blue group-hover:gap-2 transition-all">
                  Read Article <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestFromTheShow;
