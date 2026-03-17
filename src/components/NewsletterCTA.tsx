import { useState } from "react";
import { Send, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const NewsletterCTA = () => {
  const [email, setEmail] = useState("");
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
      const res = await fetch("https://api.beehiiv.com/v2/publications/pub_c5ba8b8c-515d-45fc-87c1-fb21106b1e0a/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        // Fallback: open Beehiiv subscribe form
        window.open(`https://subscribe-forms.beehiiv.com/74c343d2-d107-444d-a076-41871db3af66`, "_blank");
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch {
      // Fallback to Beehiiv form on network error
      window.open(`https://subscribe-forms.beehiiv.com/74c343d2-d107-444d-a076-41871db3af66`, "_blank");
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-background rounded-2xl shadow-lg border border-border p-8 md:p-10 text-center">
            {/* Icon */}
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-coral/10">
              <Mail className="h-7 w-7 text-coral" />
            </div>

            {/* Heading */}
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
              Stay in the Loop
            </h2>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto">
              Get episode drops, blog highlights, and admin-life tips delivered straight to your inbox. 
              No spam — just the good stuff from two admins who get it.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  maxLength={255}
                  disabled={status === "submitting" || status === "success"}
                  className="flex-1 h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all disabled:opacity-50 text-base"
                />
                <Button
                  type="submit"
                  disabled={status === "submitting" || status === "success"}
                  className="h-12 px-6 rounded-xl bg-coral hover:bg-coral/90 text-white font-semibold text-base transition-all disabled:opacity-70 shadow-md shadow-coral/20 hover:shadow-lg hover:shadow-coral/30"
                >
                  {status === "submitting" ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Subscribing…
                    </span>
                  ) : status === "success" ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Subscribed!
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Subscribe
                    </span>
                  )}
                </Button>
              </div>

              {status === "success" && (
                <p className="text-teal text-sm mt-3 flex items-center justify-center gap-1.5 animate-fade-in">
                  <CheckCircle className="h-3.5 w-3.5" /> You're in! Welcome aboard.
                </p>
              )}
              {errorMsg && (
                <p className="text-destructive text-sm mt-3">{errorMsg}</p>
              )}
            </form>

            <p className="text-xs text-muted-foreground/60 mt-5">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterCTA;
