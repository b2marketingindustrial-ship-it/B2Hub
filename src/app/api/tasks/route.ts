import { ensureDatabaseSetup, query } from "@/app/src/lib/db";
import type {
  Priority,
  Status,
  Task,
  TaskUpdate,
} from "@/app/src/types/TaskCardType";

type TaskBody = {
  id?: string;
  title?: string;
  description?: string;
  client?: string;
  status?: Status;
  date?: string;
  priority?: Priority;
  assignee?: string;
  createdByRole?: "staff" | "client";
  clientUserId?: string;
  requesterName?: string;
  referenceImageUrl?: string;
  updateMessage?: string;
  updateAttachment?: string;
  updateAuthorName?: string;
  updateAuthorRole?: string;
};

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  client: string | null;
  status: Status;
  due_date: string | null;
  priority: Priority;
  assignee: string | null;
  created_by_role: "staff" | "client";
  client_user_id: string | null;
  requester_name: string | null;
  reference_image_url: string | null;
};

type TaskUpdateRow = {
  id: string;
  task_id: string;
  message: string;
  author_name: string;
  author_role: string;
  attachment: string | null;
  created_at: string;
};

function mapTaskUpdate(row: TaskUpdateRow): TaskUpdate {
  return {
    id: row.id,
    message: row.message,
    authorName: row.author_name,
    authorRole: row.author_role,
    createdAt: row.created_at,
    attachment: row.attachment ?? "",
  };
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    client: row.client ?? "",
    status: row.status,
    date: row.due_date ?? "",
    priority: row.priority,
    assignee: row.assignee ?? "",
    createdByRole: row.created_by_role,
    clientUserId: row.client_user_id ?? "",
    requesterName: row.requester_name ?? "",
    referenceImageUrl: row.reference_image_url ?? "",
    updates: [],
  };
}

async function attachUpdates(tasks: Task[]) {
  if (!tasks.length) {
    return tasks;
  }

  const taskIds = tasks.map((task) => task.id);
  const updatesResult = await query<TaskUpdateRow>(
    `
      SELECT id, task_id, message, author_name, author_role, attachment, created_at
      FROM task_updates
      WHERE task_id = ANY($1::text[])
      ORDER BY created_at DESC
    `,
    [taskIds]
  );

  const updatesByTaskId = updatesResult.rows.reduce<Record<string, TaskUpdate[]>>(
    (accumulator, row) => {
      const mappedUpdate = mapTaskUpdate(row);

      if (!accumulator[row.task_id]) {
        accumulator[row.task_id] = [];
      }

      accumulator[row.task_id].push(mappedUpdate);
      return accumulator;
    },
    {}
  );

  return tasks.map((task) => ({
    ...task,
    updates: updatesByTaskId[task.id] ?? [],
  }));
}

function normalizeTask(body: TaskBody): Omit<Task, "id"> {
  return {
    title: body.title?.trim() ?? "",
    description: body.description?.trim() ?? "",
    client: body.client?.trim() ?? "",
    status: body.status ?? "todo",
    date: body.date ?? "",
    priority: body.priority ?? "Baixa",
    assignee: body.assignee?.trim() ?? "",
    createdByRole: body.createdByRole ?? "staff",
    clientUserId: body.clientUserId ?? "",
    requesterName: body.requesterName?.trim() ?? "",
    referenceImageUrl: body.referenceImageUrl?.trim() ?? "",
  };
}

function validateTask(task: Omit<Task, "id">) {
  if (!task.title) {
    return "O titulo da tarefa e obrigatorio";
  }

  if (!task.priority) {
    return "A prioridade da tarefa e obrigatoria";
  }

  if (task.createdByRole === "client" && !task.clientUserId) {
    return "A tarefa do cliente precisa estar vinculada a um cliente";
  }

  return null;
}

export async function GET(req: Request) {
  await ensureDatabaseSetup();

  const { searchParams } = new URL(req.url);
  const viewerRole = searchParams.get("viewerRole");
  const clientUserId = searchParams.get("clientUserId");

  const shouldFilterByClient =
    viewerRole === "client" && typeof clientUserId === "string" && clientUserId;

  const tasks = await query<TaskRow>(
    `
      SELECT
        id,
        title,
        description,
        client,
        status,
        due_date,
        priority,
        assignee,
        created_by_role,
        client_user_id,
        requester_name,
        reference_image_url
      FROM tasks
      ${shouldFilterByClient ? "WHERE client_user_id = $1" : ""}
      ORDER BY created_at DESC
    `,
    shouldFilterByClient ? [clientUserId] : []
  );

  const mappedTasks = await attachUpdates(tasks.rows.map(mapTask));

  return Response.json(
    {
      data: mappedTasks,
      message: "Tasks carregadas com sucesso",
    },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  await ensureDatabaseSetup();

  const body = (await req.json()) as TaskBody;
  const task = normalizeTask(body);
  const validationError = validateTask(task);

  if (validationError) {
    return Response.json({ message: validationError }, { status: 400 });
  }

  const newTaskId = crypto.randomUUID();

  const result = await query<TaskRow>(
    `
      INSERT INTO tasks (
        id,
        title,
        description,
        client,
        status,
        due_date,
        priority,
        assignee,
        created_by_role,
        client_user_id,
        requester_name,
        reference_image_url
      )
      VALUES ($1, $2, $3, $4, $5, NULLIF($6, '')::date, $7, $8, $9, NULLIF($10, ''), $11, $12)
      RETURNING
        id,
        title,
        description,
        client,
        status,
        due_date,
        priority,
        assignee,
        created_by_role,
        client_user_id,
        requester_name,
        reference_image_url
    `,
    [
      newTaskId,
      task.title,
      task.description,
      task.client,
      task.status,
      task.date,
      task.priority,
      task.assignee,
      task.createdByRole,
      task.clientUserId,
      task.requesterName,
      task.referenceImageUrl,
    ]
  );

  const mappedTask = await attachUpdates([mapTask(result.rows[0])]);

  return Response.json(
    {
      data: mappedTask[0],
      message: "Tarefa criada com sucesso",
    },
    { status: 201 }
  );
}

export async function PATCH(req: Request) {
  await ensureDatabaseSetup();

  const body = (await req.json()) as TaskBody;

  if (!body.id) {
    return Response.json(
      { message: "O id da tarefa e obrigatorio" },
      { status: 400 }
    );
  }

  const currentTaskResult = await query<TaskRow>(
    `
      SELECT id, title, description, client, status, due_date, priority, assignee
      , created_by_role, client_user_id, requester_name, reference_image_url
      FROM tasks
      WHERE id = $1
      LIMIT 1
    `,
    [body.id]
  );

  if (!currentTaskResult.rowCount) {
    return Response.json(
      { message: "Tarefa nao encontrada" },
      { status: 404 }
    );
  }

  const currentTask = mapTask(currentTaskResult.rows[0]);
  const updatedTask = {
    ...currentTask,
    ...normalizeTask({
      ...currentTask,
      ...body,
    }),
  };

  const validationError = validateTask(updatedTask);

  if (validationError) {
    return Response.json({ message: validationError }, { status: 400 });
  }

  const result = await query<TaskRow>(
    `
      UPDATE tasks
      SET
        title = $2,
        description = $3,
        client = $4,
        status = $5,
        due_date = NULLIF($6, '')::date,
        priority = $7,
        assignee = $8,
        created_by_role = $9,
        client_user_id = NULLIF($10, ''),
        requester_name = $11,
        reference_image_url = $12,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        title,
        description,
        client,
        status,
        due_date,
        priority,
        assignee,
        created_by_role,
        client_user_id,
        requester_name,
        reference_image_url
    `,
    [
      body.id,
      updatedTask.title,
      updatedTask.description,
      updatedTask.client,
      updatedTask.status,
      updatedTask.date,
      updatedTask.priority,
      updatedTask.assignee,
      updatedTask.createdByRole,
      updatedTask.clientUserId,
      updatedTask.requesterName,
      updatedTask.referenceImageUrl,
    ]
  );

  const updateMessage = body.updateMessage?.trim();
  const updateAttachment = body.updateAttachment?.trim();

  if (updateMessage || updateAttachment) {
    await query(
      `
        INSERT INTO task_updates (id, task_id, message, author_name, author_role, attachment)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        crypto.randomUUID(),
        body.id,
        updateMessage || "Anexo enviado.",
        body.updateAuthorName?.trim() || "Equipe",
        body.updateAuthorRole?.trim() || "staff",
        updateAttachment || "",
      ]
    );
  }

  const mappedTask = await attachUpdates([mapTask(result.rows[0])]);

  return Response.json(
    {
      data: mappedTask[0],
      message: "Tarefa atualizada com sucesso",
    },
    { status: 200 }
  );
}

export async function DELETE(req: Request) {
  await ensureDatabaseSetup();

  const body = (await req.json()) as Pick<TaskBody, "id">;

  if (!body.id) {
    return Response.json(
      { message: "O id da tarefa e obrigatorio" },
      { status: 400 }
    );
  }

  const result = await query(
    `
      DELETE FROM tasks
      WHERE id = $1
    `,
    [body.id]
  );

  if (!result.rowCount) {
    return Response.json(
      { message: "Tarefa nao encontrada" },
      { status: 404 }
    );
  }

  return Response.json(
    {
      message: "Tarefa removida com sucesso",
    },
    { status: 200 }
  );
}
