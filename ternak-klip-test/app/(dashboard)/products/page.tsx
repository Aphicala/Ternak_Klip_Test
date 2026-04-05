import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getProducts } from '@/lib/queries'
import ProductsClient from './products-client'

export default async function ProductsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const products = await getProducts(supabase)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Products</h2>
      <ProductsClient products={products} />
    </div>
  )
}
