import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X, CheckCircle } from "lucide-react";
import {
  getActivePopupForPath,
  hasSeenPopup,
  markPopupSeen,
  type PopupConfig,
} from "@/data/popupData";

const PopupModal = () => {
  const { pathname } = useLocation();
  const [popup, setPopup] = useState<PopupConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

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

  // Listen for Beehiiv subscription success via postMessage
  useEffect(() => {
    if (!visible) return;

    const handleMessage = (event: MessageEvent) => {
      // Beehiiv sends messages when subscription completes
      if (
        typeof event.data === "string" &&
        (event.data.includes("beehiiv") || event.data.includes("subscribe"))
      ) {
        triggerSuccess();
      }
      // Also handle object-based messages
      if (
        typeof event.data === "object" &&
        event.data !== null &&
        (event.data.type === "beehiiv:subscribe" || event.data.subscribed)
      ) {
        triggerSuccess();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [visible]);

  const triggerSuccess = () => {
    setShowSuccess(true);
    setFadingOut(false);
    // Start fade-out after 4s, then hide at 5s
    setTimeout(() => setFadingOut(true), 4000);
    setTimeout(() => {
      setShowSuccess(false);
      setFadingOut(false);
    }, 5000);
  };

  const close = () => {
    if (popup) markPopupSeen(popup.id, popup.cooldownDays);
    setVisible(false);
    setShowSuccess(false);
  };

  if (!visible || !popup) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={close}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full sm:max-w-[980px] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={close}
          className="sticky top-2 right-2 z-20 rounded-full bg-muted/80 hover:bg-muted p-1.5 transition-colors ml-auto mr-2 mt-2"
          aria-label="Close popup"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>

        {/* Success message overlay */}
        {showSuccess && (
          <div
            className={`absolute inset-0 z-30 flex items-center justify-center bg-card/95 rounded-2xl transition-opacity duration-1000 ${
              fadingOut ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="text-center px-6">
              <CheckCircle className="h-12 w-12 text-teal mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">
                Welcome! Check your email to confirm your subscription is live.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic content */}
        <div
          className="popup-content w-full px-4 pb-6 sm:px-0 sm:pb-0 [&_iframe]{w-full !important} [&_form]{max-w-full !important}"
          dangerouslySetInnerHTML={{ __html: popup.content }}
        />
      </div>
    </div>
  );
};

export default PopupModal;
