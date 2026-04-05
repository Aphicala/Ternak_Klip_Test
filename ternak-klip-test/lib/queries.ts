import { SupabaseClient } from '@supabase/supabase-js'

// Only adjusts stock_count by a delta. stock_count only changes on:
// - Outbound shipment created: delta = -quantity
// - Buyer return processed: delta = +quantity
export async function adjustProductStockCount(supabase: SupabaseClient, productId: number, delta: number) {
  const { data: product } = await supabase
    .from('products')
    .select('stock_count')
    .eq('id', productId)
    .single()
  if (!product) return

  await supabase
    .from('products')
    .update({
      stock_count: product.stock_count + delta,
      last_updated: new Date().toISOString(),
    })
    .eq('id', productId)
}

export async function getProducts(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('last_updated', { ascending: false })
  if (error) throw error
  return data
}

export async function getWarehouses(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getWarehouseProducts(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('warehouse_products')
    .select('*, warehouses(*), products(*)')
  if (error) throw error
  return data
}

export async function getBuyers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('buyers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getShipments(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('shipments')
    .select(`
      *,
      products(*),
      from_warehouse:warehouses!from_warehouse_id(*),
      to_warehouse:warehouses!to_warehouse_id(*),
      buyers(*)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getDashboardStats(supabase: SupabaseClient) {
  const warehouseProducts = await getWarehouseProducts(supabase)
  const products = await getProducts(supabase)
  const shipments = await getShipments(supabase)

  // Aggregate stock per product
  const stockByProduct: Record<string, { name: string; totalStock: number }> = {}
  for (const wp of warehouseProducts) {
    const pid = wp.product_id
    if (!stockByProduct[pid]) {
      stockByProduct[pid] = { name: wp.products?.name ?? 'Unknown', totalStock: 0 }
    }
    stockByProduct[pid].totalStock += wp.stock_level
  }

  const totalProducts = products.length
  const lowStockProducts = Object.values(stockByProduct).filter(p => p.totalStock > 0 && p.totalStock <= 10).length
  const zeroStockProducts = products.filter(
    p => !stockByProduct[p.id] || stockByProduct[p.id].totalStock === 0
  ).length

  // Stock levels by product name
  const stockByProductChart = Object.values(stockByProduct).map(p => ({
    name: p.name,
    value: p.totalStock,
  }))

  // Return rate by product name
  const completedOutbound = shipments.filter(
    (s: { type: string; status: string }) => s.type === 'outbound' && s.status === 'completed'
  )
  const shippedByProduct: Record<string, number> = {}
  for (const s of completedOutbound) {
    shippedByProduct[s.product_id] = (shippedByProduct[s.product_id] || 0) + s.quantity
  }
  const returnRateChart = products
    .filter(p => shippedByProduct[p.id] && shippedByProduct[p.id] > 0)
    .map(p => ({
      name: p.name,
      value: Math.round((p.return_count / shippedByProduct[p.id]) * 100),
    }))

  // Stock levels per warehouse, segmented by product
  const warehouseMap: Record<string, Record<string, number | string>> = {}
  const productNames = new Set<string>()
  for (const wp of warehouseProducts) {
    const wid = wp.warehouse_id
    const productName = wp.products?.name ?? 'Unknown'
    productNames.add(productName)
    if (!warehouseMap[wid]) {
      warehouseMap[wid] = { name: wp.warehouses?.name ?? 'Unknown' }
    }
    warehouseMap[wid][productName] = (warehouseMap[wid][productName] as number || 0) + wp.stock_level
  }
  const stockByWarehouseChart = Object.values(warehouseMap)
  const stockByWarehouseProducts = Array.from(productNames)

  // Shipment data for filterable chart
  const shipmentChartData = shipments.map((s: {
    id: string
    quantity: number
    type: string
    status: string
    created_at: string
    products?: { name: string; id: number }
    from_warehouse?: { name: string; id: string }
  }) => ({
    id: s.id,
    product: s.products?.name ?? 'Unknown',
    productId: String(s.products?.id ?? ''),
    warehouse: s.from_warehouse?.name ?? 'Unknown',
    warehouseId: s.from_warehouse?.id ?? '',
    quantity: s.quantity,
    type: s.type,
    status: s.status,
    date: s.created_at,
  }))

  return {
    totalProducts,
    lowStockProducts,
    zeroStockProducts,
    stockByProductChart,
    returnRateChart,
    stockByWarehouseChart,
    stockByWarehouseProducts,
    shipmentChartData,
    shipments,
    warehouses: await getWarehouses(supabase),
    products,
  }
}
