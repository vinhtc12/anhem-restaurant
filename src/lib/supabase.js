import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ---- Categories ----
export const categoriesApi = {
  getAll: () =>
    supabase.from('categories').select('*').order('name'),

  create: (name) =>
    supabase.from('categories').insert({ name }).select().single(),

  update: async (id, oldName, newName) => {
    const { error } = await supabase.from('categories').update({ name: newName }).eq('id', id)
    if (error) return { error }
    await supabase.from('menu_items').update({ category: newName }).eq('category', oldName)
    return {}
  },

  delete: (id) =>
    supabase.from('categories').delete().eq('id', id),
}

// ---- Menu Items ----
export const menuItemsApi = {
  getAll: () =>
    supabase.from('menu_items').select('*').order('category').order('name'),

  create: (item) =>
    supabase.from('menu_items').insert(item).select().single(),

  update: (id, item) =>
    supabase.from('menu_items').update(item).eq('id', id).select().single(),

  delete: (id) =>
    supabase.from('menu_items').delete().eq('id', id),
}

// ---- Settings ----
export const settingsApi = {
  get: async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single()
    if (error || !data) return { error }
    return {
      data: {
        name: data.name,
        tagline: data.tagline,
        phones: data.phones,
        bankOwner: data.bank_owner,
        bankAccount: data.bank_account,
        bankId: data.bank_id,
        bankName: data.bank_name,
        thankYou: data.thank_you,
        qrCode: data.qr_code,
      },
    }
  },

  save: (settings) =>
    supabase.from('app_settings').upsert({
      id: 1,
      name: settings.name,
      tagline: settings.tagline,
      phones: settings.phones,
      bank_owner: settings.bankOwner,
      bank_account: settings.bankAccount,
      bank_id: settings.bankId,
      bank_name: settings.bankName,
      thank_you: settings.thankYou,
      qr_code: settings.qrCode,
      updated_at: new Date().toISOString(),
    }),
}

// ---- Invoices ----
export const invoicesApi = {
  getAll: () =>
    supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .order('created_at', { ascending: false }),

  getById: (id) =>
    supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('id', id)
      .single(),

  create: async (invoiceData, items) => {
    const { data: invoiceNumber, error: seqError } = await supabase.rpc('next_invoice_number')
    if (seqError) return { error: seqError }

    const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({ ...invoiceData, invoice_number: invoiceNumber })
        .select()
        .single()

    if (error) return { error }

    const itemsWithInvoiceId = items.map((item) => ({
      invoice_id: invoice.id,
      menu_item_id: item.menu_item_id,
      menu_item_name: item.name,
      menu_item_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))

    const total = itemsWithInvoiceId.reduce((s, i) => s + i.subtotal, 0)

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId)

    if (itemsError) return { error: itemsError }

    const { data: updated, error: updateError } = await supabase
      .from('invoices')
      .update({ total })
      .eq('id', invoice.id)
      .select('*, invoice_items(*)')
      .single()

    return { data: updated, error: updateError }
  },

  update: async (id, invoiceData, items) => {
    const { error: invError } = await supabase
      .from('invoices')
      .update({ table_number: invoiceData.table_number, note: invoiceData.note })
      .eq('id', id)
    if (invError) return { error: invError }

    const { error: delError } = await supabase
      .from('invoice_items').delete().eq('invoice_id', id)
    if (delError) return { error: delError }

    const itemsToInsert = items.map(item => ({
      invoice_id: id,
      menu_item_id: item.menu_item_id,
      menu_item_name: item.name,
      menu_item_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))
    const total = itemsToInsert.reduce((s, i) => s + i.subtotal, 0)

    const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert)
    if (itemsError) return { error: itemsError }

    const { data, error } = await supabase
      .from('invoices').update({ total }).eq('id', id)
      .select('*, invoice_items(*)').single()
    return { data, error }
  },

  updateStatus: (id, status) =>
    supabase
      .from('invoices')
      .update({
        status,
        ...(status === 'paid' ? { paid_at: new Date().toISOString() } : {}),
      })
      .eq('id', id)
      .select()
      .single(),

  delete: (id) => supabase.from('invoices').delete().eq('id', id),
}
