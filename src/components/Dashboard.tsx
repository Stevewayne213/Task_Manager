import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Task, TaskStage, TaskPriority } from '../types';
import TaskColumn from './TaskColumn';
import TaskRow from './TaskRow';
import TaskModal from './TaskModal';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  LogOut,
  Plus,
  Search,
  CheckCircle,
  Clock,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Inbox,
  LayoutGrid,
  List
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, getAuthHeaders } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selector for Kanban board layout ('board') vs linear compact list ('list')
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Modal and editing details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Custom Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch tasks on initial mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tasks', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to retrieve task board updates.');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err: any) {
      setError(err?.message || 'Error occurred while loading tasks.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Trigger high-quality celebratory confetti
  const triggerConfetti = () => {
    try {
      // Primary center burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      // Staggered side launches
      setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 }
        });
      }, 150);
      setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 }
        });
      }, 300);
    } catch (err) {
      console.error('Failed to trigger confetti:', err);
    }
  };

  // Create or Update task
  const handleModalSubmit = async (title: string, description: string, stage: TaskStage, dueDate?: string, priority?: TaskPriority) => {
    const isEditing = !!editingTask;
    const url = isEditing ? `/api/tasks/${editingTask._id}` : '/api/tasks';
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ title, description, stage, dueDate, priority }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Operation failed');
    }

    if (isEditing) {
      const prevStage = editingTask.stage;
      setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? data : t)));
      showToast('Task updated successfully.');
      if (prevStage !== 'Done' && data.stage === 'Done') {
        triggerConfetti();
      }
    } else {
      setTasks((prev) => [...prev, data]);
      showToast('New task drafted successfully.');
      if (data.stage === 'Done') {
        triggerConfetti();
      }
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Could not delete the selected task.');
      }
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showToast('Task removed from board.');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete task.');
    }
  };

  // Move task stages effortlessly
  const handleMoveTask = async (task: Task, direction: 'forward' | 'backward') => {
    let nextStage: TaskStage = task.stage;
    const stages: TaskStage[] = ['Todo', 'In Progress', 'Done'];
    const currentIndex = stages.indexOf(task.stage);

    if (direction === 'forward' && currentIndex < 2) {
      nextStage = stages[currentIndex + 1];
    } else if (direction === 'backward' && currentIndex > 0) {
      nextStage = stages[currentIndex - 1];
    }

    if (nextStage === task.stage) return;

    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ stage: nextStage }),
      });

      const updatedTask = await response.json();
      if (!response.ok) {
        throw new Error(updatedTask.message || 'Failed to shift task stage.');
      }

      setTasks((prev) => prev.map((t) => (t._id === task._id ? updatedTask : t)));

      if (nextStage === 'Done') {
        triggerConfetti();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to move task.');
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Filter tasks based on query matches in title/description
  const filteredTasks = tasks.filter((t) => {
    const query = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query);
  });

  // Calculate task distribution metrics
  const todoCount = tasks.filter((t) => t.stage === 'Todo').length;
  const inProgressCount = tasks.filter((t) => t.stage === 'In Progress').length;
  const doneCount = tasks.filter((t) => t.stage === 'Done').length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div id="dashboard_root_div" className="min-h-screen bg-slate-950 text-zinc-100 font-sans pb-16 px-4 md:px-8 select-none">
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Primary Header/Nav Area */}
      <header id="dashboard_hdr" className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-zinc-900 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white font-sans bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Task Board</h1>
            <p className="text-xs text-zinc-500">
              Session of <span className="text-zinc-300 font-medium">{user?.name || user?.email}</span>
            </p>
          </div>
        </div>

        {/* Quick actions row */}
        <div className="flex items-center gap-3">
          <button
            id="create_task_header_btn"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 px-4.5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/15 cursor-pointer transition-all duration-300 hover:shadow-cyan-400/20"
          >
            <Plus className="h-4.5 w-4.5" />
            Create Task
          </button>
          <button
            id="logout_btn"
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-805 border-zinc-800 hover:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Board Container */}
      <main className="max-w-7xl mx-auto mt-8 space-y-8">
        {/* Statistics Widgets area */}
        <section id="statistics_widget_grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-90 w-full bg-zinc-900/25 border-zinc-900 p-4.5 flex items-center justify-between hover:border-red-900/30 transition-all duration-350">
            <div>
              <p className="text-[10px] font-mono uppercase text-red-400">Unstarted</p>
              <h3 className="text-xl font-bold text-white mt-1">{todoCount} tasks</h3>
            </div>
            <ClipboardList className="h-8 w-8 text-red-500 opacity-20" />
          </div>

          <div className="rounded-xl border border-zinc-90 w-full bg-zinc-900/25 border-zinc-900 p-4.5 flex items-center justify-between hover:border-blue-900/30 transition-all duration-350">
            <div>
              <p className="text-[10px] font-mono uppercase text-blue-400">Active WIP</p>
              <h3 className="text-xl font-bold text-white mt-1">{inProgressCount} tasks</h3>
            </div>
            <Clock className="h-8 w-8 text-blue-400 opacity-20" />
          </div>

          <div className="rounded-xl border border-zinc-90 w-full bg-zinc-900/25 border-zinc-900 p-4.5 flex items-center justify-between hover:border-emerald-900/30 transition-all duration-350">
            <div>
              <p className="text-[10px] font-mono uppercase text-emerald-400">Finished</p>
              <h3 className="text-xl font-bold text-white mt-1">{doneCount} tasks</h3>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-400 opacity-20" />
          </div>

          <div className="rounded-xl border border-zinc-90 w-full bg-zinc-900/25 border-zinc-900 p-4.5 flex flex-col justify-between hover:border-zinc-800 transition-all duration-350">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Completion</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">{completionPercentage}%</span>
            </div>
            <div className="mt-2.5 w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-900/40">
              <div className="bg-gradient-to-r from-red-550 via-blue-500 to-emerald-400 bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
            </div>
          </div>
        </section>

        {/* Filters and Search toolbar */}
        <section id="filters_toolbar" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              id="task_search_bar"
              type="text"
              placeholder="Search tasks by title or descriptor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/20 pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Board / List View Segmented Toggle */}
            <div className="relative flex rounded-xl bg-zinc-950 p-1 border border-zinc-900 shadow-lg">
              <button
                id="view_board_toggle"
                type="button"
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
                  viewMode === 'board' ? 'text-white bg-zinc-900/60 shadow border border-zinc-800/80' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                onClick={() => setViewMode('board')}
              >
                <LayoutGrid className={`h-3.5 w-3.5 ${viewMode === 'board' ? 'text-cyan-400' : ''}`} />
                <span>Board View</span>
              </button>
              <button
                id="view_list_toggle"
                type="button"
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
                  viewMode === 'list' ? 'text-white bg-zinc-900/60 shadow border border-zinc-800/80' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                onClick={() => setViewMode('list')}
              >
                <List className={`h-3.5 w-3.5 ${viewMode === 'list' ? 'text-cyan-400' : ''}`} />
                <span>List View</span>
              </button>
            </div>

            <button
              id="refresh_board_btn"
              onClick={fetchTasks}
              className="p-2 border border-zinc-800 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
              title="Refresh Board"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Global Error alert container */}
        {error && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-150">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchTasks}
              className="text-xs font-semibold text-red-400 underline hover:text-red-300 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Dynamic Board View vs Linear List View */}
        <section id="tasks_content_container" className="min-h-[450px]">
          {viewMode === 'board' ? (
            <div id="kanban_board_section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {loading ? (
                // Glowing Skeleton Loader State for Kanban
                Array.from({ length: 3 }).map((_, colIdx) => (
                  <div
                    key={`skeleton_col_${colIdx}`}
                    className="flex flex-col h-full min-h-[450px] rounded-xl border border-zinc-900 bg-zinc-950/20 p-4 space-y-4 animate-pulse select-none"
                  >
                    <div className="h-10 bg-zinc-900/60 rounded-lg" />
                    <div className="h-28 bg-zinc-900/35 rounded-xl border border-zinc-900/60" />
                    <div className="h-20 bg-zinc-900/35 rounded-xl border border-zinc-900/60" />
                    <div className="h-28 bg-zinc-900/35 rounded-xl border border-zinc-900/60" />
                  </div>
                ))
              ) : (
                // Actual Column Layouts
                <>
                  <TaskColumn
                    stage="Todo"
                    tasks={filteredTasks.filter((t) => t.stage === 'Todo')}
                    onEdit={openEditModal}
                    onDelete={handleDeleteTask}
                    onMoveTask={handleMoveTask}
                  />
                  <TaskColumn
                    stage="In Progress"
                    tasks={filteredTasks.filter((t) => t.stage === 'In Progress')}
                    onEdit={openEditModal}
                    onDelete={handleDeleteTask}
                    onMoveTask={handleMoveTask}
                  />
                  <TaskColumn
                    stage="Done"
                    tasks={filteredTasks.filter((t) => t.stage === 'Done')}
                    onEdit={openEditModal}
                    onDelete={handleDeleteTask}
                    onMoveTask={handleMoveTask}
                  />
                </>
              )}
            </div>
          ) : (
            <div id="linear_task_list_section" className="space-y-3 max-w-5xl mx-auto">
              {loading ? (
                // Linear rows skeleton loaders
                Array.from({ length: 4 }).map((_, rIdx) => (
                  <div
                    key={`skeleton_row_${rIdx}`}
                    className="h-16 rounded-xl border border-zinc-900 bg-zinc-950/10 p-4 animate-pulse flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 w-1/2">
                      <div className="h-4 w-4 bg-zinc-900/60 rounded-full" />
                      <div className="h-4 bg-zinc-900/40 rounded w-2/3" />
                    </div>
                    <div className="h-4 bg-zinc-900/40 rounded w-20" />
                  </div>
                ))
              ) : filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-zinc-900 bg-zinc-950/20 p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
                    <Inbox className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-300">No tasks matched your search</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm leading-relaxed">
                    Try altering your query parameters, cleaning filters, or quickly add a new sprint task to begin.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.map((task) => (
                      <TaskRow
                        key={task._id}
                        task={task}
                        onEdit={openEditModal}
                        onDelete={handleDeleteTask}
                        onMove={handleMoveTask}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Floating Modal Backdrop and Animation Presence */}
      <AnimatePresence>
        {isModalOpen && (
          <TaskModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleModalSubmit}
            task={editingTask}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Alerts (Toasts) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 text-xs font-semibold text-white shadow-xl backdrop-blur-md flex items-center gap-2 border-cyan-500/25"
          >
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
