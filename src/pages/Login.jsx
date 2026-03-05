import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ navigate }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate('home');
    } else {
      setApiError(result.message || 'Login failed. Please try again.');
    }
  };

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
    setApiError('');
  };

  return (
    <div className="auth-page">
      {/* Left Panel — Branding */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand" onClick={() => navigate('home')}>
            <span className="auth-brand-icon">🔥</span>
            <span className="auth-brand-name">CraveIt</span>
          </div>
          <div className="auth-headline">
            <h1>Good food is<br /><span className="auth-highlight">always a click</span><br />away.</h1>
            <p>Sign in to access your orders, saved addresses, and exclusive offers.</p>
          </div>
          <div className="auth-food-grid">
            {['🍔','🍕','🌮','🍜','🍣','🍰','🥤','🧆'].map((e, i) => (
              <div key={i} className="auth-food-orb" style={{ animationDelay: `${i * 0.15}s` }}>{e}</div>
            ))}
          </div>
          <div className="auth-stats">
            <div className="auth-stat"><span>50+</span><p>Menu Items</p></div>
            <div className="auth-stat"><span>4.9⭐</span><p>Rating</p></div>
            <div className="auth-stat"><span>30min</span><p>Avg Delivery</p></div>
          </div>
        </div>
        <div className="auth-bg-blobs">
          <div className="auth-blob b1" /><div className="auth-blob b2" /><div className="auth-blob b3" />
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2>Welcome back 👋</h2>
            <p>Sign in to your CraveIt account</p>
          </div>

          {apiError && (
            <div className="auth-alert error">
              ⚠️ {apiError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className={`auth-field ${errors.email ? 'has-error' : ''} ${form.email ? 'has-value' : ''}`}>
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="auth-err">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className={`auth-field ${errors.password ? 'has-error' : ''}`}>
              <label>Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  autoComplete="current-password"
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="auth-err">{errors.password}</span>}
            </div>

            <button type="submit" className={`auth-submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? <span className="auth-spinner" /> : '🚀 Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>or continue with demo</span></div>

          <button className="auth-demo-btn" onClick={() => { set('email','demo@craveit.in'); set('password','demo123'); }}>
            🎮 Fill Demo Credentials
          </button>

          <p className="auth-switch">
            Don't have an account?{' '}
            <button onClick={() => navigate('signup')}>Create one →</button>
          </p>
        </div>
      </div>
    </div>
  );
}
