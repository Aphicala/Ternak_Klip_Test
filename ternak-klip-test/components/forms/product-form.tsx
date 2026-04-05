'use client'

import { useActionState, useEffect } from 'react'
import { createProduct, updateProduct } from '@/app/(dashboard)/products/actions'
import type { Product } from '@/lib/types'

interface ProductFormProps {
  product?: Product | null
  onDone: () => void
}

export default function ProductForm({ product, onDone }: ProductFormProps) {
  const action = product ? updateProduct : createProduct
  const [state, formAction, pending] = useActionState(action, { error: '' })

  useEffect(() => {
    if (state?.success) onDone()
  }, [state])

  return (
    <form action={formAction} className="space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
        <input
          name="name"
          defaultValue={product?.name ?? ''}
          required
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Stock Count</label>
        <input
          name="stock_count"
          type="number"
          min="0"
          defaultValue={product?.stock_count ?? 0}
          required
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  )
}
