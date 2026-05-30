import { Task, TaskStage } from '../types';
import TaskCard from './TaskCard';
import { AnimatePresence, motion } from 'motion/react';
import { Circle, Eye, CheckCircle2, Inbox } from 'lucide-react';

interface TaskColumnProps {
  stage: TaskStage;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMoveTask: (task: Task, direction: 'forward' | 'backward') => void;
}

export default function TaskColumn({ stage, tasks, onEdit, onDelete, onMoveTask }: TaskColumnProps) {
  // Determine standard colors and icons for headers
  const getHeaderDetails = () => {
    switch (stage) {
      case 'Todo':
        return {
          icon: <Circle className="h-4 w-4 text-red-500 animate-pulse" />,
          title: 'Todo',
          bg: 'bg-red-950/10 border border-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.02)]',
          countBg: 'bg-red-500/10 text-red-400 border border-red-500/20',
        };
      case 'In Progress':
        return {
          icon: <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}><Eye className="h-4 w-4 text-blue-400" /></motion.div>,
          title: 'In Progress',
          bg: 'bg-blue-950/10 border border-blue-950/30 shadow-[0_0_15px_rgba(59,130,246,0.02)]',
          countBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
        };
      case 'Done':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-bounce" style={{ animationDuration: '2s' }} />,
          title: 'Done',
          bg: 'bg-emerald-950/10 border border-emerald-950/30 shadow-[0_0_15px_rgba(16,185,129,0.02)]',
          countBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        };
    }
  };

  const info = getHeaderDetails();

  return (
    <div id={`kanban_column_${stage}`} className="flex flex-col h-full min-h-[500px] rounded-xl bg-zinc-950/20 border border-zinc-900 p-4 font-sans select-none">
      {/* Column Header Panel */}
      <div className={`flex items-center justify-between p-3 rounded-lg ${info.bg} mb-4.5`}>
        <div className="flex items-center gap-2">
          {info.icon}
          <span className="text-sm font-semibold text-zinc-200 tracking-tight">{info.title}</span>
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${info.countBg}`}>
          {tasks.length}
        </span>
      </div>

      {/* Task List container supporting drag/glide motions */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 custom-scrollbar min-h-[300px]">
        <AnimatePresence mode="popLayout" initial={false}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMoveTask}
              />
            ))
          ) : (
            <motion.div
              id={`empty_col_state_${stage}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-zinc-900 bg-zinc-950/5 text-center text-zinc-600"
            >
              <Inbox className="h-7 w-7 text-zinc-800 mb-1.5" />
              <p className="text-[11px] font-medium uppercase tracking-wider">Empty Column</p>
              <p className="text-[10px] mt-0.5 text-zinc-650 max-w-[150px] mx-auto leading-normal">
                No tasks available right now.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
