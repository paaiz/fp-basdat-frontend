export function setAuth(payload) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("auth", JSON.stringify(payload));
  } catch {}
}
export function getAuth() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("auth"));
  } catch {
    return null;
  }
}
export function clearAuth() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("auth");
  } catch {}
}
export function isAuthenticated() {
  const a = getAuth();
  return !!(a && a.id);
}
export function getRole() {
  return getAuth()?.role ?? null;
}
export function hasRole(required) {
  const role = getRole();
  if (!role) return false;
  if (Array.isArray(required)) return required.includes(role);
  return role === required;
}
