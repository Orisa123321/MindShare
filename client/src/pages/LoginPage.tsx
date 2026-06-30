import { useState, type FormEvent } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, BookOpen, Users, FileText, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const features = [
  { icon: Users, title: 'Study Groups', desc: 'Find and join study partners' },
  { icon: FileText, title: 'Share Materials', desc: 'Upload and access resources' },
  { icon: MessageSquare, title: 'Q&A Forum', desc: 'Ask questions, get answers' },
];

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left branding panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center items-center px-12"
        style={{ background: 'linear-gradient(135deg, var(--color-dark-bg) 0%, var(--color-primary-900) 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-secondary-400/10 blur-3xl" />

        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center shadow-lg">
              <BookOpen size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold gradient-text mb-3">StudyShare</h1>
          <p className="text-lg font-medium text-white/70 mb-12">Learn together, grow together</p>

          {/* Feature cards */}
          <div className="space-y-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="glass rounded-xl p-4 flex items-center gap-4 text-left"
                style={{ animation: `float 3s ${i * 0.5}s infinite ease-in-out` }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0">
                  <f.icon size={20} className="text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{f.title}</p>
                  <p className="text-xs text-white/50">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center shadow-lg">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold gradient-text">StudyShare</span>
          </div>

          <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text)' }}>Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Sign in to continue learning</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium border border-red-500/30 animate-slide-down"
              style={{ background: 'rgba(255,107,107,0.08)', color: 'var(--color-danger)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="login-email"
              type="email"
              label="Email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              autoComplete="email"
            />
            <div className="relative">
              <Input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-[38px] p-1 rounded cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button
              id="login-submit"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          <p className="text-sm text-center mt-8" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
