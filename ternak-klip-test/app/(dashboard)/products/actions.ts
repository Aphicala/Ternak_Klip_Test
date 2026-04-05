'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(_prev: { error: string; success?: boolean }, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const name = formData.get('name') as string
  const stock_count = parseInt(formData.get('stock_count') as string, 10)

  const { error } = await supabase.from('products').insert({ name, stock_count })
  if (error) return { error: error.message }

  revalidatePath('/products')
  revalidatePath('/dashboard')
  return { error: '', success: true }
}

export async function updateProduct(_prev: { error: string; success?: boolean }, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const id = parseInt(formData.get('id') as string, 10)
  const name = formData.get('name') as string
  const stock_count = parseInt(formData.get('stock_count') as string, 10)

  const { error } = await supabase.from('products').update({ name, stock_count, last_updated: new Date().toISOString() }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/products')
  revalidatePath('/dashboard')
  return { error: '', success: true }
}

export async function deleteProduct(id: number) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/products')
  revalidatePath('/dashboard')
}
