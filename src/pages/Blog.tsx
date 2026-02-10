import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { allBlogs } from "@/data/blogData";

const Blog = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-20 bg-gradient-to-b from-slate to-navy relative overflow-hidden">
          {/* Typographic line flow background */}
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-[1px] bg-gradient-to-r from-transparent via-sky-blue/60 to-transparent"
                style={{
                  top: `${12 + i * 6}%`,
                  left: '-10%',
                  width: `${45 + (i % 3) * 18}%`,
                  animation: `blogLineFlow ${18 + (i % 4) * 4}s linear infinite`,
                  animationDelay: `${i * 1.2}s`,
                }}
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`short-${i}`}
                className="absolute h-[1px] bg-gradient-to-r from-transparent via-deep-blue/40 to-transparent"
                style={{
                  top: `${20 + i * 9}%`,
                  left: '5%',
                  width: `${20 + (i % 3) * 12}%`,
                  animation: `blogLineFlow ${22 + (i % 3) * 5}s linear infinite`,
                  animationDelay: `${2 + i * 1.8}s`,
                }}
              />
            ))}
          </div>

          <style>{`
            @keyframes blogLineFlow {
              0% { transform: translateX(-5%); opacity: 0; }
              15% { opacity: 1; }
              85% { opacity: 1; }
              100% { transform: translateX(8%); opacity: 0; }
            }
          `}</style>

          <div className="container mx-auto px-4 relative z-10">
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
