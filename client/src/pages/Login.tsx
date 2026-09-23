import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../components/account/AuthShell';
import PasswordField from '../components/account/PasswordField';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';
import { useTitle } from '../lib/useTitle';

const Login = () => {
  useTitle('Sign in');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user && !busy) return <Navigate to={from || (user.role === 'admin' ? '/admin' : '/account')} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}`);
      navigate(from || (u.role === 'admin' ? '/admin' : '/account'), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in">
      <form onSubmit={submit} className="space-y-8">
        <label className="block">
          <span className="label">Email</span>
          <input className="field" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <PasswordField label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-stone underline-offset-4 hover:text-ink hover:underline">
            Forgot your password?
          </Link>
        </div>
        {error && (
          <p role="alert" className="border-l-2 border-gold pl-4 text-sm">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn-dark w-full">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-10 text-sm text-stone">
        New to NB Classic Scents?{' '}
        <Link to="/register" state={location.state} className="text-ink underline decoration-gold underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
};

export default Login;
