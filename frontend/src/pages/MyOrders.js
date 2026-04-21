import React, { useEffect, useState } from 'react';
import { orderAPI } from '../services/api';
import { InvoiceView } from './Billing';
import toast from 'react-hot-toast';

// ─── CUSTOMER: My Orders Page ────────────────────────────────
// Customer can only see their own orders, not others'.

export default function MyOrders() {
  const [orders, setOrders]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    orderAPI.getMyOrders()
      .then(r => setOrders(r.data.reverse()))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><p>Loading orders…</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"> My Orders</h1>
          <p className="page-subtitle">{orders.length} orders placed</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card empty-state">
          <p>No orders yet. Place your first order!</p>
        </div>
      ) : (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Order list */}
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Invoice</th><th>Total</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} onClick={() => setSelected(o)}
                      style={{ cursor: 'pointer', background: selected?.id === o.id ? 'var(--surface2)' : '' }}>
                      <td>
                        <strong style={{ color: 'var(--primary)', fontSize: 12 }}>{o.invoiceNumber}</strong>
                      </td>
                      <td><strong>₹{Number(o.totalAmount).toFixed(2)}</strong></td>
                      <td className="text-muted" style={{ fontSize: 12 }}>
                        {new Date(o.orderDate).toLocaleDateString('en-IN')}
                      </td>
                      <td><span className="badge badge-success">{o.status}</span></td>
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
                <p>Click an order to view the invoice</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
