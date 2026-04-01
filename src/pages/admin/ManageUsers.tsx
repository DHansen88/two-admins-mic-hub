import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  KeyRound,
  Shield,
  ShieldCheck,
  Check,
  X,
  UserCog,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  isAdmin,
  getCurrentUser,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  type AdminUser,
  type UserPermissions,
} from "@/lib/admin-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const DEFAULT_PERMISSIONS: UserPermissions = {
  canDeleteContent: false,
  canEditTags: false,
  canManageRSS: false,
  canPublishContent: true,
  fullAdmin: false,
};

const PERMISSION_LABELS: Record<keyof UserPermissions, string> = {
  canPublishContent: "Publish content",
  canDeleteContent: "Delete content",
  canEditTags: "Edit tags",
  canManageRSS: "Manage podcast RSS",
  fullAdmin: "Full admin privileges",
};

const ManageUsers = () => {
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "manager" | "intern">("manager");
  const [newPermissions, setNewPermissions] = useState<UserPermissions>({ ...DEFAULT_PERMISSIONS });

  // Edit dialog
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "manager" | "intern">("manager");
  const [editPermissions, setEditPermissions] = useState<UserPermissions>({ ...DEFAULT_PERMISSIONS });

  // Reset password dialog
  const [resetUser, setResetUser] = useState<any | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await listUsers();
    setUsers(result);
    setLoading(false);
  };

  if (!isAdmin()) {
    return (
      <div className="py-16 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground">Only administrators can manage users.</p>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    const result = await createUser({
      name: newName.trim(),
      email: newEmail.trim(),
      password: newPassword,
      role: newRole,
      permissions: newRole === "manager" ? newPermissions : undefined,
    });

    if (result.success) {
      toast({ title: `User "${newName.trim()}" created` });
      setShowCreate(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("manager");
      setNewPermissions({ ...DEFAULT_PERMISSIONS });
      await loadUsers();
    } else {
      toast({ title: result.error || "Failed to create user", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editUser) return;

    const result = await updateUser(editUser.id, {
      name: editName.trim(),
      role: editRole,
      permissions: editRole === "manager" ? editPermissions : undefined,
    });

    if (result.success) {
      toast({ title: "User updated" });
      setEditUser(null);
      await loadUsers();
    } else {
      toast({ title: result.error || "Failed to update user", variant: "destructive" });
    }
  };

  const handleResetPassword = async () => {
    if (!resetUser || !resetPassword) return;

    const result = await resetUserPassword(resetUser.id, resetPassword);
    if (result.success) {
      toast({ title: "Password reset successfully" });
      setResetUser(null);
      setResetPassword("");
    } else {
      toast({ title: result.error || "Failed to reset password", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    const result = await deleteUser(deleteConfirm.id);
    if (result.success) {
      toast({ title: "User deleted" });
      setDeleteConfirm(null);
      await loadUsers();
    } else {
      toast({ title: result.error || "Failed to delete user", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === "active" ? "disabled" : "active";
    const result = await updateUser(user.id, { status: newStatus });
    if (result.success) {
      toast({ title: `User ${newStatus === "active" ? "enabled" : "disabled"}` });
      await loadUsers();
    }
  };

  const startEdit = (user: any) => {
    setEditUser(user);
    setEditName(user.name);
    setEditRole(user.role);
    setEditPermissions(user.permissions || { ...DEFAULT_PERMISSIONS });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage admin and manager accounts.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          New User
        </Button>
      </div>

      {/* User list */}
      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading users...</p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id} className="bg-card border-border">
              <CardContent className="flex items-center gap-4 py-3 px-4">
                <div className={`p-2 rounded-full shrink-0 ${
                  user.role === "admin"
                    ? "bg-amber-500/10 text-amber-600"
                    : user.role === "intern"
                    ? "bg-violet-500/10 text-violet-600"
                    : "bg-sky-500/10 text-sky-600"
                }`}>
                  {user.role === "admin" ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : user.role === "intern" ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    <UserCog className="h-4 w-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      user.role === "admin"
                        ? "bg-amber-500/15 text-amber-600"
                        : "bg-sky-500/15 text-sky-600"
                    }`}>
                      {user.role}
                    </span>
                    {(user.status === "disabled") && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-destructive/15 text-destructive">
                        Disabled
                      </span>
                    )}
                    {user.id === currentUser?.id && (
                      <span className="text-[10px] text-muted-foreground">(You)</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => startEdit(user)}
                    title="Edit user"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setResetUser(user)}
                    title="Reset password"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                  </Button>
                  {user.id !== currentUser?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteConfirm(user)}
                      title="Delete user"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {users.length === 0 && (
            <Card className="bg-card border-dashed border-border">
              <CardContent className="py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No users found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <div className="flex gap-2">
                {(["manager", "admin"] as const).map((role) => (
                  <Button
                    key={role}
                    type="button"
                    variant={newRole === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewRole(role)}
                    className="capitalize"
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>
            {newRole === "manager" && (
              <div className="space-y-2 border border-border rounded-lg p-3">
                <p className="text-sm font-medium">Permissions</p>
                {(Object.keys(PERMISSION_LABELS) as (keyof UserPermissions)[]).map((key) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm text-muted-foreground">{PERMISSION_LABELS[key]}</label>
                    <Switch
                      checked={!!newPermissions[key]}
                      onCheckedChange={(checked) =>
                        setNewPermissions((p) => ({ ...p, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
            <Button onClick={handleCreate} className="w-full">Create User</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <div className="flex gap-2">
                {(["manager", "admin"] as const).map((role) => (
                  <Button
                    key={role}
                    type="button"
                    variant={editRole === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditRole(role)}
                    className="capitalize"
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>
            {editRole === "manager" && (
              <div className="space-y-2 border border-border rounded-lg p-3">
                <p className="text-sm font-medium">Permissions</p>
                {(Object.keys(PERMISSION_LABELS) as (keyof UserPermissions)[]).map((key) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm text-muted-foreground">{PERMISSION_LABELS[key]}</label>
                    <Switch
                      checked={!!editPermissions[key]}
                      onCheckedChange={(checked) =>
                        setEditPermissions((p) => ({ ...p, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
            {editUser && (
              <div className="flex items-center justify-between border border-border rounded-lg p-3">
                <label className="text-sm font-medium">Account Status</label>
                <Switch
                  checked={editUser.status !== "disabled"}
                  onCheckedChange={() => handleToggleStatus(editUser)}
                />
              </div>
            )}
            <Button onClick={handleUpdate} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetUser} onOpenChange={(open) => { if (!open) { setResetUser(null); setResetPassword(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {resetUser?.name} ({resetUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="New password (min 8 characters)"
            />
            <Button
              onClick={handleResetPassword}
              className="w-full"
              disabled={resetPassword.length < 8}
            >
              Reset Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {deleteConfirm?.name} ({deleteConfirm?.email})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageUsers;
