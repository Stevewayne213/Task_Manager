import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import { Loader2, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

function AppContent() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div id="loader_splash" className="flex min-h-screen items-center justify-center bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400">
            <Loader2 className="h-7 w-7 animate-spin" />
            <Sparkles className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase text-zinc-400 font-sans">Task Manager</h4>
            <p className="text-xs text-zinc-650 mt-1">Establishing authenticated session database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {token ? (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -15 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <Dashboard />
        </motion.div>
      ) : (
        <motion.div
          key="auth"
          initial={{ opacity: 0, scale: 0.98, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <AuthPage />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
