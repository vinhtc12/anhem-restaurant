const KEY = 'restaurant_settings'

const DEFAULTS = {
  name: 'NHÀ HÀNG HẢI SẢN ANH EM 304',
  tagline: 'CHUYÊN PHỤC VỤ CÁC MÓN HẢI SẢN BIỂN TƯƠI SỐNG',
  phones: '0947794868 - 0985899636',
  bankOwner: 'TRAN MINH MANH',
  bankAccount: '3601888678789',
  bankId: '970405',
  bankName: 'Agribank',
  thankYou: 'Cảm ơn quý khách và hẹn gặp lại !!!',
  qrCode: '',
}

export function getSettings() {
  try {
    const stored = localStorage.getItem(KEY)
    if (!stored) return { ...DEFAULTS }
    const parsed = JSON.parse(stored)
    const result = {}
    for (const [key, def] of Object.entries(DEFAULTS)) {
      const val = parsed[key]
      result[key] = (val !== undefined && val !== '') ? val : def
    }
    return result
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings))
}
