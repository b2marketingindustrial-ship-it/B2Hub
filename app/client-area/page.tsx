"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Building2, FileImage, FilePlus2, Layers3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import NavBar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import type { Task, TaskPayload } from "../src/types/TaskCardType";
import useUser from "../utils/useUser";
import getTasks, { createTask } from "../utils/GetTasks";

type ClientDemandForm = {
  title: string;
  description: string;
  priority: "Alta" | "Média" | "Baixa";
  date: string;
  requesterName: string;
  referenceImageUrl: string;
};

const emptyForm: ClientDemandForm = {
  title: "",
  description: "",
  priority: "Média",
  date: "",
  requesterName: "",
  referenceImageUrl: "",
};

export default function ClientAreaPage() {
  const user = useUser();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<ClientDemandForm>(emptyForm);

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }

    if (user.role === "guest") {
      router.replace("/");
      return;
    }

    if (user.role !== "client") {
      router.replace("/Dashboard");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      requesterName: prev.requesterName || user.name,
    }));

    void loadClientTasks(user.id);
  }, [router, user]);

  useEffect(() => {
    if (!user || user.role !== "client") {
      return;
    }

    const clientUserId = user.id;

    const intervalId = window.setInterval(() => {
      void loadClientTasks(clientUserId);
    }, 10_000);

    function handleFocus() {
      void loadClientTasks(clientUserId);
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user]);

  async function loadClientTasks(clientUserId: string) {
    setLoading(true);
    const data = await getTasks({
      viewerRole: "client",
      clientUserId,
    });
    setTasks(data);
    setLoading(false);
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      toast.error("Usuario nao encontrado.");
      return;
    }

    if (!formData.title || !formData.description || !formData.requesterName) {
      toast.error("Preencha titulo, descricao e solicitante para abrir a demanda.");
      return;
    }

    setSubmitting(true);

    try {
      const payload: TaskPayload = {
        title: formData.title,
        description: formData.description,
        client: user.companyName || user.name,
        status: "todo",
        date: formData.date,
        priority: formData.priority,
        assignee: "",
        createdByRole: "client",
        clientUserId: user.id,
        requesterName: formData.requesterName,
        referenceImageUrl: formData.referenceImageUrl,
      };

      const newTask = await createTask(payload, {
        viewerRole: "client",
        clientUserId: user.id,
      });

      setTasks((prev) => [newTask, ...prev]);
      setFormData({
        ...emptyForm,
        requesterName: user.name,
      });
      toast.success("Demanda criada e enviada para o time.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel criar a demanda.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const openTasks = tasks.filter((task) => task.status !== "done");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <>
      <NavBar user={user} />

      <main
        className="
          mx-auto min-h-screen max-w-7xl px-4 pb-14 pt-28
          sm:px-6 lg:px-8
        "
      >
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div
            className="
              rounded-[36px] border border-white/10
              bg-[linear-gradient(135deg,rgba(9,24,41,0.95),rgba(7,15,26,0.88))]
              px-6 py-8 shadow-[0_28px_80px_rgba(2,8,23,0.42)]
              sm:px-8
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
              Area do cliente
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
              Abra tickets referente a sua conta em um fluxo direto com o time da{" "}
              <span className="text-cyan-400">B2</span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300">
              As solicitações feitas aqui entram no dashboard interno da equipe e
              ficam visíveis apenas para os funcionários que executam as demandas garantindo maior agilidade 
              e modernidade para o atendimento.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
                <p className="text-sm text-slate-400">Empresa</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {user?.companyName || "Cliente"}
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
                <p className="text-sm text-slate-400">Demandas abertas</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {openTasks.length}
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
                <p className="text-sm text-slate-400">Demandas concluidas</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {doneTasks.length}
                </p>
              </div>
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
            <div className="flex items-center gap-2 text-cyan-300">
              <FilePlus2 className="h-5 w-5" />
              <span className="text-sm font-medium">Novo ticket</span>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Titulo da demanda
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  type="text"
                  placeholder="Ex: Criar landing para nova campanha"
                  className="
                    w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                    text-white placeholder:text-slate-500
                    outline-none transition-colors
                    focus:border-cyan-400/40 focus:bg-white/8
                  "
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Solicitante
                  </label>
                  <input
                    name="requesterName"
                    value={formData.requesterName}
                    onChange={handleChange}
                    type="text"
                    placeholder="Quem esta pedindo"
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
                    Prioridade
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="
                      w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                      text-white outline-none transition-colors
                      focus:border-cyan-400/40 focus:bg-white/8
                    "
                  >
                    <option value="Baixa" className="bg-slate-900">Baixa</option>
                    <option value="Média" className="bg-slate-900">Media</option>
                    <option value="Alta" className="bg-slate-900">Alta</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Prazo desejado
                </label>
                <input
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  type="date"
                  className="
                    w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                    text-white outline-none transition-colors
                    focus:border-cyan-400/40 focus:bg-white/8
                  "
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Descricao da demanda
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Contexto, objetivo, escopo e observacoes."
                  className="
                    w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-3
                    text-white placeholder:text-slate-500
                    outline-none transition-colors resize-none
                    focus:border-cyan-400/40 focus:bg-white/8
                  "
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  URL da imagem de referencia
                </label>
                <div className="relative">
                  <FileImage className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    name="referenceImageUrl"
                    value={formData.referenceImageUrl}
                    onChange={handleChange}
                    type="url"
                    placeholder="https://..."
                    className="
                      w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4
                      text-white placeholder:text-slate-500
                      outline-none transition-colors
                      focus:border-cyan-400/40 focus:bg-white/8
                    "
                  />
                </div>
              </div>

              {formData.referenceImageUrl && (
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm text-slate-400">Preview da referencia</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.referenceImageUrl}
                    alt="Referencia visual"
                    className="mt-3 h-44 w-full rounded-2xl object-cover"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="
                  inline-flex w-full items-center justify-center gap-2 rounded-2xl
                  bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400
                  px-5 py-3 text-sm font-semibold text-slate-950
                  shadow-[0_16px_36px_rgba(56,189,248,0.26)]
                  transition-transform duration-200 hover:scale-[1.01]
                  disabled:cursor-not-allowed disabled:opacity-70
                "
              >
                {submitting ? "Enviando demanda..." : "Criar demanda"}
              </button>
            </form>
          </div>
        </section>

        <section className="mt-8 rounded-[36px] border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">
                Minhas demandas
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Acompanhamento do cliente
              </h2>
            </div>

            <Link
              href="/"
              className="
                inline-flex items-center gap-2 rounded-2xl border border-white/10
                px-4 py-2 text-sm text-slate-300 transition-colors
                hover:bg-white/5 hover:text-white
              "
            >
              <Layers3 className="h-4 w-4" />
              Trocar conta
            </Link>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            {loading ? (
              <div
                className="
                  rounded-[24px] border border-dashed border-white/10
                  bg-slate-950/20 px-4 py-10 text-center text-sm text-slate-400
                "
              >
                Carregando suas demandas...
              </div>
            ) : tasks.length === 0 ? (
              <div
                className="
                  rounded-[24px] border border-dashed border-white/10
                  bg-slate-950/20 px-4 py-10 text-center text-sm text-slate-400
                "
              >
                Nenhuma demanda criada ainda.
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  {...task}
                  onOpen={() => setSelectedTask(task)}
                />
              ))
            )}
          </div>
        </section>
      </main>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          currentUserName={user?.name}
          currentUserRole={user?.role}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}
