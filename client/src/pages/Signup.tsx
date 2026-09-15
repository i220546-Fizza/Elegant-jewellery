import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Create Account | Elegant Jewellery';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created! Welcome to Elegant Jewellery.');
      navigate('/');
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
          <p className="section-kicker">Join Us</p>
          <h1 className="mt-2 font-display text-3xl text-brown-dark">Create Account</h1>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="input-luxe" />
          <input
            required
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-luxe"
          />
          <input
            required
            type="password"
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-luxe"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-brown-light">
          Already have an account?{' '}
          <Link to="/login" className="text-champagne-dark hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
