import { useRef, useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useEmblaCarousel from "embla-carousel-react";
import { Eye, Search, BookOpen, PenTool, Hammer, RefreshCw, Award, Compass, Sparkles, TrendingUp, Users, Clock, Target, Heart, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Quote } from "lucide-react";
import stepsLogo from "@/assets/steps-logo.webp";
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
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));

  const handleStepChange = (i: number) => {
    setActiveStep(i);
    setVisited(prev => new Set(prev).add(i));
  };

  const active = blueprintSteps[activeStep];
  const ActiveIcon = active.icon;
  const accent = stepAccents[activeStep];
  const isComplete = visited.size === blueprintSteps.length;

  /* Completion meter gradient stops */
  const meterColors = ["#9CCC66", "#4ABC94", "#49C2F2", "#0086BF", "#00628C", "#F26D7D"];

  return (
    <>
      {/* ══════════ DESKTOP ══════════ */}
      <div className="hidden md:grid md:grid-cols-[260px_1fr] gap-8 items-start">

        {/* ── Left: Sidebar Stepper ── */}
        <nav className="relative py-2" aria-label="Leadership steps">
          {/* Vertical track background */}
          <div className="absolute left-[18px] top-6 bottom-6 w-[3px] rounded-full bg-border/60" />
          {/* Vertical track fill */}
          <div
            className="absolute left-[18px] top-6 w-[3px] rounded-full transition-all duration-500 ease-out"
            style={{
              height: `${(activeStep / (blueprintSteps.length - 1)) * 100}%`,
              background: `linear-gradient(to bottom, ${meterColors.slice(0, activeStep + 1).join(", ")})`
            }}
          />

          <ul className="relative space-y-0">
            {blueprintSteps.map((step, i) => {
              const isActive = i === activeStep;
              const isPast = visited.has(i) && i !== activeStep;
              const color = stepAccents[i];
              const StepIcon = step.icon;
              return (
                <li key={step.number}>
                  <button
                    onClick={() => handleStepChange(i)}
                    className={`
                      w-full flex items-center gap-4 pl-2 pr-3 py-4 rounded-xl text-left
                      transition-all duration-300 ease-out group
                      ${isActive
                        ? `${color.bgLight} ring-1 ${color.ring} shadow-sm scale-[1.03]`
                        : "hover:bg-muted/50 scale-100"
                      }
                    `}
                  >
                    {/* Step marker */}
                    <span
                      className={`
                        relative z-10 w-[14px] h-[14px] rounded-full flex-shrink-0
                        transition-all duration-300 ease-out
                        ${isActive
                          ? `${color.bg} scale-[1.6] shadow-lg ring-4 ${color.ring}`
                          : isPast
                            ? `${color.bg} opacity-70`
                            : "bg-border"
                        }
                      `}
                    />

                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? color.text : "text-muted-foreground/40"}`}>
                        Step {step.number}
                      </span>
                      <span className={`text-sm font-display font-semibold leading-tight transition-colors duration-300 ${isActive ? "text-foreground" : isPast ? "text-muted-foreground/80" : "text-muted-foreground/60"}`}>
                        {step.title}
                      </span>
                    </div>

                    {/* Active step icon */}
                    {isActive && (
                      <StepIcon className={`w-4 h-4 ml-auto flex-shrink-0 ${color.text} opacity-60`} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Right: Completion Meter + Spotlight ── */}
        <div className="space-y-5">

          {/* Blueprint Completion Meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground/60">
                Leadership Journey Progress
              </span>
              {isComplete && (
                <span className="text-xs font-semibold text-teal flex items-center gap-1 animate-fade-in">
                  <Award className="w-3.5 h-3.5" />
                  Blueprint Complete
                </span>
              )}
            </div>
            <div className="relative h-[6px] bg-border/40 rounded-full overflow-hidden">
              {/* Fill */}
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${isComplete ? "animate-[pulse_2s_ease-in-out_2]" : ""}`}
                style={{
                  width: `${((activeStep + 1) / blueprintSteps.length) * 100}%`,
                  background: `linear-gradient(90deg, ${meterColors.slice(0, activeStep + 1).join(", ")})`
                }}
              />
              {/* Markers */}
              {blueprintSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleStepChange(i)}
                  className={`
                    absolute top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2 border-background
                    transition-all duration-300
                    ${visited.has(i) ? "" : "bg-border/60"}
                  `}
                  style={{
                    left: `calc(${((i + 0.5) / blueprintSteps.length) * 100}% - 5px)`,
                    backgroundColor: visited.has(i) ? meterColors[i] : undefined
                  }}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Spotlight Panel */}
          <div
            key={activeStep}
            className="relative rounded-2xl border border-border bg-muted/30 p-8 md:p-10 min-h-[340px] flex flex-col justify-center overflow-hidden
              animate-fade-in shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            {/* Watermark step number */}
            <span
              className={`absolute -right-4 -top-6 text-[10rem] font-display font-black leading-none pointer-events-none select-none ${accent.text} opacity-[0.04]`}
            >
              {active.number}
            </span>

            <div className="relative z-10">
              {/* Icon + step label */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-xl ${accent.bg} flex items-center justify-center shadow-md transition-transform duration-300`}>
                  <ActiveIcon className="w-7 h-7 text-background" />
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${accent.text}`}>
                  Step {active.number} of 06
                </span>
              </div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                {active.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground text-lg leading-relaxed mb-3">
                {active.description}
              </p>

              {/* Detail */}
              <p className="text-muted-foreground/70 text-base leading-relaxed mb-4">
                {active.detail}
              </p>

              {/* Reflection prompt */}
              <p className={`italic text-sm ${accent.text} opacity-70 mb-8`}>
                {activeStep === 0 && "What does leadership success look like in your world?"}
                {activeStep === 1 && "What moments have shaped the leader you are today?"}
                {activeStep === 2 && "Where are the gaps in your leadership knowledge?"}
                {activeStep === 3 && "What principles will anchor your leadership model?"}
                {activeStep === 4 && "What one habit would transform your daily leadership?"}
                {activeStep === 5 && "How will you measure your leadership growth?"}
              </p>

              {/* Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeStep === 0}
                  onClick={() => handleStepChange(activeStep - 1)}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeStep === blueprintSteps.length - 1}
                  onClick={() => handleStepChange(activeStep + 1)}
                  className="gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`ml-auto ${accent.text} hover:${accent.bgLight} gap-1 text-xs`}
                  asChild
                >
                  <a href="/contact">
                    Apply This Step <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ MOBILE ══════════ */}
      <div className="md:hidden space-y-5">

        {/* Mobile: Horizontal step tracker */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 block text-center">
            Leadership Journey Progress
          </span>
          <div className="flex items-center gap-1 px-2">
            {blueprintSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => handleStepChange(i)}
                className="flex-1 h-[6px] rounded-full transition-all duration-400"
                style={{
                  backgroundColor: i <= activeStep ? meterColors[i] : undefined
                }}
                aria-label={`Go to step ${i + 1}`}
              >
                {i > activeStep && <div className="w-full h-full rounded-full bg-border/50" />}
              </button>
            ))}
          </div>
          {isComplete && (
            <p className="text-center text-xs font-semibold text-teal flex items-center justify-center gap-1 animate-fade-in">
              <Award className="w-3.5 h-3.5" /> Blueprint Complete
            </p>
          )}
        </div>

        {/* Mobile: Spotlight card */}
        <div
          key={`mobile-${activeStep}`}
          className={`rounded-xl border ${accent.border} ${accent.bgLight} p-5 animate-fade-in relative overflow-hidden`}
        >
          {/* Watermark */}
          <span className={`absolute -right-2 -top-4 text-[7rem] font-display font-black leading-none pointer-events-none select-none ${accent.text} opacity-[0.05]`}>
            {active.number}
          </span>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${accent.bg} flex items-center justify-center`}>
                <ActiveIcon className="w-5 h-5 text-background" />
              </div>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${accent.text}`}>
                Step {active.number} of 06
              </span>
            </div>

            <h3 className="text-xl font-display font-bold text-foreground">
              {active.title}
            </h3>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {active.description}
            </p>
            <p className="text-muted-foreground/60 text-xs leading-relaxed">
              {active.detail}
            </p>

            <p className={`italic text-xs ${accent.text} opacity-70`}>
              {activeStep === 0 && "What does leadership success look like in your world?"}
              {activeStep === 1 && "What moments have shaped the leader you are today?"}
              {activeStep === 2 && "Where are the gaps in your leadership knowledge?"}
              {activeStep === 3 && "What principles will anchor your leadership model?"}
              {activeStep === 4 && "What one habit would transform your daily leadership?"}
              {activeStep === 5 && "How will you measure your leadership growth?"}
            </p>

            {/* Mobile nav */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={activeStep === 0}
                onClick={() => handleStepChange(activeStep - 1)}
                className="gap-1 text-xs flex-1"
              >
                <ChevronLeft className="w-3 h-3" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={activeStep === blueprintSteps.length - 1}
                onClick={() => handleStepChange(activeStep + 1)}
                className="gap-1 text-xs flex-1"
              >
                Next <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <Button asChild size="lg" className="bg-teal hover:bg-teal/90 text-background font-semibold px-8 py-6 text-base">
          <a href="/contact">Start Your Leadership Blueprint</a>
        </Button>
      </div>
    </>
  );
};

const BlueprintSection = ({ externalRef }: { externalRef?: React.RefObject<HTMLDivElement> }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={(node: HTMLDivElement | null) => {
      (sectionRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (externalRef) (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }} className="py-20 md:py-28 bg-background">
      <div
        className={`container mx-auto px-4 transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              The Leadership Blueprint
            </h2>
            <p className="text-muted-foreground text-lg">The Six Core Steps</p>
            <div className="w-16 h-1 bg-coral mx-auto rounded-full" />
          </div>
          <BlueprintStepper />
        </div>
      </div>
    </section>
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
  const blueprintRef = useRef<HTMLDivElement>(null);
  const scrollToLearnMore = () => {
    learnMoreRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  const scrollToBlueprint = () => {
    blueprintRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  return <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* ─── 1. HERO ─── */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-slate via-navy to-deep-blue overflow-hidden">
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
              <img src={stepsLogo} alt="STEPS – Success Through Empowering Professional Support" className="h-[4.375rem] md:h-[6.25rem] mx-auto" />
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
              <Button onClick={scrollToBlueprint} size="lg" className="bg-teal hover:bg-teal/90 text-background font-semibold px-8 py-6 text-base">
                Explore the Blueprint
                <ChevronDown className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* ─── 2. FEATURED VIDEO ─── */}
        <section ref={learnMoreRef} className="py-14 md:py-20 bg-muted">
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

              <div className="text-muted-foreground text-lg leading-relaxed w-full text-justify space-y-4">
                <p>Executive and administrative professionals are the backbone of every organization—but too often, leadership development stops at tactical training. STEPS honors the whole leader by offering a leadership framework built for real life, not just task mastery.</p>
                <p>Inspired by conversations between a renowned leadership expert and an executive assistant, STEPS was created to take the same leadership process taught to C-Suite leaders and make it accessible for those who make everything happen every day.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. THE 6-STEP BLUEPRINT ─── */}
        <BlueprintSection externalRef={blueprintRef} />

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