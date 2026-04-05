import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getWarehouses, getWarehouseProducts, getProducts } from '@/lib/queries'
import WarehousesClient from './warehouses-client'

export default async function WarehousesPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [warehouses, warehouseProducts, products] = await Promise.all([
    getWarehouses(supabase),
    getWarehouseProducts(supabase),
    getProducts(supabase),
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Warehouses</h2>
      <WarehousesClient
        warehouses={warehouses}
        warehouseProducts={warehouseProducts}
        products={products}
      />
    </div>
  )
}
