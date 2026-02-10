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
          {/* Oversized caret / text-cursor animation */}
          <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
            {/* Large caret - left area */}
            <div
              className="absolute w-[3px] md:w-[4px] rounded-full bg-background/[0.13]"
              style={{
                height: '45%',
                top: '28%',
                left: '18%',
                animation: 'caretBlink 3.2s ease-in-out infinite',
              }}
            />
            {/* Medium caret - right area */}
            <div
              className="absolute w-[2px] md:w-[3px] rounded-full bg-background/[0.09]"
              style={{
                height: '30%',
                top: '35%',
                right: '22%',
                animation: 'caretBlink 4s ease-in-out infinite',
                animationDelay: '1.6s',
              }}
            />
            {/* Small caret - subtle accent */}
            <div
              className="absolute w-[2px] rounded-full bg-background/[0.06] hidden md:block"
              style={{
                height: '20%',
                top: '40%',
                left: '42%',
                animation: 'caretBlink 5s ease-in-out infinite',
                animationDelay: '2.8s',
              }}
            />
          </div>

          <style>{`
            @keyframes caretBlink {
              0%, 100% { opacity: 0; }
              30%, 70% { opacity: 1; }
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
