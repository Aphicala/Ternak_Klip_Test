'use client'

import { useActionState, useEffect } from 'react'
import { createWarehouse, updateWarehouse } from '@/app/(dashboard)/warehouses/actions'
import type { Warehouse } from '@/lib/types'

interface WarehouseFormProps {
  warehouse?: Warehouse | null
  onDone: () => void
}

export default function WarehouseForm({ warehouse, onDone }: WarehouseFormProps) {
  const action = warehouse ? updateWarehouse : createWarehouse
  const [state, formAction, pending] = useActionState(action, { error: '' })

  useEffect(() => {
    if (state?.success) onDone()
  }, [state])

  return (
    <form action={formAction} className="space-y-4">
      {warehouse && <input type="hidden" name="id" value={warehouse.id} />}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
        <input
          name="name"
          defaultValue={warehouse?.name ?? ''}
          required
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Location</label>
        <input
          name="location"
          defaultValue={warehouse?.location ?? ''}
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
        {pending ? 'Saving...' : warehouse ? 'Update Warehouse' : 'Create Warehouse'}
      </button>
    </form>
  )
}
