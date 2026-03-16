import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MerchCard from "@/components/MerchCard";
import { allProducts } from "@/data/merchData";

const Merch = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Banner — matches Episodes page */}
        <section className="relative py-20 bg-gradient-to-br from-slate via-navy to-deep-blue overflow-hidden">
          {/* Sound wave graphic */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: 0.2 }}
          >
            <svg
              viewBox="0 0 1200 200"
              className="w-full max-w-[1400px] h-auto"
              preserveAspectRatio="xMidYMid meet"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <style>{`
                @keyframes eq-pulse-merch {
                  0%, 100% { transform: scaleY(1); }
                  50% { transform: scaleY(0.6); }
                }
              `}</style>
              {Array.from({ length: 80 }).map((_, i) => {
                const center = 40;
                const dist = Math.abs(i - center) / center;
                const height = Math.max(
                  8,
                  (1 - dist * dist) * 180 * (0.5 + 0.5 * Math.sin(i * 0.7))
                );
                const x = (i / 80) * 1200 + 7.5;
                const delay = (Math.sin(i * 0.5) * 1.5 + 1.5).toFixed(2);
                const duration = (2 + Math.sin(i * 0.3) * 1).toFixed(2);
                return (
                  <rect
                    key={i}
                    x={x}
                    y={100 - height / 2}
                    width={6}
                    height={height}
                    rx={3}
                    fill="hsl(var(--slate))"
                    style={{
                      transformOrigin: `${x + 3}px 100px`,
                      animation: `eq-pulse-merch ${duration}s ease-in-out ${delay}s infinite`,
                    }}
                  />
                );
              })}
            </svg>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-5 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-background">
                Gear for the Admins Who Run the World
              </h1>
              <p className="text-lg md:text-xl text-background/80">
                Show your admin pride with official Two Admins &amp; a Mic merchandise.
              </p>
              <p className="text-sm md:text-base text-background/60 italic">
                Because every great leader deserves great merch.
              </p>
            </div>
          </div>
        </section>

        {/* Merch Grid */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                {allProducts.map((product) => (
                  <MerchCard key={product.id} product={product} />
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

export default Merch;
