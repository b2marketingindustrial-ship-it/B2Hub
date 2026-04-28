"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Building2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loader from "../../components/Loader";
import NavBar from "../../components/Navbar";
import { isClientRole } from "../../src/lib/roles";

type FormData = {
  email: string;
  password: string;
};

export default function ClientLoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Preencha email e senha para continuar.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Erro ao fazer login.");
        return;
      }

      if (!isClientRole(data.role)) {
        toast.error(
          "Este acesso e exclusivo para clientes. Funcionarios devem usar o login interno."
        );
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          name: data.name,
          role: data.role,
          email: data.email,
          companyName: data.companyName,
        })
      );

      toast.success(data.message);
      setTimeout(() => {
        router.push("/client-area");
      }, 900);
    } catch {
      toast.error("Nao foi possivel conectar ao login do cliente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBar user={null} />

      <main
        className="
          mx-auto flex min-h-screen max-w-6xl items-center px-4 pb-10 pt-28
          sm:px-6 lg:px-8
        "
      >
        <section className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div
            className="
              rounded-[36px] border border-white/10
              bg-[linear-gradient(135deg,rgba(9,24,41,0.95),rgba(7,15,26,0.88))]
              p-8 shadow-[0_28px_80px_rgba(2,8,23,0.42)]
            "
          >
            <div
              className="
                inline-flex items-center gap-2 rounded-full
                border border-cyan-400/20 bg-cyan-400/10
                px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-200
              "
            >
              <Building2 className="h-4 w-4" />
              Portal do cliente B2 Hub
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
             Seja bem vindo ao B2 Hub , faça acesso para adicionar tickets e acompanhar o andamento.
            </h1>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
              <div className="flex items-center gap-2 text-amber-200">
                <ShieldAlert className="h-4 w-4" />
                <p className="text-sm font-medium">
                  Acesso Exclusivo para clientes
                </p>
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                Essa area destina-se a acesso para clientes B2
              </p>
            </div>
          </div>

          <div
            className="
              rounded-[36px] border border-white/10
              bg-[linear-gradient(180deg,rgba(10,24,40,0.96),rgba(6,16,28,0.96))]
              p-7 shadow-[0_28px_80px_rgba(2,8,23,0.42)]
              sm:p-8
            "
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
                Login do cliente
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Fazer login como cliente
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                Use o acesso da sua empresa para entrar no portal exclusivo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Email corporativo
                </label>
                <input
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  name="email"
                  placeholder="voce@empresa.com"
                  className="
                    w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                    text-white placeholder:text-slate-500
                    outline-none transition-colors
                    focus:border-cyan-400/40 focus:bg-white/8
                  "
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Senha
                </label>
                <input
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                  name="password"
                  placeholder="Digite sua senha"
                  className="
                    w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                    text-white placeholder:text-slate-500
                    outline-none transition-colors
                    focus:border-cyan-400/40 focus:bg-white/8
                  "
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  inline-flex w-full items-center justify-center gap-2 rounded-2xl
                  bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400
                  px-5 py-3 text-sm font-semibold text-slate-950
                  shadow-[0_16px_36px_rgba(56,189,248,0.26)]
                  transition-transform duration-200 hover:scale-[1.01]
                  disabled:cursor-not-allowed disabled:opacity-70
                "
              >
                {loading ? <Loader /> : "Entrar na area do cliente"}
              </button>
            </form>
            
            <div className="mt-2 text-sm text-slate-400">
              E funcionario?{" "}
              <Link
                href="/"
                className="text-emerald-200 hover:text-emerald-100"
              >
                Voltar para o login interno
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
