import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { menuItemsApi, invoicesApi } from '../lib/supabase'
import { useToast } from '../components/Toast'

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫'

export default function EditInvoicePage() {
  const { id } = useParams()
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [tableNumber, setTableNumber] = useState('')
  const [note, setNote] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      menuItemsApi.getAll(),
      invoicesApi.getById(id),
    ]).then(([menuRes, invRes]) => {
      if (invRes.error || !invRes.data) {
        toast('Không tìm thấy hóa đơn', 'error')
        navigate('/')
        return
      }
      const inv = invRes.data
      if (inv.status !== 'open') {
        toast('Chỉ có thể sửa hóa đơn đang mở', 'error')
        navigate('/')
        return
      }
      setMenuItems((menuRes.data || []).filter(i => i.available))
      setTableNumber(inv.table_number || '')
      setNote(inv.note || '')
      setInvoiceNumber(inv.invoice_number)
      setCart((inv.invoice_items || []).map(item => ({
        menu_item_id: item.menu_item_id,
        name: item.menu_item_name,
        price: item.menu_item_price,
        quantity: item.quantity,
        marketPrice: item.menu_item_price === 0,
      })))
      setPageLoading(false)
    })
  }, [id])

  const categories = useMemo(() => [...new Set(menuItems.map(i => i.category))], [menuItems])

  const filtered = useMemo(() =>
    menuItems.filter(item => {
      const matchCat = category === 'all' || item.category === category
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    }), [menuItems, category, search])

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(c => c.menu_item_id === item.id)
      if (existing) return prev.map(c => c.menu_item_id === item.id
        ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { menu_item_id: item.id, name: item.name, price: item.price, quantity: 1, marketPrice: item.price === 0 }]
    })
  }

  function updateQty(id, qty) {
    if (qty <= 0) setCart(prev => prev.filter(c => c.menu_item_id !== id))
    else setCart(prev => prev.map(c => c.menu_item_id === id ? { ...c, quantity: qty } : c))
  }

  function updatePrice(id, val) {
    setCart(prev => prev.map(c => c.menu_item_id === id ? { ...c, price: Number(val) || 0 } : c))
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(c => c.menu_item_id !== id))
  }

  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0)
  const cartQty = (itemId) => cart.find(c => c.menu_item_id === itemId)?.quantity || 0

  async function handleSubmit() {
    if (cart.length === 0) { toast('Vui lòng chọn ít nhất 1 món', 'error'); return }
    const missingPrice = cart.filter(c => c.marketPrice && c.price === 0)
    if (missingPrice.length > 0) {
      if (!confirm(`Các món sau chưa nhập giá: ${missingPrice.map(c => c.name).join(', ')}. Vẫn tiếp tục?`)) return
    }
    setLoading(true)
    const { error } = await invoicesApi.update(id, { table_number: tableNumber, note }, cart)
    setLoading(false)
    if (error) { toast(error.message, 'error'); return }
    toast(`Đã cập nhật ${invoiceNumber}!`)
    navigate('/')
  }

  if (pageLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
  }

  return (
    <div className="animate-in">
      <style>{`
        .invoice-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 20px;
          align-items: start;
        }
        .cart-sticky { position: sticky; top: 20px; }
        @media (max-width: 640px) {
          .invoice-grid { grid-template-columns: 1fr; }
          .cart-sticky { position: static; }
          .invoice-title { font-size: 1.4rem !important; }
        }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 className="invoice-title" style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', color: 'var(--gold)' }}>
          Sửa Hóa Đơn
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 2 }}>
          {invoiceNumber} · Thêm, bỏ hoặc chỉnh số lượng món
        </p>
      </div>

      <div className="invoice-grid">
        {/* Left: Menu */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.85rem', color: 'var(--text2)' }}>THÔNG TIN HÓA ĐƠN</div>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Số bàn</label>
                <input className="input" placeholder="Bàn 1, 2..." value={tableNumber}
                  onChange={e => setTableNumber(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ghi chú</label>
                <input className="input" placeholder="Ghi chú thêm..." value={note}
                  onChange={e => setNote(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <input className="input" placeholder="Tìm món..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ maxWidth: 200 }} />
            <button onClick={() => setCategory('all')}
              className={`btn btn-sm ${category === 'all' ? 'btn-primary' : 'btn-ghost'}`}>Tất cả</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-ghost'}`}>{cat}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 10 }}>
            {filtered.map(item => {
              const qty = cartQty(item.id)
              return (
                <div key={item.id} className="card" style={{
                  padding: '14px', cursor: 'pointer', transition: 'var(--transition)',
                  borderColor: qty > 0 ? 'var(--gold)' : 'var(--border)',
                  background: qty > 0 ? 'var(--gold-dim)' : 'var(--surface)',
                  position: 'relative',
                }} onClick={() => addToCart(item)}>
                  {qty > 0 && (
                    <div style={{
                      position: 'absolute', top: 8, right: 10,
                      background: 'var(--gold)', color: '#1a1200',
                      borderRadius: '99px', width: 20, height: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 800,
                    }}>{qty}</div>
                  )}
                  <div style={{ fontSize: '0.65rem', color: 'var(--text3)', marginBottom: 4,
                    textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.category}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3, marginBottom: 8 }}>{item.name}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: item.price > 0 ? 'var(--gold)' : 'var(--text3)' }}>
                    {item.price > 0 ? fmt(item.price) : 'Theo giá'}
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1/-1', padding: '40px 20px' }}>
                <div className="empty-icon">🍽️</div><p>Không tìm thấy món</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="cart-sticky">
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16,
              paddingBottom: 12, borderBottom: '1px solid var(--border)', color: 'var(--gold)' }}>
              🛒 Giỏ hàng {cart.length > 0 && `(${cart.reduce((s, c) => s + c.quantity, 0)} món)`}
            </div>

            {cart.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 10px' }}>
                <div className="empty-icon">🍽️</div>
                <p>Chưa có món nào</p>
              </div>
            ) : (
              <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
                {cart.map(item => (
                  <div key={item.menu_item_id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: 10,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <input type="number" placeholder="Nhập giá..." value={item.price || ''}
                        onChange={e => updatePrice(item.menu_item_id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        style={{ width: 100, fontSize: '0.75rem', background: 'var(--bg3)',
                          border: '1px solid var(--border2)', borderRadius: 4, padding: '2px 6px',
                          color: 'var(--gold)', fontFamily: 'inherit', outline: 'none', marginTop: 2 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => updateQty(item.menu_item_id, item.quantity - 1)}
                        style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)',
                          background: 'var(--bg3)', color: 'var(--text)', cursor: 'pointer', fontSize: '1rem' }}>−</button>
                      <input type="number" value={item.quantity} min={1}
                        onChange={e => updateQty(item.menu_item_id, parseInt(e.target.value) || 0)}
                        style={{ width: 36, textAlign: 'center', background: 'transparent',
                          border: 'none', color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem',
                          fontFamily: 'inherit', outline: 'none' }} />
                      <button onClick={() => updateQty(item.menu_item_id, item.quantity + 1)}
                        style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)',
                          background: 'var(--bg3)', color: 'var(--text)', cursor: 'pointer', fontSize: '1rem' }}>＋</button>
                      <button onClick={() => removeFromCart(item.menu_item_id)}
                        style={{ width: 26, height: 26, borderRadius: 6, border: 'none',
                          background: 'rgba(224,82,82,0.15)', color: 'var(--red)', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gold)',
                      flexShrink: 0, minWidth: 72, textAlign: 'right' }}>
                      {fmt(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontWeight: 700 }}>Tổng cộng</span>
                <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--gold)' }}>{fmt(total)}</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                onClick={handleSubmit} disabled={loading || cart.length === 0}>
                {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Đang lưu...</> : '✓ Lưu thay đổi'}
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                onClick={() => navigate('/')}>Huỷ bỏ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
