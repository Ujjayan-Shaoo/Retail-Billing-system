import React, { useEffect, useState, useCallback } from 'react';
import { productAPI } from '../services/api';
import toast from 'react-hot-toast';

// ─── ADMIN: Product Management ───────────────────────────────

const EMPTY = { name: '', description: '', category: '', price: '', stock: '', unit: 'pcs' };
const CATEGORIES = ['Electronics','Grocery','Clothing','Beverages','Stationery','Other'];
const UNITS = ['pcs','kg','g','litre','ml','dozen','box','pack'];

export default function Products() {
  const [products, setProducts]   = useState([]);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [lowIds, setLowIds]       = useState(new Set());

  const load = useCallback(() => {
    productAPI.getAll().then(r => setProducts(r.data));
    productAPI.getLowStock().then(r =>
      setLowIds(new Set((r.data.products || []).map(p => p.id)))
    );
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = search.length > 1
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, description: p.description || '', category: p.category, price: p.price, stock: p.stock, unit: p.unit || 'pcs' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock || !form.category)
      return toast.error('Fill all required fields');
    try {
      editing
        ? await productAPI.update(editing, form)
        : await productAPI.create(form);
      toast.success(editing ? 'Product updated!' : 'Product added!');
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await productAPI.delete(id);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
        <div className="search-bar">
          <input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="empty-state">No products found</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={p.id}>
                  <td className="text-muted">{i + 1}</td>
                  <td>
                    <strong>{p.name}</strong>
                    {p.description && <div className="text-muted" style={{ fontSize: 11 }}>{p.description}</div>}
                  </td>
                  <td><span className="badge badge-info">{p.category}</span></td>
                  <td><strong>₹{Number(p.price).toFixed(2)}</strong></td>
                  <td>{p.stock} {p.unit}</td>
                  <td>
                    {p.stock === 0
                      ? <span className="badge badge-danger">Out of Stock</span>
                      : lowIds.has(p.id)
                        ? <span className="badge badge-warning">Low</span>
                        : <span className="badge badge-success">In Stock</span>
                    }
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input placeholder="Product name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input placeholder="Optional" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="">Select…</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input type="number" min="0" placeholder="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
