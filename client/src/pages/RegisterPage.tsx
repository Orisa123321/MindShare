import { useState, type FormEvent } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

function getPasswordStrength(p: string): { score: number; label: string; color: string } {
  let score = 0;
  if (p.length >= 6) score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 1) return { score: 1, label: 'Weak', color: '#ff6b6b' };
  if (score <= 3) return { score: 2, label: 'Fair', color: '#ffc107' };
  return { score: 3, label: 'Strong', color: '#00d68f' };
}

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const strength = password ? getPasswordStrength(password) : null;

  const validate = (): string | null => {
    if (username.length < 3) return 'Username must be at least 3 characters.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPass) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left branding panel (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center items-center px-12"
        style={{ background: 'linear-gradient(135deg, var(--color-dark-bg) 0%, var(--color-primary-900) 100%)' }}
      >
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-secondary-400/10 blur-3xl" />

        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center shadow-lg">
              <BookOpen size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold gradient-text mb-3">Join MindShare</h1>
          <p className="text-lg font-medium text-white/70 mb-12">Start your collaborative learning journey</p>

          <div className="glass rounded-2xl p-8 text-left animate-float">
            <Sparkles size={28} className="text-primary-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">AI-Powered Learning</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Coming soon: automatic material summarization, smart tagging, and AI-assisted answers for your study questions.
            </p>
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
            <span className="text-xl font-extrabold gradient-text">MindShare</span>
          </div>

          <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text)' }}>Create account</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Join thousands of students learning together</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium border border-red-500/30 animate-slide-down"
              style={{ background: 'rgba(255,107,107,0.08)', color: 'var(--color-danger)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="register-username"
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User size={16} />}
              autoComplete="username"
            />
            <Input
              id="register-email"
              type="email"
              label="Email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              autoComplete="email"
            />
            <div>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPass ? 'text' : 'password'}
                  label="Password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock size={16} />}
                  autoComplete="new-password"
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
              {/* Strength bar */}
              {strength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${(strength.score / 3) * 100}%`, background: strength.color }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>
            <Input
              id="register-confirm-password"
              type={showPass ? 'text' : 'password'}
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              leftIcon={<Lock size={16} />}
              error={confirmPass && confirmPass !== password ? 'Passwords do not match' : undefined}
              autoComplete="new-password"
            />
            <Button
              id="register-submit"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
            >
              Create Account
            </Button>
          </form>

          <p className="text-sm text-center mt-8" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
