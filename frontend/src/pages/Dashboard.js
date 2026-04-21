import React, { useEffect, useState } from 'react';
import { orderAPI, productAPI } from '../services/api';
import toast from 'react-hot-toast';

// ─── ADMIN Dashboard ─────────────────────────────────────────

export default function Dashboard({ navigate }) {
  const [data, setData]       = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([orderAPI.getDashboard(), productAPI.getLowStock()])
      .then(([dashRes, lowRes]) => {
        setData(dashRes.data);
        setLowStock(lowRes.data.products || []);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><p>Loading dashboard…</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Today's sales overview</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('billing')}>
          + New Bill
        </button>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>💰</div>
          <div className="stat-info">
            <label>Today's Sales</label>
            <h3>₹{Number(data?.todaysSales || 0).toFixed(2)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>🧾</div>
          <div className="stat-info">
            <label>Today's Orders</label>
            <h3>{data?.todaysOrders || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>📦</div>
          <div className="stat-info">
            <label>Total Products</label>
            <h3>{data?.totalProducts || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}>⚠️</div>
          <div className="stat-info">
            <label>Low Stock Items</label>
            <h3>{lowStock.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Top products */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top 5 Products</span>
          </div>
          {data?.topProducts?.length > 0 ? (
            <table>
              <thead><tr><th>#</th><th>Product</th><th>Qty Sold</th></tr></thead>
              <tbody>
                {data.topProducts.map((p, i) => (
                  <tr key={i}>
                    <td><span className="badge badge-info">{i + 1}</span></td>
                    <td>{p.productName}</td>
                    <td><strong>{p.totalQuantitySold}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state"><p>No sales data yet</p></div>
          )}
        </div>

        {/* Low stock alerts */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Low Stock Alerts!</span>
            <button className="btn btn-sm btn-outline" onClick={() => navigate('products')}>Manage</button>
          </div>
          {lowStock.length > 0 ? (
            <table>
              <thead><tr><th>Product</th><th>Stock</th><th>Status</th></tr></thead>
              <tbody>
                {lowStock.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.stock} {p.unit || 'pcs'}</td>
                    <td>
                      <span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {p.stock === 0 ? 'Out of Stock' : 'Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state"><p>✅ All products well stocked</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
