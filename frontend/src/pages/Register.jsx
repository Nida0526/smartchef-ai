import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { authApi } from '../lib/api';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthHero from '../components/AuthHero';

function PasswordStrength({ password }) {
  const score = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  if (!password) return null;

  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#34d399'];
  const level = Math.min(score, 4);

  return (
    <div className="pw-strength">
      <div className="pw-strength-bar">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} style={{ background: i <= level ? colors[level] : undefined }} />
        ))}
      </div>
      <span style={{ color: colors[level] }}>{labels[level]}</span>
    </div>
  );
}

export default function Register({ setToken }) {
  const { notify } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'At least 8 characters';
    if (!form.confirm) errs.confirm = 'Please confirm your password';
    else if (form.confirm !== form.password) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await authApi.register({ name: form.name, email: form.email, password: form.password });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      notify('Account created!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setErrors({ _global: msg });
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: undefined }));
  };

  return (
    <div className="auth-wrapper">
      <AuthHero />
      <div className="glass-panel auth-box">
        <h2>Create Account</h2>
        {errors._global && <div className="form-error-banner">{errors._global}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Name"
            id="reg-name"
            type="text"
            placeholder="Chef Your Name"
            value={form.name}
            onChange={update('name')}
            error={errors.name}
            autoComplete="name"
          />
          <Input
            label="Email"
            id="reg-email"
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            id="reg-pw"
            type={showPw ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            autoComplete="new-password"
            hint="Use a mix of letters, numbers, and symbols"
            suffix={
              <button
                type="button"
                className="pw-toggle"
                tabIndex={-1}
                onClick={() => setShowPw(s => !s)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <PasswordStrength password={form.password} />
          <Input
            label="Confirm password"
            id="reg-confirm"
            type={showPw ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={form.confirm}
            onChange={update('confirm')}
            error={errors.confirm}
            autoComplete="new-password"
            suffix={form.confirm && (
              form.confirm === form.password
                ? <span className="pw-match"><CheckCircle2 size={16} /></span>
                : <span className="pw-mismatch"><XCircle size={16} /></span>
            )}
          />
          <Button type="submit" loading={loading} disabled={loading}>
            Create Account
          </Button>
        </form>
        <p className="auth-redirect">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}