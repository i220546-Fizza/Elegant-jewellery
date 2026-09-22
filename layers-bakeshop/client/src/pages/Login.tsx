import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import Reveal from '../components/Reveal';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || '/account';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-layers-surface-alt px-5 py-28">
      <Reveal className="w-full max-w-md">
        <div className="rounded-3xl border border-layers-border bg-layers-surface p-8 shadow-sm sm:p-10">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h1 className="mt-6 text-center font-display text-3xl text-layers-ink">Welcome Back</h1>
          <p className="mt-1 text-center text-sm text-layers-muted">Log in to track orders and checkout faster.</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex items-start gap-2 rounded-xl bg-layers-error/10 px-4 py-3 text-sm text-layers-error"
              role="alert"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-layers-ink">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-layers-ink">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-layers-primary py-3.5 text-sm font-semibold text-white transition-colors hover:bg-layers-primary-hover disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-layers-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-layers-primary">
              Register
            </Link>
          </p>
        </div>
      </Reveal>
    </div>
  );
}
