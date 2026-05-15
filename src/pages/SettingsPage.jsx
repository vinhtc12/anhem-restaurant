import React, { useState, useRef, useEffect } from 'react'
import { getSettings, getSettingsAsync, saveSettings, DEFAULTS } from '../lib/settings'
import { useToast } from '../components/Toast'

const BANKS = [
  { id: '970405', name: 'Agribank' },
  { id: '970436', name: 'Vietcombank' },
  { id: '970407', name: 'Techcombank' },
  { id: '970422', name: 'MB Bank' },
  { id: '970418', name: 'BIDV' },
  { id: '970415', name: 'Vietinbank' },
  { id: '970416', name: 'ACB' },
  { id: '970403', name: 'Sacombank' },
  { id: '970423', name: 'TPBank' },
  { id: '970432', name: 'VPBank' },
  { id: '970437', name: 'HDBank' },
  { id: '970443', name: 'SHB' },
  { id: '970440', name: 'SeABank' },
  { id: '970441', name: 'VIB' },
  { id: '970426', name: 'MSB' },
  { id: '970448', name: 'OCB' },
  { id: '970449', name: 'LienVietPostBank' },
  { id: '970428', name: 'NamABank' },
  { id: '970425', name: 'ABBank' },
  { id: '970401', name: 'Eximbank' },
  { id: '970424', name: 'Shinhan Bank' },
  { id: '970431', name: 'Eximbank' },
]

function vietQrUrl(bankId, account, owner, amount = 0, addInfo = '') {
  if (!bankId || !account) return ''
  const params = new URLSearchParams({ amount, addInfo })
  if (owner) params.set('accountName', owner)
  return `https://img.vietqr.io/image/${bankId}-${account}-compact2.png?${params}`
}

export default function SettingsPage() {
  const [form, setForm] = useState(getSettings)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()
  const toast = useToast()

  useEffect(() => {
    getSettingsAsync().then(dbSettings => {
      const local = getSettings()
      const dbIsDefault = Object.keys(DEFAULTS).every(k => dbSettings[k] === DEFAULTS[k])
      const localIsCustom = Object.keys(DEFAULTS).some(k => local[k] !== DEFAULTS[k])
      if (dbIsDefault && localIsCustom) {
        // localStorage has custom settings that were never pushed to DB — migrate now
        saveSettings(local)
        setForm(local)
      } else {
        setForm(dbSettings)
      }
    })
  }, [])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleBankChange(e) {
    const bank = BANKS.find(b => b.id === e.target.value)
    setForm(prev => ({ ...prev, bankId: e.target.value, bankName: bank?.name || '' }))
  }

  function handleQrUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast('Ảnh QR quá lớn (tối đa 2MB)', 'error'); return }
    const reader = new FileReader()
    reader.onload = (ev) => set('qrCode', ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await saveSettings(form)
    setSaving(false)
    if (error) toast('Lỗi lưu cài đặt!', 'error')
    else toast('Đã lưu cài đặt!')
  }

  const field = (label, key, placeholder, hint) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="input" placeholder={placeholder} value={form[key]}
        onChange={e => set(key, e.target.value)} />
      {hint && <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 4 }}>{hint}</div>}
    </div>
  )

  const previewQr = vietQrUrl(form.bankId, form.bankAccount, form.bankOwner, 100000, 'Xem thử')
  const hasVietQr = !!(form.bankId && form.bankAccount)

  return (
    <div className="animate-in" style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', color: 'var(--gold)' }}>Cài Đặt</h1>
        <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 2 }}>Thông tin nhà hàng hiển thị trên hóa đơn in</p>
      </div>

      {/* Restaurant info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text3)', marginBottom: 16, letterSpacing: 1 }}>
          THÔNG TIN NHÀ HÀNG
        </div>
        {field('Tên nhà hàng', 'name', 'NHÀ HÀNG HẢI SẢN ANH EM 304')}
        {field('Slogan / Giới thiệu', 'tagline', 'CHUYÊN PHỤC VỤ CÁC MÓN HẢI SẢN BIỂN TƯƠI SỐNG')}
        {field('Số điện thoại', 'phones', '0947794868 - 0985899636', 'Có thể nhập nhiều số, phân cách bằng dấu -')}
      </div>

      {/* Bank info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text3)', marginBottom: 16, letterSpacing: 1 }}>
          THÔNG TIN THANH TOÁN (VIETQR)
        </div>
        <div style={{
          background: 'rgba(var(--gold-rgb, 212,175,55), 0.08)', border: '1px solid var(--gold)',
          borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.8rem', color: 'var(--text2)',
        }}>
          ✨ QR code sẽ tự động tạo với <strong>số tiền chính xác</strong> của từng hóa đơn qua VietQR
        </div>

        {field('Tên chủ tài khoản', 'bankOwner', 'TRAN MINH MANH')}
        {field('Số tài khoản', 'bankAccount', '3601888678789')}

        <div className="form-group">
          <label className="form-label">Ngân hàng</label>
          <select className="input" value={form.bankId} onChange={handleBankChange}
            style={{ cursor: 'pointer' }}>
            <option value="">-- Chọn ngân hàng --</option>
            {BANKS.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* VietQR preview */}
        {hasVietQr && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 8 }}>
              Xem trước QR (số tiền mẫu 100,000₫):
            </div>
            <img src={previewQr} alt="VietQR preview" style={{
              height: 140, display: 'block',
              borderRadius: 8, border: '1px solid var(--border)', background: '#fff', padding: 4,
            }} />
          </div>
        )}

        {/* Fallback QR upload */}
        <div className="form-group" style={{ marginBottom: 0, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <label className="form-label" style={{ color: 'var(--text3)' }}>QR tĩnh (dự phòng nếu không dùng VietQR)</label>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {form.qrCode ? (
              <div style={{ position: 'relative' }}>
                <img src={form.qrCode} alt="QR" style={{
                  width: 100, height: 100, objectFit: 'contain',
                  border: '1px solid var(--border)', borderRadius: 8, background: '#fff', padding: 4,
                }} />
                <button onClick={() => set('qrCode', '')} style={{
                  position: 'absolute', top: -8, right: -8, width: 22, height: 22,
                  borderRadius: '50%', border: 'none', background: 'var(--red)',
                  color: '#fff', cursor: 'pointer', fontSize: '0.7rem', lineHeight: 1,
                }}>✕</button>
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()} style={{
                width: 100, height: 100, border: '2px dashed var(--border)', borderRadius: 8,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text3)', fontSize: '0.75rem', gap: 6,
              }}>
                <span style={{ fontSize: '1.6rem' }}>📷</span>
                <span>Upload QR</span>
              </div>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} style={{ alignSelf: 'center' }}>
              {form.qrCode ? 'Đổi ảnh' : 'Chọn ảnh'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={handleQrUpload} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text3)', marginBottom: 16, letterSpacing: 1 }}>
          CHÂN TRANG HÓA ĐƠN
        </div>
        {field('Lời cảm ơn', 'thankYou', 'Cảm ơn quý khách và hẹn gặp lại !!!')}
      </div>

      <button className="btn btn-primary" style={{ padding: '11px 32px' }}
        onClick={handleSave} disabled={saving}>
        {saving ? 'Đang lưu...' : '✓ Lưu cài đặt'}
      </button>
    </div>
  )
}
