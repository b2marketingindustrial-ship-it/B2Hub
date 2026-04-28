"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import type { Priority, Status, Task, TaskPayload } from "../src/types/TaskCardType";

type TaskFormData = {
  title: string;
  client: string;
  status: Status;
  priority: Priority;
  date: string;
  description: string;
  assignee: string;
};

type Props = {
  initialData?: Task | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (task: TaskPayload | Task) => Promise<void>;
};

const emptyForm: TaskFormData = {
  title: "",
  client: "",
  status: "todo",
  priority: "Baixa",
  date: "",
  description: "",
  assignee: "",
};

function formatDateForDisplay(date?: string) {
  if (!date) {
    return "";
  }

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${day}/${month}/${year}`;
}

function parseDisplayDateToIso(date: string) {
  if (!date.trim()) {
    return "";
  }

  const digits = date.replace(/\D/g, "").slice(0, 8);

  if (digits.length !== 8) {
    return null;
  }

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));

  const parsedDate = new Date(year, month - 1, day);

  const isValidDate =
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day;

  if (!isValidDate) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function maskDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function getFormData(task?: Task | null): TaskFormData {
  if (!task) {
    return emptyForm;
  }


  return {
    title: task.title,
    client: task.client ?? "",
    status: task.status,
    priority: task.priority,
    date: formatDateForDisplay(task.date),
    description: task.description ?? "",
    assignee: task.assignee ?? "",
  };
}

export default function NewTaskModal({
  initialData = null,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState<TaskFormData>(() =>
    getFormData(initialData)
  );

  function updateField<K extends keyof TaskFormData>(
    field: K,
    value: TaskFormData[K]
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedDate = parseDisplayDateToIso(formData.date);
    const today = new Date();

    if (parsedDate) {
      const parsedDateObj = new Date(parsedDate);

      if (parsedDateObj < today) {
        toast.error("A data de entrega nao pode ser no passado.");
        return;
      }
    }

    if (parsedDate === null) {
      toast.error("Digite uma data valida no formato dd/mm/aaaa.");
      return;
    }

    const payload = {
      ...formData,
      date: parsedDate,
    };

    if (initialData) {
      await onSubmit({
        ...initialData,
        ...payload,
      });
      return;
    }

    await onSubmit(payload);
  }

  const isEditing = Boolean(initialData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-950/82 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        className="
          relative z-10 w-full max-w-2xl overflow-hidden rounded-[32px]
          border border-white/10
          bg-[linear-gradient(180deg,rgba(10,24,40,0.98),rgba(6,16,28,0.98))]
          shadow-[0_30px_90px_rgba(2,8,23,0.58)]
        "
      >
        <div
          className="
            flex items-start justify-between gap-4
            border-b border-white/10 px-6 py-5
          "
        >
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
              Task flow
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {isEditing ? "Editar tarefa" : "Nova tarefa"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {isEditing
                ? "Atualize as informacoes da tarefa selecionada."
                : "Adicione uma nova entrega ao quadro do time."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              rounded-2xl border border-white/10 p-2 text-slate-400
              transition-colors hover:bg-white/5 hover:text-white
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-200">
                Titulo
              </label>
              <input
                value={formData.title}
                onChange={(event) => updateField("title", event.target.value)}
                type="text"
                placeholder="Ex: Refinar tela de onboarding"
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
                Cliente
              </label>
              <input
                value={formData.client}
                onChange={(event) => updateField("client", event.target.value)}
                type="text"
                placeholder="Ex: Studio Nexo"
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
                Responsavel
              </label>
              <input
                value={formData.assignee}
                onChange={(event) => updateField("assignee", event.target.value)}
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
                Status
              </label>
              <select
                value={formData.status}
                onChange={(event) =>
                  updateField("status", event.target.value as Status)
                }
                className="
                  w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                  text-white outline-none transition-colors
                  focus:border-cyan-400/40 focus:bg-white/8
                "
              >
                <option value="todo" className="bg-slate-900">
                  A fazer
                </option>
                <option value="doing" className="bg-slate-900">
                  Em andamento
                </option>
                <option value="done" className="bg-slate-900">
                  Concluido
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(event) =>
                  updateField("priority", event.target.value as Priority)
                }
                className="
                  w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                  text-white outline-none transition-colors
                  focus:border-cyan-400/40 focus:bg-white/8
                "
              >
                <option value="Baixa" className="bg-slate-900">
                  Baixa
                </option>
                <option value="Média" className="bg-slate-900">
                  Media
                </option>
                <option value="Alta" className="bg-slate-900">
                  Alta
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Entrega
              </label>
              <input
                aria-label="Data de entrega"
                value={formData.date}
                onChange={(event) =>
                  updateField("date", maskDateInput(event.target.value))
                }
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="dd/mm/aaaa"
                className="
                  w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3
                  text-white outline-none transition-colors
                  focus:border-cyan-400/40 focus:bg-white/8
                "
              />
              <p className="text-xs text-slate-500">
                Preencha no formato `dd/mm/aaaa`.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Descricao
            </label>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Contexto, objetivo, entregaveis e observacoes da tarefa."
              className="
                w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-3
                text-white placeholder:text-slate-500
                outline-none transition-colors resize-none
                focus:border-cyan-400/40 focus:bg-white/8
              "
            />
          </div>

          <div
            className="
              flex flex-col-reverse gap-3 border-t border-white/10 pt-5
              sm:flex-row sm:justify-end
            "
          >
            <button
              type="button"
              onClick={onClose}
              className="
                rounded-2xl border border-white/10 px-5 py-3
                text-sm font-medium text-slate-300
                transition-colors hover:bg-white/5 hover:text-white
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                inline-flex items-center justify-center gap-2 rounded-2xl
                bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400
                px-5 py-3 text-sm font-semibold text-slate-950
                shadow-[0_14px_32px_rgba(56,189,248,0.24)]
                transition-transform duration-200
                hover:scale-[1.01]
                disabled:cursor-not-allowed disabled:opacity-70
              "
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar alteracoes" : "Criar tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
