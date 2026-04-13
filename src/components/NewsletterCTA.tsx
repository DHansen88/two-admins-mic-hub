import { useState } from "react";
import { Send, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const NewsletterCTA = () => {
  const [email, setEmail] = useState("");
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
      // Call our PHP backend proxy — keeps API key server-side
      const res = await fetch("/api/subscribe.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, conant_leadership: conantLeadership })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setStatus("success");
        setEmail("");
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

  return (
    <section className="py-10 md:py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-background rounded-2xl shadow-lg border border-border px-8 py-7 md:px-10 md:py-7">
            {/* Desktop: 2-col grid | Tablet+Mobile: single col */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 items-center">
              {/* Left — info */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/10 shrink-0">
                    <Mail className="h-5 w-5 text-coral" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                    Stay in the Loop
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-lg mx-auto lg:mx-0">Get episode drops, blog highlights, and admin-life tips delivered straight to your inbox. 
No spam — just the good stuff.
                </p>
              </div>

              {/* Right — form */}
              <form onSubmit={handleSubmit} className="w-full lg:w-auto flex flex-col items-center lg:items-end">
                <div className="flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={255}
                    disabled={status === "submitting" || status === "success"}
                    className="h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all disabled:opacity-50 text-base w-full sm:w-[320px] lg:w-[400px] max-w-full" />
                  
                  <Button
                    type="submit"
                    disabled={status === "submitting" || status === "success"}
                    className="h-12 px-6 rounded-xl bg-coral hover:bg-coral/90 text-white font-semibold text-base transition-all disabled:opacity-70 shadow-md shadow-coral/20 hover:shadow-lg hover:shadow-coral/30 shrink-0 w-full sm:w-auto">
                    
                    {status === "submitting" ?
                    <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Subscribing…
                      </span> :
                    status === "success" ?
                    <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Subscribed!
                      </span> :

                    <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Subscribe
                      </span>
                    }
                  </Button>
                </div>

                <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={conantLeadership}
                    onChange={(e) => setConantLeadership(e.target.checked)}
                    disabled={status === "submitting" || status === "success"}
                    className="h-4 w-4 rounded border-border text-coral focus:ring-coral/40 accent-coral"
                  />
                  <span className="text-sm text-muted-foreground">Subscribe to the ConantLeadership Newsletter.</span>
                </label>

                {status === "success" &&
                <p className="text-teal text-sm mt-2 flex items-center justify-center gap-1.5 animate-fade-in transition-opacity duration-500">
                    <CheckCircle className="h-3.5 w-3.5" /> Welcome! Check your email to confirm your subscription is live.
                  </p>
                }
                {errorMsg &&
                <p className="text-destructive text-sm mt-2 text-center">{errorMsg}</p>
                }
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default NewsletterCTA;
