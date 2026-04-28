import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const employeeManagerRoles = new Set(["admin", "ceo"]);

function normalizeRole(role?: string) {
  return role === "client" ? "cliente" : role;
}

export function proxy(request: NextRequest) {
  const role = normalizeRole(request.cookies.get("user-role")?.value);

  if (!role || !employeeManagerRoles.has(role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/register/:path*",
};
