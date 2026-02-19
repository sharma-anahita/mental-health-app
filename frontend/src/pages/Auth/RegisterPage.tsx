import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { PageTitle, BodyText } from '../../components/ui/Typography';
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
        localStorage.setItem('token', token);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="max-w-md w-full">
        <div className="mb-4">
          <PageTitle>Create account</PageTitle>
          <BodyText className="text-slate-600">Start your journey — create an account.</BodyText>
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating…' : 'Create account'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
