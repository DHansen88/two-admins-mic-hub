import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { allBlogs } from "@/data/blogData";

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
