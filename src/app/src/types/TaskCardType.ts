export type Status = "todo" | "doing" | "done";

export type Priority = "Alta" | "Média" | "Baixa";

export type TaskUpdate = {
  id: string;
  message: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  client?: string;
  description?: string;
  status: Status;
  date?: string;
  priority: Priority;
  assignee?: string;
  createdByRole?: "staff" | "client";
  clientUserId?: string;
  requesterName?: string;
  referenceImageUrl?: string;
  updates?: TaskUpdate[];
};

export type TaskPayload = Omit<Task, "id">;
