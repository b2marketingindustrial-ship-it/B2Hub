import type { Task, TaskPayload } from "../src/types/TaskCardType";

type TaskQueryOptions = {
  viewerRole?: string;
  clientUserId?: string;
};

async function requestTasks<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: object,
  queryOptions?: TaskQueryOptions
): Promise<T> {
  const params = new URLSearchParams();

  if (queryOptions?.viewerRole) {
    params.set("viewerRole", queryOptions.viewerRole);
  }

  if (queryOptions?.clientUserId) {
    params.set("clientUserId", queryOptions.clientUserId);
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/api/tasks?${queryString}` : "/api/tasks";

  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Falha ao processar a requisicao");
  }

  return data;
}

export default async function getTasks(
  queryOptions?: TaskQueryOptions
): Promise<Task[]> {
  try {
    const data = await requestTasks<{ data: Task[] }>(
      "GET",
      undefined,
      queryOptions
    );
    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createTask(
  task: TaskPayload,
  queryOptions?: TaskQueryOptions
): Promise<Task> {
  const data = await requestTasks<{ data: Task }>("POST", task, queryOptions);
  return data.data;
}

export async function updateTask(task: Task): Promise<Task> {
  const data = await requestTasks<{ data: Task }>("PATCH", task);
  return data.data;
}

export async function deleteTask(id: string): Promise<void> {
  await requestTasks("DELETE", { id });
}
