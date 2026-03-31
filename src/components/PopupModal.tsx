import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getActivePopupForPath,
  hasSeenPopup,
  markPopupSeen,
  type PopupConfig,
} from "@/data/popupData";

const PopupNewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setStatus("success");
        setEmail("");
        setFirstName("");
        setLastName("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        window.open(
          "https://subscribe-forms.beehiiv.com/74c343d2-d107-444d-a076-41871db3af66",
          "_blank"
        );
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch {
      window.open(
        "https://subscribe-forms.beehiiv.com/74c343d2-d107-444d-a076-41871db3af66",
        "_blank"
      );
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 5000);
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
        Two Admins And A Mic
      </h2>
      <p className="text-muted-foreground mb-6 text-sm sm:text-base max-w-md mx-auto">
        The podcast celebrating the power, creativity, and leadership of administrative professionals. One real story at a time.
      </p>

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
          <Button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-none h-12 bg-coral hover:bg-coral/90 text-white font-semibold text-base"
          >
            {status === "submitting" ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Subscribing…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Subscribe
              </span>
            )}
          </Button>
        </div>
        {errorMsg && (
          <p className="text-destructive text-sm mt-3">{errorMsg}</p>
        )}
      </form>
    </div>
  );
};

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

  const isBeehiivEmbed = popup.content.includes("beehiiv");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={close}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full sm:max-w-[500px] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="sticky top-2 right-2 z-20 rounded-full bg-muted/80 hover:bg-muted p-1.5 transition-colors ml-auto mr-2 mt-2"
          aria-label="Close popup"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>

        {isBeehiivEmbed ? (
          <PopupNewsletterForm />
        ) : (
          <div
            className="popup-content w-full px-4 pb-6 sm:px-0 sm:pb-0 [&_iframe]{w-full !important} [&_form]{max-w-full !important}"
            dangerouslySetInnerHTML={{ __html: popup.content }}
          />
        )}
      </div>
    </div>
  );
};

export default PopupModal;
