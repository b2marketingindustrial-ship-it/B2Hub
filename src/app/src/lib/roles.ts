export const AUTH_ROLES = ["cliente", "admin", "ceo"] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export function normalizeRole(role?: string | null): AuthRole | "guest" {
  if (role === "client") {
    return "cliente";
  }

  if (role === "admin" || role === "ceo" || role === "cliente") {
    return role;
  }

  return "guest";
}

export function canManageEmployees(role?: string | null) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "admin" || normalizedRole === "ceo";
}

export function isClientRole(role?: string | null) {
  return normalizeRole(role) === "cliente";
}
