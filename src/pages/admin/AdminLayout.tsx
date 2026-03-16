import { useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { isAuthenticated, logout, getCurrentUser, isAdmin } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Mic,
  FileText,
  Mail,
  Library,
  ShoppingBag,
  Megaphone,
  Tags,
  Users,
  LogOut,
  ChevronLeft,
  Shield,
} from "lucide-react";

const allNavItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, adminOnly: false },
  { label: "Publish Episode", path: "/admin/publish-episode", icon: Mic, adminOnly: false },
  { label: "Publish Blog", path: "/admin/publish-blog", icon: FileText, adminOnly: false },
  { label: "Tag Manager", path: "/admin/tags", icon: Tags, adminOnly: false },
  { label: "Newsletter Drafts", path: "/admin/newsletters", icon: Mail, adminOnly: false },
  { label: "Content Library", path: "/admin/library", icon: Library, adminOnly: false },
  { label: "Merchandise", path: "/admin/merchandise", icon: ShoppingBag, adminOnly: false },
  { label: "Popups", path: "/admin/popups", icon: Megaphone, adminOnly: false },
  { label: "User Management", path: "/admin/users", icon: Users, adminOnly: true },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin/login");
    }
  }, [navigate]);

  if (!isAuthenticated() || !user) return null;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin());

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-slate text-primary-foreground flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-white/10">
          <h1 className="font-display font-bold text-lg">Admin Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-white/60">{user.name}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${
              user.role === 'admin'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-sky-500/20 text-sky-300'
            }`}>
              {user.role}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Site
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-white/60 hover:text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="p-6 lg:p-8 max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
