import { useRef, useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useEmblaCarousel from "embla-carousel-react";
import { Eye, Search, BookOpen, PenTool, Hammer, RefreshCw, Award, Compass, Sparkles, TrendingUp, Users, Clock, Target, Heart, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Quote } from "lucide-react";
const blueprintSteps = [{
  number: "01",
  title: "Reach High — Envision",
  description: "Envision what leadership success looks like for you and articulate your purpose.",
  detail: "Define your aspirations and create a compelling vision that drives your daily leadership choices.",
  icon: Eye,
  accent: "teal"
}, {
  number: "02",
  title: "Dig Deep — Reflect",
  description: "Reflect on what shapes your leadership—your experiences, values, and strengths.",
  detail: "Examine the moments, mentors, and values that have shaped who you are as a professional and leader.",
  icon: Search,
  accent: "deep-blue"
}, {
  number: "03",
  title: "Prepare — Study",
  description: "Study frameworks and leadership insights that fill the gaps and expand your perspective.",
  detail: "Engage with proven leadership models and research to build a well-rounded foundation for growth.",
  icon: BookOpen,
  accent: "sky-blue"
}, {
  number: "04",
  title: "Design — Plan",
  description: "Design your personal Leadership Model based on purpose and beliefs.",
  detail: "Craft a personalized leadership blueprint that reflects your unique strengths and professional context.",
  icon: PenTool,
  accent: "teal"
}, {
  number: "05",
  title: "Build — Practice",
  description: "Build real, actionable habits that bring your leadership to life.",
  detail: "Translate your leadership model into daily practices, routines, and touchpoints that make an impact.",
  icon: Hammer,
  accent: "navy"
}, {
  number: "06",
  title: "Reinforce — Improve",
  description: "Reinforce and refine your approach, aligning it with your organization's needs.",
  detail: "Continuously evaluate and evolve your leadership, staying aligned with both personal growth and organizational goals.",
  icon: RefreshCw,
  accent: "coral"
}];
const benefits = [{
  icon: Compass,
  title: "A Personal Leadership Model",
  description: "A leadership framework you design yourself, grounded in your purpose and values."
}, {
  icon: Sparkles,
  title: "Confidence to Lead",
  description: "The clarity and conviction to show up as a leader in every interaction."
}, {
  icon: Target,
  title: "Practical Leadership Habits",
  description: "Actionable practices and routines that make leadership part of your daily work."
}, {
  icon: TrendingUp,
  title: "A Roadmap for Growth",
  description: "A clear path to influence, career advancement, and professional fulfillment."
}, {
  icon: Award,
  title: "Certificate of Completion",
  description: "A credential to share on LinkedIn and celebrate your leadership journey."
}];
const testimonials = [{
  quote: "This program changed the way I see my role. I'm not just support—I'm a leader who happens to support executives.",
  author: "Administrative Professional",
  role: "Fortune 500 Company"
}, {
  quote: "The Blueprint process gave me a framework I can actually use every day. It's not theory—it's real leadership development.",
  author: "Executive Assistant",
  role: "Healthcare Organization"
}, {
  quote: "I finally have the language and confidence to articulate my leadership value. This was transformative.",
  author: "Senior Administrative Partner",
  role: "Technology Sector"
}];
const stepAccents = [
  { bg: "bg-light-green", text: "text-light-green", border: "border-light-green", bgLight: "bg-light-green/10", ring: "ring-light-green/30" },
  { bg: "bg-teal", text: "text-teal", border: "border-teal", bgLight: "bg-teal/10", ring: "ring-teal/30" },
  { bg: "bg-sky-blue", text: "text-sky-blue", border: "border-sky-blue", bgLight: "bg-sky-blue/10", ring: "ring-sky-blue/30" },
  { bg: "bg-deep-blue", text: "text-deep-blue", border: "border-deep-blue", bgLight: "bg-deep-blue/10", ring: "ring-deep-blue/30" },
  { bg: "bg-navy", text: "text-navy", border: "border-navy", bgLight: "bg-navy/10", ring: "ring-navy/30" },
  { bg: "bg-coral", text: "text-coral", border: "border-coral", bgLight: "bg-coral/10", ring: "ring-coral/30" },
];

const BlueprintStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [mobileOpen, setMobileOpen] = useState<number | null>(0);

  const active = blueprintSteps[activeStep];
  const ActiveIcon = active.icon;
  const accent = stepAccents[activeStep];

  return (
    <>
      {/* ── Desktop: stepper left + spotlight right ── */}
      <div className="hidden md:grid md:grid-cols-[280px_1fr] gap-10 items-start">
        {/* Left stepper */}
        <nav className="relative" aria-label="Leadership steps">
          {/* Vertical track */}
          <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-border" />
          {/* Progress fill */}
          <div
            className="absolute left-[19px] top-4 w-[2px] bg-teal transition-all duration-500 ease-out rounded-full"
            style={{ height: `${(activeStep / (blueprintSteps.length - 1)) * 100}%` }}
          />

          <ul className="relative space-y-1">
            {blueprintSteps.map((step, i) => {
              const isActive = i === activeStep;
              const isPast = i < activeStep;
              const color = stepAccents[i];
              return (
                <li key={step.number}>
                  <button
                    onClick={() => setActiveStep(i)}
                    className={`
                      w-full flex items-center gap-4 px-3 py-3 rounded-lg text-left transition-all duration-300
                      ${isActive ? `${color.bgLight} ring-1 ${color.ring}` : "hover:bg-muted/60"}
                    `}
                  >
                    {/* Step dot */}
                    <span
                      className={`
                        relative z-10 w-[10px] h-[10px] rounded-full flex-shrink-0 transition-all duration-300
                        ${isActive ? `${color.bg} scale-150 shadow-md` : isPast ? "bg-teal" : "bg-border"}
                      `}
                    />
                    <span className="flex items-baseline gap-2">
                      <span className={`text-xs font-mono font-bold transition-colors duration-300 ${isActive ? color.text : "text-muted-foreground/50"}`}>
                        {step.number}
                      </span>
                      <span className={`text-sm font-display font-semibold transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.title}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right spotlight */}
        <div
          key={activeStep}
          className="rounded-2xl border border-border bg-muted/40 p-10 animate-fade-in min-h-[320px] flex flex-col justify-center"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-xl ${accent.bg} flex items-center justify-center`}>
              <ActiveIcon className="w-7 h-7 text-background" />
            </div>
            <span className={`text-5xl font-display font-black ${accent.text} opacity-20`}>
              {active.number}
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
            {active.title}
          </h3>
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            {active.description}
          </p>
          <p className="text-muted-foreground/70 text-base leading-relaxed mb-8">
            {active.detail}
          </p>
          {/* Nav arrows */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={activeStep === 0}
              onClick={() => setActiveStep(prev => prev - 1)}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={activeStep === blueprintSteps.length - 1}
              onClick={() => setActiveStep(prev => prev + 1)}
              className="gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Mobile: accordion ── */}
      <div className="md:hidden space-y-2">
        {blueprintSteps.map((step, i) => {
          const isOpen = mobileOpen === i;
          const Icon = step.icon;
          const color = stepAccents[i];
          return (
            <div key={step.number} className={`rounded-xl border transition-all duration-300 ${isOpen ? `${color.border} ${color.bgLight}` : "border-border"}`}>
              <button
                onClick={() => setMobileOpen(isOpen ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left"
              >
                <span className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-background" />
                </span>
                <span className="flex-1">
                  <span className={`text-xs font-mono ${color.text}`}>{step.number}</span>
                  <span className="ml-2 text-sm font-display font-semibold text-foreground">{step.title}</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="px-4 pb-4 pl-[60px] space-y-2">
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  <p className="text-muted-foreground/60 text-xs leading-relaxed">{step.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <Button asChild size="lg" className="bg-teal hover:bg-teal/90 text-background font-semibold px-8 py-6 text-base">
          <a href="/contact">Explore the STEPS Program</a>
        </Button>
      </div>
    </>
  );
};
const BenefitsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 1
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);
  return <div className="relative group/carousel">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {benefits.map(benefit => {
          const Icon = benefit.icon;
          return <div key={benefit.title} className="flex-[0_0_100%] sm:flex-[0_0_45%] lg:flex-[0_0_33.333%] min-w-0 pl-4">
                <div className="text-center space-y-3 p-6 rounded-xl bg-background/5 backdrop-blur-sm border border-background/10 hover:bg-background/10 transition-all duration-300 group cursor-default h-full flex flex-col items-center justify-start">
                  <div className="w-14 h-14 rounded-full bg-teal/15 flex items-center justify-center mx-auto group-hover:bg-teal/25 transition-colors flex-shrink-0">
                    <Icon className="w-6 h-6 text-teal animate-[pulse_3s_ease-in-out_infinite] group-hover:animate-[bounce_0.4s_ease-in-out_1]" />
                  </div>
                  <h3 className="text-base font-display font-semibold text-background">
                    {benefit.title}
                  </h3>
                  <p className="text-background/60 text-sm leading-relaxed flex-grow">
                    {benefit.description}
                  </p>
                </div>
              </div>;
        })}
        </div>
      </div>

      {/* Navigation arrows */}
      <button onClick={() => emblaApi?.scrollPrev()} disabled={!canScrollPrev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-9 h-9 rounded-full bg-background/15 backdrop-blur-sm flex items-center justify-center text-background hover:bg-background/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Previous benefit">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => emblaApi?.scrollNext()} disabled={!canScrollNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-9 h-9 rounded-full bg-background/15 backdrop-blur-sm flex items-center justify-center text-background hover:bg-background/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Next benefit">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>;
};
const Steps = () => {
  const learnMoreRef = useRef<HTMLDivElement>(null);
  const scrollToLearnMore = () => {
    learnMoreRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  return <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* ─── 1. HERO ─── */}
        <section className="relative py-24 md:py-32 bg-gradient-to-br from-slate via-navy to-deep-blue overflow-hidden">
          {/* Subtle background motif — ascending steps */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="absolute bg-teal/[0.04] rounded-sm" style={{
            bottom: `${i * 12}%`,
            left: `${5 + i * 10}%`,
            width: `${60 - i * 6}%`,
            height: "2px"
          }} />)}
            {/* Subtle rising diagonal lines */}
            {[1, 2, 3].map(i => <div key={`diag-${i}`} className="absolute bg-background/[0.03]" style={{
            width: "1px",
            height: "120%",
            top: "-10%",
            left: `${20 + i * 25}%`,
            transform: `rotate(${15 + i * 5}deg)`
          }} />)}
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
              <p className="text-sm md:text-base font-semibold uppercase tracking-[0.2em] text-teal">
                STEPS Leadership Program
              </p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-background leading-tight">
                Step Into Your
                <br />
                <span className="text-teal">Leadership</span>
              </h1>
              <p className="text-lg md:text-xl text-background/75 max-w-2xl mx-auto leading-relaxed">
                A leadership journey inspired by EA experience and taught
                through the Blueprint process used by senior executives.
              </p>
              <Button onClick={scrollToLearnMore} size="lg" className="bg-teal hover:bg-teal/90 text-background font-semibold px-8 py-6 text-base">
                Learn More
                <ChevronDown className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* ─── 2. FEATURED VIDEO ─── */}
        <section ref={learnMoreRef} className="py-20 md:py-28 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  Leadership From the Source
                </h2>
                <p className="text-muted-foreground text-lg">
                  Doug Conant on the STEPS Leadership Process
                </p>
              </div>

              {/* Responsive Video Embed */}
              <div className="relative w-full overflow-hidden rounded-xl shadow-2xl" style={{
              paddingTop: "56.25%"
            }}>
                <iframe className="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/nkWiYix5m-w" title="STEPS Leadership — Doug Conant" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto text-justify">Executive and administrative professionals are the backbone of every organization—but too often, leadership development stops at tactical training. STEPS honors the whole leader by offering a leadership framework built for real life, not just task mastery. Inspired by conversations between a renowned leadership expert and an executive assistant, STEPS was created to take the same leadership process taught to C-Suite leaders and make it accessible for those who make everything happen every day.</p>
            </div>
          </div>
        </section>

        {/* ─── 3. THE 6-STEP BLUEPRINT ─── */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  The Leadership Blueprint
                </h2>
                <p className="text-muted-foreground text-lg">
                  The Six Core Steps
                </p>
                <div className="w-16 h-1 bg-coral mx-auto rounded-full" />
              </div>

              <BlueprintStepper />
            </div>
          </div>
        </section>

        {/* ─── 5. KEY BENEFITS ─── */}
        <section className="py-14 md:py-20 bg-gradient-to-br from-slate via-navy to-deep-blue">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center space-y-3 mb-10">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-background">
                  What You'll Gain
                </h2>
                <div className="w-16 h-1 bg-teal mx-auto rounded-full" />
              </div>

              {/* Carousel */}
              <BenefitsCarousel />

            </div>
          </div>
        </section>

        {/* ─── 6. WHO THIS IS FOR ─── */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Who This Is For
              </h2>
              <div className="w-16 h-1 bg-teal mx-auto rounded-full" />
              <p className="text-lg text-muted-foreground leading-relaxed">
                This program is designed for administrative professionals,
                executive assistants, and support professionals who want to grow
                as leaders—not just as support staff.
              </p>

              <div className="grid sm:grid-cols-3 gap-6 pt-4">
                <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted">
                  <Clock className="w-8 h-8 text-teal" />
                  <h3 className="font-display font-semibold text-foreground">
                    Self-Paced Online
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Learn on your schedule, at your own pace.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted">
                  <Users className="w-8 h-8 text-deep-blue" />
                  <h3 className="font-display font-semibold text-foreground">
                    Built for Busy Schedules
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Designed for professionals with demanding roles.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted">
                  <Heart className="w-8 h-8 text-coral" />
                  <h3 className="font-display font-semibold text-foreground">
                    Real Growth
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Built for lasting transformation, not just tactical skills.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. TESTIMONIALS ─── */}
        <section className="py-20 md:py-28 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  What People Are Saying
                </h2>
                <div className="w-16 h-1 bg-coral mx-auto rounded-full" />
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((t, i) => <Card key={i} className="border-border hover:border-teal/30 transition-colors">
                    <CardContent className="p-8 space-y-6">
                      <Quote className="w-8 h-8 text-teal/30" />
                      <p className="text-foreground leading-relaxed italic">
                        "{t.quote}"
                      </p>
                      <div>
                        <p className="font-display font-semibold text-foreground text-sm">
                          {t.author}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t.role}
                        </p>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 8. PRIMARY CTA ─── */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-teal via-deep-blue to-navy">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-background">
                Ready to Step Into Your Leadership?
              </h2>
              <p className="text-background/70 text-lg leading-relaxed">
                Leadership training that executives invest thousands in — now
                built for the people who make everything happen.
              </p>
              <Button asChild size="lg" className="bg-coral hover:bg-coral/90 text-background font-semibold px-10 py-6 text-base">
                <a href="/contact">
                  Start Your Leadership Journey
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* ─── 9. SECONDARY CTA / CONNECT ─── */}
        
      </main>
      <Footer />
    </div>;
};
export default Steps;