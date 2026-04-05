'use client'

import { useActionState, useEffect } from 'react'
import { createBuyer, updateBuyer } from '@/app/(dashboard)/buyers/actions'
import type { Buyer } from '@/lib/types'

interface BuyerFormProps {
  buyer?: Buyer | null
  onDone: () => void
}

export default function BuyerForm({ buyer, onDone }: BuyerFormProps) {
  const action = buyer ? updateBuyer : createBuyer
  const [state, formAction, pending] = useActionState(action, { error: '' })

  useEffect(() => {
    if (state?.success) onDone()
  }, [state])

  return (
    <form action={formAction} className="space-y-4">
      {buyer && <input type="hidden" name="id" value={buyer.id} />}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
        <input
          name="name"
          defaultValue={buyer?.name ?? ''}
          required
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={buyer?.email ?? ''}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone</label>
        <input
          name="phone"
          defaultValue={buyer?.phone ?? ''}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Address</label>
        <input
          name="address"
          defaultValue={buyer?.address ?? ''}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Saving...' : buyer ? 'Update Buyer' : 'Create Buyer'}
      </button>
    </form>
  )
}
