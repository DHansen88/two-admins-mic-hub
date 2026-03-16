import { NavLink } from "./NavLink";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/episodes", label: "Podcast" },
    { to: "/blog", label: "Blog" },
    { to: "/steps", label: "STEPS" },
  ];

  const moreItems = [
    { to: "/about", label: "About" },
    { to: "/merch", label: "Merch" },
    { to: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMoreEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsMoreOpen(true);
  };

  const handleMoreLeave = () => {
    timeoutRef.current = setTimeout(() => setIsMoreOpen(false), 200);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate/95 backdrop-blur-sm border-b border-navy">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <NavLink to="/" className="flex items-center space-x-3">
            <img src={logo} alt="Two Admins & a Mic" className="h-12 md:h-14 w-auto" />
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className="text-background hover:text-accent transition-colors duration-300 font-medium"
                activeClassName="text-accent"
              >
                {item.label}
              </NavLink>
            ))}

            {/* More Dropdown */}
            <div
              ref={moreRef}
              className="relative"
              onMouseEnter={handleMoreEnter}
              onMouseLeave={handleMoreLeave}
            >
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="flex items-center gap-1 text-background hover:text-accent transition-colors duration-300 font-medium"
              >
                More
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${isMoreOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isMoreOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-slate border border-navy rounded-lg shadow-lg z-50 py-2 animate-fade-in">
                  {moreItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className="block px-4 py-2 text-background hover:text-accent hover:bg-navy/30 transition-colors duration-200 font-medium"
                      activeClassName="text-accent"
                      onClick={() => setIsMoreOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <Button variant="default" className="bg-coral-accent hover:bg-coral-accent/90">
              Subscribe
            </Button>
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

              {/* Mobile More Section */}
              <button
                onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
                className="flex items-center gap-1 text-background hover:text-accent transition-colors duration-300 font-medium py-2 text-left"
              >
                More
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${isMobileMoreOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isMobileMoreOpen && (
                <div className="flex flex-col space-y-2 pl-4 border-l-2 border-navy">
                  {moreItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className="text-background hover:text-accent transition-colors duration-300 font-medium py-2"
                      activeClassName="text-accent"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsMobileMoreOpen(false);
                      }}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}

              <Button variant="default" className="bg-coral-accent hover:bg-coral-accent/90 w-full">
                Subscribe
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;