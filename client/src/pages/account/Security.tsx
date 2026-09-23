import { useState } from 'react';
import toast from 'react-hot-toast';
import PasswordField, { strongPassword } from '../../components/account/PasswordField';
import { accountApi } from '../../services';
import { getErrorMessage } from '../../lib/api';
import { useTitle } from '../../lib/useTitle';

const Security = () => {
  useTitle('Password');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strongPassword(next)) return toast.error('Password must be at least 8 characters and include a letter and a number');
    if (next !== confirm) return toast.error('New passwords do not match');
    setBusy(true);
    try {
      await accountApi.changePassword(current, next);
      toast.success('Password updated. Other devices have been signed out.');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="font-serif text-3xl">Change password</h2>
      <form onSubmit={submit} className="mt-8 space-y-8">
        <PasswordField label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" />
        <PasswordField label="New password" value={next} onChange={setNext} autoComplete="new-password" showRules />
        <PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        <button type="submit" disabled={busy} className="btn-dark">
          {busy ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </div>
  );
};

export default Security;
