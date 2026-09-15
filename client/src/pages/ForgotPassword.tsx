import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { requestPasswordReset } from '../services/authService';
import { getErrorMessage } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Forgot Password | Elegant Jewellery';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { resetToken } = await requestPasswordReset(email);
      setSent(true);
      toast.success('Reset instructions generated');
      if (resetToken) {
        // Demo build has no email provider configured, so the reset link is
        // surfaced directly instead of being emailed.
        setTimeout(() => navigate(`/reset-password/${resetToken}`), 1200);
      }
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
          <p className="section-kicker">Account Recovery</p>
          <h1 className="mt-2 font-display text-3xl text-brown-dark">Forgot Password</h1>
          <p className="mt-3 text-sm text-brown-light">
            Enter your email address and we'll help you reset your password.
          </p>
        </div>
        {sent ? (
          <p className="mt-8 rounded-lg bg-champagne/10 p-4 text-center text-sm text-brown-dark">
            If an account exists for {email}, reset instructions have been generated. Redirecting you now...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              required
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-luxe"
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-brown-light">
          Remembered your password?{' '}
          <Link to="/login" className="text-champagne-dark hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
