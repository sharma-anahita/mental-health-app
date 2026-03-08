import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await authService.register({ name, email, password });
      if (token) {
        // Token is stored by authService.register()
        navigate('/dashboard');
      } else {
        setError('No token received');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-600">Start your journey — create an account.</p>
        </div>

        <form onSubmit={submit}>
          <div className="space-y-4">
            <label className="block">
              <div className="text-sm font-medium text-slate-700 mb-1">Name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium text-slate-700 mb-1">Email</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium text-slate-700 mb-1">Password</div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </label>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Creating…' : 'Create account'}
              </button>
            </div>
          </div>
        </form>
        <div className="mt-4">
          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
