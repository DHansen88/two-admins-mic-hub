import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";

const allBlogs = [
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
  },
  {
    title: "Navigating Difficult Conversations with Confidence",
    excerpt: "Practical strategies for handling challenging discussions while maintaining professionalism and empathy.",
    date: "November 25, 2025",
    readTime: "8 min read",
    category: "Communication",
    slug: "navigating-difficult-conversations"
  },
  {
    title: "The Power of Active Listening in Leadership",
    excerpt: "Why listening is your most powerful leadership tool and how to develop this essential skill.",
    date: "November 20, 2025",
    readTime: "4 min read",
    category: "Leadership",
    slug: "power-active-listening"
  },
  {
    title: "Work-Life Balance: Myths and Realities for Administrators",
    excerpt: "Redefining what balance means for busy professionals and practical tips for achieving it.",
    date: "November 15, 2025",
    readTime: "6 min read",
    category: "Wellness",
    slug: "work-life-balance-myths"
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-20 bg-gradient-to-b from-slate to-navy">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-display font-bold text-background">
                Blog
              </h1>
              <p className="text-xl text-background/80">
                Insights, stories, and practical advice for administrators and leaders
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
                {allBlogs.map((blog) => (
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

export default Blog;
