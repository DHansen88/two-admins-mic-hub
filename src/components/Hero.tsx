import { Button } from "./ui/button";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroLogo from "@/assets/hero-logo.png";
import { allEpisodes } from "@/data/episodeData";
const Hero = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate via-navy to-deep-blue">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--accent)) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
      </div>

      {/* Sound wave graphic */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.20 }}>
        <svg
          viewBox="0 0 1200 200"
          className="w-full max-w-[1400px] h-auto"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            @keyframes eq-pulse {
              0%, 100% { transform: scaleY(1); }
              50% { transform: scaleY(0.6); }
            }
          `}</style>
          {/* Sound wave bars */}
          {Array.from({ length: 80 }).map((_, i) => {
            const center = 40;
            const dist = Math.abs(i - center) / center;
            const height = Math.max(8, (1 - dist * dist) * 180 * (0.5 + 0.5 * Math.sin(i * 0.7)));
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
                  animation: `eq-pulse ${duration}s ease-in-out ${delay}s infinite`,
                }}
              />
            );
          })}
        </svg>
      </div>

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">

          {/* Hero Logo */}
          <div className="flex justify-center">
            <img src={heroLogo} alt="Two Admins & a Mic" className="w-56 sm:w-72 md:w-96 lg:w-[480px] h-auto drop-shadow-2xl" />
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-background/90 font-medium max-w-3xl mx-auto">
            Leadership conversations that empower and inspire
          </p>

          {/* Description */}
          <p className="text-base md:text-lg text-background/70 max-w-2xl mx-auto leading-relaxed">
            Join us for insightful discussions on leadership, administration, and professional growth. 
            Modern, friendly, and empowering conversations for today's leaders.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild size="lg" className="bg-coral-accent hover:bg-coral-accent/90 text-lg px-8 py-6 group">
              <Link to={`/episodes/${allEpisodes[0]?.slug || ''}`} onClick={() => window.scrollTo(0, 0)}>
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Latest Episode
              </Link>
            </Button>
          </div>

          {/* Social Proof / Stats */}
          
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>;
};
export default Hero;