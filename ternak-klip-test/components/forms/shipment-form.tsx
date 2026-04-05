'use client'

import { useState, useActionState, useEffect } from 'react'
import { createShipment } from '@/app/(dashboard)/shipments/actions'
import type { Product, Warehouse, WarehouseProduct } from '@/lib/types'
import type { Buyer } from '@/lib/types'

interface ShipmentFormProps {
  warehouses: Warehouse[]
  products: Product[]
  buyers: Buyer[]
  warehouseProducts: WarehouseProduct[]
  onDone: () => void
}

export default function ShipmentForm({
  warehouses,
  products,
  buyers,
  warehouseProducts,
  onDone,
}: ShipmentFormProps) {
  const [state, formAction, pending] = useActionState(createShipment, { error: '' })
  const [type, setType] = useState<'transfer' | 'outbound'>('transfer')
  const [fromWarehouse, setFromWarehouse] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')

  useEffect(() => {
    if (state?.success) onDone()
  }, [state])

  // Get available stock for selected warehouse + product
  const availableStock = warehouseProducts.find(
    wp => wp.warehouse_id === fromWarehouse && String(wp.product_id) === selectedProduct
  )?.stock_level ?? 0

  // Products available in the selected source warehouse
  const productsInWarehouse = warehouseProducts
    .filter(wp => wp.warehouse_id === fromWarehouse && wp.stock_level > 0)
    .map(wp => products.find(p => p.id === wp.product_id))
    .filter(Boolean) as Product[]

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as 'transfer' | 'outbound')}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <option value="transfer">Warehouse Transfer</option>
          <option value="outbound">Ship to Buyer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">From Warehouse</label>
        <select
          name="from_warehouse_id"
          required
          value={fromWarehouse}
          onChange={(e) => { setFromWarehouse(e.target.value); setSelectedProduct('') }}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <option value="">Select warehouse</option>
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {type === 'transfer' ? (
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">To Warehouse</label>
          <select
            name="to_warehouse_id"
            required
            className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="">Select destination</option>
            {warehouses
              .filter(w => w.id !== fromWarehouse)
              .map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">To Buyer</label>
          <select
            name="to_buyer_id"
            required
            className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="">Select buyer</option>
            {buyers.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Product</label>
        <select
          name="product_id"
          required
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <option value="">Select product</option>
          {productsInWarehouse.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {selectedProduct && (
          <p className="mt-1 text-xs text-zinc-500">Available stock: {availableStock}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Quantity</label>
        <input
          name="quantity"
          type="number"
          min="1"
          max={availableStock || undefined}
          required
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Estimated Hours</label>
        <input
          name="estimated_hours"
          type="number"
          min="1"
          step="0.5"
          required
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Creating...' : 'Create Shipment'}
      </button>
    </form>
  )
}
