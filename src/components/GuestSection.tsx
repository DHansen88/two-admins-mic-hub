import { Globe, Linkedin, Instagram, Facebook } from "lucide-react";
import type { EpisodeGuest } from "@/data/episodeData";
import TopicTag from "@/components/TopicTag";

interface GuestSectionProps {
  guest: EpisodeGuest;
  topics: string[];
}

const XIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M18.244 2H21l-6.52 7.452L22 22h-6.828l-4.78-6.49L4.8 22H2.04l6.99-7.99L2 2h6.914l4.36 5.93L18.244 2Zm-2.39 18h1.59L7.21 4H5.5l10.354 16Z" />
  </svg>
);

const SocialIcon = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    title={label}
    className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors"
  >
    {children}
  </a>
);

const GuestSection = ({ guest, topics }: GuestSectionProps) => {
  const socials = [
    guest.websiteUrl && {
      href: guest.websiteUrl,
      label: "Website",
      icon: <Globe className="h-4 w-4" />,
    },
    guest.linkedinUrl && {
      href: guest.linkedinUrl,
      label: "LinkedIn",
      icon: <Linkedin className="h-4 w-4" />,
    },
    guest.instagramUrl && {
      href: guest.instagramUrl,
      label: "Instagram",
      icon: <Instagram className="h-4 w-4" />,
    },
    guest.xUrl && {
      href: guest.xUrl,
      label: "X (Twitter)",
      icon: <XIcon />,
    },
    guest.facebookUrl && {
      href: guest.facebookUrl,
      label: "Facebook",
      icon: <Facebook className="h-4 w-4" />,
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  const quoteText = guest.featuredQuote?.trim() || guest.quote?.trim();
  const quoteAttribution = guest.name ? `- ${guest.name}` : "";

  return (
    <section aria-labelledby="meet-the-guest" className="bg-muted/20 border-y border-border">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent mb-5">
            Meet the Guest
          </p>

          <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] xl:grid-cols-[auto_minmax(0,1.1fr)_minmax(280px,0.8fr)] xl:items-start">
            {guest.image && (
              <img
                src={guest.image}
                alt={guest.name}
                loading="lazy"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shrink-0 ring-4 ring-background shadow-md"
              />
            )}

            <div className="min-w-0 space-y-4">
              <div>
                <h2
                  id="meet-the-guest"
                  className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight"
                >
                  {guest.name}
                </h2>
                {guest.title && (
                  <p className="text-base md:text-lg text-primary mt-1">
                    {guest.title}
                  </p>
                )}
              </div>

              {guest.bio && (
                <div
                  className="prose prose-sm md:prose-base max-w-none text-foreground/80 leading-relaxed [&_p]:my-2 [&_a]:text-accent [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: guest.bio }}
                />
              )}

              {socials.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {socials.map((s) => (
                    <SocialIcon key={s.label} href={s.href} label={s.label}>
                      {s.icon}
                    </SocialIcon>
                  ))}
                </div>
              )}
            </div>

            {quoteText && (
              <aside className="xl:pl-6 self-center xl:self-start">
                <blockquote className="text-2xl md:text-[2rem] leading-tight font-semibold italic text-[#74d6ad]">
                  <p className="whitespace-pre-line">"{quoteText}"</p>
                  {quoteAttribution && (
                    <footer className="mt-2 text-right text-xl md:text-2xl">
                      {quoteAttribution}
                    </footer>
                  )}
                </blockquote>
              </aside>
            )}
          </div>

          {topics.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-sm font-display font-bold uppercase tracking-widest text-foreground/80 mb-3">
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <TopicTag key={topic} topic={topic} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GuestSection;
