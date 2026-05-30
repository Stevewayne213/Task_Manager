import { Task } from '../types';
import { motion } from 'motion/react';
import { Edit2, Calendar, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react';

interface TaskCardProps {
  key?: string | number;
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (task: Task, direction: 'forward' | 'backward') => void;
}

export default function TaskCard({ task, onEdit, onDelete, onMove }: TaskCardProps) {
  // Format dates nicely
  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Color flags based on active column stage
  const getStageStyles = () => {
    switch (task.stage) {
      case 'Todo':
        return {
          border: 'border-l-[3.5px] border-l-red-500',
          badge: 'bg-red-950/40 text-red-300 border border-red-800/20',
          title: 'text-zinc-150',
        };
      case 'In Progress':
        return {
          border: 'border-l-[3.5px] border-l-blue-500',
          badge: 'bg-blue-950/40 text-blue-300 border border-blue-800/20',
          title: 'text-zinc-100 font-semibold',
        };
      case 'Done':
        return {
          border: 'border-l-[3.5px] border-l-emerald-500',
          badge: 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/20',
          title: 'text-zinc-400 line-through decoration-emerald-800/40',
        };
    }
  };

  const styles = getStageStyles();
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
      id={`task_card_${task._id}`}
      layout
      initial={{ opacity: 0, scale: 0.98, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{
        type: 'spring',
        stiffness: 450,
        damping: 38,
        layout: { duration: 0.35, ease: 'easeInOut' }
      }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border ${
        isOverdue 
          ? 'border-red-500/40 ring-1 ring-red-500/10 shadow-lg shadow-red-950/10 bg-red-950/5' 
          : 'border-zinc-800/60 bg-zinc-900/40'
      } p-4.5 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300 select-none ${styles.border}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${styles.badge}`}>
              {task.stage}
            </span>
            <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold flex items-center gap-1 uppercase tracking-wider ${priorityStyles.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${priorityStyles.dotBg}`} />
              {task.priority || 'Medium'}
            </span>
            {isOverdue && (
              <span className="rounded bg-red-500/10 text-red-200 border border-red-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider animate-pulse">
                Lapsed
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              id={`edit_btn_${task._id}`}
              onClick={() => onEdit(task)}
              type="button"
              className="rounded p-1 text-zinc-400 hover:bg-zinc-805 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
              title="Edit Task"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              id={`delete_btn_${task._id}`}
              onClick={() => onDelete(task._id)}
              type="button"
              className="rounded p-1 text-zinc-400 hover:bg-red-950/60 hover:text-red-400 transition cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <h4 className={`mt-2 text-sm leading-snug font-medium select-text break-words tracking-tight ${styles.title}`}>
          {task.title}
        </h4>

        {task.description && (
          <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-zinc-400 font-normal break-words select-text">
            {task.description}
          </p>
        )}

        {task.dueDate && (
          <div className={`mt-3 flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-mono w-fit border ${
            isOverdue 
              ? 'bg-red-500/10 text-red-400 border-red-500/30' 
              : 'bg-zinc-950/50 text-zinc-400 border-zinc-800/50'
          }`}>
            <Calendar className={`h-3 w-3 ${isOverdue ? 'text-red-400' : 'text-zinc-500'}`} />
            <span>Due: {formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-800/40 pt-3 text-[10px] text-zinc-500 font-mono">
        <div className="flex items-center gap-1">
          <span>Updated {formatDate(task.updatedAt)}</span>
        </div>

        {/* Quick Shift buttons for effortless stage swapping */}
        <div className="flex items-center gap-1">
          {task.stage !== 'Todo' && (
            <button
              id={`shift_back_${task._id}`}
              onClick={() => onMove(task, 'backward')}
              type="button"
              className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition cursor-pointer"
              title="Move Backward"
            >
              <ArrowLeft className="h-3 w-3" />
            </button>
          )}
          {task.stage !== 'Done' && (
            <button
              id={`shift_forward_${task._id}`}
              onClick={() => onMove(task, 'forward')}
              type="button"
              className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition cursor-pointer"
              title="Move Forward"
            >
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
