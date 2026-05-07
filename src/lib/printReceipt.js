import { getSettings } from './settings'

const fmtNum = (n) => Number(n).toLocaleString('en-US')

function pad2(n) { return String(n).padStart(2, '0') }

function formatDateTime(iso) {
  const d = new Date(iso)
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function formatTime(d) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function printInvoice(invoice) {
  const s = getSettings()
  const now = new Date()

  const bankLine = [s.bankOwner, s.bankAccount ? `STK ${s.bankAccount}` : '', s.bankName]
    .filter(Boolean).join(' - ')

  let qrSrc = ''
  if (s.bankId && s.bankAccount) {
    const params = new URLSearchParams({
      amount: invoice.total,
      addInfo: invoice.invoice_number,
      ...(s.bankOwner ? { accountName: s.bankOwner } : {}),
    })
    qrSrc = `https://img.vietqr.io/image/${s.bankId}-${s.bankAccount}-qr_only.png?${params}`
  } else if (s.qrCode) {
    qrSrc = s.qrCode
  }

  const itemRows = (invoice.invoice_items || []).map(item => `
    <tr>
      <td class="name">${item.menu_item_name}</td>
      <td class="right">${fmtNum(item.menu_item_price)}</td>
      <td class="center">x&nbsp;${item.quantity}</td>
      <td class="right bold">${fmtNum(item.subtotal)}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>${invoice.invoice_number}</title>
  <style>
    @page { size: 80mm auto; margin: 4mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; }
    .receipt {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      font-weight: bold;
      width: 72mm;
      margin: 0 auto;
      padding: 6px 0;
      color: #000;
      background: #fff;
    }
    .center { text-align: center; }
    .right  { text-align: right; }
    .bold   { font-weight: bold; }
    .name-header { font-size: 17px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
    .tagline { font-size: 12px; margin-top: 2px; }
    .phones  { font-size: 12px; margin-top: 2px; }
    .divider { border: none; border-top: 1px dashed #000; margin: 5px 0; }
    .solid   { border-top-style: solid; }
    .row2 { display: flex; justify-content: space-between; align-items: center; margin: 5px 0; }
    .badge {
      border: 1.5px solid #000; border-radius: 6px;
      padding: 3px 8px; font-weight: bold; font-size: 13px; white-space: nowrap;
    }
    .ticket-title { text-align: right; }
    .ticket-title .main { font-weight: bold; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; }
    thead tr th { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 0; font-size: 13px; font-weight: bold; }
    th.name, td.name { text-align: left; width: 42%; }
    td { padding: 2px 0; vertical-align: top; font-size: 13px; font-weight: bold; }
    .totals td { padding: 1.5px 0; }
    .grand td { font-size: 15px; }
    .qr-img { display: block; margin: 8px auto; max-width: 110px; max-height: 110px; }
    .bank { font-size: 12px; margin-top: 4px; }
    .thanks { font-size: 13px; font-weight: bold; font-style: italic; margin-top: 6px; padding-bottom: 8px; }
    @media print { body { margin: 0; } .receipt { padding: 0; } }
  </style>
</head>
<body>
<div class="receipt">

  <div class="center">
    <div class="name-header">${s.name || 'NHÀ HÀNG'}</div>
    ${s.tagline ? `<div class="tagline">${s.tagline}</div>` : ''}
    ${s.phones ? `<div class="phones">Điện thoại: ${s.phones}</div>` : ''}
  </div>

  <hr class="divider solid">

  <div class="row2">
    <div class="badge">${invoice.table_number || 'Mang về'}</div>
    <div class="ticket-title">
      <div class="main">PHIẾU TÍNH TIỀN</div>
      <div>${invoice.invoice_number}</div>
    </div>
  </div>

  <div class="row2" style="font-size:12px">
    <div>Giờ vào: ${formatDateTime(invoice.created_at)}</div>
    <div>Giờ in: ${formatTime(now)}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="name">Tên hàng</th>
        <th style="text-align:right">Đ.Giá</th>
        <th style="text-align:center">SL</th>
        <th style="text-align:right">Thành<br>tiền</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <hr class="divider solid">

  <table class="totals">
    <tr><td>Tổng tiền hàng:</td><td class="right">${fmtNum(invoice.total)}</td></tr>
    <tr><td>Chiết khấu:</td><td class="right">0</td></tr>
  </table>
  <hr class="divider">
  <table class="totals grand">
    <tr><td>Tổng Cộng:</td><td class="right">${fmtNum(invoice.total)}</td></tr>
  </table>

  ${qrSrc ? `<img class="qr-img" src="${qrSrc}" alt="QR">` : ''}
  ${bankLine ? `<div class="center bank">${bankLine}</div>` : ''}
  ${s.thankYou ? `<div class="center thanks">${s.thankYou}</div>` : ''}

</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html; charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank', 'width=380,height=650,toolbar=0,menubar=0,scrollbars=1')
  if (!win) { alert('Vui lòng cho phép popup để in hóa đơn'); URL.revokeObjectURL(url); return }
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
