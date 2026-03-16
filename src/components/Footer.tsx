import { useState } from "react";
import { Mail, Instagram, Twitter, Linkedin, Youtube, Send, CheckCircle } from "lucide-react";
import { NavLink } from "./NavLink";
import footerLogo from "@/assets/footer-logo.png";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    // Simulate submission — replace with real endpoint when ready
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 4000);
    }, 800);
  };

  return (
    <footer className="bg-slate text-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Newsletter Signup */}
          <div className="mb-12 rounded-2xl bg-navy/40 border border-background/10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1 space-y-2">
                <h3 className="font-display font-bold text-xl text-background">
                  Stay in the Loop
                </h3>
                <p className="text-background/70 text-sm leading-relaxed">
                  Get episode drops, blog highlights, and admin-life tips delivered to your inbox. No spam — just the good stuff.
                </p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex-1 max-w-md w-full">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={255}
                    disabled={status === "submitting" || status === "success"}
                    className="flex-1 h-11 px-4 rounded-lg border border-background/20 bg-background/10 text-background placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal transition-all disabled:opacity-50"
                  />
                  <Button
                    type="submit"
                    disabled={status === "submitting" || status === "success"}
                    className="h-11 px-5 rounded-lg bg-coral hover:bg-coral/90 text-background font-semibold transition-all disabled:opacity-70"
                  >
                    {status === "submitting" ? (
                      <span className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : status === "success" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {status === "success" && (
                  <p className="text-teal text-xs mt-2 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> You're subscribed! Welcome aboard.
                  </p>
                )}
                {errorMsg && (
                  <p className="text-coral text-xs mt-2">{errorMsg}</p>
                )}
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 space-y-4">
              <div className="flex items-center">
                <img src={footerLogo} alt="Two Admins & a Mic" className="h-12 w-auto" />
              </div>
              <p className="text-background/70 leading-relaxed">
                Celebrating the power, wit, and wisdom of administrative professionals. 
                New episodes every other week — made by admins, for admins.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://www.instagram.com/twoadminsamic/" target="_blank" rel="noopener noreferrer" className="hover:text-teal transition-colors p-2 -m-2" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://twitter.com/twoadminsamic" target="_blank" rel="noopener noreferrer" className="hover:text-sky-blue transition-colors p-2 -m-2" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://www.linkedin.com/groups/17735025/" target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors p-2 -m-2" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="https://www.youtube.com/@TwoAdminsAMic" target="_blank" rel="noopener noreferrer" className="hover:text-deep-blue transition-colors p-2 -m-2" aria-label="YouTube">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href="https://www.tiktok.com/@twoadminsamic" target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors p-2 -m-2" aria-label="TikTok">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.7a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z"/>
                  </svg>
                </a>
                <a href="mailto:info@twoadminsandamic.com" className="hover:text-light-green transition-colors p-2 -m-2" aria-label="Email">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Quick Links</h3>
              <nav className="grid grid-cols-2 gap-x-8 gap-y-2">
                <NavLink to="/" className="text-background/70 hover:text-teal transition-colors">
                  Home
                </NavLink>
                <NavLink to="/about" className="text-background/70 hover:text-teal transition-colors">
                  About Us
                </NavLink>
                <NavLink to="/episodes" className="text-background/70 hover:text-teal transition-colors">
                  Podcast
                </NavLink>
                <NavLink to="/blog" className="text-background/70 hover:text-teal transition-colors">
                  Blog
                </NavLink>
                <NavLink to="/steps" className="text-background/70 hover:text-teal transition-colors">
                  STEPS
                </NavLink>
                <NavLink to="/merch" className="text-background/70 hover:text-teal transition-colors">
                  Merch
                </NavLink>
                <NavLink to="/contact" className="text-background/70 hover:text-teal transition-colors">
                  Contact
                </NavLink>
              </nav>
            </div>

            {/* Subscribe */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Listen On</h3>
              <div className="flex flex-col space-y-2">
                <a href="#" className="text-background/70 hover:text-sky-blue transition-colors">
                  Apple Podcasts
                </a>
                <a href="#" className="text-background/70 hover:text-sky-blue transition-colors">
                  Spotify
                </a>
                <a href="#" className="text-background/70 hover:text-sky-blue transition-colors">
                  Google Podcasts
                </a>
                <a href="#" className="text-background/70 hover:text-sky-blue transition-colors">
                  RSS Feed
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-navy/50 text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-background/60 text-sm">
                © {currentYear} Two Admins & a Mic. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-background/60 hover:text-background transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-background/60 hover:text-background transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;