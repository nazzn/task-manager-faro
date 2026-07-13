export type TaskStatus = "todo" | "doing" | "done";
export type StatusFilter = TaskStatus | null;

export type Subtask = {
  id: number;
  title: string;
  is_completed: boolean;
  order: number;
};

export type Role = "admin" | "manager" | "user";

export type Attachment = {
  id?: number | string;
  name: string;
  size: number;
  url?: string;
  file?: File;
};

export interface User {
  id: number;
  username: string;
  role: Role;
}

export type Comment = {
  id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  user?: {
    id: number;
    username: string;
    role: string;
  };
  attachment?: {
    id: number;
    name: string;
    size: number;
  } | null;
};

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  assignee_id: number;
  due_date: string;
  start_at: string | null;
  created_at: string;
  subtasks: Subtask[];
  attachments: Attachment[];
  assignee?: User;
  createdBy?: User;
  parent_id: number | null;
  project_id: number | null;
}
