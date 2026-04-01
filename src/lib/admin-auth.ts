/**
 * Admin Authentication Library
 * 
 * Communicates with the PHP backend API on Hostinger for secure authentication.
 * Falls back to localStorage session tracking for the static preview environment.
 */

function resolveAdminApiBase(): string {
  const configuredBase = (import.meta.env.VITE_ADMIN_API_URL || '').trim();

  if (typeof window === 'undefined') {
    return configuredBase || '/api';
  }

  if (!configuredBase) {
    return '/api';
  }

  if (import.meta.env.DEV) {
    return configuredBase;
  }

  try {
    const url = new URL(configuredBase, window.location.origin);
    if (url.origin === window.location.origin) {
      return url.pathname.replace(/\/$/, '') || '/api';
    }
  } catch {
    if (configuredBase.startsWith('/')) {
      return configuredBase.replace(/\/$/, '') || '/api';
    }
  }

  return '/api';
}

const API_BASE = resolveAdminApiBase();
const FALLBACK_HOST_PATTERNS = ['localhost', '127.0.0.1', '.lovable.app', '.lovableproject.com'];

const SESSION_KEY = 'taam_admin_session';
const ADMIN_TOKEN_KEY = 'taam_admin_token';
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager';
  permissions?: UserPermissions;
}

export interface UserPermissions {
  canDeleteContent?: boolean;
  canEditTags?: boolean;
  canManageRSS?: boolean;
  canPublishContent?: boolean;
  fullAdmin?: boolean;
}

interface SessionData {
  user: AdminUser;
  expiresAt: number;
  lastActivity: number;
}

class AdminAuthError extends Error {
  constructor(message = 'Not authenticated') {
    super(message);
    this.name = 'AdminAuthError';
  }
}

function isPhpSourceResponse(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith('<?php') || trimmed.includes("require_once __DIR__ . '/config.php'");
}

export function canUseAdminFallback(): boolean {
  if (typeof window === 'undefined') return false;
  const { hostname } = window.location;
  return FALLBACK_HOST_PATTERNS.some((pattern) =>
    pattern.startsWith('.') ? hostname.endsWith(pattern) : hostname === pattern,
  );
}

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

function saveAdminToken(token?: string | null): void {
  if (typeof window === 'undefined') return;

  if (token) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

export function getAdminAuthHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = getAdminToken();
  const normalizedHeaders = new Headers(headers);

  if (token) {
    normalizedHeaders.set('Authorization', `Bearer ${token}`);
    normalizedHeaders.set('X-Admin-Token', token);
  }

  return Object.fromEntries(normalizedHeaders.entries());
}

export function getAdminApiBase(): string {
  return API_BASE;
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin') {
    window.location.href = '/admin';
  }
}

export function handleAuthFailure(message = 'Not authenticated'): Error {
  console.error('[admin-auth] auth failure', message);
  clearSession();
  redirectToLogin();
  return new AdminAuthError(message);
}

export function isAdminAuthError(error: unknown): error is Error {
  return error instanceof Error && error.name === 'AdminAuthError';
}

// ─── Session Storage ───

function getSession(): SessionData | null {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    const session: SessionData = JSON.parse(stored);
    
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    
    if (Date.now() - session.lastActivity > INACTIVITY_TIMEOUT) {
      clearSession();
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

function saveSession(user: AdminUser): void {
  const session: SessionData = {
    user,
    expiresAt: Date.now() + SESSION_DURATION,
    lastActivity: Date.now(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  resetInactivityTimer();
}

function updateActivity(): void {
  const session = getSession();
  if (session) {
    session.lastActivity = Date.now();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
}

function resetInactivityTimer(): void {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    clearSession();
    redirectToLogin();
  }, INACTIVITY_TIMEOUT);
}

if (typeof window !== 'undefined') {
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
    window.addEventListener(event, () => {
      const session = getSession();
      if (session) {
        updateActivity();
        resetInactivityTimer();
      }
    }, { passive: true });
  });
}

// ─── API Communication ───

async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeaders(options.headers || {}),
      },
      credentials: 'include',
    });

    const text = await response.text();
    let data: any = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        if (isPhpSourceResponse(text)) {
          return null;
        }
        data = null;
      }
    }

    if (response.status === 401) {
      console.error('[admin-auth] 401 response', { endpoint, data, raw: text });
      throw handleAuthFailure(data?.error || 'Not authenticated');
    }

    if (!response.ok) {
      console.error('[admin-auth] non-OK response', { endpoint, status: response.status, data, raw: text });
      throw new Error(data?.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return null;
    }
    throw error;
  }
}

// ─── Auth Functions ───

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
  try {
    const result = await apiCall('auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (result?.success && result.user) {
      saveAdminToken(result.token);
      saveSession(result.user);
      return { success: true, user: result.user };
    }
    
    if (result === null) {
      if (canUseAdminFallback()) {
        return fallbackLogin(email, password);
      }

      return {
        success: false,
        error: 'Live admin login is not reaching the PHP backend. Please verify /api/auth.php is executing on the server.',
      };
    }
    
    return { success: false, error: result?.error || 'Login failed' };
  } catch (error: any) {
    if (isAdminAuthError(error)) {
      return { success: false, error: error.message };
    }
    return { success: false, error: error?.message || 'Login failed' };
  }
}

export async function validateSession(): Promise<boolean> {
  if (!getSession()) return false;

  try {
    const result = await apiCall('auth.php?action=session');

    if (result === null) {
      return canUseAdminFallback() ? isAuthenticated() : false;
    }

    if (result?.authenticated && result.user) {
      saveSession(result.user);
      return true;
    }
  } catch (error) {
    if (isAdminAuthError(error)) {
      return false;
    }
  }

  clearSession();
  return false;
}

/** Fallback login for preview/development when PHP backend isn't available */
function fallbackLogin(email: string, password: string): { success: boolean; error?: string; user?: AdminUser } {
  const devAccounts = getDevAccounts();
  const account = devAccounts.find((a) => a.email === email);
  
  if (account && account.password === password && account.status === 'active') {
    const user: AdminUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      permissions: account.permissions,
    };
    saveSession(user);
    return { success: true, user };
  }
  
  const defaultAccounts: Record<string, { name: string; password: string }> = {
    'admin@twoadminsandamic.com': { name: 'Site Admin', password: 'admin2025' },
    'info@twoadminsandamic.com': { name: 'TAAM Admin', password: 'TaamSecure#2026!' },
  };
  
  const defaultAccount = defaultAccounts[email];
  if (defaultAccount && password === defaultAccount.password) {
    const user: AdminUser = { id: Object.keys(defaultAccounts).indexOf(email) + 1, name: defaultAccount.name, email, role: 'admin' };
    saveSession(user);
    if (devAccounts.length === 0) {
      saveDevAccounts(
        Object.entries(defaultAccounts).map(([e, a], i) => ({
          id: i + 1,
          name: a.name,
          email: e,
          role: 'admin' as const,
          password: a.password,
          status: 'active' as const,
        }))
      );
    }
    return { success: true, user };
  }
  
  return { success: false, error: 'Invalid email or password' };
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function getCurrentUser(): AdminUser | null {
  return getSession()?.user || null;
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

export function hasPermission(permission: keyof UserPermissions): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.permissions?.fullAdmin) return true;
  return user.permissions?.[permission] ?? false;
}

export function logout(): void {
  apiCall('auth.php?action=logout', { method: 'POST' }).catch(() => {});
  clearSession();
}

// ─── Dev Accounts (localStorage fallback for preview) ───

interface DevAccount extends AdminUser {
  password: string;
  status: 'active' | 'disabled';
}

const DEV_ACCOUNTS_KEY = 'taam_dev_accounts';

function getDevAccounts(): DevAccount[] {
  try {
    return JSON.parse(localStorage.getItem(DEV_ACCOUNTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDevAccounts(accounts: DevAccount[]): void {
  localStorage.setItem(DEV_ACCOUNTS_KEY, JSON.stringify(accounts));
}

// ─── User Management (works with API or localStorage fallback) ───

export async function listUsers(): Promise<AdminUser[]> {
  try {
    const result = await apiCall('users.php?action=list');
    if (result?.users) return result.users;
  } catch {}
  
  return getDevAccounts().map(({ password, status, ...user }) => ({ ...user, status } as any));
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager';
  permissions?: UserPermissions;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await apiCall('users.php?action=create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result?.success) return { success: true };
    if (result) return { success: false, error: result.error };
  } catch (e: any) {
    if (e.message) return { success: false, error: e.message };
  }
  
  const accounts = getDevAccounts();
  if (accounts.some((a) => a.email === data.email)) {
    return { success: false, error: 'Email already exists' };
  }
  accounts.push({
    id: Date.now(),
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    status: 'active',
    permissions: data.permissions,
  });
  saveDevAccounts(accounts);
  return { success: true };
}

export async function updateUser(id: number, updates: Partial<{
  name: string;
  role: 'admin' | 'manager';
  status: 'active' | 'disabled';
  permissions: UserPermissions;
}>): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await apiCall('users.php?action=update', {
      method: 'POST',
      body: JSON.stringify({ id, ...updates }),
    });
    if (result?.success) return { success: true };
    if (result) return { success: false, error: result.error };
  } catch (e: any) {
    if (e.message) return { success: false, error: e.message };
  }
  
  const accounts = getDevAccounts();
  const idx = accounts.findIndex((a) => a.id === id);
  if (idx >= 0) {
    accounts[idx] = { ...accounts[idx], ...updates } as DevAccount;
    saveDevAccounts(accounts);
  }
  return { success: true };
}

export async function deleteUser(id: number): Promise<{ success: boolean; error?: string }> {
  const current = getCurrentUser();
  if (current?.id === id) {
    return { success: false, error: 'Cannot delete your own account' };
  }
  
  try {
    const result = await apiCall('users.php?action=delete', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
    if (result?.success) return { success: true };
    if (result) return { success: false, error: result.error };
  } catch (e: any) {
    if (e.message) return { success: false, error: e.message };
  }
  
  const accounts = getDevAccounts().filter((a) => a.id !== id);
  saveDevAccounts(accounts);
  return { success: true };
}

export async function resetUserPassword(id: number, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }
  
  try {
    const result = await apiCall('users.php?action=reset-password', {
      method: 'POST',
      body: JSON.stringify({ id, password: newPassword }),
    });
    if (result?.success) return { success: true };
    if (result) return { success: false, error: result.error };
  } catch (e: any) {
    if (e.message) return { success: false, error: e.message };
  }
  
  const accounts = getDevAccounts();
  const idx = accounts.findIndex((a) => a.id === id);
  if (idx >= 0) {
    accounts[idx].password = newPassword;
    saveDevAccounts(accounts);
  }
  return { success: true };
}
