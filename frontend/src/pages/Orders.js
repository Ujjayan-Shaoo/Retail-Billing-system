import React, { useEffect, useState } from 'react';
import { orderAPI } from '../services/api';
import { InvoiceView } from './Billing';
import toast from 'react-hot-toast';

// ─── ADMIN: All Orders Page ──────────────────────────────────
// Admin sees every order from every customer.

export default function Orders() {
  const [orders, setOrders]     = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    orderAPI.getAll()
      .then(r => setOrders(r.data.reverse()))
      .catch(() => toast.error('Failed to load orders'));
  }, []);

  const filtered = search.length > 0
    ? orders.filter(o =>
        o.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customer?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">All Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
        <div className="search-bar">
          <input
            placeholder="Search by invoice number or customer name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Orders table */}
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Date</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className="empty-state">No orders found</td></tr>
                ) : filtered.map(order => (
                  <tr key={order.id} onClick={() => setSelected(order)}
                    style={{ cursor: 'pointer', background: selected?.id === order.id ? 'var(--surface2)' : '' }}>
                    <td>
                      <strong style={{ color: 'var(--primary)', fontSize: 12 }}>{order.invoiceNumber}</strong>
                    </td>
                    <td>
                      <div>{order.customer?.name || 'Walk-in'}</div>
                      {order.customer?.phone && (
                        <div className="text-muted" style={{ fontSize: 11 }}>{order.customer.phone}</div>
                      )}
                    </td>
                    <td><strong>₹{Number(order.totalAmount).toFixed(2)}</strong></td>
                    <td className="text-muted" style={{ fontSize: 12 }}>
                      {new Date(order.orderDate).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice detail */}
        <div className="card">
          {selected ? (
            <InvoiceView invoice={selected} onClose={null} />
          ) : (
            <div className="empty-state">
              <p>Click an order to view invoice</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
