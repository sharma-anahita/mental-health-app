import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import authService from '../../services/authService';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Invalid reset link. Please request a new password reset email.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword({ token, newPassword });
      setSuccess(res.message || 'Password has been reset successfully.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err?.message || 'Could not reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-slate-900">Reset password</h1>
          <p className="mt-1 text-sm text-slate-600">Enter a new password for your account.</p>
        </div>

        <form onSubmit={submit}>
          <div className="space-y-4">
            <label className="block">
              <div className="text-sm font-medium text-slate-700 mb-1">New password</div>
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                minLength={8}
                required
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium text-slate-700 mb-1">Confirm new password</div>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                minLength={8}
                required
              />
            </label>

            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-emerald-700">{success}</div>}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Resetting…' : 'Reset password'}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4">
          <p className="text-center text-sm text-slate-600">
            Back to{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
