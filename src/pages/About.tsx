import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mic, Users, Target, Heart } from "lucide-react";
import hostDmh from "@/assets/host-dmh.jpg";
import hostMelinda from "@/assets/host-melinda.jpg";

const hosts = [
  {
    name: "Diana Hansen",
    title: "Co-Founder & Co-Host",
    image: hostDmh,
    bio: "With decades of experience in educational leadership and administration, Diana brings a grounded, people-first perspective to every conversation. She believes the best leaders are lifelong learners who lead with empathy and clarity.",
    tags: ["Leadership", "Career Growth", "Communication"],
    micBullets: [
      "Practical frameworks for leading with confidence",
      "Honest perspectives on balancing empathy with accountability",
      "A passion for developing the next generation of leaders",
    ],
    tilt: "-rotate-2",
  },
  {
    name: "Melinda Vail Goodnight",
    title: "Co-Founder & Co-Host",
    image: hostMelinda,
    bio: "Melinda is a seasoned administrator with a gift for building collaborative cultures. She's passionate about creating systems that support both people and performance, and she's never afraid to share a good laugh along the way.",
    tags: ["Admin Life", "Wellness", "Humor & Human Moments"],
    micBullets: [
      "Strategies for creating healthy, high-performing teams",
      "Insights on navigating change with grace and humor",
      "Real talk about self-care and sustainability in leadership",
    ],
    tilt: "rotate-2",
  },
];

const HostCard = ({
  host,
  reversed,
}: {
  host: (typeof hosts)[0];
  reversed: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`flex flex-col ${
        reversed ? "md:flex-row-reverse" : "md:flex-row"
      } items-center gap-10 md:gap-16`}
    >
      {/* Polaroid headshot */}
      <div className="flex-shrink-0 group">
        <div
          className={`relative bg-white p-3 pb-14 shadow-lg ${host.tilt} transition-transform duration-300 hover:rotate-0`}
          style={{
            boxShadow:
              "0 8px 30px -8px hsla(199,62%,21%,0.18), 0 2px 8px -2px hsla(199,62%,21%,0.10)",
          }}
        >
          <img
            src={host.image}
            alt={host.name}
            className="w-52 h-52 md:w-64 md:h-64 object-cover object-top"
          />
          {/* Mic badge */}
          <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-teal flex items-center justify-center shadow-md">
            <Mic className="w-5 h-5 text-white" />
          </div>
          {/* Name on polaroid */}
          <span className="absolute bottom-3 left-0 right-0 text-center text-sm font-display font-semibold text-foreground/70">
            {host.name.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* Bio content */}
      <div className="flex-1 space-y-4 text-center md:text-left max-w-xl">
        <div>
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            {host.name}
          </h3>
          <p className="text-sm font-semibold uppercase tracking-wider text-teal mt-1">
            {host.title}
          </p>
        </div>

        {/* Bio / What I Bring toggle */}
        <div
          className="relative min-h-[120px] cursor-pointer"
          onClick={() => setExpanded(!expanded)}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
        >
          <div
            className={`transition-all duration-300 ${
              expanded ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            }`}
          >
            <p className="text-muted-foreground leading-relaxed">{host.bio}</p>
          </div>
          <div
            className={`absolute inset-0 transition-all duration-300 ${
              expanded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
          >
            <p className="text-sm font-display font-semibold text-foreground mb-3">
              What I Bring to the Mic
            </p>
            <ul className="space-y-2">
              {host.micBullets.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-muted-foreground text-sm"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/60 italic">
          {expanded ? "Click to see bio" : "Hover or tap for more"}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {host.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full text-teal bg-teal/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-slate via-navy to-deep-blue">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-display font-bold text-background">
                About Two Admins & a Mic
              </h1>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-background pt-6">
                About the Hosts
              </h2>
              <p className="text-xl md:text-2xl text-background/70 max-w-2xl mx-auto leading-relaxed">
                Two Admins. Two perspectives. One mic—built to elevate the
                profession through practical leadership conversations.
              </p>
              <p className="text-lg md:text-xl text-background/80 leading-relaxed">
                Empowering leaders through authentic conversations on
                administration, leadership, and professional growth.
              </p>
            </div>
          </div>
        </section>

        {/* About the Hosts */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">

              <div className="space-y-20">
                {hosts.map((host, i) => (
                  <div key={host.name}>
                    <HostCard host={host} reversed={i % 2 !== 0} />
                    {i < hosts.length - 1 && (
                      <div className="flex items-center justify-center mt-20">
                        <div className="h-px w-16 bg-border" />
                        <Mic className="w-5 h-5 text-teal/30 mx-4" />
                        <div className="h-px w-16 bg-border" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-4xl font-display font-bold text-foreground text-center">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Two Admins & a Mic is a podcast celebrating the power, creativity, and leadership of administrative professionals. Hosted by Melinda Vail-Goodnight and Diana Hansen, the show explores real stories, practical strategies, and the lighter side of life behind the desk.
                </p>
                <p className="font-semibold text-foreground">Mission Statement:</p>
                <p>
                  To amplify the voices, experiences, and expertise of administrative professionals around the world, highlighting their critical impact on modern organizations.
                </p>
                <p>
                  Our podcast brings together experienced administrators and
                  thought leaders to share real-world insights, proven
                  strategies, and honest conversations about the challenges and
                  triumphs of modern leadership.
                </p>
                <p>
                  Whether you're a seasoned executive or just starting your
                  leadership journey, our episodes are designed to provide
                  actionable takeaways that you can implement immediately in
                  your role. We keep it friendly, professional, and always
                  focused on empowering you to be the best leader you can be.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Banner */}
        <section className="py-20 bg-gradient-to-r from-navy to-deep-blue">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-sky-blue/70">
                Proud Partnership
              </p>
              <h2 className="text-4xl font-display font-bold text-background">
                In Partnership With ConantLeadership
              </h2>
              <div className="w-16 h-px bg-teal mx-auto" />
              <p className="text-lg text-background/80 leading-relaxed max-w-2xl mx-auto">
                We're proud to partner with ConantLeadership. ConantLeadership
                is a mission-driven community of leaders and learners who are
                championing leadership that works in the 21st century.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
