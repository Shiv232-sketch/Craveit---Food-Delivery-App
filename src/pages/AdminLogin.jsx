import React, { useState } from 'react';

const API = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:5000/api';

export default function AdminLogin({ onLogin }) {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Always clear old token first
    localStorage.removeItem('craveit_admin');

    try {
      const res  = await fetch(`${API}/auth/admin/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ 
          email:    form.email.trim(), 
          password: form.password 
        }),
      });

      const data = await res.json();
      console.log('Admin login response:', data); // debug

      if (data.success && data.token) {
        localStorage.setItem('craveit_admin', data.token);
        console.log('Token saved:', data.token.slice(0, 20) + '...'); // debug
        onLogin();
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.log('Backend offline, using demo mode');
      // Backend offline — demo mode
      if (form.email.trim() === 'admin@craveit.in' && form.password === 'admin123') {
        localStorage.setItem('craveit_admin', 'demo_admin');
        onLogin();
      } else {
        setError('Invalid credentials. Use admin@craveit.in / admin123');
      }
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
            <input 
              type="email" 
              placeholder="admin@craveit.in"
              value={form.email} 
              onChange={e => setForm({ ...form, email: e.target.value })} 
              required 
            />
          </div>
          <div className="admin-field">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={form.password} 
              onChange={e => setForm({ ...form, password: e.target.value })} 
              required 
            />
          </div>
          {error && <div className="admin-login-err">⚠️ {error}</div>}
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? <span className="admin-spin" /> : '🔐 Sign In to Admin'}
          </button>
        </form>
        <p className="admin-demo-hint">Use: admin@craveit.in / admin123</p>
      </div>
    </div>
  );
}
