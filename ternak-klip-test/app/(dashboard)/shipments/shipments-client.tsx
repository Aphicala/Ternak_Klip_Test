'use client'

import { useState, useActionState } from 'react'
import Modal from '@/components/modal'
import ShipmentForm from '@/components/forms/shipment-form'
import { updateElapsedTime } from './actions'
import type { Shipment, Warehouse, Product, Buyer, WarehouseProduct } from '@/lib/types'

interface Props {
  shipments: Shipment[]
  warehouses: Warehouse[]
  products: Product[]
  buyers: Buyer[]
  warehouseProducts: WarehouseProduct[]
}

export default function ShipmentsClient({ shipments, warehouses, products, buyers, warehouseProducts }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        New Shipment
      </button>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">To</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Est. Hours</th>
              <th className="px-4 py-3 font-medium">Elapsed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-zinc-400">No shipments</td>
              </tr>
            ) : (
              shipments.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{s.products?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                      s.type === 'transfer'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : s.type === 'return'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    }`}>
                      {s.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {s.type === 'return' ? s.buyers?.name ?? '—' : s.from_warehouse?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {s.type === 'transfer' ? s.to_warehouse?.name ?? '—' : s.type === 'return' ? s.from_warehouse?.name ?? '—' : s.buyers?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{s.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                      s.status === 'completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{s.estimated_hours}h</td>
                  <td className="px-4 py-3">
                    {s.status === 'in_transit' ? (
                      <ElapsedTimeInput shipmentId={s.id} currentElapsed={s.elapsed_hours} />
                    ) : (
                      <span className="text-zinc-500">{s.elapsed_hours}h</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Shipment">
        <ShipmentForm
          warehouses={warehouses}
          products={products}
          buyers={buyers}
          warehouseProducts={warehouseProducts}
          onDone={() => setModalOpen(false)}
        />
      </Modal>
    </>
  )
}

function ElapsedTimeInput({ shipmentId, currentElapsed }: { shipmentId: string; currentElapsed: number }) {
  const [state, formAction, pending] = useActionState(updateElapsedTime, { error: '' })

  return (
    <form action={formAction} className="flex items-center gap-1">
      <input type="hidden" name="shipment_id" value={shipmentId} />
      <input
        name="elapsed_hours"
        type="number"
        min="0"
        step="0.5"
        defaultValue={currentElapsed}
        className="w-16 rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
      >
        {pending ? '...' : 'Update'}
      </button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  )
}
