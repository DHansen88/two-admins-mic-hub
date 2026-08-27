import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Award, Briefcase } from "lucide-react";
import dianaHeadshot from "@/assets/images/authors/diana-headshot.jpeg";
import melHeadshot from "@/assets/images/authors/mel-headshot.png";

const hosts = [
  {
    initial: "D",
    headshot: dianaHeadshot,
    name: "Diana Hansen",
    badge: "Admin Awards Loyalty Winner",
    badgeIcon: Award,
    bio: "Diana is the Executive Administrator to Doug Conant at ConantLeadership and for the Conant family. A 2022 Admin Award winner, she brings years of experience supporting senior leaders at companies like General Electric and Campbell Soup Company. Known for her precision, creativity, and proactive mindset, she also leads branding and creative for ConantLeadership.",
    skills: ["Leadership Coaching", "Strategic Planning", "Team Empowerment", "Culture Building"],
    meetLink: "/about#diana",
    articlesLink: "/blog",
    colorClass: "teal",
    bgClass: "bg-teal/5",
    borderClass: "border-teal/20",
    badgeBg: "bg-teal/10 text-teal",
    avatarBg: "bg-teal",
    btnClass: "bg-teal hover:bg-teal/90 text-white",
    pillClass: "bg-teal/10 text-teal border-teal/20",
  },
  {
    initial: "M",
    headshot: melHeadshot,
    name: "Melinda Vail-Goodnight, CAP",
    badge: "20+ Years Executive Support",
    badgeIcon: Briefcase,
    bio: "Melinda Vail-Goodnight, CAP, is a former Senior Executive Assistant at Southwest Airlines with more than 25 years of experience supporting senior leaders and building strong executive administrative partnerships.\n\nThroughout her career, Melinda has been a passionate advocate for the administrative profession, with a focus on elevating the role of Executive Assistants from support professionals to strategic business partners. She has led professional development and mentorship initiatives, spoken to administrative communities, and coached and mentored professionals at every stage of their careers.\n\nToday, Melinda is the creator of The Right Hand Advantage™ and co-host of Two Admins & a Mic™, where she brings candid conversations, humor, and real-world experience to topics affecting today's administrative professionals. She is also a member of the ConantLeadership STEPS Global Advisory Council and serves on the Advisory Board for The Admin Awards.\n\nHer work centers on one simple belief: when leaders and their administrative partners build relationships grounded in trust, communication, and mutual respect, both people, and the business perform better.",
    skills: ["Operations", "Executive Support", "Process Optimization", "Communication"],
    meetLink: "/about#melinda",
    articlesLink: "/blog",
    colorClass: "coral-accent",
    bgClass: "bg-coral-accent/5",
    borderClass: "border-coral-accent/20",
    badgeBg: "bg-coral-accent/10 text-coral-accent",
    avatarBg: "bg-coral-accent",
    btnClass: "bg-coral-accent hover:bg-coral-accent/90 text-white",
    pillClass: "bg-coral-accent/10 text-coral-accent border-coral-accent/20",
  },
];

const MeetTheHosts = () => {
  return (
    <section className="pt-8 pb-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Meet the Hosts
            </h2>
            <p className="text-muted-foreground">The voices behind the mic</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {hosts.map((host) => {
              const IconComp = host.badgeIcon;
              return (
                <div
                  key={host.initial}
                  className={`rounded-xl border ${host.borderClass} ${host.bgClass} p-6 space-y-4`}
                >
                  {/* Credibility badge */}
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${host.badgeBg}`}>
                    <IconComp className="h-3 w-3" />
                    {host.badge}
                  </span>

                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3">
                    {host.headshot ? (
                      <img src={host.headshot} alt={host.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className={`${host.avatarBg} text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0`}>
                        {host.initial}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-foreground">{host.name}</h3>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{host.bio}</p>


                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button asChild size="sm" className={host.btnClass}>
                      <Link to={host.meetLink}>
                        Meet {host.name.split(" ")[0]}
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="border-foreground/20">
                      <Link to={host.articlesLink} onClick={() => window.scrollTo(0, 0)}>
                        View Articles
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetTheHosts;
