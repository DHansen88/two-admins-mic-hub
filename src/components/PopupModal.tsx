import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocation, Link } from "react-router-dom";
import { X, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getActivePopupForPath,
  getPopups,
  hasSeenPopup,
  markPopupSeen,
  subscribePopups,
  type PopupConfig,
} from "@/data/popupData";
import { type PopupContentBlock, type NewsletterPopupBlock, getVideoEmbedUrl } from "@/data/popupBlockTypes";
import { submitNewsletterSubscription } from "@/lib/newsletter-subscribe";

const NewsletterForm = ({
  config,
  compact = false,
}: {
  config: Pick<
    NewsletterPopupBlock,
    "heading" | "description" | "buttonText" | "showConantLeadership" | "conantLeadershipLabel"
  >;
  compact?: boolean;
}) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [conantLeadership, setConantLeadership] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    const result = await submitNewsletterSubscription({
      email: trimmed,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      conant_leadership: conantLeadership,
    });

    if (result.success) {
      setStatus("success");
      setEmail("");
      setFirstName("");
      setLastName("");
      setConantLeadership(false);
      setTimeout(() => setStatus("idle"), 5000);
    } else {
      setStatus("error");
      setErrorMsg(result.error || "Subscription failed. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
        <CheckCircle className="h-14 w-14 text-teal mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">You're in!</h3>
        <p className="text-muted-foreground text-base">
          Welcome! Check your email to confirm your subscription is live.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-10 py-8 text-center">
      {!compact && config.heading && (
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate text-center mb-3">
          {config.heading}
        </h2>
      )}
      {!compact && config.description && (
        <div
          className="popup-description text-muted-foreground mb-6 text-sm sm:text-base max-w-md mx-auto"
          dangerouslySetInnerHTML={{ __html: config.description }}
        />
      )}
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-0">
        <div className="border border-border rounded-lg overflow-hidden">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            className="w-full px-4 py-3 text-foreground placeholder:text-muted-foreground/50 bg-background border-b border-border focus:outline-none text-base"
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            className="w-full px-4 py-3 text-foreground placeholder:text-muted-foreground/50 bg-background border-b border-border focus:outline-none text-base"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 text-foreground placeholder:text-muted-foreground/50 bg-background focus:outline-none text-base"
          />
          <Button type="submit" disabled={status === "submitting"} className="w-full rounded-none h-12 bg-coral hover:bg-coral/90 text-white font-semibold text-base">
            {status === "submitting" ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Subscribing…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                {config.buttonText}
              </span>
            )}
          </Button>
        </div>
        {config.showConantLeadership && (
          <label className="flex items-center gap-2 mt-4 text-sm text-muted-foreground cursor-pointer justify-center">
            <Checkbox checked={conantLeadership} onCheckedChange={(v) => setConantLeadership(v === true)} />
            <span className="my-[15px]">{config.conantLeadershipLabel}</span>
          </label>
        )}
        {errorMsg && <p className="text-destructive text-sm mt-3">{errorMsg}</p>}
      </form>
    </div>
  );
};

function PopupBlockRenderer({ blocks }: { blocks: PopupContentBlock[] }) {
  return (
    <div className="px-5 py-6 space-y-4">
      {blocks.map((block, index) => (
        <PopupBlock key={block.id} block={block} index={index} totalBlocks={blocks.length} />
      ))}
    </div>
  );
}

function PopupBlock({
  block,
  index,
  totalBlocks,
}: {
  block: PopupContentBlock;
  index: number;
  totalBlocks: number;
}) {
  switch (block.type) {
    case "richtext": {
      const textAlign = block.textAlign || (index === 0 ? "center" : "left");
      const leadTitleClass = index === 0
        ? "[&_p:first-child]:font-display [&_p:first-child]:text-2xl sm:[&_p:first-child]:text-3xl [&_p:first-child]:font-bold [&_p:first-child]:text-slate"
        : "";
      return (
        <div
          className={`popup-description prose prose-sm max-w-none text-foreground [&_a]:text-primary [&_a]:underline [&_h1]:font-display [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-slate [&_h2]:font-display [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-slate [&_h3]:font-display [&_h3]:text-2xl sm:[&_h3]:text-3xl [&_h3]:font-bold [&_h3]:text-slate [&_h4]:font-display [&_h4]:text-xl sm:[&_h4]:text-2xl [&_h4]:font-bold [&_h4]:text-slate ${leadTitleClass}`}
          style={{ textAlign }}
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );
    }

    case "image": {
      const img = (
        <img
          src={block.src}
          alt={block.caption || ""}
          className="rounded-lg object-cover w-full"
          style={{ maxWidth: `${block.width || 100}%` }}
        />
      );
      return (
        <div className="flex flex-col items-center">
          {block.linkUrl ? (
            block.linkUrl.startsWith("/") ? (
              <Link to={block.linkUrl}>{img}</Link>
            ) : (
              <a href={block.linkUrl} target="_blank" rel="noopener noreferrer">{img}</a>
            )
          ) : img}
          {block.caption && <p className="text-xs text-muted-foreground mt-1.5">{block.caption}</p>}
        </div>
      );
    }

    case "video": {
      const embedUrl = getVideoEmbedUrl(block.url);
      if (!embedUrl) return null;
      return (
        <div className="aspect-video rounded-lg overflow-hidden">
          <iframe src={embedUrl} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" />
        </div>
      );
    }

    case "button": {
      const isInternal = block.url.startsWith("/");
      const cls = `inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm transition-colors w-full sm:w-auto ${
        block.style === "primary"
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
      }`;
      return (
        <div className="flex justify-center">
          {isInternal ? (
            <Link to={block.url} className={cls}>{block.text}</Link>
          ) : (
            <a href={block.url} target={block.openNewTab ? "_blank" : undefined} rel="noopener noreferrer" className={cls}>{block.text}</a>
          )}
        </div>
      );
    }

    case "divider":
      return <hr className="border-border" />;

    case "spacer":
      return <div style={{ height: `${block.height}px` }} />;

    case "html":
      return (
        <div
          className="popup-html-embed [&_iframe]:w-full [&_form]:max-w-full"
          dangerouslySetInnerHTML={{ __html: block.code }}
        />
      );

    case "newsletter":
      return <NewsletterForm config={block} compact={totalBlocks > 1} />;

    default:
      return null;
  }
}

function PopupButton({ config }: { config: NonNullable<PopupConfig["buttonConfig"]> }) {
  const isInternal = config.url.startsWith("/");
  const cls = `inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm transition-colors w-full sm:w-auto ${
    config.style === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
  }`;

  return (
    <div className="flex justify-center px-6 pb-4">
      {isInternal ? (
        <Link to={config.url} className={cls}>{config.text}</Link>
      ) : (
        <a href={config.url} target={config.openNewTab ? "_blank" : undefined} rel="noopener noreferrer" className={cls}>
          {config.text}
        </a>
      )}
    </div>
  );
}

const PopupModal = () => {
  const { pathname } = useLocation();
  const popups = useSyncExternalStore(subscribePopups, getPopups, getPopups);
  const [popup, setPopup] = useState<PopupConfig | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const match = getActivePopupForPath(pathname);
    if (!match || hasSeenPopup(match.id, match.cooldownDays)) {
      setPopup(null);
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      setPopup(match);
      setVisible(true);
    }, match.delaySeconds * 1000);
    return () => clearTimeout(timer);
  }, [pathname, popups]);

  const close = () => {
    if (popup) markPopupSeen(popup.id, popup.cooldownDays);
    setVisible(false);
  };

  if (!visible || !popup) return null;

  const hasRichContent = !!popup.content;
  const hasLegacyBlocks = !hasRichContent && popup.contentBlocks && popup.contentBlocks.length > 0;
  const hasButton = popup.buttonConfig?.enabled;
  const hasNewsletter = popup.newsletterConfig?.enabled;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={close}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full sm:max-w-[500px] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={close} className="sticky top-2 right-2 z-20 rounded-full bg-muted/80 hover:bg-muted p-1.5 transition-colors ml-auto mr-2 mt-2" aria-label="Close popup">
          <X className="h-5 w-5 text-foreground" />
        </button>

        {popup.title && (
          <h2 className="text-xl sm:text-lg leading-tight font-display font-bold text-foreground text-center max-w-[340px] mx-auto pt-4 pb-3 px-[10px] font-sans">
            {popup.title}
          </h2>
        )}

        {hasRichContent && (
          <div
            className="popup-prose px-6 py-4"
            dangerouslySetInnerHTML={{ __html: popup.content }}
          />
        )}

        {hasLegacyBlocks && <PopupBlockRenderer blocks={popup.contentBlocks!} />}

        {hasButton && <PopupButton config={popup.buttonConfig!} />}

        {hasNewsletter && <NewsletterForm config={popup.newsletterConfig!} />}

        {!hasRichContent && !hasLegacyBlocks && !hasButton && !hasNewsletter && (
          <div className="px-6 py-12 text-center text-muted-foreground text-sm italic">
            This popup has no content configured.
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupModal;
