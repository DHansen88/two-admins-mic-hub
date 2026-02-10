import { NavLink } from "./NavLink";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [{
    to: "/",
    label: "Home"
  }, {
    to: "/about",
    label: "About"
  }, {
    to: "/episodes",
    label: "Podcast"
  }, {
    to: "/blog",
    label: "Blog"
  }, {
    to: "/contact",
    label: "Contact"
  }];
  return <header className="fixed top-0 left-0 right-0 z-50 bg-slate/95 backdrop-blur-sm border-b border-navy">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <NavLink to="/" className="flex items-center space-x-3">
            <img src={logo} alt="Two Admins & a Mic" className="h-12 md:h-14 w-auto" />
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(item => <NavLink key={item.to} to={item.to} end={item.to === "/"} className="text-background hover:text-accent transition-colors duration-300 font-medium" activeClassName="text-accent">
                {item.label}
              </NavLink>)}
            <Button variant="default" className="bg-coral-accent hover:bg-coral-accent/90">
              Newsletter
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-background hover:text-accent transition-colors">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <nav className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              {navItems.map(item => <NavLink key={item.to} to={item.to} end={item.to === "/"} className="text-background hover:text-accent transition-colors duration-300 font-medium py-2" activeClassName="text-accent" onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </NavLink>)}
              <Button variant="default" className="bg-coral-accent hover:bg-coral-accent/90 w-full">
                Subscribe
              </Button>
            </div>
          </nav>}
      </div>
    </header>;
};
export default Header;