import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getHistory, exportNewsletterDraft } from "@/lib/file-export";

const NewsletterDrafts = () => {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState(() => getHistory("newsletter"));

  const handleExport = (draft: Record<string, unknown>) => {
    exportNewsletterDraft(
      { subject: draft.subject as string, body: draft.body as string },
      `newsletter-${Date.now()}.txt`
    );
    toast({ title: "Newsletter draft exported!" });
  };

  const handleDelete = (index: number) => {
    const updated = drafts.filter((_, i) => i !== index);
    localStorage.setItem("taam_newsletter_history", JSON.stringify(updated));
    setDrafts(updated);
    toast({ title: "Draft deleted" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
          <Mail className="h-7 w-7 text-primary" />
          Newsletter Drafts
        </h1>
        <p className="text-muted-foreground mt-1">
          Auto-generated newsletter drafts from published episodes and blog posts. Export for Beehiiv.
        </p>
      </div>

      {drafts.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No newsletter drafts yet. Publish a podcast episode or blog post to auto-generate one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft, i) => (
            <Card key={i} className="bg-card border-border">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-base truncate">
                    {(draft.subject as string) || "Newsletter Draft"}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {draft.publishedAt
                      ? new Date(draft.publishedAt as string).toLocaleDateString()
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => handleExport(draft)} className="gap-1">
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(i)} className="text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  {(draft.body as string) || ""}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsletterDrafts;
