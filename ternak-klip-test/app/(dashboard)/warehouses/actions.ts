'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWarehouse(_prev: { error: string; success?: boolean }, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const name = formData.get('name') as string
  const location = (formData.get('location') as string) || null

  const { error } = await supabase.from('warehouses').insert({ name, location })
  if (error) return { error: error.message }

  revalidatePath('/warehouses')
  revalidatePath('/dashboard')
  return { error: '', success: true }
}

export async function updateWarehouse(_prev: { error: string; success?: boolean }, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const location = (formData.get('location') as string) || null

  const { error } = await supabase.from('warehouses').update({ name, location }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/warehouses')
  revalidatePath('/dashboard')
  return { error: '', success: true }
}

export async function deleteWarehouse(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from('warehouses').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/warehouses')
  revalidatePath('/dashboard')
}

export async function assignProduct(_prev: { error: string; success?: boolean }, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const warehouse_id = formData.get('warehouse_id') as string
  const product_id = parseInt(formData.get('product_id') as string, 10)
  const stock_level = parseInt(formData.get('stock_level') as string, 10)

  const { error } = await supabase
    .from('warehouse_products')
    .upsert(
      { warehouse_id, product_id, stock_level },
      { onConflict: 'warehouse_id,product_id' }
    )
  if (error) return { error: error.message }

  revalidatePath('/warehouses')
  revalidatePath('/dashboard')
  return { error: '', success: true }
}

export async function removeProductFromWarehouse(warehouseProductId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from('warehouse_products').delete().eq('id', warehouseProductId)
  if (error) throw new Error(error.message)

  revalidatePath('/warehouses')
  revalidatePath('/dashboard')
}
