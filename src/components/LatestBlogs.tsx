import BlogCard from "./BlogCard";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const blogs = [
  {
    title: "5 Essential Leadership Skills Every Administrator Needs in 2025",
    excerpt: "Discover the key leadership competencies that will set you apart as an effective administrator in today's rapidly evolving workplace.",
    date: "December 10, 2025",
    readTime: "5 min read",
    category: "Leadership",
    slug: "essential-leadership-skills-2025"
  },
  {
    title: "Building a Culture of Empowerment in Your Organization",
    excerpt: "Learn how to create an environment where team members feel valued, trusted, and motivated to take initiative.",
    date: "December 5, 2025",
    readTime: "7 min read",
    category: "Team Building",
    slug: "building-culture-empowerment"
  },
  {
    title: "The Administrator's Guide to Effective Communication",
    excerpt: "Master the art of clear, impactful communication that drives results and builds stronger relationships.",
    date: "November 30, 2025",
    readTime: "6 min read",
    category: "Communication",
    slug: "guide-effective-communication"
  }
];

const LatestBlogs = () => {
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

          <div className="grid md:grid-cols-3 gap-6 animate-slide-in">
            {blogs.map((blog) => (
              <BlogCard key={blog.slug} {...blog} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/blog">
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
