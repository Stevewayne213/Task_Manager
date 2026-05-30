export interface User {
  id: string;
  name: string;
  email: string;
}

export type TaskStage = 'Todo' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  _id: string;
  title: string;
  description: string;
  stage: TaskStage;
  userId: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority?: TaskPriority;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}
