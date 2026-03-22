import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
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

  const close = () => {
    if (popup) markPopupSeen(popup.id, popup.cooldownDays);
    setVisible(false);
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
