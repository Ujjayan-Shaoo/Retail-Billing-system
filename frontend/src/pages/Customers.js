import React, { useEffect, useState } from 'react';
import { customerAPI } from '../services/api';
import toast from 'react-hot-toast';

// ─── ADMIN: Customer Management ──────────────────────────────
// Only admin can see all customers and their order history.

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [orders, setOrders]       = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ name: '', phone: '', email: '' });

  const load = () => customerAPI.getAll().then(r => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  const viewOrders = async (c) => {
    setSelected(c);
    const res = await customerAPI.getOrders(c.id);
    setOrders(res.data.reverse());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name is required');
    try {
      await customerAPI.create(form);
      toast.success('Customer added!');
      setShowModal(false);
      setForm({ name: '', phone: '', email: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add customer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await customerAPI.delete(id);
      toast.success('Deleted');
      if (selected?.id === id) setSelected(null);
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Customer</button>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Customer list */}
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={4} className="empty-state">No customers yet</td></tr>
                ) : customers.map(c => (
                  <tr key={c.id}
                    style={{ cursor: 'pointer', background: selected?.id === c.id ? 'var(--surface2)' : '' }}>
                    <td onClick={() => viewOrders(c)}><strong>{c.name}</strong></td>
                    <td onClick={() => viewOrders(c)}>{c.phone || '—'}</td>
                    <td className="text-muted" style={{ fontSize: 12 }} onClick={() => viewOrders(c)}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order history panel */}
        <div className="card">
          {selected ? (
            <>
              <div className="card-header">
                <span className="card-title"> {selected.name}'s Orders</span>
                <button className="btn-icon" onClick={() => setSelected(null)}>✕</button>
              </div>
              {orders.length === 0 ? (
                <div className="empty-state"><p>No orders yet</p></div>
              ) : orders.map(o => (
                <div key={o.id} style={{
                  padding: 12, borderRadius: 8,
                  background: 'var(--surface2)', marginBottom: 10,
                  border: '1px solid var(--border)',
                }}>
                  <div className="flex justify-between">
                    <strong style={{ fontSize: 12, color: 'var(--primary)' }}>{o.invoiceNumber}</strong>
                    <span className="badge badge-success">₹{Number(o.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                    {new Date(o.orderDate).toLocaleString('en-IN')}  Cash
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {o.items?.map((item, i) => (
                      <div key={i} className="text-muted" style={{ fontSize: 12 }}>
                        {item.productName} × {item.quantity} = ₹{Number(item.totalPrice).toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="empty-state"><p>Click a customer to view their order history</p></div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add Customer</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input placeholder="10-digit phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} maxLength={10} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input placeholder="Optional" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
