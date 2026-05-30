import React, { useState, useEffect } from 'react';
import { Task, TaskStage, TaskPriority } from '../types';
import { motion } from 'motion/react';
import { X, Save, AlertCircle } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, stage: TaskStage, dueDate?: string, priority?: TaskPriority) => Promise<void>;
  task?: Task | null; // If passed, we are in Edit mode
}

export default function TaskModal({ isOpen, onClose, onSubmit, task }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<TaskStage>('Todo');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync state when task changes (i.e., when opening editing modal)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStage(task.stage);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setPriority(task.priority || 'Medium');
    } else {
      setTitle('');
      setDescription('');
      setStage('Todo');
      setDueDate('');
      setPriority('Medium');
    }
    setError(null);
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await onSubmit(
        title.trim(),
        description.trim(),
        stage,
        dueDate ? new Date(dueDate).toISOString() : undefined,
        priority
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit operation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="task_modal_backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md">
      {/* Modal Card Content container */}
      <motion.div
        id="task_modal_window"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-855/90 bg-zinc-900 border-zinc-800 shadow-2xl p-6"
      >
        <button
          id="close_modal_btn"
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition duration-200"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <h3 className="text-xl font-bold text-white font-sans">
          {task ? 'Edit Task Info' : 'Draft New Task'}
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          {task ? 'Update task details or move its active status column.' : 'Describe a task to add to your Kanban board.'}
        </p>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/10 bg-red-500/5 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="task_title" className="text-xs font-medium text-zinc-400">Title</label>
            <input
              id="task_title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Design OAuth Workflow"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm font-normal text-white placeholder-zinc-650 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-200"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task_desc" className="text-xs font-medium text-zinc-400">Description (Optional)</label>
            <textarea
              id="task_desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Map scope identifiers and generate PKCE codes..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm font-normal text-white placeholder-zinc-650 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-200"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task_due" className="text-xs font-medium text-zinc-400">Due Date (Optional)</label>
            <input
              id="task_due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm font-normal text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="task_stage" className="text-xs font-medium text-zinc-400">Board Column (Stage)</label>
              <select
                id="task_stage"
                value={stage}
                onChange={(e) => setStage(e.target.value as TaskStage)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm font-normal text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all duration-200"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="task_priority" className="text-xs font-medium text-zinc-400">Task Priority</label>
              <select
                id="task_priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm font-normal text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all duration-200"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              id="cancel_modal_btn"
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-805 border-zinc-800 hover:bg-zinc-850 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save_task_btn"
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {submitting ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
