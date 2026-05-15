import { settingsApi } from './supabase'

const KEY = 'restaurant_settings'

export const DEFAULTS = {
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

function fromStored(stored) {
  try {
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

// Sync read from localStorage cache — fast, used for initial render
export function getSettings() {
  try {
    const stored = localStorage.getItem(KEY)
    if (!stored) return { ...DEFAULTS }
    return fromStored(stored)
  } catch {
    return { ...DEFAULTS }
  }
}

// Async read from DB — authoritative, updates localStorage cache
export async function getSettingsAsync() {
  const { data, error } = await settingsApi.get()
  if (error) return getSettings()
  if (!data) {
    // Row doesn't exist yet — seed it from localStorage or DEFAULTS
    const seed = getSettings()
    await settingsApi.save(seed)
    return seed
  }
  localStorage.setItem(KEY, JSON.stringify(data))
  return data
}

// Save to DB (source of truth) and localStorage cache
export async function saveSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings))
  return settingsApi.save(settings)
}
