import React, { useEffect, useState } from 'react';
import { productAPI, orderAPI, customerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CustomerBilling() {
  const { auth } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch]     = useState('');
  const [cart, setCart]         = useState([]);
  const [invoice, setInvoice]   = useState(null);
  const [placing, setPlacing]   = useState(false);
  const [profile, setProfile]   = useState(null);

  useEffect(() => {
    productAPI.getAll().then(r => setProducts(r.data)).catch(() => {});
    customerAPI.getMe().then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const filtered = search.length > 0
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const addToCart = (product) => {
    if (product.stock === 0) { toast.error('Out of stock!'); return; }
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) {
        if (ex.quantity >= product.stock) { toast.error('Max stock reached'); return prev; }
        return prev.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSearch('');
  };

  const updateQty = (id, qty) => {
    if (qty < 1) { setCart(prev => prev.filter(i => i.product.id !== id)); return; }
    const p = products.find(p => p.id === id);
    if (p && qty > p.stock) { toast.error('Insufficient stock'); return; }
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: qty } : i));
  };

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) { toast.error('Cart is empty!'); return; }
    setPlacing(true);
    try {
      const payload = {
        customerId:    profile?.id    ?? null,
        customerName:  profile?.name  ?? null,
        customerPhone: profile?.phone ?? null,
        items: cart.map(i => ({
          productId: i.product.id,
          quantity:  i.quantity,
        })),
      };
      const res = await orderAPI.create(payload);
      setInvoice(res.data);
      setCart([]);
      setSearch('');
      toast.success('Order placed! 🎉');
      productAPI.getAll().then(r => setProducts(r.data));
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        'Failed to place order. Please try again.';
      toast.error(msg);
      console.error('Order error:', err.response?.data);
    } finally {
      setPlacing(false);
    }
  };

  // ── Invoice screen ───────────────────────────────────────────
  if (invoice) {
    // Backend returns raw Order entity — field names from Order.java:
    // invoice.invoiceNumber  → invoiceNumber
    // invoice.totalAmount    → totalAmount
    // invoice.items          → List<OrderItem>
    //   item.productName     → productName
    //   item.quantity        → quantity
    //   item.totalPrice      → totalPrice  (NOT subtotal)

    const invoiceNo  = invoice.invoiceNumber  || invoice.orderNumber || `#${invoice.id}`;
    const totalAmt   = invoice.totalAmount    || invoice.subtotal    || 0;

    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Order Confirmed!</h1>
        </div>

        <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <div style={{ fontSize: 52 }}>✅</div>
            <h2 style={{ color: '#10b981', margin: '8px 0 4px' }}>
              Order Placed Successfully
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              Invoice: <strong>{invoiceNo}</strong>
            </p>
          </div>

          <div className="divider" />

          {/* Items — Order.java → items → OrderItem.java fields */}
          {(invoice.items || []).map((item, idx) => (
            <div key={idx} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0', fontSize: 14,
            }}>
              <span>
                {item.productName || item.product?.name || `Item ${idx + 1}`}
                {' × '}{item.quantity}
              </span>
              <span>
                ₹{Number(item.totalPrice || item.subtotal || 0).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="divider" />

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontWeight: 700, fontSize: 20, padding: '4px 0 16px',
          }}>
            <span>Total</span>
            <span>₹{Number(totalAmt).toFixed(2)}</span>
          </div>

          <div style={{
            background: '#d1fae5', borderRadius: 8,
            padding: '10px 14px', fontSize: 13,
            color: '#065f46', marginBottom: 16,
          }}>
            💵 Please pay <strong>₹{Number(totalAmt).toFixed(2)}</strong> cash at the counter.
          </div>

          <button
            className="btn btn-success"
            style={{ width: '100%', justifyContent: 'center', padding: 10 }}
            onClick={() => setInvoice(null)}
          >
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  // ── Main billing UI ──────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Place Order</h1>
          <p className="page-subtitle">
            Shopping as:{' '}
            <strong>{profile?.name || auth?.customerName || auth?.username}</strong>
          </p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>

        {/* Product Search */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔍 Search Products</span>
          </div>
          <div className="search-bar" style={{ marginBottom: search.length > 0 ? 12 : 0 }}>
            <input
              placeholder="Type to search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {search.length > 0 && (
            <div style={{ maxHeight: 320, overflowY: 'auto', marginTop: 8 }}>
              {filtered.length === 0
                ? <p className="text-muted" style={{ padding: 8 }}>No products found</p>
                : filtered.map(p => (
                  <div key={p.id} onClick={() => addToCart(p)} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '10px 12px', borderRadius: 8,
                    cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                    background: 'var(--surface2)', marginBottom: 6,
                    border: '1px solid var(--border)',
                    opacity: p.stock === 0 ? 0.5 : 1,
                  }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {p.category} • {p.stock} {p.unit || 'pcs'} left
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        ₹{Number(p.price).toFixed(2)}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: p.stock === 0 ? 'var(--danger)' : 'var(--success)',
                      }}>
                        {p.stock === 0 ? 'Out of stock' : '+ Add to cart'}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          <div style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 8,
            background: '#d1fae5', border: '1px solid #6ee7b7',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 20 }}>💵</span>
            <div>
              <div style={{ fontWeight: 600, color: '#065f46', fontSize: 13 }}>
                Payment: Cash Only
              </div>
              <div style={{ fontSize: 11, color: '#047857' }}>
                Invoice will be generated after your order
              </div>
            </div>
          </div>
        </div>

        {/* Cart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"> Cart ({cart.length})</span>
            {cart.length > 0 && (
              <button className="btn btn-sm btn-outline" onClick={() => setCart([])}>
                Clear
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="empty-state">
              <p>Search and add products to cart</p>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.product.id} className="cart-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{item.product.name}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      ₹{Number(item.product.price).toFixed(2)} each
                    </div>
                  </div>
                  <div className="qty-control">
                    <button className="qty-btn"
                      onClick={() => updateQty(item.product.id, item.quantity - 1)}>−</button>
                    <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>
                      {item.quantity}
                    </span>
                    <button className="qty-btn"
                      onClick={() => updateQty(item.product.id, item.quantity + 1)}>+</button>
                  </div>
                  <div style={{ minWidth: 80, textAlign: 'right', fontWeight: 700 }}>
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                  <button className="btn-icon" style={{ marginLeft: 6 }}
                    onClick={() => setCart(prev =>
                      prev.filter(i => i.product.id !== item.product.id))}>✕</button>
                </div>
              ))}

              <div className="divider" />

              <div style={{
                background: 'var(--surface2)', borderRadius: 8,
                padding: '14px 16px', marginBottom: 16,
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontWeight: 700, fontSize: 20,
                }}>
                  <span>Total</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
                  Pay cash at the counter
                </div>
              </div>

              <button
                className="btn btn-success"
                style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 15 }}
                onClick={placeOrder}
                disabled={placing}
              >
                {placing ? ' Placing order…' : '✅ Place Order & Get Invoice'}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
