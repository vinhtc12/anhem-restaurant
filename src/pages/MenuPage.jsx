import React, { useEffect, useState } from 'react'
import { menuItemsApi } from '../lib/supabase'
import { useToast } from '../components/Toast'

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫'
const CATEGORIES = ['Phở', 'Bún', 'Cơm', 'Đồ uống', 'Khai vị', 'Tráng miệng', 'Khác']

const DEFAULT_FORM = { name: '', price: '', category: 'Khác', available: true }

export default function MenuPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | item
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const toast = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await menuItemsApi.getAll()
    setItems(data || [])
    setLoading(false)
  }

  function openAdd() { setForm(DEFAULT_FORM); setModal('add') }
  function openEdit(item) { setForm({ name: item.name, price: item.price, category: item.category, available: item.available }); setModal(item) }
  function closeModal() { setModal(null); setForm(DEFAULT_FORM) }

  async function handleSave() {
    if (!form.name.trim()) { toast('Vui lòng nhập tên món', 'error'); return }
    if (!form.price || isNaN(Number(form.price))) { toast('Vui lòng nhập giá hợp lệ', 'error'); return }
    setSaving(true)
    const payload = { name: form.name.trim(), price: Number(form.price), category: form.category, available: form.available }
    let error
    if (modal === 'add') {
      ;({ error } = await menuItemsApi.create(payload))
    } else {
      ;({ error } = await menuItemsApi.update(modal.id, payload))
    }
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    toast(modal === 'add' ? 'Đã thêm món!' : 'Đã cập nhật!')
    closeModal(); load()
  }

  async function handleToggle(item) {
    const { error } = await menuItemsApi.update(item.id, { available: !item.available })
    if (error) toast(error.message, 'error')
    else { toast(item.available ? 'Đã tắt món' : 'Đã bật món'); load() }
  }

  async function handleDelete(item) {
    if (!confirm(`Xoá "${item.name}"?`)) return
    const { error } = await menuItemsApi.delete(item.id)
    if (error) toast(error.message, 'error')
    else { toast('Đã xoá món'); load() }
  }

  const categories = [...new Set(items.map(i => i.category))]
  const filtered = items.filter(item => {
    const matchCat = catFilter === 'all' || item.category === catFilter
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', color: 'var(--gold)' }}>Quản Lý Món Ăn</h1>
          <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 2 }}>{items.length} món · {items.filter(i => i.available).length} đang phục vụ</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Thêm món</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="input" placeholder="Tìm món..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 220 }} />
        <button onClick={() => setCatFilter('all')}
          className={`btn btn-sm ${catFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}>Tất cả</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)}
            className={`btn btn-sm ${catFilter === cat ? 'btn-primary' : 'btn-ghost'}`}>{cat}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🍜</div><p>Chưa có món ăn nào</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tên món</th><th>Danh mục</th><th>Giá bán</th><th>Trạng thái</th><th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>
                      <span style={{ background: 'var(--bg3)', padding: '3px 10px', borderRadius: 99,
                        fontSize: '0.75rem', color: 'var(--text2)' }}>{item.category}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--gold)' }}>{fmt(item.price)}</td>
                    <td>
                      <button onClick={() => handleToggle(item)}
                        className={`badge ${item.available ? 'badge-paid' : 'badge-cancelled'}`}
                        style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
                        {item.available ? '● Phục vụ' : '○ Tạm ngừng'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>✏️ Sửa</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item)}>🗑 Xoá</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <span style={{ fontWeight: 700 }}>{modal === 'add' ? '＋ Thêm món mới' : '✏️ Sửa món ăn'}</span>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Tên món *</label>
                <input className="input" placeholder="VD: Phở bò tái..." value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Giá bán (VNĐ) *</label>
                  <input className="input" type="number" placeholder="50000" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                  {form.price && !isNaN(Number(form.price)) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold)', marginTop: 4 }}>
                      = {fmt(Number(form.price))}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Danh mục</label>
                  <select className="input" value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.available}
                    onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} />
                  <span className="form-label" style={{ marginBottom: 0 }}>Đang phục vụ</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Huỷ</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Đang lưu...</> : '✓ Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
