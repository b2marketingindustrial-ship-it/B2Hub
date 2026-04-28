"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Building2, FileStack } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loader from "../../components/Loader";
import NavBar from "../../components/Navbar";

type ClientRegisterFormData = {
  name: string;
  email: string;
  companyName: string;
  password: string;
};

export default function ClientRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ClientRegisterFormData>({
    name: "",
    email: "",
    companyName: "",
    password: "",
  });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.companyName ||
      !formData.password
    ) {
      toast.error("Preencha todos os campos para criar o acesso do cliente.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role: "cliente",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Nao foi possivel registrar o cliente.");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          name: data.name,
          role: "cliente",
          email: data.email,
          companyName: data.companyName,
        })
      );
      document.cookie =
        "user-role=cliente; path=/; max-age=604800; SameSite=Lax";

      toast.success("Cliente cadastrado com sucesso.");
      router.push("/client-area");
    } catch {
      toast.error("Nao foi possivel concluir o cadastro do cliente.");
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
              bg-[linear-gradient(135deg,rgba(8,23,39,0.94),rgba(6,14,25,0.88))]
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
              Portal do cliente
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
              Dê ao cliente um acesso próprio para abrir demandas e acompanhar o
              fluxo.
            </h1>

            <p className="mt-5 text-sm leading-8 text-slate-300">
              Cada cliente cria solicitações dentro da própria área e essas
              demandas entram no dashboard interno para o time operacional.
            </p>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
              <div className="flex items-center gap-3 text-cyan-200">
                <FileStack className="h-5 w-5" />
                <p className="text-sm font-medium">
                  Fluxo pronto para clientes e funcionários
                </p>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                O cliente abre a demanda, o time interno enxerga no dashboard e
                organiza a execução sem misturar com a visão externa.
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
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">
                Cadastro de cliente
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Criar acesso empresarial
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                Informe responsável, empresa e credenciais para liberar o portal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Nome do solicitante
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  placeholder="Nome da pessoa responsavel"
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
                  Empresa
                </label>
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  type="text"
                  placeholder="Nome da empresa"
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
                  Email corporativo
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="contato@empresa.com"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                  placeholder="Crie uma senha segura"
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
                {loading ? <Loader /> : "Criar acesso do cliente"}
              </button>
            </form>

            <p className="mt-5 text-sm text-slate-400">
              Ja possui acesso?{" "}
              <Link href="/" className="text-cyan-200 hover:text-cyan-100">
                Entrar no portal
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
