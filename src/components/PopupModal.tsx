import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { X, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getActivePopupForPath,
  hasSeenPopup,
  markPopupSeen,
  type PopupConfig,
} from "@/data/popupData";

/* ── Newsletter Form ── */
const NewsletterForm = ({
  config,
}: {
  config: NonNullable<PopupConfig["newsletterConfig"]>;
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
    try {
      const res = await fetch("/api/subscribe.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
          conant_leadership: conantLeadership || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setStatus("success");
        setEmail("");
        setFirstName("");
        setLastName("");
        setConantLeadership(false);
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setErrorMsg(data?.error || "Subscription failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Subscription service unavailable. Please try again.");
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
      <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate mb-3">
        {config.heading}
      </h2>
      <p className="popup-description text-muted-foreground mb-6 text-sm sm:text-base max-w-md mx-auto">
        {config.description}
      </p>
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-0">
        <div className="border border-border rounded-lg overflow-hidden">
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="w-full px-4 py-3 text-foreground placeholder:text-muted-foreground/50 bg-background border-b border-border focus:outline-none text-base" />
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="w-full px-4 py-3 text-foreground placeholder:text-muted-foreground/50 bg-background border-b border-border focus:outline-none text-base" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="w-full px-4 py-3 text-foreground placeholder:text-muted-foreground/50 bg-background focus:outline-none text-base" />
          <Button type="submit" disabled={status === "submitting"} className="w-full rounded-none h-12 bg-coral hover:bg-coral/90 text-white font-semibold text-base">
            {status === "submitting" ? (
              <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Subscribing…</span>
            ) : (
              <span className="flex items-center gap-2"><Send className="h-4 w-4" />{config.buttonText}</span>
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

/* ── CTA Button Renderer ── */
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

/* ── Legacy block renderer for backward compat ── */
function LegacyBlockRenderer({ blocks }: { blocks: any[] }) {
  return (
    <div className="popup-prose px-5 py-6 space-y-4">
      {blocks.map((block: any) => {
        if (block.type === "richtext") {
          return <div key={block.id} dangerouslySetInnerHTML={{ __html: block.html }} />;
        }
        if (block.type === "newsletter") {
          return (
            <NewsletterForm
              key={block.id}
              config={{
                enabled: true,
                heading: block.heading,
                description: block.description,
                buttonText: block.buttonText,
                showConantLeadership: block.showConantLeadership,
                conantLeadershipLabel: block.conantLeadershipLabel,
              }}
            />
          );
        }
        if (block.type === "spacer") {
          return <div key={block.id} style={{ height: `${block.height}px` }} />;
        }
        if (block.type === "divider") {
          return <hr key={block.id} className="border-border" />;
        }
        return null;
      })}
    </div>
  );
}

/* ── Popup Modal ── */
const PopupModal = () => {
  const { pathname } = useLocation();
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
  }, [pathname]);

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

        {/* Popup Title */}
        {popup.title && (
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground px-6 pt-4 pb-1 text-center">
            {popup.title}
          </h2>
        )}

        {/* Rich text content */}
        {hasRichContent && (
          <div
            className="popup-prose px-6 py-4"
            dangerouslySetInnerHTML={{ __html: popup.content }}
          />
        )}

        {/* Legacy block-based content (backward compat) */}
        {hasLegacyBlocks && <LegacyBlockRenderer blocks={popup.contentBlocks!} />}

        {/* CTA Button */}
        {hasButton && <PopupButton config={popup.buttonConfig!} />}

        {/* Newsletter signup */}
        {hasNewsletter && <NewsletterForm config={popup.newsletterConfig!} />}

        {/* Fallback if nothing */}
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
