import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Award, Briefcase } from "lucide-react";
import dianaHeadshot from "@/assets/images/authors/diana-headshot.jpeg";
import melHeadshot from "@/assets/images/authors/mel-headshot.jpeg";

const hosts = [
  {
    initial: "D",
    headshot: dianaHeadshot,
    name: "Diana Hansen",
    badge: "Admin Awards Loyalty Winner",
    badgeIcon: Award,
    bio: "Diana brings 15 years of administrative leadership experience and is passionate about empowering others to reach their full potential. She's a certified leadership coach dedicated to elevating the admin profession.",
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
    name: "Melinda Vail Goodnight",
    badge: "20+ Years Executive Support",
    badgeIcon: Briefcase,
    bio: "Mel has spent two decades in administrative roles across Fortune 500 companies and loves sharing practical strategies that work. Her no-nonsense approach makes complex topics accessible and actionable.",
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
                  <p className="text-sm text-muted-foreground leading-relaxed">{host.bio}</p>


                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button asChild size="sm" className={host.btnClass}>
                      <Link to={host.meetLink} onClick={() => window.scrollTo(0, 0)}>
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
