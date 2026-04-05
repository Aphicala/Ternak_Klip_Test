'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { adjustProductStockCount } from '@/lib/queries'

export async function createBuyer(_prev: { error: string; success?: boolean }, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const name = formData.get('name') as string
  const email = (formData.get('email') as string) || null
  const phone = (formData.get('phone') as string) || null
  const address = (formData.get('address') as string) || null

  const { error } = await supabase.from('buyers').insert({ name, email, phone, address })
  if (error) return { error: error.message }

  revalidatePath('/buyers')
  return { error: '', success: true }
}

export async function updateBuyer(_prev: { error: string; success?: boolean }, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const email = (formData.get('email') as string) || null
  const phone = (formData.get('phone') as string) || null
  const address = (formData.get('address') as string) || null

  const { error } = await supabase.from('buyers').update({ name, email, phone, address }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/buyers')
  return { error: '', success: true }
}

export async function deleteBuyer(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from('buyers').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/buyers')
}

export async function processReturn(_prev: { error: string; success?: boolean }, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const product_id = parseInt(formData.get('product_id') as string, 10)
  const warehouse_id = formData.get('warehouse_id') as string
  const quantity = parseInt(formData.get('quantity') as string, 10)

  if (!product_id || !warehouse_id || !quantity || quantity <= 0) {
    return { error: 'All fields are required and quantity must be positive' }
  }

  // Increment return_count on the product
  const { data: product, error: fetchErr } = await supabase
    .from('products')
    .select('return_count')
    .eq('id', product_id)
    .single()
  if (fetchErr) return { error: fetchErr.message }

  const { error: updateErr } = await supabase
    .from('products')
    .update({ return_count: product.return_count + quantity, last_updated: new Date().toISOString() })
    .eq('id', product_id)
  if (updateErr) return { error: updateErr.message }

  // Add stock back to the warehouse
  const { data: existing } = await supabase
    .from('warehouse_products')
    .select('id, stock_level')
    .eq('warehouse_id', warehouse_id)
    .eq('product_id', product_id)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('warehouse_products')
      .update({ stock_level: existing.stock_level + quantity })
      .eq('id', existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('warehouse_products')
      .insert({ warehouse_id, product_id, stock_level: quantity })
    if (error) return { error: error.message }
  }

  // Create a return shipment record (immediately completed)
  const buyer_id = formData.get('buyer_id') as string
  await supabase.from('shipments').insert({
    product_id,
    from_warehouse_id: warehouse_id,
    to_warehouse_id: null,
    to_buyer_id: buyer_id,
    quantity,
    type: 'return',
    status: 'completed',
    estimated_hours: 0,
    elapsed_hours: 0,
    completed_at: new Date().toISOString(),
  })

  // Return increases product stock_count
  await adjustProductStockCount(supabase, product_id, +quantity)

  revalidatePath('/buyers')
  revalidatePath('/dashboard')
  revalidatePath('/warehouses')
  revalidatePath('/products')
  revalidatePath('/shipments')
  return { error: '', success: true }
}
