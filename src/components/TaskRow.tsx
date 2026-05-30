import React from 'react';
import { Task } from '../types';
import { motion } from 'motion/react';
import { Edit2, Calendar, ArrowRight, ArrowLeft, Trash2, CheckCircle2, Circle, Eye } from 'lucide-react';

interface TaskRowProps {
  key?: string | number;
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (task: Task, direction: 'forward' | 'backward') => void;
}

export default function TaskRow({ task, onEdit, onDelete, onMove }: TaskRowProps) {
  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const statusStyles = () => {
    switch (task.stage) {
      case 'Todo':
        return {
          icon: <Circle className="h-4 w-4 text-red-500 shrink-0" />,
          badge: 'bg-red-950/40 text-red-400 border border-red-800/20',
          title: 'text-zinc-200',
        };
      case 'In Progress':
        return {
          icon: <Eye className="h-4 w-4 text-blue-400 shrink-0 animate-pulse" />,
          badge: 'bg-blue-950/40 text-blue-400 border border-blue-800/20',
          title: 'text-white font-medium',
        };
      case 'Done':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
          badge: 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/25',
          title: 'text-zinc-500 line-through decoration-emerald-800/30',
        };
    }
  };

  const styles = statusStyles();
  const isOverdue = task.dueDate && new Date(task.dueDate).getTime() < Date.now() && task.stage !== 'Done';

  const getPriorityStyles = () => {
    const priority = task.priority || 'Medium';
    switch (priority) {
      case 'High':
        return {
          dotBg: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
          badge: 'bg-red-500/10 text-red-400 border border-red-500/20'
        };
      case 'Medium':
        return {
          dotBg: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
          badge: 'bg-amber-550/10 text-amber-400 border border-amber-500/20'
        };
      case 'Low':
        return {
          dotBg: 'bg-zinc-400 shadow-[0_0_8px_rgba(161,161,170,0.3)]',
          badge: 'bg-zinc-800 text-zinc-400 border border-zinc-750/50'
        };
    }
  };

  const priorityStyles = getPriorityStyles();

  return (
    <motion.div
      id={`task_row_${task._id}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.005, backgroundColor: 'rgba(24, 24, 27, 0.5)' }}
      transition={{ duration: 0.2 }}
      className={`group relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border ${
        isOverdue
          ? 'border-red-500/30 bg-red-950/5 shadow-[0_0_15px_rgba(239,68,68,0.05)]'
          : 'border-zinc-800/60 bg-zinc-900/25'
      } backdrop-blur-md transition-all duration-300`}
    >
      {/* Left indicator & Title */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="mt-1 md:mt-0">{styles.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm tracking-tight break-words font-medium select-text ${styles.title}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="mt-1 text-xs text-zinc-400 font-normal break-words select-text line-clamp-1 group-hover:line-clamp-none transition-all duration-305">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Due Date & Badges info */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${styles.badge}`}>
          {task.stage}
        </span>

        <span className={`rounded-md px-2 py-0.5 text-[9px] font-semibold flex items-center gap-1 uppercase tracking-wider ${priorityStyles.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${priorityStyles.dotBg}`} />
          {task.priority || 'Medium'}
        </span>

        {isOverdue && (
          <span className="rounded-md bg-red-500/10 text-red-200 border border-red-500/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider animate-pulse">
            Lapsed
          </span>
        )}

        {task.dueDate && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border ${
            isOverdue
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : 'bg-zinc-950 text-zinc-400 border-zinc-800/80'
          }`}>
            <Calendar className={`h-3 w-3 ${isOverdue ? 'text-red-400' : 'text-zinc-500'}`} />
            <span>Due: {formatDate(task.dueDate)}</span>
          </div>
        )}

        <div className="text-[10px] text-zinc-500 font-mono hidden sm:block">
          Updated {formatDate(task.updatedAt)}
        </div>
      </div>

      {/* Actions and stage movers */}
      <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800/60">
        <div className="flex items-center gap-1">
          {task.stage !== 'Todo' && (
            <button
              id={`row_shift_back_${task._id}`}
              onClick={() => onMove(task, 'backward')}
              type="button"
              className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition cursor-pointer"
              title="Move backward"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
          )}
          {task.stage !== 'Done' && (
            <button
              id={`row_shift_forward_${task._id}`}
              onClick={() => onMove(task, 'forward')}
              type="button"
              className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition cursor-pointer"
              title="Move forward"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id={`row_edit_btn_${task._id}`}
            onClick={() => onEdit(task)}
            type="button"
            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            title="Edit task"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            id={`row_delete_btn_${task._id}`}
            onClick={() => onDelete(task._id)}
            type="button"
            className="rounded p-1.5 text-zinc-400 hover:bg-red-950/60 hover:text-red-400 transition cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
