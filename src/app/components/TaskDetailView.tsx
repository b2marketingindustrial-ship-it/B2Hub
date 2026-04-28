"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Paperclip,
  Pencil,
  PlayCircle,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import type { Status, Task } from "../src/types/TaskCardType";
import { fileToDataUrl, MAX_ATTACHMENT_SIZE } from "../utils/attachments";

type Props = {
  task: Task;
  backHref: string;
  backLabel: string;
  canManage?: boolean;
  canSeeInternalHistory?: boolean;
  loading?: boolean;
  currentUserName?: string;
  currentUserRole?: string;
  onDelete?: (task: Task) => Promise<void>;
  onQuickUpdate?: (
    task: Task,
    updateMessage?: string,
    updateAttachment?: string
  ) => Promise<void>;
};

function isImageAttachment(attachment?: string) {
  return Boolean(attachment?.startsWith("data:image/"));
}

const statusLabels: Record<Status, string> = {
  todo: "A fazer",
  doing: "Em andamento",
  done: "Concluida",
};

export default function TaskDetailView({
  task,
  backHref,
  backLabel,
  canManage = false,
  canSeeInternalHistory = false,
  loading = false,
  currentUserName,
  currentUserRole,
  onDelete,
  onQuickUpdate,
}: Props) {
  const [assignee, setAssignee] = useState(task.assignee ?? "");
  const [status, setStatus] = useState<Status>(task.status);
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateAttachment, setUpdateAttachment] = useState("");
  const visibleAssignee = canManage
    ? assignee || "Nao atribuido"
    : assignee
      ? "Tarefa atribuida"
      : "Aguardando atribuicao";

  async function handleQuickUpdate(nextStatus?: Status, forcePublishNote = false) {
    const trimmedUpdate = updateMessage.trim();
    const completionMessage =
      nextStatus === "done"
        ? trimmedUpdate
          ? `Tarefa marcada como concluida.\n\n${trimmedUpdate}`
          : "Tarefa marcada como concluida."
        : trimmedUpdate;
    const assigneeChanged = assignee.trim() !== (task.assignee ?? "").trim();
    const statusChanged = (nextStatus ?? status) !== task.status;
    const assigneeMessage = assigneeChanged
      ? `Troca de funcionario: ${task.assignee || "Nao atribuido"} -> ${
          assignee.trim() || "Nao atribuido"
        }`
      : "";
    const statusMessage =
      statusChanged && nextStatus !== "done"
        ? `Status alterado: ${statusLabels[task.status]} -> ${
            statusLabels[nextStatus ?? status]
          }`
        : "";
    const finalUpdateMessage = [
      assigneeMessage,
      statusMessage,
      completionMessage,
    ]
      .filter(Boolean)
      .join("\n\n");
    const updatedTask: Task = {
      ...task,
      assignee: assignee.trim(),
      status: nextStatus ?? status,
    };

    setStatus(updatedTask.status);

    await onQuickUpdate?.(
      updatedTask,
      forcePublishNote || finalUpdateMessage ? finalUpdateMessage : undefined,
      updateAttachment || undefined
    );

    if (trimmedUpdate) {
      setUpdateMessage("");
    }

    if (updateAttachment) {
      setUpdateAttachment("");
    }
  }

  async function handleUpdateAttachmentChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      toast.error("O anexo deve ter no maximo 9MB.");
      event.target.value = "";
      return;
    }

    try {
      const attachmentDataUrl = await fileToDataUrl(file);
      setUpdateAttachment(attachmentDataUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel anexar o arquivo.";
      toast.error(message);
    }
  }

  return (
    <main
      className="
        mx-auto min-h-screen max-w-6xl px-4 pb-14 pt-28
        sm:px-6 lg:px-8
      "
    >
      <Link
        href={backHref}
        className="
          inline-flex items-center gap-2 rounded-2xl border border-white/10
          px-4 py-2 text-sm text-slate-300 transition-colors
          hover:bg-white/5 hover:text-white
        "
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <section
        className="
          mt-6 overflow-hidden rounded-[36px] border border-white/10
          bg-[linear-gradient(180deg,rgba(10,24,40,0.98),rgba(6,16,28,0.98))]
          p-6 shadow-[0_30px_90px_rgba(2,8,23,0.48)]
        "
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
              Detalhes da tarefa
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {task.title}
            </h1>
            {task.client && (
              <p className="mt-3 text-sm text-slate-400">
                Cliente <span className="text-slate-200">{task.client}</span>
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
              {task.date && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <CalendarDays className="h-4 w-4 text-cyan-300" />
                  {new Date(task.date).toLocaleDateString("pt-BR")}
                </span>
              )}

              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <UserRound className="h-4 w-4 text-emerald-300" />
                {visibleAssignee}
              </span>

              {task.createdByRole === "client" && (
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-cyan-100">
                  <Building2 className="h-4 w-4" />
                  {task.requesterName
                    ? `Solicitado por ${task.requesterName}`
                    : "Demanda do cliente"}
                </span>
              )}

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                Prioridade {task.priority}
              </span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Status
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {statusLabels[status]}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Responsavel:{" "}
              <span className="text-slate-200">
                {visibleAssignee}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-cyan-100">
              <FileText className="h-4 w-4" />
              <p className="text-sm font-medium">Descricao</p>
            </div>
            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
              {task.description || "Sem descricao"}
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-cyan-100">
              <Paperclip className="h-4 w-4" />
              <p className="text-sm font-medium">Anexo</p>
            </div>

            {task.referenceImageUrl ? (
              <div className="mt-4 space-y-4">
                {isImageAttachment(task.referenceImageUrl) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={task.referenceImageUrl}
                    alt={`Anexo da tarefa ${task.title}`}
                    className="max-h-64 w-full rounded-[20px] object-contain"
                  />
                )}
                <a
                  href={task.referenceImageUrl}
                  download={`anexo-${task.id}`}
                  className="
                    inline-flex w-full items-center justify-center gap-2
                    rounded-2xl border border-cyan-400/20 bg-cyan-400/10
                    px-4 py-3 text-sm font-medium text-cyan-100
                    transition-colors hover:bg-cyan-400/15
                  "
                >
                  <Download className="h-4 w-4" />
                  Baixar anexo
                </a>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-400">
                Nenhum anexo enviado para esta tarefa.
              </p>
            )}
          </div>
        </div>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/25 p-5">
          <div className="flex items-center gap-2 text-cyan-100">
            <FileText className="h-4 w-4" />
            <p className="text-sm font-medium">Historico da tarefa</p>
          </div>

          {task.updates?.length ? (
            <div className="mt-4 space-y-3">
              {task.updates.map((update) => {
                const isCompletionLog = update.message
                  .toLowerCase()
                  .includes("marcada como concluida");
                const isAssigneeLog = update.message
                  .toLowerCase()
                  .includes("troca de funcionario");

                if (isAssigneeLog && !canSeeInternalHistory) {
                  return null;
                }

                return (
                <div
                  key={update.id}
                  className={`
                    rounded-[22px] border p-4
                    ${
                      isCompletionLog
                        ? "border-emerald-400/25 bg-emerald-400/10"
                        : "border-white/8 bg-white/[0.03]"
                    }
                  `}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-white">
                        {update.authorName}
                      </p>
                      {isCompletionLog && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-100">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Concluida
                        </span>
                      )}
                    </div>
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
                  {update.attachment && (
                    <a
                      href={update.attachment}
                      download={`atualizacao-${update.id}`}
                      className="
                        mt-3 inline-flex items-center gap-2 rounded-2xl
                        border border-cyan-400/20 bg-cyan-400/10 px-3 py-2
                        text-xs font-medium text-cyan-100 transition-colors
                        hover:bg-cyan-400/15
                      "
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar anexo da atualizacao
                    </a>
                  )}
                </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              Ainda nao existem atualizacoes publicadas para esta tarefa.
            </p>
          )}
        </section>

        {canManage && (
          <section className="mt-6 space-y-4 border-t border-white/10 pt-5">
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
                    text-white placeholder:text-slate-500 outline-none
                    transition-colors focus:border-cyan-400/40 focus:bg-white/8
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
                placeholder="Descreva o que foi feito, o que mudou ou o proximo passo."
                className="
                  w-full resize-none rounded-[24px] border border-white/10
                  bg-white/5 px-4 py-3 text-white placeholder:text-slate-500
                  outline-none transition-colors focus:border-cyan-400/40
                  focus:bg-white/8
                "
              />
              <p className="text-xs text-slate-500">
                Essa nota fica visivel para o cliente no historico da demanda.
                {currentUserName && (
                  <>
                    {" "}
                    Publicando como {currentUserName}
                    {currentUserRole ? ` - ${currentUserRole}` : ""}.
                  </>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Anexo da atualizacao
              </label>
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.04] p-4">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15">
                  <Paperclip className="h-4 w-4" />
                  {updateAttachment ? "Trocar anexo" : "Enviar anexo"}
                  <input
                    type="file"
                    onChange={handleUpdateAttachmentChange}
                    className="sr-only"
                  />
                </label>
                <p className="mt-3 text-xs text-slate-500">
                  Arquivo de ate 9MB. O anexo fica visivel no historico.
                </p>
                {updateAttachment && (
                  <button
                    type="button"
                    onClick={() => setUpdateAttachment("")}
                    className="mt-3 text-sm font-medium text-rose-200 hover:text-rose-100"
                  >
                    Remover anexo
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => handleQuickUpdate()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
                Salvar
              </button>

              <button
                onClick={() => handleQuickUpdate("doing")}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition-colors hover:bg-sky-400/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PlayCircle className="h-4 w-4" />
                Em andamento
              </button>

              <button
                onClick={() => handleQuickUpdate("done", true)}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                Concluir
              </button>

              <button
                onClick={() => onDelete?.(task)}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200 transition-colors hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
