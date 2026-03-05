import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Signup({ navigate }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (form.phone && !/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit phone number';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    const result = await register(form.name, form.email, form.password, form.phone);
    setLoading(false);
    if (result.success) {
      navigate('home');
    } else {
      setApiError(result.message || 'Registration failed. Please try again.');
    }
  };

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
    setApiError('');
  };

  // Password strength
  const getStrength = (p) => {
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 3) return { level: 2, label: 'Fair', color: '#f59e0b' };
    return { level: 3, label: 'Strong', color: '#22c55e' };
  };
  const strength = getStrength(form.password);

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left signup-left">
        <div className="auth-left-content">
          <div className="auth-brand" onClick={() => navigate('home')}>
            <span className="auth-brand-icon">🔥</span>
            <span className="auth-brand-name">CraveIt</span>
          </div>
          <div className="auth-headline">
            <h1>Join the<br /><span className="auth-highlight">craving</span><br />community.</h1>
            <p>Create your free account and get your first order delivered in under 30 minutes.</p>
          </div>
          <div className="signup-perks">
            {[
              { icon: '🎁', title: '10% off first order', desc: 'Use code NEWUSER on checkout' },
              { icon: '📍', title: 'Save addresses', desc: 'Quick checkout every time' },
              { icon: '📦', title: 'Track live', desc: 'Real-time order tracking + OTP' },
              { icon: '🏷️', title: 'Exclusive deals', desc: 'Member-only coupons & offers' },
            ].map(p => (
              <div key={p.title} className="signup-perk">
                <span className="perk-icon">{p.icon}</span>
                <div>
                  <p className="perk-title">{p.title}</p>
                  <p className="perk-desc">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-bg-blobs">
          <div className="auth-blob b1" /><div className="auth-blob b2" /><div className="auth-blob b3" />
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2>Create account ✨</h2>
            <p>Join thousands of food lovers on CraveIt</p>
          </div>

          {apiError && <div className="auth-alert error">⚠️ {apiError}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {/* Name */}
            <div className={`auth-field ${errors.name ? 'has-error' : ''}`}>
              <label>Full Name *</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">👤</span>
                <input type="text" placeholder="Your full name"
                  value={form.name} onChange={e => set('name', e.target.value)} autoComplete="name" />
              </div>
              {errors.name && <span className="auth-err">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className={`auth-field ${errors.email ? 'has-error' : ''}`}>
              <label>Email Address *</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
              </div>
              {errors.email && <span className="auth-err">{errors.email}</span>}
            </div>

            {/* Phone */}
            <div className={`auth-field ${errors.phone ? 'has-error' : ''}`}>
              <label>Phone Number <span className="optional">(optional)</span></label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">📞</span>
                <input type="tel" placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value.replace(/\D/g,'').slice(0,10))} />
              </div>
              {errors.phone && <span className="auth-err">{errors.phone}</span>}
            </div>

            {/* Password */}
            <div className={`auth-field ${errors.password ? 'has-error' : ''}`}>
              <label>Password *</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={e => set('password', e.target.value)} autoComplete="new-password" />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Strength meter */}
              {form.password && (
                <div className="strength-meter">
                  <div className="strength-bars">
                    {[1,2,3].map(l => (
                      <div key={l} className="strength-bar"
                        style={{ background: strength.level >= l ? strength.color : 'var(--border)' }} />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
              {errors.password && <span className="auth-err">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className={`auth-field ${errors.confirm ? 'has-error' : ''}`}>
              <label>Confirm Password *</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔐</span>
                <input type={showPass ? 'text' : 'password'} placeholder="Re-enter password"
                  value={form.confirm} onChange={e => set('confirm', e.target.value)} autoComplete="new-password" />
                {form.confirm && form.confirm === form.password && (
                  <span className="match-check">✓</span>
                )}
              </div>
              {errors.confirm && <span className="auth-err">{errors.confirm}</span>}
            </div>

            <button type="submit" className={`auth-submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? <span className="auth-spinner" /> : '🎉 Create My Account'}
            </button>
          </form>

          <p className="auth-terms">
            By creating an account, you agree to our <button>Terms of Service</button> and <button>Privacy Policy</button>.
          </p>

          <p className="auth-switch">
            Already have an account?{' '}
            <button onClick={() => navigate('login')}>Sign in →</button>
          </p>
        </div>
      </div>
    </div>
  );
}
