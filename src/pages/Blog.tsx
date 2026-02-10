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
          {/* Cursive word flow background */}
          <div className="absolute inset-0 opacity-[0.13] pointer-events-none select-none" aria-hidden="true">
            {[
              { word: 'inspire', top: 8, left: -5, size: 'text-3xl', delay: 0, dur: 24 },
              { word: 'leadership', top: 18, left: 10, size: 'text-4xl', delay: 3, dur: 28 },
              { word: 'growth', top: 30, left: -8, size: 'text-2xl', delay: 1.5, dur: 20 },
              { word: 'stories', top: 42, left: 15, size: 'text-3xl', delay: 5, dur: 26 },
              { word: 'empower', top: 55, left: -3, size: 'text-4xl', delay: 2, dur: 22 },
              { word: 'insight', top: 65, left: 8, size: 'text-2xl', delay: 4, dur: 25 },
              { word: 'connect', top: 78, left: -6, size: 'text-3xl', delay: 6, dur: 27 },
              { word: 'reflect', top: 88, left: 12, size: 'text-2xl', delay: 1, dur: 23 },
              { word: 'wisdom', top: 15, left: 55, size: 'text-3xl', delay: 7, dur: 26 },
              { word: 'voice', top: 38, left: 60, size: 'text-2xl', delay: 3.5, dur: 21 },
              { word: 'purpose', top: 58, left: 50, size: 'text-4xl', delay: 8, dur: 29 },
              { word: 'courage', top: 75, left: 58, size: 'text-3xl', delay: 5.5, dur: 24 },
            ].map((item, i) => (
              <span
                key={i}
                className={`absolute ${item.size} italic text-background/60`}
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontStyle: 'italic',
                  top: `${item.top}%`,
                  left: `${item.left}%`,
                  animation: `blogCursiveFlow ${item.dur}s linear infinite`,
                  animationDelay: `${item.delay}s`,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.word}
              </span>
            ))}
          </div>

          <style>{`
            @keyframes blogCursiveFlow {
              0% { transform: translateX(-3%); opacity: 0; }
              12% { opacity: 1; }
              88% { opacity: 1; }
              100% { transform: translateX(6%); opacity: 0; }
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
