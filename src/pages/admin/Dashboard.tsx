import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mic, FileText, Mail, Library, Plus, Server, Rss, Users } from "lucide-react";
import { allBlogs } from "@/data/blogData";
import { allEpisodes } from "@/data/episodeData";
import { getHistory } from "@/lib/file-export";
import { getCurrentUser, isAdmin } from "@/lib/admin-auth";

const Dashboard = () => {
  const newsletterHistory = getHistory("newsletter");
  const user = getCurrentUser();

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
          Welcome back, {user?.name || "Admin"}. Manage your podcast episodes, blog posts, and newsletters.
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
          <Link to="/admin/library">
            <Button variant="outline" className="gap-2">
              <Library className="h-4 w-4" />
              Content Library
            </Button>
          </Link>
          {isAdmin() && (
            <Link to="/admin/users">
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Manage Users
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Publishing Workflow */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Publishing Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3 items-start">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            <p>
              Fill in the episode or blog form with all required fields.
              Use <strong>Auto-Generate</strong> to create excerpts, takeaways, SEO descriptions, and newsletter drafts.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
              2
            </span>
            <p>
              Click <strong>Publish to Server</strong> to save the content file directly to your Hostinger server.
              The content is written to{" "}
              <code className="bg-muted px-1 rounded text-xs">/content/blog/</code> or{" "}
              <code className="bg-muted px-1 rounded text-xs">/content/podcasts/</code>.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
              3
            </span>
            <p>
              The RSS feed at <code className="bg-muted px-1 rounded text-xs">/podcast/rss.xml</code> updates
              dynamically via the PHP backend. You can also regenerate it from the Content Library.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
              4
            </span>
            <p>
              Alternatively, use <strong>Export</strong> to download files manually and upload them via FTP.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hostinger Deployment Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Rss className="h-5 w-5 text-primary" />
            Backend Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Authentication: PHP + MySQL</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Content API: <code className="bg-muted px-1 rounded text-xs">/api/content.php</code></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>RSS Feed: <code className="bg-muted px-1 rounded text-xs">/api/rss.php</code></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Content Generation: <code className="bg-muted px-1 rounded text-xs">/api/generate.php</code></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
