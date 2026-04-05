'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { adjustProductStockCount } from '@/lib/queries'

export async function createShipment(_prev: { error: string; success?: boolean }, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const type = formData.get('type') as 'transfer' | 'outbound'
  const product_id = parseInt(formData.get('product_id') as string, 10)
  const from_warehouse_id = formData.get('from_warehouse_id') as string
  const to_warehouse_id = type === 'transfer' ? (formData.get('to_warehouse_id') as string) : null
  const to_buyer_id = type === 'outbound' ? (formData.get('to_buyer_id') as string) : null
  const quantity = parseInt(formData.get('quantity') as string, 10)
  const estimated_hours = parseFloat(formData.get('estimated_hours') as string)

  if (!product_id || !from_warehouse_id || !quantity || quantity <= 0 || !estimated_hours) {
    return { error: 'All fields are required' }
  }

  if (type === 'transfer' && !to_warehouse_id) return { error: 'Select a destination warehouse' }
  if (type === 'outbound' && !to_buyer_id) return { error: 'Select a buyer' }

  // Check available stock
  const { data: wp, error: wpErr } = await supabase
    .from('warehouse_products')
    .select('id, stock_level')
    .eq('warehouse_id', from_warehouse_id)
    .eq('product_id', product_id)
    .single()

  if (wpErr || !wp) return { error: 'Product not found in source warehouse' }
  if (wp.stock_level < quantity) return { error: `Insufficient stock. Available: ${wp.stock_level}` }

  // Deduct stock from source warehouse
  const { error: deductErr } = await supabase
    .from('warehouse_products')
    .update({ stock_level: wp.stock_level - quantity })
    .eq('id', wp.id)
  if (deductErr) return { error: deductErr.message }

  // Create shipment
  const { error: shipErr } = await supabase.from('shipments').insert({
    product_id,
    from_warehouse_id,
    to_warehouse_id,
    to_buyer_id,
    quantity,
    type,
    estimated_hours,
    status: 'in_transit',
    elapsed_hours: 0,
  })
  if (shipErr) return { error: shipErr.message }

  // Only outbound shipments decrease product stock_count
  if (type === 'outbound') {
    await adjustProductStockCount(supabase, product_id, -quantity)
  }

  revalidatePath('/shipments')
  revalidatePath('/dashboard')
  revalidatePath('/warehouses')
  revalidatePath('/products')
  return { error: '', success: true }
}

export async function updateElapsedTime(_prev: { error: string; success?: boolean }, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const shipment_id = formData.get('shipment_id') as string
  const elapsed_hours = parseFloat(formData.get('elapsed_hours') as string)

  if (!shipment_id || isNaN(elapsed_hours) || elapsed_hours < 0) {
    return { error: 'Invalid input' }
  }

  // Get shipment
  const { data: shipment, error: fetchErr } = await supabase
    .from('shipments')
    .select('*')
    .eq('id', shipment_id)
    .single()
  if (fetchErr || !shipment) return { error: 'Shipment not found' }
  if (shipment.status === 'completed') return { error: 'Shipment already completed' }

  // Update elapsed hours
  const { error: updateErr } = await supabase
    .from('shipments')
    .update({ elapsed_hours })
    .eq('id', shipment_id)
  if (updateErr) return { error: updateErr.message }

  // Auto-complete if elapsed >= estimated
  if (elapsed_hours >= shipment.estimated_hours) {
    await completeShipment(shipment_id)
  }

  revalidatePath('/shipments')
  revalidatePath('/dashboard')
  revalidatePath('/warehouses')
  revalidatePath('/products')
  return { error: '', success: true }
}

async function completeShipment(shipmentId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: shipment, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('id', shipmentId)
    .single()
  if (error || !shipment) return

  // Mark as completed
  await supabase
    .from('shipments')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', shipmentId)

  // If transfer, add stock to destination warehouse
  if (shipment.type === 'transfer' && shipment.to_warehouse_id) {
    const { data: existing } = await supabase
      .from('warehouse_products')
      .select('id, stock_level')
      .eq('warehouse_id', shipment.to_warehouse_id)
      .eq('product_id', shipment.product_id)
      .single()

    if (existing) {
      await supabase
        .from('warehouse_products')
        .update({ stock_level: existing.stock_level + shipment.quantity })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('warehouse_products')
        .insert({
          warehouse_id: shipment.to_warehouse_id,
          product_id: shipment.product_id,
          stock_level: shipment.quantity,
        })
    }
  }
  // Outbound: stock already decremented on creation, nothing to do here
  // Transfer: stock_count never changed, nothing to do here
}
