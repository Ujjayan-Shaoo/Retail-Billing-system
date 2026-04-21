import React, { useEffect, useState } from 'react';
import { productAPI, orderAPI, customerAPI } from '../services/api';
import toast from 'react-hot-toast';

// ─── ADMIN Billing Page ──────────────────────────────────────
// Admin can search products, pick a customer (or walk-in), build cart, place order.
// Payment is always CASH. No discount. Invoice generated after order.

export default function Billing() {
  const [products, setProducts]       = useState([]);
  const [search, setSearch]           = useState('');
  const [cart, setCart]               = useState([]);
  const [customers, setCustomers]     = useState([]);
  const [selectedCust, setSelectedCust] = useState('');   // customer id
  const [walkInName, setWalkInName]   = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [invoice, setInvoice]         = useState(null);
  const [placing, setPlacing]         = useState(false);

  useEffect(() => {
    productAPI.getAll().then(r => setProducts(r.data));
    customerAPI.getAll().then(r => setCustomers(r.data));
  }, []);

  const filtered = search.length > 0
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const addToCart = (product) => {
    if (product.stock === 0) return toast.error('Out of stock!');
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) {
        if (ex.quantity >= product.stock) { toast.error('Max stock reached'); return prev; }
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSearch('');
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return setCart(prev => prev.filter(i => i.product.id !== id));
    const p = products.find(p => p.id === id);
    if (qty > p.stock) return toast.error('Insufficient stock');
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: qty } : i));
  };

  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return toast.error('Cart is empty!');
    setPlacing(true);
    try {
      const payload = {
        items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      };
      // Attach customer info
      if (selectedCust) {
        payload.customerId = Number(selectedCust);
      } else {
        payload.customerName  = walkInName  || 'Walk-in Customer';
        payload.customerPhone = walkInPhone || null;
      }

      const res = await orderAPI.create(payload);
      setInvoice(res.data);
      setCart([]);
      setSelectedCust('');
      setWalkInName('');
      setWalkInPhone('');
      setSearch('');
      toast.success('Bill created!');
      productAPI.getAll().then(r => setProducts(r.data));
      customerAPI.getAll().then(r => setCustomers(r.data));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order');
    } finally { setPlacing(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🧾 Billing</h1>
          <p className="page-subtitle">Create cash bills &amp; print invoices</p>
        </div>
      </div>

      {/* Invoice view */}
      {invoice && (
        <div className="card" style={{ marginBottom: 20, borderColor: '#10b981' }}>
          <InvoiceView invoice={invoice} onClose={() => setInvoice(null)} />
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left column */}
        <div>
          {/* Product search */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span className="card-title">Search Products</span></div>
            <div className="search-bar">
              <input
                placeholder="Type product name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            {search.length > 0 && (
              <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 10 }}>
                {filtered.length === 0
                  ? <p className="text-muted" style={{ padding: 8 }}>No products found</p>
                  : filtered.map(p => (
                    <div key={p.id} onClick={() => addToCart(p)} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                      background: 'var(--surface2)', marginBottom: 6,
                      border: '1px solid var(--border)', opacity: p.stock === 0 ? 0.5 : 1,
                    }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>{p.category} • {p.stock} {p.unit} left</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{Number(p.price).toFixed(2)}</div>
                        <div style={{ fontSize: 11, color: p.stock === 0 ? 'var(--danger)' : 'var(--success)' }}>
                          {p.stock === 0 ? 'Out of stock' : 'Click to add'}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* Customer selection */}
          <div className="card">
            <div className="card-header"><span className="card-title">Customer</span></div>
            <div className="form-group">
              <label>Registered Customer</label>
              <select value={selectedCust} onChange={e => setSelectedCust(e.target.value)}>
                <option value="">— Walk-in / New —</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.phone ? ` (${c.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {!selectedCust && (
              <div className="form-row">
                <div className="form-group">
                  <label>Walk-in Name</label>
                  <input placeholder="Customer name" value={walkInName}
                    onChange={e => setWalkInName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input placeholder="Phone (optional)" value={walkInPhone}
                    onChange={e => setWalkInPhone(e.target.value)} maxLength={10} />
                </div>
              </div>
            )}
            {/* Cash-only badge */}
            <div style={{
              marginTop: 8, padding: '10px 14px', borderRadius: 8,
              background: '#d1fae5', border: '1px solid #6ee7b7',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div>
                <div style={{ fontWeight: 600, color: '#065f46', fontSize: 13 }}>Payment: Cash Only</div>
                <div style={{ fontSize: 11, color: '#047857' }}>Invoice generated after order</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Cart ({cart.length} items)</span>
            {cart.length > 0 && (
              <button className="btn btn-sm btn-outline" onClick={() => setCart([])}>Clear</button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="empty-state"><p>Search and add products to cart</p></div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.product.id} className="cart-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{item.product.name}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>₹{Number(item.product.price).toFixed(2)} each</div>
                  </div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item.product.id, item.quantity - 1)}>−</button>
                    <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.product.id, item.quantity + 1)}>+</button>
                  </div>
                  <div style={{ minWidth: 80, textAlign: 'right', fontWeight: 700 }}>
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                  <button className="btn-icon" style={{ marginLeft: 6 }}
                    onClick={() => setCart(prev => prev.filter(i => i.product.id !== item.product.id))}>✕</button>
                </div>
              ))}
              <div className="divider" />
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
                <div className="flex justify-between font-bold" style={{ fontSize: 20 }}>
                  <span>Total (Cash)</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                className="btn btn-success"
                style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 15 }}
                onClick={handlePlaceOrder}
                disabled={placing}
              >
                {placing ? 'Processing…' : '✅ Place Order & Generate Invoice'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared Invoice View Component ───────────────────────────
export function InvoiceView({ invoice, onClose }) {
  return (
    <>
      <div className="invoice-container">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20 }}>RetailBilling</h2>
          <p className="text-muted">Cash Invoice</p>
          <div className="divider" />
        </div>
        <div className="grid-2" style={{ marginBottom: 12 }}>
          <div>
            <p className="text-muted" style={{ fontSize: 11 }}>INVOICE NO</p>
            <p><strong>{invoice.invoiceNumber}</strong></p>
          </div>
          <div className="text-right">
            <p className="text-muted" style={{ fontSize: 11 }}>DATE</p>
            <p><strong>{new Date(invoice.orderDate).toLocaleDateString('en-IN')}</strong></p>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <p className="text-muted" style={{ fontSize: 11 }}>CUSTOMER</p>
          <p><strong>{invoice.customer?.name || 'Walk-in Customer'}</strong></p>
          {invoice.customer?.phone && <p className="text-muted">{invoice.customer.phone}</p>}
        </div>
        <div className="divider" />
        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Unit Price</th><th className="text-right">Amount</th></tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, i) => (
              <tr key={i}>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>₹{Number(item.unitPrice).toFixed(2)}</td>
                <td className="text-right">₹{Number(item.totalPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="divider" />
        <div style={{ maxWidth: 240, marginLeft: 'auto' }}>
          <div className="flex justify-between font-bold" style={{ fontSize: 18 }}>
            <span>TOTAL</span><span>₹{Number(invoice.totalAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted mt-4" style={{ fontSize: 12 }}>
            <span>Payment Mode</span><span>CASH</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p className="text-muted" style={{ fontSize: 12 }}>Thank you for shopping with us!</p>
        </div>
      </div>
      <div className="flex gap-2 no-print" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
        {onClose && <button className="btn btn-outline" onClick={onClose}>Close</button>}
        <button className="btn btn-primary" onClick={() => window.print()}>Print Invoice</button>
      </div>
    </>
  );
}
