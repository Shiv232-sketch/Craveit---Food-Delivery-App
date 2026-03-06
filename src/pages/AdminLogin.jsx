import React, { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    // Demo credentials — replace with real auth when backend is ready
    if (form.email === 'admin@craveit.in' && form.password === 'admin123') {
      localStorage.setItem('craveit_admin', 'true');
      onLogin();
    } else {
      setError('Invalid credentials. Use admin@craveit.in / admin123');
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <span>🔥</span>
          <h1>CraveIt</h1>
          <p>Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-field">
            <label>Email</label>
            <input type="email" placeholder="admin@craveit.in"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="admin-field">
            <label>Password</label>
            <input type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error && <div className="admin-login-err">⚠️ {error}</div>}
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? <span className="admin-spin" /> : '🔐 Sign In to Admin'}
          </button>
        </form>
        <p className="admin-demo-hint">Demo: admin@craveit.in / admin123</p>
      </div>
    </div>
  );
}
