import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mic, FileText, Mail, Library, Plus } from "lucide-react";
import { allBlogs } from "@/data/blogData";
import { allEpisodes } from "@/data/episodeData";
import { getHistory } from "@/lib/file-export";

const Dashboard = () => {
  const newsletterHistory = getHistory("newsletter");

  const stats = [
    {
      label: "Podcast Episodes",
      count: allEpisodes.length,
      icon: Mic,
      action: "/admin/publish-episode",
      actionLabel: "Publish Episode",
    },
    {
      label: "Blog Posts",
      count: allBlogs.length,
      icon: FileText,
      action: "/admin/publish-blog",
      actionLabel: "Publish Post",
    },
    {
      label: "Newsletter Drafts",
      count: newsletterHistory.length,
      icon: Mail,
      action: "/admin/newsletters",
      actionLabel: "View Drafts",
    },
    {
      label: "Content Library",
      count: allBlogs.length + allEpisodes.length,
      icon: Library,
      action: "/admin/library",
      actionLabel: "Browse",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your podcast episodes, blog posts, and newsletters.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stat.count}
              </div>
              <Link to={stat.action}>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs text-accent"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {stat.actionLabel}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link to="/admin/publish-episode">
            <Button className="gap-2">
              <Mic className="h-4 w-4" />
              Publish Podcast Episode
            </Button>
          </Link>
          <Link to="/admin/publish-blog">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Publish Blog Post
            </Button>
          </Link>
          <Link to="/admin/newsletters">
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              View Newsletter Drafts
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Workflow Guide */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-display">
            Publishing Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3 items-start">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            <p>
              Fill out the episode or blog form with all required fields and
              auto-generate content (excerpt, takeaways, SEO).
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
              2
            </span>
            <p>
              Click <strong>Export File</strong> to download the JSON or Markdown
              content file.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
              3
            </span>
            <p>
              Upload the file to{" "}
              <code className="bg-muted px-1 rounded text-xs">
                src/content/blog/
              </code>{" "}
              or{" "}
              <code className="bg-muted px-1 rounded text-xs">
                src/content/podcasts/
              </code>{" "}
              in your project.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
              4
            </span>
            <p>
              Rebuild and deploy the site. The new content will appear
              automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
