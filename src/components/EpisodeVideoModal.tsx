import { Dialog, DialogContent } from "@/components/ui/dialog";

interface EpisodeVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  title: string;
}

const EpisodeVideoModal = ({ open, onOpenChange, videoUrl, title }: EpisodeVideoModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-foreground border-none">
        <div className="aspect-video w-full">
          <iframe
            src={videoUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EpisodeVideoModal;
