import { Mail, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import { NavLink } from "./NavLink";
import footerLogo from "@/assets/footer-logo.png";
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="bg-slate text-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center">
                <img src={footerLogo} alt="Two Admins & a Mic" className="h-12 w-auto" />
              </div>
              <p className="text-background/70 leading-relaxed">
                Empowering leaders through insightful conversations on administration, 
                leadership, and professional growth. Join us every week for new episodes.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/twoadminsamic/" target="_blank" rel="noopener noreferrer" className="hover:text-teal transition-colors" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://twitter.com/twoadminsamic" target="_blank" rel="noopener noreferrer" className="hover:text-sky-blue transition-colors" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://www.linkedin.com/groups/17735025/" target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="https://www.youtube.com/@TwoAdminsAMic" target="_blank" rel="noopener noreferrer" className="hover:text-deep-blue transition-colors" aria-label="YouTube">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href="https://www.tiktok.com/@twoadminsamic" target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors" aria-label="TikTok">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.7a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z"/>
                  </svg>
                </a>
                <a href="mailto:info@twoadminsandamic.com" className="hover:text-light-green transition-colors" aria-label="Email">
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
    </footer>;
};
export default Footer;