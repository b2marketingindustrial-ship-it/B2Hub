"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  CircleCheckBig,
  Clock3,
  Flame,
  Plus,
  Search,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import NavBar from "../components/Navbar";
import NewTaskModal from "../components/NewTaskModal";
import TaskCard from "../components/TaskCard";
import type { Task, TaskPayload } from "../src/types/TaskCardType";
import {
  createTask,
  default as getTasks,
} from "../utils/GetTasks";
import { canManageEmployees, isClientRole } from "../src/lib/roles";
import useUser from "../utils/useUser";

type Column = {
  title: string;
  description: string;
  tasks: Task[];
  accent: string;
  emptyLabel: string;
};

export default function Dashboard() {
  const user = useUser();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingTask, setSavingTask] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedColumnTitle, setSelectedColumnTitle] = useState("A fazer");

  const loadTasks = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setLoading(true);
    }

    const data = await getTasks();
    setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role === "guest") {
      router.replace("/");
      return;
    }

    if (isClientRole(user?.role)) {
      router.replace("/client-area");
      return;
    }

    void loadTasks({ showLoading: true });
  }, [loadTasks, user, router]);

  useEffect(() => {
    if (!user || user.role === "guest" || isClientRole(user.role)) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadTasks();
    }, 10_000);

    function handleFocus() {
      void loadTasks();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadTasks, user]);

  function isLate(task: Task): boolean {
    if (!task.date || task.status === "done") {
      return false;
    }

    const today = new Date();
    const taskDate = new Date(task.date);

    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);

    return taskDate < today;
  }

  const normalizedClientSearch = clientSearch.trim().toLowerCase();
  const filteredTasks = normalizedClientSearch
    ? tasks.filter((task) =>
        (task.client ?? "").toLowerCase().includes(normalizedClientSearch)
      )
    : tasks;

  const lateTasks = filteredTasks.filter((task) => isLate(task));
  const tasksTodo = filteredTasks.filter(
    (task) => task.status === "todo" && !isLate(task)
  );
  const tasksDoing = filteredTasks.filter(
    (task) => task.status === "doing" && !isLate(task)
  );
  const tasksDone = filteredTasks.filter((task) => task.status === "done");

  const stats = [
    {
      label: "Total",
      value: filteredTasks.length,
      icon: BarChart3,
      accent: "from-sky-400/25 to-cyan-400/10 text-cyan-200",
    },
    {
      label: "Em andamento",
      value: tasksDoing.length,
      icon: Clock3,
      accent: "from-blue-400/25 to-sky-400/10 text-sky-200",
    },
    {
      label: "Concluidas",
      value: tasksDone.length,
      icon: CircleCheckBig,
      accent: "from-emerald-400/25 to-lime-400/10 text-emerald-200",
    },
    {
      label: "Atrasadas",
      value: lateTasks.length,
      icon: Flame,
      accent: "from-rose-400/25 to-orange-400/10 text-rose-200",
    },
    {
      label: "Demandas cliente",
      value: filteredTasks.filter((task) => task.createdByRole === "client")
        .length,
      icon: Building2,
      accent: "from-cyan-400/25 to-teal-400/10 text-cyan-100",
    },
  ];

  const columns: Column[] = [
    {
      title: "Atrasadas",
      description: "Itens que ja ultrapassaram a data prevista.",
      tasks: lateTasks,
      accent: "border-rose-400/22 bg-rose-500/[0.07]",
      emptyLabel: "Nenhuma tarefa atrasada por aqui.",
    },
    {
      title: "A fazer",
      description: "Backlog pronto para entrar em execucao.",
      tasks: tasksTodo,
      accent: "border-amber-400/16 bg-amber-400/[0.05]",
      emptyLabel: "Tudo o que estava pendente ja andou.",
    },
    {
      title: "Em andamento",
      description: "Demandas ativas no fluxo atual.",
      tasks: tasksDoing,
      accent: "border-sky-400/16 bg-sky-400/[0.05]",
      emptyLabel: "Nenhuma tarefa em andamento agora.",
    },
    {
      title: "Concluido",
      description: "Entregas finalizadas pelo time.",
      tasks: tasksDone,
      accent: "border-emerald-400/16 bg-emerald-400/[0.05]",
      emptyLabel: "As conclusoes vao aparecer aqui.",
    },
  ];

  function openCreateModal() {
    setEditingTask(null);
    setTaskModalOpen(true);
  }

  function closeTaskFormModal() {
    setEditingTask(null);
    setTaskModalOpen(false);
  }

  function openDescriptionModal(task: Task) {
    router.push(`/dashboard/tasks/${task.id}`);
  }

  async function handleSaveTask(taskData: TaskPayload | Task) {
    setSavingTask(true);

    try {
      if (!("id" in taskData)) {
        const createdTask = await createTask(taskData);
        setTasks((prev) => [createdTask, ...prev]);
        toast.success("Tarefa criada com sucesso");
      }

      closeTaskFormModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel salvar a tarefa";
      toast.error(message);
    } finally {
      setSavingTask(false);
    }
  }

  const selectedColumn =
    columns.find((column) => column.title === selectedColumnTitle) ?? columns[0];

  return (
    <>
      <div className="min-h-screen">
        <NavBar user={user} />

        <motion.main
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="
            mx-auto max-w-7xl px-4 pb-14 pt-28
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
            <div
              className="
                flex flex-col gap-6
                lg:flex-row lg:items-end lg:justify-between
              "
            >
              <div className="max-w-2xl space-y-4">
                <div
                  className="
                    inline-flex items-center gap-2 rounded-full
                    border border-cyan-400/20 bg-cyan-400/10
                    px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-200
                  "
                >
                  <BarChart3 className="h-4 w-4" />
                  Operacao do time
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Quadro de chamados aqui você verifica todos os chamados dos clientes B2, 
                    ritmo e prioridades.
                  </h1>
                  <p className="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                    Visual mais limpo, leitura mais rapida e uma rotina de tasks
                    completa para o time trabalhar com menos atrito. Demandas
                    abertas pelos clientes tambem chegam aqui para o time interno.
                  </p>
                </div>
              </div>

              {canManageEmployees(user?.role) && (
                <button
                  onClick={openCreateModal}
                  className="
                    inline-flex items-center justify-center gap-2 rounded-2xl
                    bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400
                    px-5 py-3 text-sm font-semibold text-slate-950
                    shadow-[0_16px_36px_rgba(56,189,248,0.26)]
                    transition-transform duration-200 hover:scale-[1.01]
                  "
                >
                  <Plus className="h-4 w-4" />
                  Nova tarefa
                </button>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {stats.map(({ label, value, icon: Icon, accent }) => (
                <div
                  key={label}
                  className={`
                    rounded-[28px] border border-white/10 bg-gradient-to-br p-5
                    ${accent}
                  `}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-300">{label}</p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        {value}
                      </p>
                    </div>
                    <div
                      className="
                        rounded-2xl border border-white/10 bg-slate-950/40 p-3
                      "
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            className="
              mt-8 rounded-[32px] border border-cyan-400/15
              bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(15,23,42,0.35))]
              p-6 shadow-[0_18px_50px_rgba(8,145,178,0.12)]
            "
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100">
                  <Building2 className="h-4 w-4" />
                  Cliente em sincronia
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  O dashboard acompanha automaticamente o que o cliente abriu no portal.
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-slate-300">
                  Cada demanda do cliente chega para o time com empresa, solicitante,
                  contexto, anexo e pronta para designacao operacional.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-slate-950/30 px-5 py-4">
                <p className="text-sm text-slate-400">Solicitacoes do cliente</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {
                    filteredTasks.filter(
                      (task) => task.createdByRole === "client"
                    ).length
                  }
                </p>
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
                    Filtrar por cliente
                  </p>
                  <p className="text-xs text-slate-400">
                    {normalizedClientSearch
                      ? `${filteredTasks.length} de ${tasks.length} tarefas exibidas`
                      : "Pesquise pelo nome da empresa ou cliente"}
                  </p>
                </div>
              </div>

              <div className="flex w-full gap-2 md:max-w-md">
                <input
                  value={clientSearch}
                  onChange={(event) => setClientSearch(event.target.value)}
                  type="search"
                  placeholder="Buscar cliente..."
                  className="
                    h-11 min-w-0 flex-1 rounded-2xl border border-white/10
                    bg-white/5 px-4 text-sm text-white
                    outline-none transition-colors placeholder:text-slate-500
                    focus:border-cyan-400/40 focus:bg-white/8
                  "
                />

                {normalizedClientSearch && (
                  <button
                    type="button"
                    onClick={() => setClientSearch("")}
                    aria-label="Limpar filtro"
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

          <section className="mt-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              {columns.map((column) => {
                const selected = column.title === selectedColumn.title;

                return (
                  <button
                    key={column.title}
                    type="button"
                    onClick={() => setSelectedColumnTitle(column.title)}
                    className={`
                      rounded-[28px] border p-5 text-left
                      shadow-[0_18px_42px_rgba(2,8,23,0.18)]
                      transition-colors
                      ${column.accent}
                      ${
                        selected
                          ? "ring-2 ring-cyan-300/45"
                          : "hover:border-cyan-400/30"
                      }
                    `}
                  >
                    <p className="text-sm text-slate-300">{column.title}</p>
                    <p className="mt-2 text-4xl font-semibold text-white">
                      {column.tasks.length}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {column.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div
              className={`
                rounded-[30px] border p-5 shadow-[0_22px_55px_rgba(2,8,23,0.2)]
                ${selectedColumn.accent}
              `}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {selectedColumn.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {selectedColumn.description}
                  </p>
                </div>

                <span
                  className="
                    rounded-full border border-white/10 bg-slate-950/40 px-3 py-1
                    text-sm text-slate-200
                  "
                >
                  {selectedColumn.tasks.length}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                  <div
                    className="
                      rounded-[24px] border border-dashed border-white/10
                      bg-slate-950/20 px-4 py-10 text-center text-sm text-slate-400
                    "
                  >
                    Carregando tarefas...
                  </div>
                ) : selectedColumn.tasks.length === 0 ? (
                  <div
                    className="
                      rounded-[24px] border border-dashed border-white/10
                      bg-slate-950/20 px-4 py-10 text-center text-sm text-slate-400
                    "
                  >
                    {selectedColumn.emptyLabel}
                  </div>
                ) : (
                  selectedColumn.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      {...task}
                      onOpen={() => openDescriptionModal(task)}
                    />
                  ))
                )}
              </div>
            </div>
          </section>
        </motion.main>
      </div>

      {taskModalOpen && (
        <NewTaskModal
          initialData={editingTask}
          loading={savingTask}
          onClose={closeTaskFormModal}
          onSubmit={handleSaveTask}
        />
      )}

    </>
  );
}
