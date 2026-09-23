import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../components/account/AuthShell';
import PasswordField, { strongPassword } from '../components/account/PasswordField';
import { authApi } from '../services';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';
import { useTitle } from '../lib/useTitle';

const ResetPassword = () => {
  useTitle('Choose a new password');
  const { token = '' } = useParams();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strongPassword(password)) return setError('Password must be at least 8 characters and include a letter and a number');
    if (password !== confirm) return setError('Passwords do not match');
    setBusy(true);
    setError('');
    try {
      setUser(await authApi.reset(token, password));
      toast.success('Your password has been updated');
      navigate('/account', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell eyebrow="Account recovery" title="New password">
      <form onSubmit={submit} className="space-y-8">
        <PasswordField label="New password" value={password} onChange={setPassword} autoComplete="new-password" showRules />
        <PasswordField label="Confirm password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        {error && <p role="alert" className="border-l-2 border-gold pl-4 text-sm">{error}</p>}
        <button type="submit" disabled={busy} className="btn-dark w-full">
          {busy ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  );
};

export default ResetPassword;
