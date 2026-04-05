'use client'

import { useState, useTransition } from 'react'
import DataTable from '@/components/data-table'
import Modal from '@/components/modal'
import ProductForm from '@/components/forms/product-form'
import { deleteProduct } from './actions'
import type { Product } from '@/lib/types'

export default function ProductsClient({ products }: { products: Product[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [, startTransition] = useTransition()

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'stock_count', header: 'Stock Count' },
    { key: 'return_count', header: 'Returns' },
    {
      key: 'last_updated',
      header: 'Last Updated',
      render: (p: Product) =>
        p.last_updated ? new Date(p.last_updated).toLocaleString() : '—',
    },
  ]

  return (
    <>
      <button
        onClick={() => { setEditing(null); setModalOpen(true) }}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Add Product
      </button>

      <DataTable
        columns={columns}
        data={products}
        onEdit={(p) => { setEditing(p); setModalOpen(true) }}
        onDelete={(p) => {
          if (confirm('Delete this product?')) {
            startTransition(() => deleteProduct(p.id))
          }
        }}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'New Product'}
      >
        <ProductForm product={editing} onDone={() => setModalOpen(false)} />
      </Modal>
    </>
  )
}
