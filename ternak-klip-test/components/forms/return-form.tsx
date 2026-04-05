'use client'

import { useActionState, useEffect } from 'react'
import { processReturn } from '@/app/(dashboard)/buyers/actions'
import type { Product, Warehouse } from '@/lib/types'

interface ReturnFormProps {
  buyerId: string
  products: Product[]
  warehouses: Warehouse[]
  onDone: () => void
}

export default function ReturnForm({ buyerId, products, warehouses, onDone }: ReturnFormProps) {
  const [state, formAction, pending] = useActionState(processReturn, { error: '' })

  useEffect(() => {
    if (state?.success) onDone()
  }, [state])

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="buyer_id" value={buyerId} />
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Product</label>
        <select
          name="product_id"
          required
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <option value="">Select a product</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Return to Warehouse</label>
        <select
          name="warehouse_id"
          required
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <option value="">Select a warehouse</option>
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Quantity</label>
        <input
          name="quantity"
          type="number"
          min="1"
          required
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {pending ? 'Processing...' : 'Process Return'}
      </button>
    </form>
  )
}
