/**
 * Simple client-side admin authentication.
 * 
 * ⚠️ SECURITY NOTE: This is client-side only authentication suitable for
 * a small personal/team site on static hosting. The password is stored in
 * code and is not cryptographically secure. For production CMS needs,
 * consider a proper backend auth solution.
 * 
 * To change the admin password, update ADMIN_PASSWORD below before deploying.
 */

const ADMIN_PASSWORD = 'admin2025';
const AUTH_KEY = 'taam_admin_auth';
const AUTH_EXPIRY_KEY = 'taam_admin_auth_expiry';
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

export function login(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    const expiry = Date.now() + SESSION_DURATION;
    sessionStorage.setItem(AUTH_KEY, 'true');
    sessionStorage.setItem(AUTH_EXPIRY_KEY, expiry.toString());
    return true;
  }
  return false;
}

export function isAuthenticated(): boolean {
  const auth = sessionStorage.getItem(AUTH_KEY);
  const expiry = sessionStorage.getItem(AUTH_EXPIRY_KEY);
  if (auth !== 'true' || !expiry) return false;
  if (Date.now() > parseInt(expiry, 10)) {
    logout();
    return false;
  }
  return true;
}

export function logout(): void {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_EXPIRY_KEY);
}
