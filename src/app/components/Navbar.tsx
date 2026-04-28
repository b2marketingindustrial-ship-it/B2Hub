"use client";

import {
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import type { User } from "../src/types/typeUser";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { canManageEmployees, isClientRole } from "../src/lib/roles";

export default function NavBar({ user }: { user: User | null }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isLoggedIn = Boolean(user?.role);
  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  const navLinks = [
    {
      href: isClientRole(user?.role) ? "/client-area" : "/dashboard",
      label: isClientRole(user?.role) ? "Area do cliente" : "Dashboard",
      icon: isClientRole(user?.role) ? Building2 : LayoutDashboard,
      show: isLoggedIn && user?.role !== "guest",
    },
    {
      href: "/register",
      label: "Cadastrar funcionario",
      icon: Settings,
      show: canManageEmployees(user?.role),
    },
    {
      href: "/client/register",
      label: "Cadastrar cliente",
      icon: Building2,
      show: canManageEmployees(user?.role),
    },
  ].filter((item) => item.show);

  function toggleMenu() {
    setIsMobileMenuOpen((prev) => !prev);
  }

  function closeMenu() {
    setIsMobileMenuOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("user");
    document.cookie = "user-role=; path=/; max-age=0; SameSite=Lax";
    closeMenu();
    router.push("/");
  }

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="
          fixed top-0 left-0 z-50 w-full
          border-b border-white/10
          bg-slate-950/72
          shadow-[0_18px_48px_rgba(2,8,20,0.28)]
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto flex max-w-7xl items-center justify-between
            px-4 py-3 sm:px-6
          "
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div
                className="
                  flex h-10 w-10 items-center justify-center rounded-2xl
                  bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400
                  text-sm font-semibold text-slate-950
                  shadow-[0_12px_30px_rgba(56,189,248,0.26)]
                  ring-1 ring-white/20
                "
              >
                {userInitial}
              </div>
              <span
                className="
                  absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full
                  border-2 border-slate-950 bg-emerald-400
                "
              />
            </div>

            <div className="hidden flex-col sm:flex">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-cyan-300" />
                <p className="text-sm font-semibold text-white">
                  B2 Hub
                </p>
              </div>
              {isLoggedIn ? (
                <p className="text-xs text-slate-400">
                  {user?.name} • {user?.role}
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  Organize o fluxo do time com mais clareza
                </p>
              )}
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm
                    transition-colors duration-200
                    ${
                      active
                        ? "border border-cyan-400/30 bg-cyan-400/12 text-white"
                        : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-4 w-4
                      ${active ? "text-cyan-300" : "text-slate-400"}
                    `}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}

            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="
                  flex items-center gap-2 rounded-2xl
                  border border-white/10 px-4 py-2.5
                  text-sm text-slate-300
                  transition-colors duration-200
                  hover:border-rose-400/30
                  hover:bg-rose-500/10
                  hover:text-rose-200
                "
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            )}
          </div>

          <button
            onClick={toggleMenu}
            className="
              rounded-2xl border border-white/10 p-2 text-slate-300
              transition-colors hover:bg-white/5 hover:text-white md:hidden
            "
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </motion.nav>

      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? "visible bg-black/50 backdrop-blur-sm"
            : "invisible"
        }`}
        onClick={closeMenu}
      >
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-zinc-900/95 backdrop-blur-xl border-l border-white/5 shadow-2xl transform transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-3">
              <div
                className="
                  flex h-10 w-10 items-center justify-center rounded-2xl
                  bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400
                  font-semibold text-slate-950
                "
              >
                {userInitial}
              </div>

              <div>
                <p className="text-xs text-slate-400">Ola,</p>
                <p className="font-semibold text-white">
                  {user?.name || "visitante"}
                </p>
                {isLoggedIn && (
                  <p className="text-xs text-slate-400">{user?.role}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 p-4">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className={`
                    flex items-center gap-3 rounded-2xl px-4 py-3
                    transition-colors duration-200
                    ${
                      active
                        ? "border border-cyan-400/30 bg-cyan-400/12 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-5 w-5
                      ${active ? "text-cyan-300" : "text-slate-400"}
                    `}
                  />
                  {label}
                </Link>
              );
            })}

            {!isLoggedIn && (
              <Link
                href="/"
                onClick={closeMenu}
                className="
                  flex items-center gap-3 rounded-2xl px-4 py-3
                  text-slate-300 transition-colors
                  hover:bg-white/5 hover:text-white
                "
              >
                <LayoutDashboard className="h-5 w-5 text-slate-400" />
                Login
              </Link>
            )}
          </div>

          {isLoggedIn && (
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
              <button
                onClick={handleLogout}
                className="
                  flex w-full items-center gap-3 rounded-2xl px-4 py-3
                  text-rose-300 transition-colors
                  hover:bg-rose-500/10 hover:text-rose-200
                "
              >
                <LogOut className="h-5 w-5" />
                Sair da conta
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
