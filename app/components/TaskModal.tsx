"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  ImageIcon,
  Loader2,
  Pencil,
  PlayCircle,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import type { Status, Task } from "../src/types/TaskCardType";

type Props = {
  task: Task;
  canManage?: boolean;
  loading?: boolean;
  onDelete?: (task: Task) => Promise<void>;
  currentUserName?: string;
  currentUserRole?: string;
  onQuickUpdate?: (task: Task, updateMessage?: string) => Promise<void>;
  onClose: () => void;
};

export default function TaskModal({
  task,
  canManage = false,
  loading = false,
  currentUserName,
  currentUserRole,
  onDelete,
  onQuickUpdate,
  onClose,
}: Props) {
  const [assignee, setAssignee] = useState(task.assignee ?? "");
  const [status, setStatus] = useState<Status>(task.status);
  const [updateMessage, setUpdateMessage] = useState("");

  async function handleQuickUpdate(nextStatus?: Status, forcePublishNote = false) {
    const trimmedUpdate = updateMessage.trim();
    const updatedTask: Task = {
      ...task,
      assignee: assignee.trim(),
      status: nextStatus ?? status,
    };

    setStatus(updatedTask.status);

    await onQuickUpdate?.(
      {
        ...updatedTask,
      },
      forcePublishNote || trimmedUpdate ? trimmedUpdate : undefined
    );

    if (trimmedUpdate) {
      setUpdateMessage("");
    }
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-slate-950/82 backdrop-blur-md
      "
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 12 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="
          relative mx-4 flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col
          overflow-hidden rounded-[32px]
          border border-white/10
          bg-[linear-gradient(180deg,rgba(10,24,40,0.98),rgba(6,16,28,0.98))]
          p-6
          shadow-[0_30px_90px_rgba(2,8,23,0.58)]
        "
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="
            absolute right-4 top-4 rounded-2xl border border-white/10 p-2
            text-slate-400 transition-colors
            hover:bg-white/5 hover:text-white
          "
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 shrink-0 space-y-4">
          <div className="space-y-2 pr-12">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
              Detalhes da tarefa
            </p>
            <h2 className="text-2xl font-semibold text-white">{task.title}</h2>
            {task.client && (
              <p className="text-sm text-slate-400">
                Cliente <span className="text-slate-200">{task.client}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            {task.date && (
              <span
                className="
                  inline-flex items-center gap-2 rounded-full
                  border border-white/10 bg-white/5 px-3 py-1.5
                "
              >
                <CalendarDays className="h-4 w-4 text-cyan-300" />
                {new Date(task.date).toLocaleDateString("pt-BR")}
              </span>
            )}

            <span
              className="
                inline-flex items-center gap-2 rounded-full
                border border-white/10 bg-white/5 px-3 py-1.5
              "
            >
              <UserRound className="h-4 w-4 text-emerald-300" />
              {task.assignee || "Nao atribuido"}
            </span>

            {task.createdByRole === "client" && (
              <span
                className="
                  inline-flex items-center gap-2 rounded-full
                  border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5
                  text-cyan-100
                "
              >
                <Building2 className="h-4 w-4" />
                {task.requesterName
                  ? `Solicitado por ${task.requesterName}`
                  : "Demanda do cliente"}
              </span>
            )}

            <span
              className="
                rounded-full border border-white/10 bg-white/5 px-3 py-1.5
              "
            >
              Prioridade {task.priority}
            </span>
          </div>
        </div>

        <div
          className="
            min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-[24px]
            border border-white/8 bg-white/[0.03] p-5 pr-4
          "
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-slate-950/25 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Origem
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {task.createdByRole === "client"
                  ? "Solicitacao aberta pelo cliente"
                  : "Tarefa interna da equipe"}
              </p>
              {task.requesterName && (
                <p className="mt-2 text-sm text-slate-400">
                  Solicitante:{" "}
                  <span className="text-slate-200">{task.requesterName}</span>
                </p>
              )}
            </div>

            <div className="rounded-[22px] border border-white/10 bg-slate-950/25 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Operacao
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Status atual <span className="font-medium text-slate-200">{status}</span>
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Responsavel{" "}
                <span className="font-medium text-slate-200">
                  {assignee || "Nao atribuido"}
                </span>
              </p>
            </div>
          </div>

          <p
            className="
              mt-5 whitespace-pre-wrap break-words text-sm
              leading-7 text-slate-300
            "
          >
            {task.description || "Sem descricao"}
          </p>

          {task.referenceImageUrl && (
            <div className="mt-5 overflow-hidden rounded-[24px] border border-cyan-400/15 bg-slate-950/35">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2 text-cyan-100">
                  <ImageIcon className="h-4 w-4" />
                  <p className="text-sm font-medium">Referencia visual</p>
                </div>
                <a
                  href={task.referenceImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    inline-flex items-center gap-2 rounded-2xl border
                    border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs
                    font-medium text-cyan-100 transition-colors
                    hover:bg-cyan-400/15
                  "
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir
                </a>
              </div>
              <div className="flex justify-center bg-slate-950/50 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={task.referenceImageUrl}
                  alt={`Referencia visual da tarefa ${task.title}`}
                  className="
                    max-h-[360px] w-auto max-w-full rounded-[18px]
                    object-contain
                  "
                />
              </div>
            </div>
          )}

          <div className="mt-5 rounded-[24px] border border-white/10 bg-slate-950/25 p-4">
            <div className="flex items-center gap-2 text-cyan-100">
              <FileText className="h-4 w-4" />
              <p className="text-sm font-medium">Atualizacoes da tarefa</p>
            </div>

            {task.updates?.length ? (
              <div className="mt-4 space-y-3">
                {task.updates.map((update) => (
                  <div
                    key={update.id}
                    className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-white">
                        {update.authorName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(update.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-200/70">
                      {update.authorRole}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                      {update.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Ainda nao existem atualizacoes publicadas para esta tarefa.
              </p>
            )}
          </div>
        </div>

        {canManage && (
          <div
            className="
              mt-6 shrink-0 space-y-4 border-t border-white/10 pt-5
            "
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Designar funcionario
                </label>
                <input
                  value={assignee}
                  onChange={(event) => setAssignee(event.target.value)}
                  placeholder="Nome do responsavel"
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
                  value={status}
                  onChange={(event) => setStatus(event.target.value as Status)}
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Atualizacao para o cliente
              </label>
              <textarea
                value={updateMessage}
                onChange={(event) => setUpdateMessage(event.target.value)}
                rows={4}
                placeholder="Descreva de forma simples o que foi feito, o que mudou ou o proximo passo."
                className="
                  w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-3
                  text-white placeholder:text-slate-500
                  outline-none transition-colors resize-none
                  focus:border-cyan-400/40 focus:bg-white/8
                "
              />
              <p className="text-xs text-slate-500">
                Essa nota fica visivel para o cliente no historico da demanda.
                {currentUserName && (
                  <> Publicando como {currentUserName}{currentUserRole ? ` • ${currentUserRole}` : ""}.</>
                )}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => handleQuickUpdate()}
                disabled={loading}
                className="
                  inline-flex items-center justify-center gap-2 rounded-2xl
                  border border-cyan-400/20 bg-cyan-400/10 px-4 py-3
                  text-sm font-medium text-cyan-100
                  transition-colors hover:bg-cyan-400/15
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
                Salvar operacao
              </button>

              <button
                onClick={() => handleQuickUpdate("doing")}
                disabled={loading}
                className="
                  inline-flex items-center justify-center gap-2 rounded-2xl
                  border border-sky-400/20 bg-sky-400/10 px-4 py-3
                  text-sm font-medium text-sky-100
                  transition-colors hover:bg-sky-400/15
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              >
                <PlayCircle className="h-4 w-4" />
                Em andamento
              </button>

              <button
                onClick={() => handleQuickUpdate("done")}
                disabled={loading}
                className="
                  inline-flex items-center justify-center gap-2 rounded-2xl
                  border border-emerald-400/20 bg-emerald-400/10 px-4 py-3
                  text-sm font-medium text-emerald-100
                  transition-colors hover:bg-emerald-400/15
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              >
                <CheckCircle2 className="h-4 w-4" />
                Concluir
              </button>

              <button
                onClick={() => handleQuickUpdate(undefined, true)}
                disabled={loading || !updateMessage.trim()}
                className="
                  inline-flex items-center justify-center gap-2 rounded-2xl
                  border border-violet-400/20 bg-violet-400/10 px-4 py-3
                  text-sm font-medium text-violet-100
                  transition-colors hover:bg-violet-400/15
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              >
                <FileText className="h-4 w-4" />
                Publicar update
              </button>

              <button
                onClick={() => onDelete?.(task)}
                disabled={loading}
                className="
                  inline-flex items-center justify-center gap-2 rounded-2xl
                  border border-rose-400/20 bg-rose-500/10 px-4 py-3
                  text-sm font-medium text-rose-200
                  transition-colors hover:bg-rose-500/15
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
