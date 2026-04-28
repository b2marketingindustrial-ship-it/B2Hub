"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NavBar from "../../../components/Navbar";
import TaskDetailView from "../../../components/TaskDetailView";
import { isClientRole } from "../../../src/lib/roles";
import type { Task } from "../../../src/types/TaskCardType";
import getTasks from "../../../utils/GetTasks";
import useUser from "../../../utils/useUser";

export default function ClientTaskDetailPage() {
  const user = useUser();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTask = useCallback(
    async (clientUserId: string) => {
      setLoading(true);
      const data = await getTasks({
        viewerRole: "client",
        clientUserId,
      });
      setTask(data.find((item) => item.id === params.id) ?? null);
      setLoading(false);
    },
    [params.id]
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role === "guest") {
      router.replace("/");
      return;
    }

    if (!isClientRole(user.role)) {
      router.replace("/dashboard");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadTask(user.id);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadTask, router, user]);

  return (
    <>
      <NavBar user={user} />

      {loading ? (
        <main className="mx-auto min-h-screen max-w-6xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-dashed border-white/10 bg-slate-950/20 px-4 py-10 text-center text-sm text-slate-400">
            Carregando detalhes da demanda...
          </div>
        </main>
      ) : task ? (
        <TaskDetailView
          task={task}
          backHref="/client-area"
          backLabel="Voltar para area do cliente"
        />
      ) : (
        <main className="mx-auto min-h-screen max-w-6xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-dashed border-white/10 bg-slate-950/20 px-4 py-10 text-center text-sm text-slate-400">
            Demanda nao encontrada.
          </div>
        </main>
      )}
    </>
  );
}
