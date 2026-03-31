import BlogCard from "./BlogCard";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useVisibleBlogs } from "@/hooks/useVisibleContent";

const LatestBlogs = () => {
  const allBlogs = useVisibleBlogs();
  const latestBlogs = allBlogs.slice(0, 3);

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              From the Blog
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Insights, tips, and stories to help you grow as a leader and administrator
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
            {latestBlogs.map((blog) => (
              <BlogCard key={blog.slug} {...blog} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/blog" onClick={() => window.scrollTo(0, 0)}>
              <Button variant="outline" size="lg" className="border-teal text-teal hover:bg-teal hover:text-background">
                View All Posts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestBlogs;
