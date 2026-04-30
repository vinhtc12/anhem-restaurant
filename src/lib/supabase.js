import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    const count = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
    const num = String((count.count || 0) + 1).padStart(6, '0')

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({ ...invoiceData, invoice_number: `HD${num}` })
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
