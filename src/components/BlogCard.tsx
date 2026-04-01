import { Card } from "./ui/card";
import { Link } from "react-router-dom";
import TopicTag from "./TopicTag";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface BlogCardProps {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  topics: string[];
  slug: string;
  author?: { name: string; avatar?: string };
  featuredImage?: string;
  tagStyles?: Record<string, { bgColor: string; textColor: string; borderColor?: string }>;
}

const BlogCard = ({ title, excerpt, date, readTime, topics = [], slug, author, featuredImage, tagStyles }: BlogCardProps) => {
  return (
    <Link
      to={`/blog/${slug}`}
      className="block group"
      onClick={() => window.scrollTo(0, 0)}
    >
      <Card className="h-full overflow-hidden bg-card border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-xl">
        {/* Featured Image */}
        <div className="relative w-full h-[200px] overflow-hidden bg-muted">
          {featuredImage ? (
            <img
              src={featuredImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate to-navy flex items-center justify-center">
              <span className="text-background/30 text-5xl font-display font-bold">✦</span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5 space-y-3">
          <h2 className="text-lg font-display font-semibold text-foreground group-hover:text-teal transition-colors line-clamp-2 leading-snug">
            {title}
          </h2>

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {author?.name && (
              <span className="inline-flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={author.avatar} alt={author.name} />
                  <AvatarFallback className="text-[9px] bg-teal text-background">
                    {author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{author.name}</span>
              </span>
            )}
            <span className="text-border">•</span>
            <span>{date}</span>
            <span className="text-border">•</span>
            <span>{readTime}</span>
          </div>

          {/* Tags */}
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {topics.slice(0, 3).map((topic) => (
                <TopicTag
                  key={topic}
                  topic={topic}
                  className="!text-[10px] !py-1 !px-2.5"
                  styleOverride={tagStyles?.[topic]}
                />
              ))}
              {topics.length > 3 && (
                <span className="text-xs text-muted-foreground self-center">+{topics.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default BlogCard;
