import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth_container" className="flex min-h-screen items-center justify-center bg-radial from-zinc-950 via-slate-950 to-black px-4 py-12 font-sans select-none">
      {/* Background Decorative Accents */}
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

      <motion.div
        id="auth_card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-90 w-full bg-zinc-900/40 p-8 backdrop-blur-xl shadow-2xl shadow-cyan-950/10"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30 shadow-inner">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white font-sans bg-gradient-to-r from-white via-zinc-250 to-zinc-400 bg-clip-text text-transparent">
            Task Manager
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400">
            {isLogin ? 'Welcome back. Lock in and crush your daily sprints.' : 'Unleash extreme focus. Build, iterate, and ship tasks.'}
          </p>
        </div>

        {/* Tab Toggle Control */}
        <div className="relative mt-8 flex rounded-lg bg-zinc-950/80 p-1 border border-zinc-900">
          <button
            id="login_tab_btn"
            type="button"
            className={`relative flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ${
              isLogin ? 'text-white' : 'text-zinc-500 hover:text-zinc-350'
            }`}
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
          >
            {isLogin && (
              <motion.div
                layoutId="active_tab_bg"
                className="absolute inset-0 rounded-md bg-zinc-800 border border-zinc-700/40"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              <LogIn className="h-3.5 w-3.5 text-cyan-450 text-cyan-400" />
              Sign In
            </span>
          </button>
          <button
            id="register_tab_btn"
            type="button"
            className={`relative flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ${
              !isLogin ? 'text-white' : 'text-zinc-500 hover:text-zinc-355'
            }`}
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
          >
            {!isLogin && (
              <motion.div
                layoutId="active_tab_bg"
                className="absolute inset-0 rounded-md bg-zinc-800 border border-zinc-700/40"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              <UserPlus className="h-3.5 w-3.5 text-indigo-400" />
              Sign Up
            </span>
          </button>
        </div>

        {/* Animated Error Toast */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              className="mt-4 overflow-hidden"
            >
              <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="name-input"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-1.5"
              >
                <label htmlFor="auth_name" className="text-xs font-medium text-zinc-400">Full Name</label>
                <input
                  id="auth_name"
                  type="text"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Steve Smith"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm font-normal text-white placeholder-zinc-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-200"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label htmlFor="auth_email" className="text-xs font-medium text-zinc-400">Email Address</label>
            <input
              id="auth_email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm font-normal text-white placeholder-zinc-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-200"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="auth_password" className="text-xs font-medium text-zinc-400">Password</label>
            <input
              id="auth_password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm font-normal text-white placeholder-zinc-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-200"
            />
          </div>

          <motion.button
            id="auth_submit_btn"
            whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 py-3 text-sm font-semibold text-white transition-all cursor-pointer shadow-lg shadow-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500 leading-relaxed">
          {isLogin ? (
            <>
              New to Task Manager?{' '}
              <button
                type="button"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition cursor-pointer"
                onClick={() => setIsLogin(false)}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition cursor-pointer"
                onClick={() => setIsLogin(true)}
              >
                Sign in instead
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}
