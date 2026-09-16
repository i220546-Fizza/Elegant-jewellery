import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const deniedByRole = !loading && !!user && adminOnly && user.role !== 'admin';

  useEffect(() => {
    if (deniedByRole) {
      toast.error("This account doesn't have admin access.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deniedByRole]);

  if (loading) return <LoadingSpinner fullScreen label="Checking your session" />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (deniedByRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
