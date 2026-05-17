import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const guestEmail = 'guest@gmail.com';
  const guestPassword = 'guestlogsin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillGuestCredentials = () => {
    setEmail(guestEmail);
    setPassword(guestPassword);
    setError(null);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await authService.login({ email, password });
      if (token) {
        // Token is stored by authService.login()
        navigate('/dashboard');
      } else {
        setError('No token received');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    setError(null);
    setLoading(true);
    try {
      const credential = response.credential;
      if (!credential) {
        setError('Google sign-in did not return a credential.');
        return;
      }

      const token = await authService.googleLogin(credential);
      if (token) {
        navigate('/dashboard');
      } else {
        setError('No token received');
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-600">Enter your account credentials to continue.</p>
        </div>

        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Guest Access</p>
              <p className="mt-1 text-sm text-emerald-900">Email: <span className="font-semibold">{guestEmail}</span></p>
              <p className="text-sm text-emerald-900">Password: <span className="font-semibold">{guestPassword}</span></p>
            </div>
            <button
              type="button"
              onClick={fillGuestCredentials}
              className="shrink-0 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
            >
              Use guest
            </button>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="space-y-4">
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
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </div>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {googleClientId ? (
          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google sign-in was cancelled or failed.')} text="signin_with" />
          </div>
        ) : (
          <p className="text-center text-xs text-slate-500">
            Google sign-in is disabled until <span className="font-medium">VITE_GOOGLE_CLIENT_ID</span> is configured.
          </p>
        )}

        <div className="mt-4">
          <p className="text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
