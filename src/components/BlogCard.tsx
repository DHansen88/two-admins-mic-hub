import { Card, CardContent, CardHeader } from "./ui/card";
import { Link } from "react-router-dom";

interface BlogCardProps {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  topics: string[];
  slug: string;
}

const BlogCard = ({ title, excerpt, date, readTime, topics = [], slug }: BlogCardProps) => {
  return (
    <Link to={`/blog/${slug}`} className="block group">
      <Card className="h-full bg-card hover:bg-card/80 border-border hover:border-teal transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {topics.map((topic) => (
              <span
                key={topic}
                className="text-xs font-semibold uppercase tracking-wider text-teal"
              >
                {topic}
              </span>
            ))}
          </div>
          <h3 className="text-xl font-display font-bold text-foreground group-hover:text-teal transition-colors line-clamp-2">
            {title}
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground line-clamp-2">
            {excerpt}
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{date}</span>
            <span>{readTime}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BlogCard;
