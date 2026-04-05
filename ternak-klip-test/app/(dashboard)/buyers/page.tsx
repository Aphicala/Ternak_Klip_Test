import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getBuyers, getProducts, getWarehouses } from '@/lib/queries'
import BuyersClient from './buyers-client'

export default async function BuyersPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [buyers, products, warehouses] = await Promise.all([
    getBuyers(supabase),
    getProducts(supabase),
    getWarehouses(supabase),
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Buyers</h2>
      <BuyersClient buyers={buyers} products={products} warehouses={warehouses} />
    </div>
  )
}
