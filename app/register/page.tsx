"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { ShieldPlus, UserPlus2 } from "lucide-react";
import NavBar from "../components/Navbar";
import Loader from "../components/Loader";
import useUser from "../utils/useUser";

type RegisterFormData = {
  name: string;
  email: string;
  role: string;
  password: string;
};

export default function Register() {
  const user = useUser();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    role: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.role || !formData.password) {
      toast.error("Preencha todos os campos para registrar o usuario.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Erro ao registrar usuario.");
        return;
      }

      toast.success("Funcionario registrado com sucesso.");
      setFormData({
        name: "",
        email: "",
        role: "",
        password: "",
      });
    } catch {
      toast.error("Nao foi possivel concluir o cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBar user={user} />

      <main
        className="
          mx-auto flex min-h-screen max-w-6xl items-center px-4 pb-10 pt-28
          sm:px-6 lg:px-8
        "
      >
        <section className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
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
                border border-emerald-400/20 bg-emerald-400/10
                px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200
              "
            >
              <ShieldPlus className="h-4 w-4" />
              Equipe
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
              Adicione novas pessoas ao workspace com um fluxo mais claro.
            </h1>

            <p className="mt-5 text-sm leading-8 text-slate-300">
              Esta area agora segue a mesma linguagem visual do dashboard, com
              foco em legibilidade, contraste e rapidez de preenchimento.
            </p>
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
              <div className="flex items-center gap-2 text-cyan-300">
                <UserPlus2 className="h-5 w-5" />
                <span className="text-sm font-medium">Novo colaborador</span>
              </div>

              <h2 className="text-2xl font-semibold text-white">
                Registrar funcionario
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                Preencha os dados do usuario para liberar o acesso ao sistema.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Nome completo
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Digite o nome completo"
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
                    Email
                  </label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
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
                    Cargo
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="
                      w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                      text-white outline-none transition-colors
                      focus:border-cyan-400/40 focus:bg-white/8
                    "
                  >
                    <option value="" className="bg-slate-900">
                      Selecione um cargo
                    </option>
                    <option value="admin" className="bg-slate-900">
                      Admin
                    </option>
                    <option value="staff" className="bg-slate-900">
                      Staff
                    </option>
                    <option value="guest" className="bg-slate-900">
                      Guest
                    </option>
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Senha inicial
                  </label>
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type="password"
                    placeholder="Crie uma senha temporaria"
                    className="
                      w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                      text-white placeholder:text-slate-500
                      outline-none transition-colors
                      focus:border-cyan-400/40 focus:bg-white/8
                    "
                  />
                </div>
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
                {loading ? <Loader /> : "Registrar funcionario"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
