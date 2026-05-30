import { readJSON, writeJSON, TASKS_FILE } from './db.js';

export interface ITask {
  _id: string;
  title: string;
  description: string;
  stage: 'Todo' | 'In Progress' | 'Done';
  userId: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority?: 'Low' | 'Medium' | 'High';
}

export const Task = {
  /**
   * Find tasks with matching filters
   */
  async find(filter: Partial<ITask>): Promise<ITask[]> {
    const tasks = readJSON(TASKS_FILE);
    return tasks.filter((t: any) => {
      return Object.entries(filter).every(([key, val]) => t[key] === val);
    });
  },

  /**
   * Find a task by id
   */
  async findById(id: string): Promise<ITask | null> {
    const tasks = readJSON(TASKS_FILE);
    const found = tasks.find((t: any) => t._id === id);
    return found || null;
  },

  /**
   * Create and write a new task
   */
  async create(data: { title: string; description: string; stage: 'Todo' | 'In Progress' | 'Done'; userId: string; dueDate?: string; priority?: 'Low' | 'Medium' | 'High' }): Promise<ITask> {
    const tasks = readJSON(TASKS_FILE);
    const now = new Date().toISOString();
    const newTask: ITask = {
      _id: Math.random().toString(36).substring(2, 11),
      title: data.title,
      description: data.description,
      stage: data.stage,
      userId: data.userId,
      createdAt: now,
      updatedAt: now,
      dueDate: data.dueDate || undefined,
      priority: data.priority || 'Medium',
    };
    tasks.push(newTask);
    writeJSON(TASKS_FILE, tasks);
    return newTask;
  },

  /**
   * Find a task by ID and modify specified properties
   */
  async findByIdAndUpdate(id: string, updateData: Partial<ITask>, options?: { new?: boolean }): Promise<ITask | null> {
    const tasks = readJSON(TASKS_FILE);
    const taskIndex = tasks.findIndex((t: any) => t._id === id);
    if (taskIndex === -1) return null;

    const updatedTask: ITask = {
      ...tasks[taskIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    tasks[taskIndex] = updatedTask;
    writeJSON(TASKS_FILE, tasks);
    return updatedTask;
  },

  /**
   * Delete a task by ID
   */
  async findByIdAndDelete(id: string): Promise<ITask | null> {
    const tasks = readJSON(TASKS_FILE);
    const taskIndex = tasks.findIndex((t: any) => t._id === id);
    if (taskIndex === -1) return null;

    const deletedTask = tasks[taskIndex];
    const filteredTasks = tasks.filter((t: any) => t._id !== id);
    writeJSON(TASKS_FILE, filteredTasks);
    return deletedTask;
  }
};
