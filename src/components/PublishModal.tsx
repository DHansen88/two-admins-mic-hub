import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Send } from "lucide-react";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublishNow: () => void;
  onSchedule: (date: string, time: string) => void;
  title?: string;
}

const PublishModal = ({ open, onOpenChange, onPublishNow, onSchedule, title }: PublishModalProps) => {
  const [mode, setMode] = useState<"choose" | "schedule">("choose");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");

  const handlePublishNow = () => {
    onPublishNow();
    onOpenChange(false);
    setMode("choose");
  };

  const handleSchedule = () => {
    if (!scheduleDate) return;
    onSchedule(scheduleDate, scheduleTime);
    onOpenChange(false);
    setMode("choose");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setMode("choose"); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish Content</DialogTitle>
          <DialogDescription>
            {title ? `"${title}"` : "Choose how you'd like to publish."}
          </DialogDescription>
        </DialogHeader>

        {mode === "choose" ? (
          <div className="grid gap-3 py-4">
            <Button
              onClick={handlePublishNow}
              className="h-16 gap-3 text-base justify-start px-6"
            >
              <Send className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Publish Now</div>
                <div className="text-xs opacity-80">Make it live immediately</div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => setMode("schedule")}
              className="h-16 gap-3 text-base justify-start px-6"
            >
              <Calendar className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Schedule for Later</div>
                <div className="text-xs text-muted-foreground">Pick a date and time</div>
              </div>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Date
              </label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" /> Time
              </label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setMode("choose")}>Back</Button>
              <Button onClick={handleSchedule} disabled={!scheduleDate}>
                Schedule Publish
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PublishModal;
