import { useRef, useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useEmblaCarousel from "embla-carousel-react";
import { Eye, Search, BookOpen, PenTool, Hammer, RefreshCw, Award, Compass, Sparkles, TrendingUp, Users, Clock, Target, Heart, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Quote, ArrowRight } from "lucide-react";

const stepColors = [
  { bg: "bg-light-green", text: "text-light-green", border: "border-light-green", ring: "ring-light-green" },
  { bg: "bg-teal", text: "text-teal", border: "border-teal", ring: "ring-teal" },
  { bg: "bg-sky-blue", text: "text-sky-blue", border: "border-sky-blue", ring: "ring-sky-blue" },
  { bg: "bg-deep-blue", text: "text-deep-blue", border: "border-deep-blue", ring: "ring-deep-blue" },
  { bg: "bg-navy", text: "text-navy", border: "border-navy", ring: "ring-navy" },
  { bg: "bg-coral", text: "text-coral", border: "border-coral", ring: "ring-coral" },
];

const blueprintSteps = [{
  number: "01",
  title: "Reach High — Envision",
  description: "Envision what leadership success looks like for you and articulate your purpose.",
  detail: "Define your aspirations and create a compelling vision that drives your daily leadership choices.",
  icon: Eye,
  colorIdx: 0
}, {
  number: "02",
  title: "Dig Deep — Reflect",
  description: "Reflect on what shapes your leadership—your experiences, values, and strengths.",
  detail: "Examine the moments, mentors, and values that have shaped who you are as a professional and leader.",
  icon: Search,
  colorIdx: 1
}, {
  number: "03",
  title: "Prepare — Study",
  description: "Study frameworks and leadership insights that fill the gaps and expand your perspective.",
  detail: "Engage with proven leadership models and research to build a well-rounded foundation for growth.",
  icon: BookOpen,
  colorIdx: 2
}, {
  number: "04",
  title: "Design — Plan",
  description: "Design your personal Leadership Model based on purpose and beliefs.",
  detail: "Craft a personalized leadership blueprint that reflects your unique strengths and professional context.",
  icon: PenTool,
  colorIdx: 3
}, {
  number: "05",
  title: "Build — Practice",
  description: "Build real, actionable habits that bring your leadership to life.",
  detail: "Translate your leadership model into daily practices, routines, and touchpoints that make an impact.",
  icon: Hammer,
  colorIdx: 4
}, {
  number: "06",
  title: "Reinforce — Improve",
  description: "Reinforce and refine your approach, aligning it with your organization's needs.",
  detail: "Continuously evaluate and evolve your leadership, staying aligned with both personal growth and organizational goals.",
  icon: RefreshCw,
  colorIdx: 5
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
const accentColorMap: Record<string, string> = {
  teal: "bg-teal",
  "deep-blue": "bg-deep-blue",
  "sky-blue": "bg-sky-blue",
  navy: "bg-navy",
  coral: "bg-coral"
};
const accentTextMap: Record<string, string> = {
  teal: "text-teal",
  "deep-blue": "text-deep-blue",
  "sky-blue": "text-sky-blue",
  navy: "text-navy",
  coral: "text-coral"
};
const BlueprintStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [mobileOpen, setMobileOpen] = useState<number | null>(0);

  const active = blueprintSteps[activeStep];
  const ActiveIcon = active.icon;
  const colors = stepColors[active.colorIdx];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center space-y-4 mb-14">
            {/* Ascending steps motif */}
            <div className="flex items-end justify-center gap-1 mb-4" aria-hidden="true">
              {stepColors.map((c, i) => (
                <div
                  key={i}
                  className={`${c.bg} rounded-sm transition-all duration-300 ${i === activeStep ? 'opacity-100' : 'opacity-40'}`}
                  style={{ width: 12, height: 10 + i * 6 }}
                />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              The Leadership Blueprint
            </h2>
            <p className="text-muted-foreground text-lg">The Six Core Steps</p>
          </div>

          {/* Progress bar */}
          <div className="hidden md:flex items-center gap-0 max-w-2xl mx-auto mb-14">
            {blueprintSteps.map((step, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-initial">
                <button
                  onClick={() => setActiveStep(i)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0
                    ${i === activeStep
                      ? `${stepColors[i].bg} text-background ring-4 ${stepColors[i].ring}/20 scale-110`
                      : i < activeStep
                        ? `${stepColors[i].bg} text-background opacity-70`
                        : 'bg-muted text-muted-foreground'
                    }`}
                >
                  {step.number}
                </button>
                {i < blueprintSteps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        i < activeStep ? stepColors[i].bg : 'bg-border'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: Timeline left + Spotlight right */}
          <div className="hidden md:grid md:grid-cols-[220px_1fr] gap-8 items-start">
            {/* Left - vertical step list */}
            <div className="space-y-1">
              {blueprintSteps.map((step, i) => {
                const sc = stepColors[step.colorIdx];
                const isActive = i === activeStep;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 group
                      ${isActive
                        ? `bg-muted border-l-4 ${sc.border}`
                        : 'hover:bg-muted/50 border-l-4 border-transparent'
                      }`}
                  >
                    <span className={`text-xs font-bold font-display transition-colors duration-300 ${isActive ? sc.text : 'text-muted-foreground'}`}>
                      {step.number}
                    </span>
                    <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {step.title.split(' — ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right - spotlight content */}
            <div
              key={activeStep}
              className="bg-muted rounded-2xl p-10 animate-fade-in relative overflow-hidden"
            >
              {/* Subtle color accent bar */}
              <div className={`absolute top-0 left-0 w-full h-1 ${colors.bg}`} />

              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <ActiveIcon className="w-8 h-8 text-background" />
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-4xl font-display font-bold ${colors.text} opacity-30`}>{active.number}</span>
                    <h3 className="text-xl font-display font-bold text-foreground">{active.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{active.description}</p>
                  <p className="text-muted-foreground/80 text-sm leading-relaxed">{active.detail}</p>
                </div>
              </div>

              {/* Step navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={() => setActiveStep(Math.min(blueprintSteps.length - 1, activeStep + 1))}
                  disabled={activeStep === blueprintSteps.length - 1}
                  className={`text-sm font-medium ${colors.text} hover:opacity-80 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1`}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile: Accordion steps */}
          <div className="md:hidden space-y-2">
            {blueprintSteps.map((step, i) => {
              const Icon = step.icon;
              const sc = stepColors[step.colorIdx];
              const isOpen = mobileOpen === i;
              return (
                <div key={i} className={`rounded-xl border transition-all duration-300 ${isOpen ? `${sc.border} border-2` : 'border-border'}`}>
                  <button
                    onClick={() => setMobileOpen(isOpen ? null : i)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg ${sc.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-background" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-bold ${sc.text}`}>{step.number}</span>
                      <p className="text-sm font-display font-semibold text-foreground truncate">{step.title}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-4 pb-4 space-y-2">
                      <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                      <p className="text-muted-foreground/70 text-xs leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button asChild className="bg-teal hover:bg-teal/90 text-background font-semibold px-8">
              <a href="#benefits">
                Explore the STEPS Program
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </div>
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

        {/* ─── 3. WHY THIS MATTERS ─── */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground text-center">
                Why This Matters
              </h2>
              <div className="w-16 h-1 bg-teal mx-auto rounded-full" />
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Executive and administrative professionals are the backbone of
                  every organization—but too often, leadership development stops
                  at tactical training. STEPS honors the whole leader by
                  offering a leadership framework built for real life, not just
                  task mastery.
                </p>
                <p>
                  Inspired by conversations between a renowned leadership expert
                  and an executive assistant, STEPS was created to take the same
                  leadership process taught to C-Suite leaders and make it
                  accessible for those who make everything happen every day.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. THE 6-STEP BLUEPRINT (Interactive Stepper) ─── */}
        <BlueprintStepper />

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
        <section className="py-16 bg-background border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Connect with us to learn more about STEPS, partner
                opportunities, and how we're reimagining leadership development
                for administrative professionals.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button asChild variant="outline" className="border-2">
                  <a href="/contact">Contact Us</a>
                </Button>
                <Button asChild variant="outline" className="border-2">
                  <a href="https://linktr.ee/twoadminsandamic" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    All Our Links
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default Steps;