import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from '../components/account/AuthShell';
import { authApi } from '../services';
import { getErrorMessage } from '../lib/api';
import { useTitle } from '../lib/useTitle';

const ForgotPassword = () => {
  useTitle('Forgot password');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<{ message: string; devResetToken?: string } | null>(null);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      setSent(await authApi.forgot(email));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell eyebrow="Account recovery" title="Forgot password">
      {sent ? (
        <div>
          <p className="text-[15px] leading-relaxed text-stone">{sent.message}</p>
          {sent.devResetToken && (
            <p className="mt-6 border border-dashed border-gold p-4 text-sm">
              Development mode (no email service configured):{' '}
              <Link to={`/reset-password/${sent.devResetToken}`} className="underline underline-offset-4">
                reset your password here
              </Link>
              .
            </p>
          )}
          <Link to="/login" className="btn-outline mt-10">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-8">
          <p className="text-sm text-stone">Enter the email for your account and we will send you a link to choose a new password.</p>
          <label className="block">
            <span className="label">Email</span>
            <input className="field" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {error && <p role="alert" className="border-l-2 border-gold pl-4 text-sm">{error}</p>}
          <button type="submit" disabled={busy} className="btn-dark w-full">
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
          <Link to="/login" className="block text-center text-xs text-stone hover:text-ink">
            Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
