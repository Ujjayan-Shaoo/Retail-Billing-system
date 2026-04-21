import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ─── Login / Register Page ───────────────────────────────────
// Admin logs in with Admin / admin@123
// Customers register themselves, then log in

export default function Login() {
  const { login }  = useAuth();
  const [tab, setTab]     = useState('login');
  const [form, setForm]   = useState({ username: '', password: '', name: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return toast.error('Enter username and password');
    setLoading(true);
    try {
      const res = await authAPI.login({ username: form.username, password: form.password });
      login(res.data);
      toast.success(`Welcome back, ${res.data.username}!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.name)
      return toast.error('Name, username and password are required');
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data);
      toast.success('Account created! Welcome');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 18,
            background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
            display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 32, marginBottom: 14,
            boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
          }}>🏪</div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>
            Retail<span style={{ color: '#3b82f6' }}>Billing</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Point of Sale System
          </p>
        </div>

        <div className="card">
          {/* Tabs */}
          <div style={{
            display: 'flex', marginBottom: 24,
            background: 'var(--surface2)', borderRadius: 8, padding: 4,
          }}>
            {[
              { key: 'login',    label: 'Login' },
              { key: 'register', label: 'Register' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                flex: 1, padding: '8px', border: 'none', cursor: 'pointer',
                borderRadius: 6, fontWeight: 600, fontSize: 13,
                background: tab === t.key ? 'var(--primary)' : 'transparent',
                color: tab === t.key ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input placeholder="Enter your username" value={form.username}
                  onChange={e => set('username', e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Enter your password" value={form.password}
                  onChange={e => set('password', e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 8 }}
                disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name *</label>
                <input placeholder="Your full name" value={form.name}
                  onChange={e => set('name', e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label>Phone <span className="text-muted">(optional)</span></label>
                <input placeholder="10-digit phone number" value={form.phone}
                  onChange={e => set('phone', e.target.value)} maxLength={10} />
              </div>
              <div className="form-group">
                <label>Username *</label>
                <input placeholder="Choose a username" value={form.username}
                  onChange={e => set('username', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" placeholder="Choose a password" value={form.password}
                  onChange={e => set('password', e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 8 }}
                disabled={loading}>
                {loading ? 'Creating account…' : 'Create Customer Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
