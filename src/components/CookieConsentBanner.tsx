import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "tam_cookie_consent";

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] p-4 animate-fade-in">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-card border border-border rounded-xl shadow-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Cookie className="h-6 w-6 text-primary shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1 text-sm text-foreground/80">
            <p>
              We use cookies to enhance your experience, analyze site traffic, and deliver relevant content. By clicking "Accept," you consent to our use of cookies. Learn more in our{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={decline} className="flex-1 sm:flex-none">
              Decline
            </Button>
            <Button size="sm" onClick={accept} className="flex-1 sm:flex-none">
              Accept
            </Button>
          </div>
          <button
            onClick={decline}
            className="absolute top-2 right-2 sm:static p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close cookie banner"
          >
            <X className="h-4 w-4 hidden sm:block" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
