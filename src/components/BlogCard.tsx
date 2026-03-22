import { Card, CardContent, CardHeader } from "./ui/card";
import { Link } from "react-router-dom";
import { getTagByName } from "@/data/tags";

interface BlogCardProps {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  topics: string[];
  slug: string;
  author?: { name: string };
}

const BlogCard = ({ title, excerpt, date, readTime, topics = [], slug, author }: BlogCardProps) => {
  const hostName = author?.name?.toLowerCase() || "";
  const isD = hostName === "diana";
  const isM = hostName === "mel";

  return (
    <Link
      to={`/blog/${slug}`}
      className="block group"
      onClick={() => window.scrollTo(0, 0)}
      data-host={hostName}
      data-topic={topics.map((t) => t.toLowerCase().replace(/\s+/g, "-")).join(" ")}
    >
      <Card className="h-full bg-card hover:bg-card/80 border-border hover:border-teal transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {topics.slice(0, 2).map((topic) => {
              const tag = getTagByName(topic);
              const bg = tag?.bgColor || "#5A7DFF";
              const text = tag?.textColor || "#ffffff";
              return (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider rounded-full"
                  style={{
                    backgroundColor: bg,
                    color: text,
                    padding: "4px 10px",
                    borderRadius: "999px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                    fontWeight: 600,
                  }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: text, opacity: 0.7 }} />
                  {topic}
                </span>
              );
            })}
          </div>
          <h3 className="text-xl font-display font-bold text-foreground group-hover:text-teal transition-colors line-clamp-2">
            {title}
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground line-clamp-2">{excerpt}</p>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {author?.name && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white ${
                    isD ? "bg-[hsl(var(--teal))]" : isM ? "bg-[hsl(var(--coral))]" : "bg-muted-foreground"
                  }`}
                >
                  {author.name.charAt(0)}
                </span>
                <span className="font-medium">{author.name}</span>
              </span>
            )}
            <span>•</span>
            <span>{date}</span>
            <span>•</span>
            <span>{readTime}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BlogCard;
