"use client";

import { useEffect } from "react";
import { Activity, BarChart3, Clock3, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/Navbar";
import { isClientRole } from "../../src/lib/roles";
import useUser from "../../utils/useUser";

const monthlyMetrics = [
  {
    label: "Metrica 1",
    value: "24",
    helper: "Tickets acompanhados no mes",
    icon: BarChart3,
  },
  {
    label: "Metrica 2",
    value: "82%",
    helper: "Indice mensal mockado",
    icon: TrendingUp,
  },
  {
    label: "Metrica 3",
    value: "3.4d",
    helper: "Tempo medio mockado",
    icon: Clock3,
  },
];

export default function ClientMetricsPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role === "guest") {
      router.replace("/");
      return;
    }

    if (!isClientRole(user.role)) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  return (
    <>
      <NavBar user={user} />

      <main
        className="
          mx-auto min-h-screen max-w-7xl px-4 pb-14 pt-28
          sm:px-6 lg:px-8
        "
      >
        <section
          className="
            overflow-hidden rounded-[36px] border border-white/10
            bg-[linear-gradient(135deg,rgba(9,24,41,0.95),rgba(7,15,26,0.88))]
            px-6 py-8 shadow-[0_28px_80px_rgba(2,8,23,0.42)]
            sm:px-8
          "
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div
                className="
                  inline-flex items-center gap-2 rounded-full
                  border border-cyan-400/20 bg-cyan-400/10
                  px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-200
                "
              >
                <Activity className="h-4 w-4" />
                Em desenvolvimento
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
                Metricas mensais da conta
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300">
                Visao inicial para acompanhar indicadores simples da conta.
                Estes dados ainda sao mockados e servem como base do layout.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.05] px-5 py-4">
              <p className="text-sm text-slate-400">Conta</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {user?.companyName || user?.name || "Cliente"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {monthlyMetrics.map(({ label, value, helper, icon: Icon }) => (
              <div
                key={label}
                className="
                  rounded-[28px] border border-white/10 bg-white/[0.05] p-5
                  shadow-[0_18px_42px_rgba(2,8,23,0.18)]
                "
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-white">
                      {value}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                    <Icon className="h-5 w-5 text-cyan-100" />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {helper}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
