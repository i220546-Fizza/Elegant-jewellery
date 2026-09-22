import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import Reveal from '../components/Reveal';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.phone, form.password);
      navigate('/account', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not create your account. Please try again.';
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
          <h1 className="mt-6 text-center font-display text-3xl text-layers-ink">Create Account</h1>
          <p className="mt-1 text-center text-sm text-layers-muted">Join Layers for faster checkout and order tracking.</p>

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
              <label htmlFor="name" className="text-sm font-medium text-layers-ink">Full Name</label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-layers-ink">Email</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-layers-ink">Phone</label>
              <input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="text-sm font-medium text-layers-ink">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium text-layers-ink">Confirm</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-layers-primary py-3.5 text-sm font-semibold text-white transition-colors hover:bg-layers-primary-hover disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-layers-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-layers-primary">
              Log In
            </Link>
          </p>
        </div>
      </Reveal>
    </div>
  );
}
