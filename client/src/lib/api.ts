import axios from 'axios';

// Auth is an httpOnly cookie set by the API, so requests just need credentials.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

export const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'We could not reach the server. Please check your connection and try again.';
    return err.response.data?.message || err.message || 'Something went wrong';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
};

export const getStatus = (err: unknown): number | undefined => (axios.isAxiosError(err) ? err.response?.status : undefined);

export default api;
