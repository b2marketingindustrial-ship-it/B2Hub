import { Task } from "../src/types/TaskCardType";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  ImageIcon,
  UserRound,
} from "lucide-react";

type Props = Task & {
  onOpen?: () => void;
};

export default function TaskCard({
  id,
  title,
  client,
  description,
  status = "todo",
  date,
  priority = "Baixa",
  assignee = "Não atribuído",
  createdByRole,
  requesterName,
  referenceImageUrl,
  onOpen
}: Props) {
  function isLate(): boolean {
    if (!date) return false;

    const today = new Date();
    const taskDate = new Date(date);

    return today > taskDate && status !== "done";
  }

  const late = isLate();

  const statusStyles = {
    todo: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    doing: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    done: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  };

  const statusLabel = {
    todo: "A fazer",
    doing: "Em andamento",
    done: "Concluído",
  };

  const priorityStyles = {
    Alta: "text-rose-300",
    Média: "text-amber-200",
    Baixa: "text-emerald-200",
  };

  const userInitial = assignee.charAt(0).toUpperCase();

  return (
    <article
      className={`
        group relative overflow-hidden rounded-[28px] border p-5
        shadow-[0_20px_60px_rgba(4,10,22,0.32)]
        transition-all duration-300
        hover:-translate-y-1 hover:border-cyan-400/30
        ${
          late
            ? "border-rose-400/30 bg-rose-500/8"
            : "border-white/10 bg-white/[0.045]"
        }
      `}
    >
      <div
        className="
          absolute inset-x-0 top-0 h-px
          bg-gradient-to-r from-transparent via-white/35 to-transparent
        "
      />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <span
            className={`
              inline-flex rounded-full border px-3 py-1 text-xs font-medium
              ${statusStyles[status]}
            `}
          >
            {statusLabel[status]}
          </span>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              #{id.slice(0, 6)}
            </p>
          </div>
        </div>

        {late && (
          <div className="flex items-center gap-1 rounded-full bg-rose-500/12 px-2 py-1">
            <AlertCircle className="h-4 w-4 text-rose-300" />
            <span className="text-xs font-medium text-rose-200">Atrasada</span>
          </div>
        )}
      </div>

      {client && (
        <p className="mt-4 text-sm font-medium text-cyan-200">{client}</p>
      )}

      {createdByRole === "client" && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span
            className="
              inline-flex items-center gap-1.5 rounded-full
              border border-cyan-400/20 bg-cyan-400/10 px-3 py-1
              text-cyan-100
            "
          >
            <Building2 className="h-3.5 w-3.5" />
            Demanda do cliente
          </span>
          {requesterName && (
            <span className="text-slate-400">Solicitante: {requesterName}</span>
          )}
          {referenceImageUrl && (
            <span className="inline-flex items-center gap-1 text-slate-400">
              <ImageIcon className="h-3.5 w-3.5" />
              Imagem anexa
            </span>
          )}
        </div>
      )}

      {description && (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
          {description}
        </p>
      )}

      <div
        className="
          mt-5 flex flex-wrap items-center justify-between gap-3
          border-t border-white/8 pt-4
        "
      >
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className={`font-medium ${priorityStyles[priority]}`}>
            Prioridade {priority}
          </span>

          {date && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
              {new Date(date).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div
            className="
              flex h-8 w-8 items-center justify-center rounded-full
              bg-cyan-400/12 text-xs font-semibold text-cyan-200
            "
          >
            {assignee ? userInitial : <UserRound className="h-4 w-4" />}
          </div>
          <span className="text-xs text-slate-300">{assignee}</span>
        </div>
      </div>

      {description && (
        <button
          onClick={onOpen}
          className="
            mt-4 text-sm font-medium text-cyan-200
            transition-colors hover:text-cyan-100
          "
        >
          Ver detalhes
        </button>
      )}
    </article>
  );
}
