import { Button } from "./ui/button";
import { Play } from "lucide-react";
import heroLogo from "@/assets/hero-logo.png";
const Hero = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate via-navy to-deep-blue">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--accent)) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
      </div>

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">

          {/* Hero Logo */}
          <div className="flex justify-center">
            <img src={heroLogo} alt="Two Admins & a Mic" className="w-72 md:w-96 lg:w-[480px] h-auto drop-shadow-2xl" />
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 py-[28px]">
            <Button size="lg" className="bg-coral-accent hover:bg-coral-accent/90 text-lg px-8 py-6 group">
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Latest Episode
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-2 border-background text-background hover:bg-background hover:text-navy text-lg px-8 py-6">
              View All Episodes
            </Button>
          </div>

          {/* Social Proof / Stats */}
          <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
            <div className="space-y-2">
              
              <div className="text-sm md:text-base text-background/70">Episodes</div>
            </div>
            <div className="space-y-2">
              
              <div className="text-sm md:text-base text-background/70">Listeners</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-light-green">​</div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>;
};
export default Hero;