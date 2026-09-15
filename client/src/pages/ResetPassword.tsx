import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword as resetPasswordRequest } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Reset Password | Elegant Jewellery';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!token) return;
    setLoading(true);
    try {
      const { token: authToken } = await resetPasswordRequest(token, password);
      localStorage.setItem('ej_token', authToken);
      await refreshUser();
      toast.success('Password reset successfully!');
      navigate('/profile');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-luxe flex min-h-[70vh] items-center justify-center py-16">
      <div className="card-luxe w-full max-w-md p-8 sm:p-10">
        <div className="text-center">
          <p className="section-kicker">Almost There</p>
          <h1 className="mt-2 font-display text-3xl text-brown-dark">Reset Password</h1>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            required
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-luxe"
          />
          <input
            required
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-luxe"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
