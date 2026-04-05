'use client'

import { useState, useTransition, useActionState, useEffect } from 'react'
import DataTable from '@/components/data-table'
import Modal from '@/components/modal'
import WarehouseForm from '@/components/forms/warehouse-form'
import { deleteWarehouse, assignProduct, removeProductFromWarehouse } from './actions'
import type { Warehouse, WarehouseProduct, Product } from '@/lib/types'

interface Props {
  warehouses: Warehouse[]
  warehouseProducts: WarehouseProduct[]
  products: Product[]
}

export default function WarehousesClient({ warehouses, warehouseProducts, products }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Warehouse | null>(null)
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [, startTransition] = useTransition()

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'location', header: 'Location', render: (w: Warehouse) => w.location || '—' },
    {
      key: 'stock',
      header: 'Products',
      render: (w: Warehouse) => {
        const wps = warehouseProducts.filter(wp => wp.warehouse_id === w.id)
        return (
          <button
            onClick={() => { setSelectedWarehouse(w); setStockModalOpen(true) }}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {wps.length} product{wps.length !== 1 ? 's' : ''}
          </button>
        )
      },
    },
  ]

  return (
    <>
      <button
        onClick={() => { setEditing(null); setModalOpen(true) }}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Add Warehouse
      </button>

      <DataTable
        columns={columns}
        data={warehouses}
        onEdit={(w) => { setEditing(w); setModalOpen(true) }}
        onDelete={(w) => {
          if (confirm('Delete this warehouse?')) {
            startTransition(() => deleteWarehouse(w.id))
          }
        }}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Warehouse' : 'New Warehouse'}
      >
        <WarehouseForm warehouse={editing} onDone={() => setModalOpen(false)} />
      </Modal>

      <Modal
        open={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title={`Stock — ${selectedWarehouse?.name ?? ''}`}
      >
        {selectedWarehouse && (
          <StockManager
            warehouse={selectedWarehouse}
            warehouseProducts={warehouseProducts.filter(wp => wp.warehouse_id === selectedWarehouse.id)}
            products={products}
            onDone={() => setStockModalOpen(false)}
          />
        )}
      </Modal>
    </>
  )
}

function StockManager({
  warehouse,
  warehouseProducts,
  products,
  onDone,
}: {
  warehouse: Warehouse
  warehouseProducts: WarehouseProduct[]
  products: Product[]
  onDone: () => void
}) {
  const [, startTransition] = useTransition()
  const [state, formAction, pending] = useActionState(assignProduct, { error: '' })
  const assignedProductIds = warehouseProducts.map(wp => wp.product_id)
  const availableProducts = products.filter(p => !assignedProductIds.includes(p.id))

  useEffect(() => {
    if (state?.success) onDone()
  }, [state])

  return (
    <div className="space-y-4">
      {warehouseProducts.length > 0 && (
        <div className="space-y-2">
          {warehouseProducts.map(wp => (
            <div key={wp.id} className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700">
              <span className="text-zinc-700 dark:text-zinc-300">
                {wp.products?.name ?? 'Unknown'} — <strong>{wp.stock_level}</strong> units
              </span>
              <button
                onClick={() => {
                  if (confirm('Remove this product from warehouse?')) {
                    startTransition(() => removeProductFromWarehouse(wp.id))
                  }
                }}
                className="text-xs text-red-600 hover:underline dark:text-red-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {availableProducts.length > 0 && (
        <form action={formAction} className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Assign Product</p>
          <input type="hidden" name="warehouse_id" value={warehouse.id} />
          <select
            name="product_id"
            required
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {availableProducts.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            name="stock_level"
            type="number"
            min="0"
            defaultValue="0"
            placeholder="Stock level"
            required
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {pending ? 'Assigning...' : 'Assign Product'}
          </button>
        </form>
      )}

      {availableProducts.length === 0 && warehouseProducts.length === 0 && (
        <p className="text-sm text-zinc-400">No products available. Create products first.</p>
      )}
    </div>
  )
}
