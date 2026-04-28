"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loader from "./components/Loader";
import NavBar from "./components/Navbar";

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
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

      if (data.role === "client") {
        toast.error(
          "Este login e exclusivo para funcionarios. Clientes devem usar o portal do cliente."
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
        router.push("/dashboard");
      }, 900);
    } catch {
      toast.error("Nao foi possivel conectar ao login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBar user={null} />

      <main
        className="
          mx-auto flex min-h-screen max-w-7xl items-center px-4 pb-10 pt-28
          sm:px-6 lg:px-8
        "
      >
        <section
          className="
            flex w-full flex-col justify-center gap-8
            md:flex-row md:items-center
          "
        >
          <div
            className="
              rounded-[36px] border border-white/10
              bg-[linear-gradient(180deg,rgba(10,24,40,0.96),rgba(6,16,28,0.96))]
              p-7 shadow-[0_28px_80px_rgba(2,8,23,0.42)]
              sm:p-8
            "
          >
            <div className="space-y-2">
              <p
                className="
                  text-xs uppercase tracking-[0.24em] text-emerald-300/80
                "
              >
                Acesso interno
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Entrar como funcionario
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                Use suas credenciais da equipe para acessar o dashboard operacional.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Email
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
                {loading ? <Loader /> : "Entrar"}
              </button>
            </form>

            <div
              className="
                mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-4
              "
            >
              <div className="flex items-center gap-2 text-cyan-100">
                <Users className="h-4 w-4" />
                <p className="text-sm font-medium text-white">
                  E cliente?
                </p>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Cliente usa um acesso separado e nao entra na main dashboard.
              </p>
              <Link
                href="/client/login"
                className="
                  mt-4 inline-flex items-center rounded-2xl border border-cyan-400/20
                  bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100
                  transition-colors hover:bg-cyan-400/15
                "
              >
                Fazer login como cliente
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
