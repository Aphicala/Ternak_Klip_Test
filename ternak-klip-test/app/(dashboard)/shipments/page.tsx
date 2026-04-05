import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getShipments, getWarehouses, getProducts, getBuyers, getWarehouseProducts } from '@/lib/queries'
import ShipmentsClient from './shipments-client'

export default async function ShipmentsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [shipments, warehouses, products, buyers, warehouseProducts] = await Promise.all([
    getShipments(supabase),
    getWarehouses(supabase),
    getProducts(supabase),
    getBuyers(supabase),
    getWarehouseProducts(supabase),
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Shipments</h2>
      <ShipmentsClient
        shipments={shipments}
        warehouses={warehouses}
        products={products}
        buyers={buyers}
        warehouseProducts={warehouseProducts}
      />
    </div>
  )
}
