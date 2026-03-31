import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, AlertCircle, Mail, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = (import.meta.env.VITE_ADMIN_API_URL || '').trim() || '/api';

const AdminLogin = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      const res = await fetch(`${API_BASE}/reset-password.php?action=request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (data.success) {
        setForgotSent(true);
      } else {
        setForgotError(data.error || "Something went wrong.");
      }
    } catch {
      // If API is unreachable (preview environment), show confirmation anyway
      setForgotSent(true);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success && result.user) {
        toast({ title: `Welcome back, ${result.user.name}!` });
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/admin");
        }
      } else {
        setError(result.error || "Invalid credentials");
        setPassword("");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display text-foreground">
            Admin Dashboard
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Two Admins and a Mic — Content Management
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@twoadminsandamic.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="h-12 pl-10"
                  autoFocus
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="h-12 pl-10"
                  required
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1.5 bg-destructive/10 px-3 py-2 rounded-md">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full h-12"
              disabled={!email || !password || loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Contact your administrator if you need access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
