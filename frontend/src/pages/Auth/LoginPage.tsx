import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { PageTitle, BodyText } from '../../components/ui/Typography';
import authService from '../../services/authService';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await authService.login({ email, password });
      if (token) {
        localStorage.setItem('token', token);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="max-w-md w-full">
        <div className="mb-4">
          <PageTitle>Sign in</PageTitle>
          <BodyText className="text-slate-600">Enter your account credentials to continue.</BodyText>
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </div>
          </div>
        </form>
        <div className="mt-4">
          <BodyText className="text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Register
            </Link>
          </BodyText>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
