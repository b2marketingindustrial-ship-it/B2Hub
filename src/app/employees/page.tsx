"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BriefcaseBusiness,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  UsersRound,
  X,
} from "lucide-react";
import NavBar from "../components/Navbar";
import Loader from "../components/Loader";
import { canManageEmployees } from "../src/lib/roles";
import useUser from "../utils/useUser";

type Employee = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "ceo";
  createdAt?: string;
};

type EmployeeForm = {
  name: string;
  email: string;
  role: "admin" | "ceo";
  password: string;
};

const emptyEmployeeForm: EmployeeForm = {
  name: "",
  email: "",
  role: "admin",
  password: "",
};

function formatDate(value?: string) {
  if (!value) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function EmployeesPage() {
  const user = useUser();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeForm>(emptyEmployeeForm);

  const loadEmployees = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/users");
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Nao foi possivel listar funcionarios.");
        return;
      }

      setEmployees(data);
    } catch {
      toast.error("Nao foi possivel carregar os funcionarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!canManageEmployees(user.role)) {
      router.replace("/");
      return;
    }

    void loadEmployees();
  }, [loadEmployees, router, user]);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return employees;
    }

    return employees.filter((employee) =>
      [employee.name, employee.email, employee.role].some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      )
    );
  }, [employees, search]);

  const stats = [
    {
      label: "Funcionarios",
      value: employees.length,
      icon: UsersRound,
      accent: "from-sky-400/25 to-cyan-400/10 text-cyan-100",
    },
    {
      label: "Admins",
      value: employees.filter((employee) => employee.role === "admin").length,
      icon: UserCog,
      accent: "from-emerald-400/24 to-lime-400/10 text-emerald-100",
    },
    {
      label: "CEOs",
      value: employees.filter((employee) => employee.role === "ceo").length,
      icon: ShieldCheck,
      accent: "from-amber-400/24 to-orange-400/10 text-amber-100",
    },
  ];

  function openEditModal(employee: Employee) {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      password: "",
    });
  }

  function closeModal() {
    setSelectedEmployee(null);
    setFormData(emptyEmployeeForm);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function syncCurrentUser(updatedEmployee: Employee) {
    if (updatedEmployee.id !== user?.id) {
      return;
    }

    const nextUser = {
      ...user,
      name: updatedEmployee.name,
      email: updatedEmployee.email,
      role: updatedEmployee.role,
    };

    localStorage.setItem("user", JSON.stringify(nextUser));
    document.cookie = `user-role=${updatedEmployee.role}; path=/; max-age=604800; SameSite=Lax`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedEmployee) {
      return;
    }

    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Preencha nome, email e cargo para alterar o funcionario.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/users/${selectedEmployee.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Nao foi possivel alterar o funcionario.");
        return;
      }

      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === selectedEmployee.id ? data : employee
        )
      );
      syncCurrentUser(data);
      toast.success("Funcionario alterado com sucesso.");
      closeModal();
    } catch {
      toast.error("Nao foi possivel concluir a alteracao.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(employee: Employee) {
    const confirmed = window.confirm(
      `Excluir o cadastro de ${employee.name}? Esta acao nao pode ser desfeita.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(employee.id);

    try {
      const response = await fetch(`/api/users/${employee.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Nao foi possivel excluir o funcionario.");
        return;
      }

      setEmployees((prev) => prev.filter((item) => item.id !== employee.id));
      toast.success("Funcionario excluido com sucesso.");

      if (employee.id === user?.id) {
        localStorage.removeItem("user");
        document.cookie = "user-role=; path=/; max-age=0; SameSite=Lax";
        router.push("/");
      }
    } catch {
      toast.error("Nao foi possivel concluir a exclusao.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="min-h-screen">
        <NavBar user={user} />

        <motion.main
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 lg:px-8"
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
              <div className="max-w-2xl space-y-4">
                <div
                  className="
                    inline-flex items-center gap-2 rounded-full border border-cyan-400/20
                    bg-cyan-400/10 px-3 py-1 text-xs uppercase
                    tracking-[0.24em] text-cyan-200
                  "
                >
                  <BriefcaseBusiness className="h-4 w-4" />
                  Gestao de equipe
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Gerencie os cadastros dos funcionarios internos.
                  </h1>
                  <p className="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                    Consulte todos os funcionarios cadastrados, altere dados de
                    acesso e remova registros que nao devem mais entrar no sistema.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                {stats.map(({ label, value, icon: Icon, accent }) => (
                  <div
                    key={label}
                    className={`rounded-[28px] border border-white/10 bg-gradient-to-br p-5 ${accent}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-300">{label}</p>
                        <p className="mt-2 text-3xl font-semibold text-white">
                          {value}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div
              className="
                flex flex-col gap-4 rounded-[28px] border border-white/10
                bg-slate-950/30 p-4 shadow-[0_18px_50px_rgba(2,8,23,0.18)]
                md:flex-row md:items-center md:justify-between
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="
                    flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl
                    border border-cyan-400/20 bg-cyan-400/10 text-cyan-100
                  "
                >
                  <Search className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    Buscar funcionario
                  </p>
                  <p className="text-xs text-slate-400">
                    {search.trim()
                      ? `${filteredEmployees.length} de ${employees.length} registros exibidos`
                      : "Pesquise por nome, email ou cargo"}
                  </p>
                </div>
              </div>

              <div className="flex w-full gap-2 md:max-w-md">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  type="search"
                  placeholder="Buscar funcionario..."
                  className="
                    h-11 min-w-0 flex-1 rounded-2xl border border-white/10
                    bg-white/5 px-4 text-sm text-white outline-none
                    transition-colors placeholder:text-slate-500
                    focus:border-cyan-400/40 focus:bg-white/8
                  "
                />

                {search.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Limpar busca"
                    className="
                      flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl
                      border border-white/10 text-slate-300 transition-colors
                      hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-100
                    "
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </section>

          <section
            className="
              mt-8 overflow-hidden rounded-[30px] border border-white/10
              bg-slate-950/32 shadow-[0_22px_55px_rgba(2,8,23,0.2)]
            "
          >
            <div className="grid grid-cols-[1.4fr_1fr_0.7fr_0.8fr_110px] gap-4 border-b border-white/10 px-5 py-4 text-xs uppercase tracking-[0.18em] text-slate-400">
              <span>Funcionario</span>
              <span>Email</span>
              <span>Cargo</span>
              <span>Cadastro</span>
              <span className="text-right">Acoes</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 px-5 py-14 text-sm text-slate-300">
                <Loader />
                Carregando funcionarios...
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="px-5 py-14 text-center text-sm text-slate-400">
                Nenhum funcionario encontrado.
              </div>
            ) : (
              <div className="divide-y divide-white/8">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="
                      grid gap-4 px-5 py-4 text-sm text-slate-300
                      transition-colors hover:bg-white/[0.03]
                      md:grid-cols-[1.4fr_1fr_0.7fr_0.8fr_110px] md:items-center
                    "
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {employee.name}
                      </p>
                      {employee.id === user?.id && (
                        <p className="mt-1 text-xs text-cyan-200">Sua conta</p>
                      )}
                    </div>
                    <p className="min-w-0 truncate">{employee.email}</p>
                    <span className="w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase text-cyan-100">
                      {employee.role}
                    </span>
                    <span>{formatDate(employee.createdAt)}</span>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(employee)}
                        aria-label={`Alterar ${employee.name}`}
                        title="Alterar funcionario"
                        className="
                          flex h-10 w-10 items-center justify-center rounded-2xl
                          border border-white/10 text-slate-300 transition-colors
                          hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-100
                        "
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(employee)}
                        disabled={deletingId === employee.id}
                        aria-label={`Excluir ${employee.name}`}
                        title="Excluir funcionario"
                        className="
                          flex h-10 w-10 items-center justify-center rounded-2xl
                          border border-white/10 text-slate-300 transition-colors
                          hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200
                          disabled:cursor-not-allowed disabled:opacity-60
                        "
                      >
                        {deletingId === employee.id ? (
                          <Loader />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </motion.main>
      </div>

      {selectedEmployee && (
        <div
          className="
            fixed inset-0 z-[60] flex items-center justify-center
            bg-slate-950/78 px-4 py-8 backdrop-blur-sm
          "
        >
          <div
            className="
              w-full max-w-2xl rounded-[30px] border border-white/10
              bg-[linear-gradient(180deg,rgba(10,24,40,0.98),rgba(6,16,28,0.98))]
              p-6 shadow-[0_30px_90px_rgba(2,8,23,0.62)]
              sm:p-7
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-cyan-300">
                  <UserCog className="h-5 w-5" />
                  <span className="text-sm font-medium">Alterar registro</span>
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {selectedEmployee.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Fechar modal"
                className="
                  flex h-10 w-10 items-center justify-center rounded-2xl
                  border border-white/10 text-slate-300 transition-colors
                  hover:border-white/20 hover:bg-white/5 hover:text-white
                "
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
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
                    className="
                      w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                      text-white outline-none transition-colors placeholder:text-slate-500
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
                    className="
                      w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                      text-white outline-none transition-colors placeholder:text-slate-500
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
                    <option value="admin" className="bg-slate-900">
                      Admin
                    </option>
                    <option value="ceo" className="bg-slate-900">
                      CEO
                    </option>
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Nova senha
                  </label>
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type="password"
                    placeholder="Deixe em branco para manter a senha atual"
                    className="
                      w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                      text-white outline-none transition-colors placeholder:text-slate-500
                      focus:border-cyan-400/40 focus:bg-white/8
                    "
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="
                    rounded-2xl border border-white/10 px-5 py-3 text-sm
                    font-semibold text-slate-300 transition-colors
                    hover:bg-white/5 hover:text-white
                  "
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    inline-flex items-center justify-center gap-2 rounded-2xl
                    bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400
                    px-5 py-3 text-sm font-semibold text-slate-950
                    shadow-[0_16px_36px_rgba(56,189,248,0.26)]
                    transition-transform duration-200 hover:scale-[1.01]
                    disabled:cursor-not-allowed disabled:opacity-70
                  "
                >
                  {saving ? <Loader /> : "Salvar alteracoes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
