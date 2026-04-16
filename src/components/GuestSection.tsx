import { Globe, Linkedin, Instagram, Facebook } from "lucide-react";
import type { EpisodeGuest } from "@/data/episodeData";

interface GuestSectionProps {
  guest: EpisodeGuest;
}

/** Simple X / Twitter glyph (lucide doesn't ship a current X icon) */
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

const GuestSection = ({ guest }: GuestSectionProps) => {
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

  return (
    <section aria-labelledby="meet-the-guest" className="bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">
            Meet the Guest
          </p>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            {guest.image && (
              <img
                src={guest.image}
                alt={guest.name}
                loading="lazy"
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover shrink-0 ring-4 ring-background shadow-md"
              />
            )}

            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h2
                  id="meet-the-guest"
                  className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight"
                >
                  {guest.name}
                </h2>
                {guest.title && (
                  <p className="text-sm md:text-base text-muted-foreground mt-1">
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
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {socials.map((s) => (
                    <SocialIcon key={s.label} href={s.href} label={s.label}>
                      {s.icon}
                    </SocialIcon>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuestSection;
