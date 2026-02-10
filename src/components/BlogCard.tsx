import { Card, CardContent, CardHeader } from "./ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogCardProps {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  slug: string;
}

const BlogCard = ({ title, excerpt, date, readTime, category, slug }: BlogCardProps) => {
  return (
    <Card className="group bg-card hover:bg-card/80 border-border hover:border-teal transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="pb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal">
          {category}
        </span>
        <h3 className="text-xl font-display font-bold text-foreground group-hover:text-teal transition-colors line-clamp-2">
          {title}
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground line-clamp-3">
          {excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{date}</span>
            <span>{readTime}</span>
          </div>
          <Link 
            to={`/blog/${slug}`}
            className="flex items-center space-x-1 text-coral-accent hover:text-coral-accent/80 font-medium text-sm transition-colors"
          >
            <span>Read More</span>
            <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
