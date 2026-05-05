import React, { useEffect, useState } from 'react'
import { menuItemsApi, categoriesApi } from '../lib/supabase'
import { useToast } from '../components/Toast'

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫'
const UNITS = ['đĩa', 'tô', 'lon', 'chai', 'con', 'kg', 'gói', 'suất', 'lần', 'dĩa']

const DEFAULT_FORM = { name: '', price: '', category: '', unit: '', available: true }

export default function MenuPage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | item
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')

  // Category management
  const [catModal, setCatModal] = useState(false)
  const [editCatId, setEditCatId] = useState(null)
  const [editCatName, setEditCatName] = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [catSaving, setCatSaving] = useState(false)

  const toast = useToast()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [{ data: menuData }, { data: catData }] = await Promise.all([
      menuItemsApi.getAll(),
      categoriesApi.getAll(),
    ])
    setItems(menuData || [])
    setCategories(catData || [])
    setLoading(false)
  }

  async function loadCategories() {
    const { data } = await categoriesApi.getAll()
    setCategories(data || [])
  }

  function openAdd() {
    setForm({ ...DEFAULT_FORM, category: categories[0]?.name || '' })
    setModal('add')
  }
  function openEdit(item) {
    setForm({ name: item.name, price: item.price, category: item.category, unit: item.unit || '', available: item.available })
    setModal(item)
  }
  function closeModal() { setModal(null); setForm(DEFAULT_FORM) }

  async function handleSave() {
    if (!form.name.trim()) { toast('Vui lòng nhập tên món', 'error'); return }
    if (form.price === '' || isNaN(Number(form.price))) { toast('Vui lòng nhập giá hợp lệ', 'error'); return }
    setSaving(true)
    const payload = { name: form.name.trim(), price: Number(form.price), category: form.category, unit: form.unit.trim(), available: form.available }
    let error
    if (modal === 'add') {
      ;({ error } = await menuItemsApi.create(payload))
    } else {
      ;({ error } = await menuItemsApi.update(modal.id, payload))
    }
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    toast(modal === 'add' ? 'Đã thêm món!' : 'Đã cập nhật!')
    closeModal()
    const { data } = await menuItemsApi.getAll()
    setItems(data || [])
  }

  async function handleToggle(item) {
    const { error } = await menuItemsApi.update(item.id, { available: !item.available })
    if (error) toast(error.message, 'error')
    else {
      toast(item.available ? 'Đã tắt món' : 'Đã bật món')
      const { data } = await menuItemsApi.getAll()
      setItems(data || [])
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Xoá "${item.name}"?`)) return
    const { error } = await menuItemsApi.delete(item.id)
    if (error) toast(error.message, 'error')
    else {
      toast('Đã xoá món')
      const { data } = await menuItemsApi.getAll()
      setItems(data || [])
    }
  }

  // --- Category management ---
  function startEditCat(cat) { setEditCatId(cat.id); setEditCatName(cat.name) }
  function cancelEditCat() { setEditCatId(null); setEditCatName('') }

  async function handleAddCat() {
    if (!newCatName.trim()) return
    setCatSaving(true)
    const { error } = await categoriesApi.create(newCatName.trim())
    setCatSaving(false)
    if (error) { toast(error.message, 'error'); return }
    setNewCatName('')
    await loadCategories()
    toast('Đã thêm danh mục!')
  }

  async function handleSaveCat(cat) {
    if (!editCatName.trim() || editCatName.trim() === cat.name) { cancelEditCat(); return }
    setCatSaving(true)
    const { error } = await categoriesApi.update(cat.id, cat.name, editCatName.trim())
    setCatSaving(false)
    if (error) { toast(error.message, 'error'); return }
    cancelEditCat()
    await Promise.all([loadCategories(), menuItemsApi.getAll().then(({ data }) => setItems(data || []))])
    toast('Đã đổi tên danh mục!')
  }

  async function handleDeleteCat(cat) {
    const usedBy = items.filter(i => i.category === cat.name).length
    if (usedBy > 0 && !confirm(`Danh mục "${cat.name}" đang được dùng bởi ${usedBy} món. Vẫn xoá?`)) return
    const { error } = await categoriesApi.delete(cat.id)
    if (error) { toast(error.message, 'error'); return }
    await loadCategories()
    toast('Đã xoá danh mục')
  }

  const filteredItems = items.filter(item => {
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setCatModal(true)}>⚙ Danh mục</button>
          <button className="btn btn-primary" onClick={openAdd}>＋ Thêm món</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="input" placeholder="Tìm món..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 220 }} />
        <button onClick={() => setCatFilter('all')}
          className={`btn btn-sm ${catFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}>Tất cả</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setCatFilter(cat.name)}
            className={`btn btn-sm ${catFilter === cat.name ? 'btn-primary' : 'btn-ghost'}`}>{cat.name}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🍜</div><p>Chưa có món ăn nào</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tên món</th><th>Danh mục</th><th>Đơn vị</th><th>Giá bán</th><th>Trạng thái</th><th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>
                      <span style={{ background: 'var(--bg3)', padding: '3px 10px', borderRadius: 99,
                        fontSize: '0.75rem', color: 'var(--text2)' }}>{item.category}</span>
                    </td>
                    <td style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{item.unit || '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--gold)' }}>
                      {item.price > 0 ? fmt(item.price) : <span style={{ color: 'var(--text3)', fontWeight: 400 }}>Theo giá</span>}
                    </td>
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

      {/* Add/Edit Item Modal */}
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
                <input className="input" placeholder="VD: Tôm hấp sả..." value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Giá bán (VNĐ)</label>
                  <input className="input" type="number" placeholder="0 = Theo giá" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                  {Number(form.price) > 0 && !isNaN(Number(form.price)) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold)', marginTop: 4 }}>
                      = {fmt(Number(form.price))}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Đơn vị tính</label>
                  <select className="input" value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                    <option value="">-- Chọn --</option>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <select className="input" value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
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

      {/* Category Management Modal */}
      {catModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setCatModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <span style={{ fontWeight: 700 }}>⚙ Quản lý danh mục</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setCatModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {editCatId === cat.id ? (
                      <>
                        <input className="input" value={editCatName} autoFocus
                          onChange={e => setEditCatName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveCat(cat); if (e.key === 'Escape') cancelEditCat() }}
                          style={{ flex: 1 }} />
                        <button className="btn btn-primary btn-sm" onClick={() => handleSaveCat(cat)} disabled={catSaving}>✓</button>
                        <button className="btn btn-ghost btn-sm" onClick={cancelEditCat}>✕</button>
                      </>
                    ) : (
                      <>
                        <span style={{ flex: 1, padding: '6px 0' }}>
                          {cat.name}
                          <span style={{ color: 'var(--text3)', fontSize: '0.75rem', marginLeft: 8 }}>
                            ({items.filter(i => i.category === cat.name).length} món)
                          </span>
                        </span>
                        <button className="btn btn-ghost btn-sm" onClick={() => startEditCat(cat)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCat(cat)}>🗑</button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
                <label className="form-label">Thêm danh mục mới</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" placeholder="Tên danh mục..." value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCat()}
                    style={{ flex: 1 }} />
                  <button className="btn btn-primary" onClick={handleAddCat} disabled={catSaving || !newCatName.trim()}>
                    ＋ Thêm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
