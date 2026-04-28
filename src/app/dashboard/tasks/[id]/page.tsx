"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import NavBar from "../../../components/Navbar";
import TaskDetailView from "../../../components/TaskDetailView";
import { canManageEmployees, isClientRole } from "../../../src/lib/roles";
import type { Task } from "../../../src/types/TaskCardType";
import getTasks, { deleteTask, updateTask } from "../../../utils/GetTasks";
import useUser from "../../../utils/useUser";

export default function DashboardTaskDetailPage() {
  const user = useUser();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTask = useCallback(async () => {
    setLoading(true);
    const data = await getTasks();
    setTask(data.find((item) => item.id === params.id) ?? null);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role === "guest") {
      router.replace("/");
      return;
    }

    if (isClientRole(user.role)) {
      router.replace("/client-area");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadTask();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadTask, router, user]);

  async function handleDeleteTask(taskToDelete: Task) {
    setSaving(true);

    try {
      await deleteTask(taskToDelete.id);
      toast.success("Tarefa removida com sucesso");
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel excluir a tarefa";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickUpdateTask(
    taskToUpdate: Task,
    updateMessage?: string,
    updateAttachment?: string
  ) {
    setSaving(true);

    try {
      const updatedTask = await updateTask({
        ...taskToUpdate,
        updateMessage,
        updateAttachment,
        updateAuthorName: user?.name || "Equipe",
        updateAuthorRole: user?.role || "staff",
      } as Task & {
        updateMessage?: string;
        updateAttachment?: string;
        updateAuthorName?: string;
        updateAuthorRole?: string;
      });

      setTask(updatedTask);
      toast.success("Task sincronizada com a operacao");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel atualizar a tarefa";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <NavBar user={user} />

      {loading ? (
        <main className="mx-auto min-h-screen max-w-6xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-dashed border-white/10 bg-slate-950/20 px-4 py-10 text-center text-sm text-slate-400">
            Carregando detalhes da tarefa...
          </div>
        </main>
      ) : task ? (
        <TaskDetailView
          task={task}
          backHref="/dashboard"
          backLabel="Voltar para dashboard"
          canManage={canManageEmployees(user?.role)}
          canSeeInternalHistory={canManageEmployees(user?.role)}
          loading={saving}
          currentUserName={user?.name}
          currentUserRole={user?.role}
          onDelete={handleDeleteTask}
          onQuickUpdate={handleQuickUpdateTask}
        />
      ) : (
        <main className="mx-auto min-h-screen max-w-6xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-dashed border-white/10 bg-slate-950/20 px-4 py-10 text-center text-sm text-slate-400">
            Tarefa nao encontrada.
          </div>
        </main>
      )}
    </>
  );
}
