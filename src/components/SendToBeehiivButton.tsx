import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Mail, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getBeehiivStatus, sendBlogToBeehiiv,
  BeehiivPreviewUnavailable, type BeehiivStatus,
} from "@/lib/beehiiv-publish";

interface Props {
  slug: string;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  disabled?: boolean;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

const SendToBeehiivButton = ({
  slug, title, excerpt, featuredImage, disabled,
  size = "sm", variant = "outline", className,
}: Props) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<BeehiivStatus | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getBeehiivStatus(slug)
      .then((s) => { if (!cancelled) setStatus(s); })
      .catch(() => { /* non-fatal */ });
    return () => { cancelled = true; };
  }, [open, slug]);

  const handleSend = async () => {
    setSending(true);
    try {
      const result = await sendBlogToBeehiiv(slug);
      toast({
        title: "Draft created in Beehiiv",
        description: "Review and send it from your Beehiiv dashboard.",
      });
      setStatus({
        slug,
        sent: true,
        beehiiv_post_id: result.beehiiv_post_id,
        beehiiv_url: result.beehiiv_url,
        sent_at: result.sent_at,
      });
      setOpen(false);
    } catch (e: any) {
      if (e instanceof BeehiivPreviewUnavailable) {
        toast({
          title: "Live site only",
          description: e.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Beehiiv send failed",
          description: e?.message || "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setSending(false);
    }
  };

  const alreadySent = status?.sent;

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={className}
      >
        <Mail className="h-4 w-4 mr-1.5" />
        {alreadySent ? "Resend to Beehiiv" : "Send to Beehiiv"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Send to Beehiiv as draft
            </DialogTitle>
            <DialogDescription>
              This creates a <strong>draft email</strong> in Beehiiv. Nothing is
              sent to subscribers until you review and send it from your Beehiiv
              dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {featuredImage && (
              <img
                src={featuredImage}
                alt=""
                className="w-full h-40 object-cover rounded-md border border-border"
              />
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Subject
              </p>
              <p className="text-foreground font-medium">New on the blog: {title}</p>
            </div>
            {excerpt && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Preview
                </p>
                <p className="text-sm text-muted-foreground">{excerpt}</p>
              </div>
            )}

            {alreadySent && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-emerald-800 dark:text-emerald-300 font-medium">
                    Already sent to Beehiiv
                    {status?.sent_at && (
                      <> on {new Date(status.sent_at).toLocaleString()}</>
                    )}
                  </p>
                  {status?.beehiiv_url && (
                    <a
                      href={status.beehiiv_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Open in Beehiiv <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                    Confirming will create a new draft in Beehiiv.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? (
                <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Sending…</>
              ) : alreadySent ? (
                "Create new draft"
              ) : (
                "Create draft in Beehiiv"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SendToBeehiivButton;