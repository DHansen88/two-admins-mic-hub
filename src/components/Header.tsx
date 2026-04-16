import { NavLink } from "./NavLink";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Menu, X, Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { submitNewsletterSubscription } from "@/lib/newsletter-subscribe";

/* ── Inline Subscribe Form with ConantLeadership checkbox ── */
const HeaderSubscribeForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
    const result = await submitNewsletterSubscription({
      email: trimmed,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      conant_leadership: conantLeadership,
    });

    if (result.success) {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 5000);
    } else {
      setStatus("error");
      setErrorMsg(result.error || "Subscription failed. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-display font-bold text-foreground mb-1">Join the Community</h3>
      <p className="text-sm text-muted-foreground mb-4">Get episode drops, blog highlights, and admin life insights.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            maxLength={100}
            disabled={status === "submitting" || status === "success"}
            className="h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all disabled:opacity-50 text-sm w-full"
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            maxLength={100}
            disabled={status === "submitting" || status === "success"}
            className="h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all disabled:opacity-50 text-sm w-full"
          />
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          maxLength={255}
          disabled={status === "submitting" || status === "success"}
          className="h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral transition-all disabled:opacity-50 text-sm w-full"
        />
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={conantLeadership}
            onChange={(e) => setConantLeadership(e.target.checked)}
            disabled={status === "submitting" || status === "success"}
            className="h-4 w-4 rounded border-border text-coral focus:ring-coral/40 accent-coral"
          />
          <span className="text-sm text-muted-foreground">Subscribe to the ConantLeadership Newsletter.</span>
        </label>
        <Button
          type="submit"
          disabled={status === "submitting" || status === "success"}
          className="h-10 rounded-lg bg-coral hover:bg-coral/90 text-white font-semibold text-sm transition-all disabled:opacity-70 w-full"
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
        {status === "success" && (
          <p className="text-teal text-xs flex items-center gap-1 animate-fade-in">
            <CheckCircle className="h-3 w-3" /> Check your email to confirm.
          </p>
        )}
        {errorMsg && <p className="text-destructive text-xs">{errorMsg}</p>}
      </form>
    </div>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { to: "/about", label: "About" },
    { to: "/episodes", label: "Podcast" },
    { to: "/blog", label: "Blog" },
    { to: "/steps", label: "STEPS" },
  ];

  return (
    <header className="bg-navy shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-xl font-display font-bold text-background no-underline">
            <img src={logo} alt="Two Admins and a Mic logo" className="h-10 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className="text-background hover:text-accent transition-colors duration-300 font-medium px-2 py-2 min-w-[44px] text-center"
                activeClassName="text-accent"
              >
                {item.label}
              </NavLink>
            ))}

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" className="bg-coral-accent hover:bg-coral-accent/90 ml-2 min-w-[44px]">
                  Subscribe
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[420px] p-0 border border-border rounded-xl overflow-hidden">
                <HeaderSubscribeForm />
              </DialogContent>
            </Dialog>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-background hover:text-accent transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className="text-background hover:text-accent transition-colors duration-300 font-medium py-2"
                  activeClassName="text-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}



              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" className="bg-coral-accent hover:bg-coral-accent/90 w-full">
                    Subscribe
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px] p-0 border border-border rounded-xl overflow-hidden">
                  <HeaderSubscribeForm />
                </DialogContent>
              </Dialog>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
