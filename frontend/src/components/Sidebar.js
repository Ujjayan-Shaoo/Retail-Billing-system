import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { section: 'Main' },
  { label: 'Dashboard',  icon: '📊', page: 'dashboard' },
  { label: 'Billing',    icon: '🧾', page: 'billing' },
  { section: 'Management' },
  { label: 'Products',   icon: '📦', page: 'products' },
  { label: 'Customers',  icon: '👤', page: 'customers' },
  { label: 'Orders',     icon: '📋', page: 'orders' },
];

const CUSTOMER_NAV = [
  { section: 'Shopping' },
  { label: 'Place Order', icon: '🛒', page: 'shop' },
  { label: 'My Orders',   icon: '📋', page: 'myorders' },
];

export default function Sidebar({ current, navigate }) {
  const { dark, toggle } = useTheme();
  const { auth, logout } = useAuth();

  const isAdmin = auth?.role === 'ADMIN';
  const NAV = isAdmin ? ADMIN_NAV : CUSTOMER_NAV;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Retail<span>Billing</span></h2>
        <p>{isAdmin ? '⚙️ Admin Panel' : '🛒 Customer Portal'}</p>
      </div>

      {/* User badge */}
      <div style={{
        margin: '0 12px 4px', padding: '10px 12px',
        background: 'rgba(255,255,255,0.05)', borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: isAdmin ? '#3b82f6' : '#10b981',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
        }}>
          {isAdmin ? '⚙️' : '👤'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 600,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {auth?.username}
          </div>
          <div style={{ color: isAdmin ? '#93c5fd' : '#6ee7b7', fontSize: 11 }}>
            {isAdmin ? 'Administrator' : 'Customer'}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((item, i) =>
          item.section ? (
            <div key={i} className="nav-section">{item.section}</div>
          ) : (
            <button key={i}
              className={`nav-item ${current === item.page ? 'active' : ''}`}
              onClick={() => navigate(item.page)}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={toggle} style={{ borderRadius: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 16 }}>{dark ? '☀️' : '🌙'}</span>
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button className="nav-item" onClick={logout} style={{ borderRadius: 8, color: '#fca5a5' }}>
          <span style={{ fontSize: 16 }}>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
