import { Mail, Instagram, Twitter, Linkedin } from "lucide-react";
import { NavLink } from "./NavLink";
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="bg-slate text-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center">
                <div className="text-xl font-display font-bold">
                  <span className="text-teal">Two Admins</span>
                  <span className="text-coral"> & </span>
                  
                </div>
              </div>
              <p className="text-background/70 leading-relaxed">
                Empowering leaders through insightful conversations on administration, 
                leadership, and professional growth. Join us every week for new episodes.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-teal transition-colors" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-sky-blue transition-colors" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-coral transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-light-green transition-colors" aria-label="Email">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Quick Links</h3>
              <nav className="flex flex-col space-y-2">
                <NavLink to="/" className="text-background/70 hover:text-teal transition-colors">
                  Home
                </NavLink>
                <NavLink to="/about" className="text-background/70 hover:text-teal transition-colors">
                  About Us
                </NavLink>
                <NavLink to="/episodes" className="text-background/70 hover:text-teal transition-colors">
                  Episodes
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