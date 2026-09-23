import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../components/account/AuthShell';
import PasswordField, { strongPassword } from '../components/account/PasswordField';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';
import { useTitle } from '../lib/useTitle';

const Register = () => {
  useTitle('Create an account');
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [form, setForm] = useState({ name: '', email: '', password: '', newsletter: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user && !busy) return <Navigate to={from || '/account'} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strongPassword(form.password)) {
      setError('Password must be at least 8 characters and include a letter and a number');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const u = await register(form);
      toast.success(`Welcome to NB Classic Scents, ${u.name.split(' ')[0]}`);
      navigate(from || '/account', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell eyebrow="Join the house" title="Create an account" image="/uploads/products/essence-2.webp">
      <form onSubmit={submit} className="space-y-8">
        <label className="block">
          <span className="label">Full name</span>
          <input className="field" autoComplete="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="block">
          <span className="label">Email</span>
          <input className="field" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <PasswordField label="Password" value={form.password} onChange={(password) => setForm({ ...form, password })} autoComplete="new-password" showRules />
        <label className="flex items-start gap-3 text-sm text-stone">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-ink" checked={form.newsletter} onChange={(e) => setForm({ ...form, newsletter: e.target.checked })} />
          Receive private previews of new creations and limited editions.
        </label>
        {error && (
          <p role="alert" className="border-l-2 border-gold pl-4 text-sm">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn-dark w-full">
          {busy ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-xs text-stone">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="underline underline-offset-4">
            terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline underline-offset-4">
            privacy policy
          </Link>
          .
        </p>
      </form>
      <p className="mt-10 text-sm text-stone">
        Already have an account?{' '}
        <Link to="/login" state={location.state} className="text-ink underline decoration-gold underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default Register;
