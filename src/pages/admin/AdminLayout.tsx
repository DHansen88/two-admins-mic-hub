import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { isAuthenticated, logout, getCurrentUser, isAdmin, validateSession, login } from "@/lib/admin-auth";
import AdminLogin from "./AdminLogin";
import { Button } from "@/components/ui/button";
import {
  Mic,
  FileText,
  ShoppingBag,
  Megaphone,
  Tags,
  Users,
  UserCircle,
  LogOut,
  ChevronLeft,
} from "lucide-react";

const allNavItems = [
  { label: "Blog Posts", path: "/admin/blog-posts", icon: FileText, minRole: "intern" as const },
  { label: "Episodes", path: "/admin/episodes", icon: Mic, minRole: "intern" as const },
  { label: "Tag Manager", path: "/admin/tags", icon: Tags, minRole: "manager" as const },
  { label: "Author Library", path: "/admin/authors", icon: UserCircle, minRole: "manager" as const },
  { label: "Merchandise", path: "/admin/merchandise", icon: ShoppingBag, minRole: "manager" as const },
  { label: "Popups", path: "/admin/popups", icon: Megaphone, minRole: "manager" as const },
  { label: "User Management", path: "/admin/users", icon: Users, minRole: "admin" as const },
];

const ROLE_RANK: Record<string, number> = { intern: 0, manager: 1, admin: 2 };

function hasMinRole(userRole: string, minRole: string): boolean {
  return (ROLE_RANK[userRole] ?? 0) >= (ROLE_RANK[minRole] ?? 99);
}

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getCurrentUser());
  const [checkingSession, setCheckingSession] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const isDev = import.meta.env.DEV || window.location.hostname.includes('lovable.app');

    if (isDev) {
      // Bypass login in dev/preview
      setUser({ name: "Dev Admin", role: "admin", email: "dev@localhost" } as any);
      setShowLogin(false);
      setCheckingSession(false);
      return;
    }

    const verify = async () => {
      if (!isAuthenticated()) {
        if (!mounted) return;
        setShowLogin(true);
        setCheckingSession(false);
        return;
      }

      const isValid = await validateSession();
      if (!mounted) return;

      if (!isValid) {
        setUser(null);
        setShowLogin(true);
        setCheckingSession(false);
        return;
      }

      setUser(getCurrentUser());
      setShowLogin(false);
      setCheckingSession(false);
    };

    verify();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (checkingSession) return null;

  if (showLogin || !user) {
    return <AdminLogin onSuccess={() => { setUser(getCurrentUser()); setShowLogin(false); }} />;
  }

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowLogin(true);
  };

  const navItems = allNavItems.filter((item) => hasMinRole(user.role, item.minRole));

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-64 bg-slate text-primary-foreground flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-white/10">
          <h1 className="font-display font-bold text-lg">Admin Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-white/60">{user.name}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${
              user.role === "admin"
                ? "bg-amber-500/20 text-amber-300"
                : "bg-sky-500/20 text-sky-300"
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

      <main className="flex-1 min-w-0">
        <div className="p-6 lg:p-8 max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
