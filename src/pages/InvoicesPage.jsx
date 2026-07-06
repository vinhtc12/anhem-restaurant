import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { invoicesApi } from '../lib/supabase'
import { useToast } from '../components/Toast'
import { printInvoice } from '../lib/printReceipt'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫'

const STATUS_LABEL = { open: 'Đang mở', paid: 'Đã thanh toán', cancelled: 'Đã huỷ' }
const PAGE_SIZE = 20

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)
  const [page, setPage] = useState(1)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await invoicesApi.getAll()
    if (error) toast(error.message, 'error')
    else setInvoices(data || [])
    setLoading(false)
  }

  async function handleStatus(id, status) {
    const { error } = await invoicesApi.updateStatus(id, status)
    if (error) toast(error.message, 'error')
    else { toast(status === 'paid' ? 'Đã thanh toán!' : 'Đã huỷ hóa đơn'); load() }
  }

  async function handleDelete(id) {
    if (!confirm('Xoá hóa đơn này?')) return
    const { error } = await invoicesApi.delete(id)
    if (error) toast(error.message, 'error')
    else { toast('Đã xoá'); load(); setDetail(null) }
  }

  const filtered = invoices.filter(inv => {
    const matchFilter = filter === 'all' || inv.status === filter
    const matchSearch = !search ||
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.table_number?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [filter, search])

  const stats = {
    total: invoices.length,
    open: invoices.filter(i => i.status === 'open').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    revenue: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
  }

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', color: 'var(--gold)' }}>Hóa Đơn</h1>
          <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 2 }}>Quản lý tất cả hóa đơn bán hàng</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/new')}>＋ Tạo hóa đơn</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Tổng hóa đơn', val: stats.total, icon: '🧾' },
          { label: 'Đang mở', val: stats.open, icon: '🔵' },
          { label: 'Đã thanh toán', val: stats.paid, icon: '✅' },
          { label: 'Doanh thu', val: fmt(stats.revenue), icon: '💰' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>{s.val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <input className="input" placeholder="Tìm theo số HD, bàn..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
        {['all', 'open', 'paid', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`btn ${filter === s ? 'btn-primary' : 'btn-ghost'} btn-sm`}>
            {s === 'all' ? 'Tất cả' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🧾</div><p>Chưa có hóa đơn nào</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Số HĐ</th><th>Bàn</th><th>Số món</th><th>Tổng tiền</th>
                  <th>Trạng thái</th><th>Thời gian</th><th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <span style={{ color: 'var(--gold)', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => setDetail(inv)}>
                        {inv.invoice_number}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{inv.table_number || '—'}</td>
                    <td style={{ color: 'var(--text2)' }}>{inv.invoice_items?.length || 0} món</td>
                    <td style={{ fontWeight: 600 }}>{fmt(inv.total)}</td>
                    <td><span className={`badge badge-${inv.status}`}>{STATUS_LABEL[inv.status]}</span></td>
                    <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>
                      {format(new Date(inv.created_at), 'dd/MM HH:mm', { locale: vi })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                        {inv.status === 'open' && <>
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/edit/${inv.id}`)}>Sửa</button>
                          <button className="btn btn-success btn-sm" onClick={() => handleStatus(inv.id, 'paid')}>Thanh toán</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleStatus(inv.id, 'cancelled')}>Huỷ</button>
                        </>}
                        <button className="btn btn-ghost btn-sm" onClick={() => setDetail(inv)}>Chi tiết</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => printInvoice(inv)}>🖨️</button>
                        {inv.status !== 'open' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(inv.id)}>Xoá</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>
            Trang {currentPage}/{totalPages} · {filtered.length} hóa đơn
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost btn-sm" disabled={currentPage === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}>‹ Trước</button>
            <button className="btn btn-ghost btn-sm" disabled={currentPage === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Sau ›</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && <InvoiceDetail invoice={detail} onClose={() => setDetail(null)}
        onStatusChange={(id, s) => { handleStatus(id, s); setDetail(null) }}
        onDelete={(id) => handleDelete(id)}
        onEdit={(id) => navigate(`/edit/${id}`)} />}
    </div>
  )
}

function InvoiceDetail({ invoice, onClose, onStatusChange, onDelete, onEdit }) {
  const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫'
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--gold)' }}>{invoice.invoice_number}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 2 }}>
              {invoice.table_number ? `Bàn: ${invoice.table_number}` : 'Mang về'}
              {' · '}{format(new Date(invoice.created_at), 'dd/MM/yyyy HH:mm')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`badge badge-${invoice.status}`}>{
              { open: 'Đang mở', paid: 'Đã thanh toán', cancelled: 'Đã huỷ' }[invoice.status]
            }</span>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Món</th><th style={{ textAlign: 'right' }}>Giá</th>
                <th style={{ textAlign: 'center' }}>SL</th><th style={{ textAlign: 'right' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {invoice.invoice_items?.map(item => (
                <tr key={item.id}>
                  <td>{item.menu_item_name}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text3)', fontSize: '0.8rem' }}>{fmt(item.menu_item_price)}</td>
                  <td style={{ textAlign: 'center', color: 'var(--text2)' }}>×{item.quantity}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Tổng cộng</span>
            <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--gold)' }}>{fmt(invoice.total)}</span>
          </div>
          {invoice.note && <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg3)',
            borderRadius: 'var(--radius)', fontSize: '0.85rem', color: 'var(--text2)' }}>
            📝 {invoice.note}
          </div>}
        </div>
        <div className="modal-footer">
          {invoice.status === 'open' && <>
            <button className="btn btn-ghost" onClick={() => onEdit(invoice.id)}>✏️ Sửa món</button>
            <button className="btn btn-danger" onClick={() => onStatusChange(invoice.id, 'cancelled')}>Huỷ hóa đơn</button>
            <button className="btn btn-success" onClick={() => onStatusChange(invoice.id, 'paid')}>✓ Thanh toán</button>
          </>}
          {invoice.status !== 'open' && (
            <button className="btn btn-danger" onClick={() => onDelete(invoice.id)}>Xoá</button>
          )}
          <button className="btn btn-ghost" onClick={() => printInvoice(invoice)}>🖨️ In</button>
          <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  )
}
