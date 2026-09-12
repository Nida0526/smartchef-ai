import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../lib/api';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthHero from '../components/AuthHero';

export default function Login({ setToken }) {
  const { notify } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'At least 6 characters';
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
      const res = await authApi.login({ email: form.email, password: form.password });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      notify('Welcome back!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
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
        <h2>Welcome Back</h2>
        {errors._global && <div className="form-error-banner">{errors._global}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            id="login-email"
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            id="login-pw"
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            autoComplete="current-password"
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
          <Button type="submit" loading={loading} disabled={loading}>
            Sign In
          </Button>
        </form>
        <p className="auth-redirect">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}